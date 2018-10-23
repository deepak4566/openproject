require 'spec_helper'

shared_examples 'work package relations tab', js: true, selenium: true do
  include_context 'ui-autocomplete helpers'

  let(:user) { FactoryBot.create :admin }

  let(:project) { FactoryBot.create(:project) }
  let(:work_package) { FactoryBot.create(:work_package, project: project) }
  let(:relations) { ::Components::WorkPackages::Relations.new(work_package) }
  let(:tabs) { ::Components::WorkPackages::Tabs.new(work_package) }

  let(:relations_tab) { find('.tabrow li.selected', text: 'RELATIONS') }

  let(:visit) { true }

  before do
    login_as user

    if visit
      visit_relations
    end
  end

  def visit_relations
    wp_page.visit_tab!('relations')
    expect_angular_frontend_initialized
    wp_page.expect_subject
    loading_indicator_saveguard
  end

  describe 'as admin' do
    let!(:parent) { FactoryBot.create(:work_package, project: project, subject: 'Parent WP') }
    let!(:child) { FactoryBot.create(:work_package, project: project, subject: 'Child WP') }
    let!(:child2) { FactoryBot.create(:work_package, project: project, subject: 'Another child WP') }

    it 'allows to manage hierarchy' do
      # Shows link parent link
      expect(page).to have_selector('#hierarchy--add-parent')
      find('.wp-inline-create--add-link',
           text: I18n.t('js.relation_buttons.add_parent')).click

      # Add parent
      relations.add_parent(parent.id, parent)
      relations.expect_parent(parent)

      ##
      # Add child #1
      find('.wp-inline-create--add-link',
           text: I18n.t('js.relation_buttons.add_existing_child')).click

      relations.add_existing_child(child)

      ##
      # Add child #2
      find('.wp-inline-create--add-link',
           text: I18n.t('js.relation_buttons.add_existing_child')).click

      relations.add_existing_child(child2)

      # Count parent and child relations in split view
      tabs.expect_counter(relations_tab, 3)
    end

    describe 'inline create' do
      let!(:status) { FactoryBot.create(:status, is_default: true) }
      let!(:priority) { FactoryBot.create(:priority, is_default: true) }
      let(:type_bug) { FactoryBot.create(:type_bug) }
      let!(:project) do
        FactoryBot.create(:project, types: [type_bug])
      end

      it 'can inline-create children' do
        relations.inline_create_child 'my new child'
        table = relations.children_table

        table.expect_work_package_subject 'my new child'
        work_package.reload
        expect(work_package.children.count).to eq(1)

        # If new child is inline created, counter should increase
        tabs.expect_counter(relations_tab, 1)
      end
    end
  end

  describe 'relation group-by toggler' do
    let(:project) { FactoryBot.create :project, types: [type_1, type_2] }
    let(:type_1) { FactoryBot.create :type }
    let(:type_2) { FactoryBot.create :type }

    let(:to_1) { FactoryBot.create(:work_package, type: type_1, project: project) }
    let(:to_2) { FactoryBot.create(:work_package, type: type_2, project: project) }

    let!(:relation_1) do
      FactoryBot.create :relation,
                        from: work_package,
                        to: to_1,
                        relation_type: Relation::TYPE_FOLLOWS
    end
    let!(:relation_2) do
      FactoryBot.create :relation,
                        from: work_package,
                        to: to_2,
                        relation_type: Relation::TYPE_RELATES
    end

    let(:toggle_btn_selector) { '#wp-relation-group-by-toggle' }
    let(:visit) { false }

    before do
      visit_relations

      wp_page.visit_tab!('relations')
      wp_page.expect_subject
      loading_indicator_saveguard
    end

    describe 'with limited permissions' do
      let(:permissions) { %i(view_work_packages) }
      let(:user_role) do
        FactoryBot.create :role, permissions: permissions
      end

      let(:user) do
        FactoryBot.create :user,
                          member_in_project: project,
                          member_through_role: user_role
      end

      context 'as view-only user, with parent set' do
        let(:parent) { FactoryBot.create(:work_package, project: project, subject: 'Parent WP') }
        let(:work_package) { FactoryBot.create(:work_package, parent: parent, project: project, subject: 'Child WP') }

        it 'shows no links to create relations' do
          # No create buttons should exist
          expect(page).to have_no_selector('.wp-relations-create-button')

          # Test for add relation
          expect(page).to have_no_selector('#relation--add-relation')

          # Test for add parent
          expect(page).to have_no_selector('#hierarchy--add-parent')

          # Test for add children
          expect(page).to have_no_selector('#hierarchy--add-exisiting-child')
          expect(page).to have_no_selector('#hierarchy--add-new-child')

          # But it should show the linked parent
          expect(page).to have_selector('.wp-relations-hierarchy-subject', text: parent.subject)

          # And it should count parent and the two relations
          tabs.expect_counter(relations_tab, 3)
        end
      end

      context 'with manage_subtasks permissions' do
        let(:permissions) { %i(view_work_packages manage_subtasks) }
        let!(:parent) { FactoryBot.create(:work_package, project: project, subject: 'Parent WP') }
        let!(:child) { FactoryBot.create(:work_package, project: project, subject: 'Child WP') }

        it 'should be able to link parent and children' do
          # Shows link parent link
          expect(page).to have_selector('#hierarchy--add-parent')
          find('.wp-inline-create--add-link',
               text: I18n.t('js.relation_buttons.add_parent')).click

          # Add parent
          relations.add_parent(parent.id, parent)
          wp_page.expect_and_dismiss_notification(message: 'Successful update.')
          relations.expect_parent(parent)

          ##
          # Add child
          find('.wp-inline-create--add-link',
               text: I18n.t('js.relation_buttons.add_existing_child')).click

          relations.add_existing_child(child)
          wp_page.expect_and_dismiss_notification(message: 'Successful update.')
          relations.expect_child(child)

          # Expect counter to add up new parent and child to the existing relations
          tabs.expect_counter(relations_tab, 4)

          # Remove parent
          relations.remove_parent(parent)
          wp_page.expect_and_dismiss_notification(message: 'Successful update.')
          relations.expect_not_parent(parent)

          # Remove child
          relations.remove_child(child)
          # Should also check for successful update but no message is shown, yet.
          relations.expect_not_child(child)

          # Expect counter to only count the two existing relations
          tabs.expect_counter(relations_tab, 2)
        end
      end
    end
  end
end

context 'Split screen' do
  let(:wp_page) { Pages::SplitWorkPackage.new(work_package) }
  it_behaves_like 'work package relations tab'
end

context 'Full screen' do
  let(:wp_page) { Pages::FullWorkPackage.new(work_package) }
  it_behaves_like 'work package relations tab'
end
