require 'spec_helper'

describe 'Work package relations tab', js: true, selenium: true do
  let(:user) { FactoryGirl.create :admin }
  let(:work_package) { FactoryGirl.create(:work_package) }
  let(:work_packages_page) { ::Pages::SplitWorkPackage.new(work_package) }

  before do
    login_as user

    work_packages_page.visit_tab!('relations')
    loading_indicator_saveguard
    work_packages_page.expect_subject
  end

  describe 'no relations' do
    it 'shows empty relation tabs' do
      %w(parent children relates duplicates
         duplicated blocks blocked precedes follows).each do |rel|
        within ".relation.#{rel}" do
          find(".#{rel}-toggle-link").click
          expect(page).to have_selector('.content', text: 'No relation exists')
        end
      end
    end
  end

  describe 'with parent' do
    let(:parent) { FactoryGirl.create(:work_package) }
    let(:work_package) { FactoryGirl.create(:work_package, parent: parent) }

    it 'shows the parent relationship expanded' do
      within '.relation.parent' do
        expect(page).to have_selector('.content', text: "##{parent.id} #{parent.subject}")
      end
    end
  end

  describe 'create parent relationship' do
    let(:parent) { FactoryGirl.create(:work_package) }
    let(:work_package) { FactoryGirl.create(:work_package) }

    include_context 'ui-select helpers'

    it 'shows the parent relationship expanded' do
      within '.relation.parent' do
        # Expand parent
        find('.parent-toggle-link').click

        form = find('.choice--select')
        ui_select_choose(form, parent.id)

        click_button 'Change parent'

        expect(page).to have_selector('.content', text: "##{parent.id} #{parent.subject}")
      end
    end
  end
end
