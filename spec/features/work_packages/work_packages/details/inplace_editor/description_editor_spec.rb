#-- copyright
# OpenProject is a project management system.
# Copyright (C) 2012-2015 the OpenProject Foundation (OPF)
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

require 'rails_helper'
require_relative '../../support/shared_contexts'
require_relative '../../support/shared_examples'
require_relative '../../page_objects/work_package_field'
require_relative '../../page_objects/work_packages_page'

describe 'description inplace editor', js: true, selenium: true do
  include_context 'maximized window'

  let(:project) { FactoryGirl.create :project_with_types, is_public: true }
  let(:property_name) { :description }
  let(:property_title) { 'Description' }
  let(:description_text) { 'Ima description' }
  let!(:work_package) {
    FactoryGirl.create(
      :work_package,
      project: project,
      description: description_text
    )
  }
  let(:user) { FactoryGirl.create :admin }
  let(:field) { WorkPackageField.new page, property_name }
  let(:work_packages_page) { WorkPackagesPage.new(project) }

  before do
    allow(User).to receive(:current).and_return(user)

    work_packages_page.visit_index(work_package)
  end

  context 'in read state' do
    it 'renders the correct text' do
      expect(field.read_state_text).to eq work_package.send(property_name)
    end

    context 'when is empty' do
      let(:description_text) { '' }

      it 'renders a placeholder' do
        expect(field.read_state_text).to eq 'Click to enter description...'
      end
    end

    context 'when is editable' do
      context 'when clicking on an anchor' do
        it 'navigates to the given url'
        it 'does not trigger editing'
      end
    end
  end

  it_behaves_like 'an auth aware field'
  it_behaves_like 'a cancellable field'

  context 'in edit state' do
    before do
      field.activate_edition
    end

    after do
      field.cancel_by_click
    end

    it 'renders a textarea' do
      expect(field.input_element).to be_visible
      expect(field.input_element.tag_name).to eq 'textarea'
    end
    it 'renders formatting buttons'
    it 'renders a preview button'
    it 'prevents page navigation in edit mode'
    it 'has a correct value for the textarea'
    it 'displays the new HTML after save'
  end
end
