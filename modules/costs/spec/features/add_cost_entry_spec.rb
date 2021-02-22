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

require File.expand_path(File.dirname(__FILE__) + '/../spec_helper.rb')

describe 'Work Package cost fields', type: :feature, js: true do
  let(:type_task) { FactoryBot.create(:type_task) }
  let!(:status) { FactoryBot.create(:status, is_default: true) }
  let!(:priority) { FactoryBot.create(:priority, is_default: true) }
  let!(:project) do
    FactoryBot.create(:project, types: [type_task])
  end
  let(:user) do
    FactoryBot.create :user,
                      member_in_project: project,
                      member_through_role: role
  end
  let(:role) do
    FactoryBot.create :role, permissions: %i[view_work_packages
                                             delete_work_packages
                                             log_costs
                                             view_cost_rates
                                             edit_cost_entries
                                             view_cost_entries]
  end
  let!(:cost_type1) do
    type = FactoryBot.create :cost_type, name: 'A', unit: 'A single', unit_plural: 'A plural'
    FactoryBot.create :cost_rate, cost_type: type, rate: 1.00
    type
  end

  let!(:cost_type2) do
    type = FactoryBot.create :cost_type, name: 'B', unit: 'B single', unit_plural: 'B plural'
    FactoryBot.create :cost_rate, cost_type: type, rate: 2.00
    type
  end

  let!(:work_package) { FactoryBot.create :work_package, project: project, status: status, type: type_task }
  let(:full_view) { ::Pages::FullWorkPackage.new(work_package, project) }

  before do
    login_as(user)
  end

  it 'does not show read-only fields' do
    full_view.visit!
    # Go to add cost entry page
    SeleniumHubWaiter.wait
    find('#action-show-more-dropdown-menu .button').click
    find('.menu-item', text: 'Log unit costs').click

    SeleniumHubWaiter.wait
    # Set single value, should update suffix
    select 'A', from: 'cost_entry_cost_type_id'
    fill_in 'cost_entry_units', with: '1'
    expect(page).to have_selector('#cost_entry_unit_name', text: 'A single')
    expect(page).to have_selector('#cost_entry_costs', text: '1.00 EUR')

    fill_in 'cost_entry_units', with: '2'
    expect(page).to have_selector('#cost_entry_unit_name', text: 'A plural')
    expect(page).to have_selector('#cost_entry_costs', text: '2.00 EUR')

    # Switch cost type
    select 'B', from: 'cost_entry_cost_type_id'
    expect(page).to have_selector('#cost_entry_unit_name', text: 'B plural')
    expect(page).to have_selector('#cost_entry_costs', text: '4.00 EUR')

    # Override costs
    find('#cost_entry_costs').click
    SeleniumHubWaiter.wait
    fill_in 'cost_entry_costs_edit', with: '15.52'

    click_on 'Save'

    # Expect correct costs
    expect(page).to have_selector('.flash.notice', text: I18n.t(:notice_cost_logged_successfully))
    entry = CostEntry.last
    expect(entry.cost_type_id).to eq(cost_type2.id)
    expect(entry.units).to eq(2.0)
    expect(entry.costs).to eq(4.0)
    expect(entry.real_costs).to eq(15.52)

    visit edit_cost_entry_path(entry)
    expect(page).to have_selector('#cost_entry_costs', text: '15.52 EUR')
  end

  context 'with german locale' do
    it 'creates the budget including the given cost items with german locale' do
      user.update!(language: :de)
      I18n.locale = :de

      full_view.visit!

      # Go to add cost entry page
      SeleniumHubWaiter.wait
      find('#action-show-more-dropdown-menu .button').click
      find('.menu-item', text: I18n.t(:button_log_costs)).click

      SeleniumHubWaiter.wait
      fill_in 'cost_entry_units', with: '1,42'
      select 'B', from: 'cost_entry_cost_type_id'
      expect(page).to have_selector('#cost_entry_unit_name', text: 'B plural')
      expect(page).to have_selector('#cost_entry_costs', text: '2,84 EUR')

      # Override costs
      find('#cost_entry_costs').click
      SeleniumHubWaiter.wait
      fill_in 'cost_entry_costs_edit', with: '1.350,25'

      click_on I18n.t(:button_save)

      # Expect correct costs
      expect(page).to have_selector('.flash.notice', text: I18n.t(:notice_cost_logged_successfully))
      entry = CostEntry.last
      expect(entry.cost_type_id).to eq(cost_type2.id)
      expect(entry.units).to eq(1.42)
      expect(entry.costs).to eq(2.84)
      expect(entry.real_costs).to eq(1350.25)

      # Can edit the costs again
      visit edit_cost_entry_path(entry)
      expect(page).to have_selector('#cost_entry_costs', text: '1.350,25 EUR')

      # Toggle the cost button
      SeleniumHubWaiter.wait
      find('#cost_entry_costs').click

      # Update the costs in german locale
      SeleniumHubWaiter.wait
      fill_in 'cost_entry_costs_edit', with: '55.000,55'
      click_on I18n.t(:button_save)

      expect(page).to have_selector('#cost_entry_costs', text: '55.000,55 EUR')
      entry.reload
      expect(entry.units).to eq(1.42)
      expect(entry.costs).to eq(2.84)
      expect(entry.real_costs).to eq(55000.55)
    end
  end
end
