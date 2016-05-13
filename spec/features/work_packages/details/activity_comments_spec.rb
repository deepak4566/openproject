require 'spec_helper'

require 'features/work_packages/shared_contexts'
require 'features/work_packages/details/inplace_editor/shared_examples'

describe 'activity comments', js: true, selenium: true do
  let(:project) { FactoryGirl.create :project, is_public: true }
  let!(:work_package) {
    FactoryGirl.create(:work_package,
                       project: project,
                       journal_notes: initial_comment)
  }
  let(:wp_page) { Pages::SplitWorkPackage.new(work_package, project) }
  let(:selector) { '.work-packages--activity--add-comment' }
  let(:comment_field) {
    WorkPackageTextAreaField.new wp_page,
                                 'comment',
                                 selector: selector,
                                 trigger: '.inplace-editing--trigger-container'
  }
  let(:initial_comment) { 'the first comment in this WP' }

  before do
    login_as(user)
    allow(user.pref).to receive(:warn_on_leaving_unsaved?).and_return(false)
  end

  context 'with permission' do
    let(:user) { FactoryGirl.create :admin }

    before do
      wp_page.visit!
      wp_page.ensure_page_loaded
    end

    describe 'submitting with other fields' do
      let(:description) { WorkPackageTextAreaField.new wp_page, 'description' }

      before do
        comment_field.activate!
        comment_field.input_element.set 'comment with description'
        description.activate!
        description.input_element.set 'description goes here'
      end

      it 'saves both fields from comment submit' do
        comment_field.input_element.set 'some ingenious comment.'
        comment_field.submit_by_click
        expect(page).to have_selector('.user-comment .message', text: 'some ingenious comment.')
        description.expect_state_text('description goes here')
      end
    end

    context 'in edit state' do
      before do
        comment_field.activate!
      end

      describe 'editing' do
        it 'buttons are disabled when empty' do
          expect(page).to have_selector("#{selector} .inplace-edit--control--save[disabled]")
          comment_field.cancel_by_click
        end
      end

      describe 'submitting comment' do
        it 'does not submit with enter' do
          comment_field.input_element.set 'this is a comment'
          comment_field.submit_by_enter

          expect(page).to_not have_selector('.user-comment .message', text: 'this is a comment')
        end

        it 'submits with click' do
          comment_field.input_element.set 'this is a comment!1'
          comment_field.submit_by_click

          expect(page).to have_selector('.user-comment .message', text: 'this is a comment!1')
        end

        it 'submits comments repeatedly' do
          comment_field.input_element.set 'this is my first comment!1'
          comment_field.submit_by_click

          expect(page).to have_selector('.user-comment > .message', count: 2)
          expect(page).to have_selector('.user-comment > .message',
                                        text: 'this is my first comment!1')

          expect(comment_field.editing?).to be false
          comment_field.activate!
          expect(comment_field.editing?).to be true

          comment_field.input_element.set 'this is my second comment!1'
          comment_field.submit_by_click

          expect(page).to have_selector('.user-comment > .message', count: 3)
          expect(page).to have_selector('.user-comment > .message',
                                        text: 'this is my second comment!1')
        end
      end

      describe 'cancel comment' do
        it do
          expect(comment_field.editing?).to be true
          comment_field.input_element.set 'this is a comment'
          comment_field.cancel_by_escape
          expect(comment_field.editing?).to be false

          expect(page).to_not have_selector('.user-comment .message', text: 'this is a comment')

          comment_field.activate!

          expect(comment_field.editing?).to be true
          comment_field.input_element.set 'this is a comment'
          comment_field.cancel_by_click
          expect(comment_field.editing?).to be false

          expect(page).to_not have_selector('.user-comment .message', text: 'this is a comment')
        end
      end

      describe 'quoting' do
        it 'can quote a previous comment' do
          expect(page).to have_selector('.user-comment .message',
                                        text: initial_comment)

          # Hover comment
          page.find('.user-comment > .message').hover

          # Quote this comment
          page.find('.comments-icons .icon-quote').click
          expect(comment_field.editing?).to be true

          # Add our comment
          quote = comment_field.input_element[:value]
          expect(quote).to include("> #{initial_comment}")
          quote << "\nthis is some remark under a quote"
          comment_field.input_element.set(quote)
          comment_field.submit_by_click

          expect(page).to have_selector('.user-comment > .message', count: 2)
          expect(page).to have_selector('.user-comment > .message blockquote')
        end
      end
    end
  end

  context 'with no permission' do
    let(:user) { FactoryGirl.create(:user, member_in_project: project, member_through_role: role) }
    let(:role) { FactoryGirl.create :role, permissions: %i(view_work_packages) }

    before do
      wp_page.visit!
      wp_page.ensure_page_loaded
    end

    it 'does not show the field' do
      expect(page).to have_no_selector(selector, visible: true)
    end
  end
end
