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

require 'spec_helper'
require 'features/work_packages/work_packages_page'

describe 'Work package index accessibility', :type => :feature do
  let(:user) { FactoryGirl.create(:admin) }
  let(:project) { FactoryGirl.create(:project) }
  let(:work_package) { FactoryGirl.create(:work_package,
                                          project: project) }
  let(:work_packages_page) { WorkPackagesPage.new(project) }
  let(:sort_ascending_selector) { '.icon-sort-ascending' }
  let(:sort_descending_selector) { '.icon-sort-descending' }

  before do
    allow(User).to receive(:current).and_return(user)

    work_package

    work_packages_page.visit_index
  end

  describe 'Select all link' do
    let(:link_selector) { 'table.workpackages-table th.checkbox a' }

    describe 'Initial state', js: true do
      it { expect(page).to have_selector(link_selector) }

      context 'attributes' do
        before { expect(page).to have_selector(link_selector) }

        it { expect(find(link_selector)[:title]).to eq(I18n.t(:button_check_all)) }

        it { expect(find(link_selector)[:alt]).to eq(I18n.t(:button_check_all)) }

        it do
          expect(find(link_selector)).to have_selector('.hidden-for-sighted',
                                                       visible: false,
                                                       text: I18n.t(:button_check_all))
        end
      end
    end

    describe 'Change state', js: true do
      # TODO
    end

    after do
      # Ensure that all requests have fired and are answered.  Otherwise one
      # spec can interfere with the next when a request of the former is still
      # running in the one process but the other process has already removed
      # the data in the db to prepare for the next spec.
      #
      # Taking an element, that get's activated late in the page setup.
      expect(page).not_to have_selector('ul.dropdown-menu a.inactive',
                                    :text => Regexp.new("^#{I18n.t(:button_save)}$"),
                                    :visible => false)
    end
  end

  describe 'Sort link', js: true do
    def click_sort_ascending_link
      expect(page).to have_selector(sort_ascending_selector)
      element = find(sort_ascending_selector)
      element.click
    end

    def click_sort_descending_link
      expect(page).to have_selector(sort_descending_selector)
      element = find(sort_descending_selector)
      element.click
    end

    shared_examples_for 'sort column' do
      it do
        expect(page).to have_selector(column_header_selector)
        expect(find(column_header_selector + " span.sort-header")[:title]).to eq(sort_text)
      end
    end

    shared_examples_for 'unsorted column' do
      let(:sort_text) { I18n.t(:label_open_menu) }

      it_behaves_like 'sort column'
    end

    shared_examples_for 'ascending sorted column' do
      let(:sort_text) { "#{I18n.t(:label_ascending)} #{I18n.t(:label_sorted_by, value: "\"#{link_caption}\"")}" }

      it_behaves_like 'sort column'
    end

    shared_examples_for 'descending sorted column' do
      let(:sort_text) { "#{I18n.t(:label_descending)} #{I18n.t(:label_sorted_by, value: "\"#{link_caption}\"")}" }

      it_behaves_like 'sort column'
    end

    shared_examples_for 'sortable column' do
      before { expect(page).to have_selector(column_header_selector) }

      describe 'Initial sort' do
        it_behaves_like 'unsorted column'
      end

      describe 'descending' do
        before do
          find(column_header_link_selector).click
          click_sort_descending_link
        end

        it_behaves_like 'descending sorted column'
      end

      describe 'ascending' do
        before do
          find(column_header_link_selector).click
          click_sort_ascending_link
        end

        it_behaves_like 'ascending sorted column'
      end
    end

    describe 'id column' do
      let(:link_caption) { '#' }
      let(:column_header_selector) { 'table.workpackages-table th:nth-of-type(2)' }
      let(:column_header_link_selector) { column_header_selector + ' a' }

      it_behaves_like 'sortable column'
    end

    describe 'type column' do
      let(:link_caption) { 'Type' }
      let(:column_header_selector) { 'table.workpackages-table th:nth-of-type(3)' }
      let(:column_header_link_selector) { column_header_selector + ' a' }

      it_behaves_like 'sortable column'
    end

    describe 'status column' do
      let(:link_caption) { 'Status' }
      let(:column_header_selector) { 'table.workpackages-table th:nth-of-type(4)' }
      let(:column_header_link_selector) { column_header_selector + ' a' }

      it_behaves_like 'sortable column'
    end

    describe 'priority column' do
      let(:link_caption) { 'Priority' }
      let(:column_header_selector) { 'table.workpackages-table th:nth-of-type(5)' }
      let(:column_header_link_selector) { column_header_selector + ' a' }

      it_behaves_like 'sortable column'
    end

    describe 'subject column' do
      let(:link_caption) { 'Subject' }
      let(:column_header_selector) { 'table.workpackages-table th:nth-of-type(6)' }
      let(:column_header_link_selector) { column_header_selector + ' a' }

      it_behaves_like 'sortable column'
    end

    describe 'assigned to column' do
      let(:link_caption) { 'Assignee' }
      let(:column_header_selector) { 'table.workpackages-table th:nth-of-type(7)' }
      let(:column_header_link_selector) { column_header_selector + ' a' }

      it_behaves_like 'sortable column'
    end
  end

  describe 'context menus' do
    shared_examples_for 'context menu' do
      describe 'focus' do
        before do
          expect(page).to have_selector(source_link)
          element = find(source_link)
          element.native.send_keys(keys)
        end

        it { expect(page).to have_selector(target_link + ':focus') }

        describe 'reset' do
          before do
            expect(page).to have_selector(target_link)
            element = find(target_link)
            element.native.send_keys(:enter)
          end

          it { expect(page).to have_selector(source_link + ':focus') }
        end
      end
    end

    describe 'work package context menu', js: true do
      it_behaves_like 'context menu' do
        let(:target_link) { '#work-package-context-menu li.open a' }
        let(:source_link) { ".workpackages-table tr.issue td.id a" }
        let(:keys) { [:shift, :alt, :f10] }
      end
    end

    describe 'column header drop down menu', js: true do
      it_behaves_like 'context menu' do
        let(:source_link) { 'table.workpackages-table th:nth-of-type(2) a' }
        let(:target_link) { '#column-context-menu .menu li:first-of-type a' }
        let(:keys) { :enter }
      end
    end
  end
end
