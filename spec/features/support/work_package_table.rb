#-- copyright
# OpenProject is a project management system.
# Copyright (C) 2012-2014 the OpenProject Foundation (OPF)
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
# See doc/COPYRIGHT.rdoc for more details.
#++

shared_context 'work package table helpers' do
  def remove_wp_table_column(column_name)
    click_button('Settings')
    click_link('Columns ...')

    # This is faster than has_selector but does not wait for anything.
    # So if problems occur, switch to has_selector?
    if find('.select2-choices').text.include?(column_name)
      find('.select2-search-choice', text: column_name)
        .click_link('select2-search-choice-close')
    end

    click_button('Apply')
  end

  def sort_wp_table_by(column_name, order: :desc)
    click_button('Settings')
    click_link('Sort by ...')

    # If the modal was accessible, this would be elegant.
    first_sort_criteria = all('.select2-container')[0]
    select2_select_option(first_sort_criteria, column_name)

    # If the modal was accessible, this would be elegant.
    order_name = order == :desc ? 'Descending' : 'Ascending'

    first_sort_order = all('.select2-container')[1]
    select2_select_option(first_sort_order, order_name)

    click_button('Apply')
  end

  def within_wp_table(&block)
    within('.work-packages-table--results-container', &block)
  end
end
