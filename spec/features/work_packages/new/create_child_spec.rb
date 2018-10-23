#-- copyright
# OpenProject is a project management system.
# Copyright (C) 2012-2018 the OpenProject Foundation (OPF)
#
# This program is free software; you can redistribute it and/or
# modify it under the terms of the GNU General Public License version 3.
#
# OpenProject is a fork of ChiliProject, which is a fork of Redmine. The copyright follows:
# Copyright (C) 2006-2017 Jean-Philippe Lang
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

RSpec.feature 'Work package create children', js: true, selenium: true do
  let(:tabs) { ::Components::WorkPackages::Tabs.new(original_work_package) }
  let(:relations_tab) { find('.tabrow li', text: 'RELATIONS') }
  let(:user) do
    FactoryBot.create(:user,
                       member_in_project: project,
                       member_through_role: create_role)
  end
  let(:work_flow) do
    FactoryBot.create(:workflow,
                       role: create_role,
                       type_id: original_work_package.type_id,
                       old_status: original_work_package.status,
                       new_status: FactoryBot.create(:status))
  end
  let(:create_role) do
    FactoryBot.create(:role,
                       permissions: [:view_work_packages,
                                     :add_work_packages,
                                     :edit_work_packages,
                                     :manage_subtasks])
  end
  let(:project) { FactoryBot.create(:project) }
  let(:original_work_package) do
    FactoryBot.build(:work_package,
                      project: project,
                      assigned_to: assignee,
                      responsible: responsible,
                      fixed_version: version,
                      priority: default_priority,
                      author: author,
                      status: default_status)
  end
  let(:default_priority) do
    FactoryBot.build(:default_priority)
  end
  let(:default_status) do
    FactoryBot.build(:default_status)
  end
  let(:role) { FactoryBot.build(:role, permissions: [:view_work_packages]) }
  let(:assignee) do
    FactoryBot.build(:user,
                      firstname: 'An',
                      lastname: 'assignee',
                      member_in_project: project,
                      member_through_role: role)
  end
  let(:responsible) do
    FactoryBot.build(:user,
                      firstname: 'The',
                      lastname: 'responsible',
                      member_in_project: project,
                      member_through_role: role)
  end
  let(:author) do
    FactoryBot.build(:user,
                      firstname: 'The',
                      lastname: 'author',
                      member_in_project: project,
                      member_through_role: role)
  end
  let(:version) do
    FactoryBot.build(:version,
                      project: project)
  end

  before do
    login_as(user)
    allow(user.pref).to receive(:warn_on_leaving_unsaved?).and_return(false)
    original_work_package.save!
    work_flow.save!
  end

  scenario 'on fullscreen page' do
    original_work_package_page = Pages::FullWorkPackage.new(original_work_package)

    child_work_package_page = original_work_package_page.add_child
    expect_angular_frontend_initialized

    type_field = child_work_package_page.edit_field :type

    type_field.expect_active!
    expect(type_field.input_element).to have_selector('option[selected]', text: 'Please select')
    child_work_package_page.expect_current_path

    child_work_package_page.update_attributes Subject: 'Child work package',
                                              Type: 'None'

    expect(type_field.input_element).to have_selector('option[selected]', text: 'None')
    child_work_package_page.save!

    expect(page).to have_selector('.notification-box--content',
                                  text: I18n.t('js.notice_successful_create'))

    # Relations counter in full view should equal 1
    tabs.expect_counter(relations_tab, 1)

    child_work_package = WorkPackage.order(created_at: 'desc').first

    expect(child_work_package).to_not eql original_work_package

    child_work_package_page = Pages::FullWorkPackage.new(child_work_package, project)

    child_work_package_page.ensure_page_loaded
    child_work_package_page.expect_subject
    child_work_package_page.expect_current_path

    child_work_package_page.expect_parent(original_work_package)
  end

  scenario 'on split screen page' do
    original_work_package_page = Pages::SplitWorkPackage.new(original_work_package, project)

    child_work_package_page = original_work_package_page.add_child
    expect_angular_frontend_initialized

    type_field = child_work_package_page.edit_field :type

    expect(type_field.input_element).to have_selector('option[selected]', text: 'Please select')
    child_work_package_page.expect_current_path

    child_work_package_page.update_attributes Subject: 'Child work package',
                                              Type: 'None'

    expect(type_field.input_element).to have_selector('option[selected]', text: 'None')
    child_work_package_page.save!

    expect(page).to have_selector('.notification-box--content',
                                  text: I18n.t('js.notice_successful_create'))

    # # Relations counter in split view should equal 1
    tabs.expect_counter(relations_tab, 1)

    child_work_package = WorkPackage.order(created_at: 'desc').first

    expect(child_work_package).to_not eql original_work_package

    child_work_package_page = Pages::SplitWorkPackage.new(child_work_package, project)

    child_work_package_page.ensure_page_loaded
    child_work_package_page.expect_subject
    child_work_package_page.expect_current_path

    child_work_package_page.expect_parent(original_work_package)
  end
end
