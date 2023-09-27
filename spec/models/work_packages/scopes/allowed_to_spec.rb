#-- copyright
# OpenProject is an open source project management software.
# Copyright (C) 2012-2023 the OpenProject GmbH
#
# This program is free software; you can redistribute it and/or
# modify it under the terms of the GNU General Public License version 3.
#
# OpenProject is a fork of ChiliProject, which is a fork of Redmine. The copyright follows:
# Copyright (C) 2006-2013 Jean-Philippe Lang
# Copyright (C) 2010-2013 the ChiliProject Team
#
# This program is free software; you can redistribute it and/or
# modify it under the terms of the GNU General Public License
# as published by the Free Software Foundation; either version 2
# of the License, or (at your option) any later version.
#
# This program is distributed in the hope that it will be useful,
# but WITHOUT ANY WARRANTY; without even the implied warranty of
# MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.  See the
# GNU General Public License for more details.
#
# You should have received a copy of the GNU General Public License
# along with this program; if not, write to the Free Software
# Foundation, Inc., 51 Franklin Street, Fifth Floor, Boston, MA  02110-1301, USA.
#
# See COPYRIGHT and LICENSE files for more details.
#++

require 'spec_helper'

RSpec.describe WorkPackage, '.allowed_to' do
  let!(:private_project) { create(:project, public: false, active: project_status) }
  let!(:public_project) { create(:project, public: true, active: project_status) }
  let(:project_status) { true }

  let!(:work_package_in_public_project) { create(:work_package, project: public_project) }
  let!(:work_package_in_private_project) { create(:work_package, project: private_project) }
  let!(:other_work_package_in_private_project) { create(:work_package, project: private_project) }

  let(:project_permissions) { [] }
  let(:project_role) { create(:role, permissions: project_permissions) }

  let(:work_package_permissions) { [] }
  let(:work_package_role) { create(:work_package_role, permissions: work_package_permissions) }

  let(:anonymous_permissions) { [] }
  let(:anonymous_role) { create(:anonymous_role, permissions: anonymous_permissions) }

  let(:non_member_permissions) { [] }
  let!(:non_member_role) { create(:non_member, permissions: non_member_permissions) }

  let!(:user_without_membership) { create(:user) }
  let!(:user_with_private_project_membership) { create(:user, member_with_roles: { private_project => project_role }) }
  let!(:user_with_private_work_package_membership) do
    create(:user, member_with_roles: { work_package_in_private_project => work_package_role })
  end

  let(:action) { project_or_work_package_action }
  let(:project_or_work_package_action) { :view_work_packages }
  let(:public_action) { :view_news }
  let(:public_non_module_action) { :view_project }
  let(:non_module_action) { :edit_project }

  context 'when querying for a permission that does not exist' do
    it 'raises an error' do
      expect do
        described_class.allowed_to(build(:user), :non_existing_permission)
      end.to raise_error(Authorization::UnknownPermissionError)
    end
  end

  context 'when the user is an admin' do
    let(:user) { create(:admin) }

    subject { described_class.allowed_to(user, action) }

    it 'returns all work packages' do
      expect(subject).to contain_exactly(
        work_package_in_public_project,
        work_package_in_private_project,
        other_work_package_in_private_project
      )
    end
  end

  context 'when the user has the permission directly on the work package' do
    let(:work_package_permissions) { [action] }
    let!(:user) do
      create(:user, member_with_roles: { work_package_in_private_project => work_package_role })
    end

    subject { described_class.allowed_to(user, action) }

    it 'returns the authorized work package' do
      expect(subject).to contain_exactly(work_package_in_private_project)
    end
  end

  context 'when the user has the permission on the project the work package belongs to' do
    let(:project_permissions) { [action] }

    let!(:user) do
      create(:user, member_with_roles: { private_project => project_role })
    end

    subject { described_class.allowed_to(user, action) }

    it 'returns the authorized work packages' do
      expect(subject).to contain_exactly(work_package_in_private_project, other_work_package_in_private_project)
    end
  end

  context 'when the user has a different permission on the project, but the requested one on a specific work package' do
    let(:project_permissions) { [:view_work_packages] }
    let(:work_package_permissions) { %i[view_work_packages edit_work_packages] }

    let(:user) do
      create(:user, member_with_roles: { private_project => project_role, work_package_in_private_project => work_package_role })
    end

    subject { described_class.allowed_to(user, :edit_work_packages) }

    it 'returns the authorized work packages' do
      expect(subject).to contain_exactly(work_package_in_private_project)
    end
  end

  # TODO: Add more tests that check anonymous and non-member permissions
end
