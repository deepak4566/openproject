#-- copyright
# OpenProject is an open source project management software.
# Copyright (C) 2012-2021 the OpenProject GmbH
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
# See docs/COPYRIGHT.rdoc for more details.
#++

require 'spec_helper'

describe ::API::V3::Principals::PrincipalRepresenterFactory do
  let(:current_user) { FactoryBot.build_stubbed :user }

  describe '.create' do
    subject { described_class.create principal, current_user: current_user }

    context 'with a user' do
      let(:principal) { FactoryBot.build_stubbed :user }

      it 'returns a user representer' do
        expect(subject).to be_a ::API::V3::Users::UserRepresenter
      end
    end

    context 'with a group' do
      let(:principal) { FactoryBot.build_stubbed :group }

      it 'returns a group representer' do
        expect(subject).to be_a ::API::V3::Groups::GroupRepresenter
      end
    end

    context 'with a placeholder user' do
      let(:principal) { FactoryBot.build_stubbed :placeholder_user }

      it 'returns a user representer' do
        expect(subject).to be_a ::API::V3::PlaceholderUsers::PlaceholderUserRepresenter
      end
    end

    context 'with a deleted user' do
      let(:principal) { FactoryBot.build_stubbed :deleted_user }

      it 'returns a user representer' do
        expect(subject).to be_a ::API::V3::Users::UserRepresenter
      end
    end
  end
end
