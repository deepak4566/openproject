#-- copyright
# OpenProject is an open source project management software.
# Copyright (C) 2012-2024 the OpenProject GmbH
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

require "spec_helper"

RSpec.describe "Work package activity", :js, :with_cuprite, with_flag: { primerized_work_package_activities: true } do
  let(:project) { create(:project) }
  let(:admin) { create(:admin) }
  let(:member_role) do
    create(:project_role,
           permissions: %i[view_work_packages edit_work_packages add_work_packages work_package_assigned])
  end
  let(:member) do
    create(:user,
           firstname: "A",
           lastname: "Member",
           member_with_roles: { project => member_role })
  end

  let(:wp_page) { Pages::FullWorkPackage.new(work_package, project) }
  let(:activity_tab) { Components::WorkPackages::Activities.new(work_package) }

  context "when a workpackage is created and visited by the same user" do
    current_user { admin }
    let(:work_package) { create(:work_package, project:, author: admin) }

    before do
      # for some reason the journal is set to the "Anonymous"
      # although the work_package is created by the admin
      # so we need to update the journal to the admin manually to simulate the real world case
      work_package.journals.first.update!(user: admin)

      wp_page.visit!
      wp_page.wait_for_activity_tab
    end

    it "shows and merges activities and comments correctly", :aggregate_failures do
      first_journal = work_package.journals.first

      # initial journal entry is shown without changeset or comment
      activity_tab.within_journal_entry(first_journal) do
        activity_tab.expect_journal_details_header(text: admin.name)
        activity_tab.expect_no_journal_notes
        activity_tab.expect_no_journal_changed_attribute
      end

      wp_page.update_attributes(subject: "A new subject") # rubocop:disable Rails/ActiveRecordAliases
      wp_page.expect_and_dismiss_toaster(message: "Successful update.")

      # even when attributes are changed, the initial journal entry is still not showing any changeset
      activity_tab.within_journal_entry(first_journal) do
        activity_tab.expect_no_journal_changed_attribute
      end

      # merges the initial journal entry with the first comment when a comment is added right after the work package is created
      activity_tab.add_comment(text: "First comment")

      activity_tab.within_journal_entry(first_journal) do
        activity_tab.expect_no_journal_details_header
        activity_tab.expect_journal_notes_header(text: admin.name)
        activity_tab.expect_journal_notes(text: "First comment")
        activity_tab.expect_no_journal_changed_attribute
      end

      # changing the work package attributes after the first comment is added
      wp_page.update_attributes(subject: "A new subject!!!") # rubocop:disable Rails/ActiveRecordAliases
      wp_page.expect_and_dismiss_toaster(message: "Successful update.")

      # the changeset is still not shown in the journal entry
      activity_tab.within_journal_entry(first_journal) do
        activity_tab.expect_no_journal_changed_attribute
      end

      # adding a second comment
      activity_tab.add_comment(text: "Second comment")

      second_journal = work_package.journals.second

      activity_tab.within_journal_entry(second_journal) do
        activity_tab.expect_no_journal_changed_attribute
      end

      # changing the work package attributes after the first comment is added
      wp_page.update_attributes(subject: "A new subject") # rubocop:disable Rails/ActiveRecordAliases
      wp_page.expect_and_dismiss_toaster(message: "Successful update.")

      # the changeset is shown for the second journal entry (all but initial)
      activity_tab.within_journal_entry(second_journal) do
        activity_tab.expect_journal_changed_attribute(text: "Subject")
      end

      wp_page.update_attributes(assignee: member.name) # rubocop:disable Rails/ActiveRecordAliases
      wp_page.expect_and_dismiss_toaster(message: "Successful update.")

      # the changeset is merged for the second journal entry
      activity_tab.within_journal_entry(second_journal) do
        activity_tab.expect_journal_changed_attribute(text: "Subject")
        activity_tab.expect_journal_changed_attribute(text: "Assignee")
      end
    end
  end

  context "when a workpackage is created and visited by different users" do
    current_user { member }
    let(:work_package) { create(:work_package, project:, author: admin) }

    before do
      # for some reason the journal is set to the "Anonymous"
      # although the work_package is created by the admin
      # so we need to update the journal to the admin manually to simulate the real world case
      work_package.journals.first.update!(user: admin)

      wp_page.visit!
      wp_page.wait_for_activity_tab
    end

    it "shows and merges activities and comments correctly", :aggregate_failures do
      first_journal = work_package.journals.first

      # initial journal entry is shown without changeset or comment
      activity_tab.within_journal_entry(first_journal) do
        activity_tab.expect_journal_details_header(text: admin.name)
        activity_tab.expect_no_journal_notes
        activity_tab.expect_no_journal_changed_attribute
      end

      wp_page.update_attributes(subject: "A new subject") # rubocop:disable Rails/ActiveRecordAliases
      wp_page.expect_and_dismiss_toaster(message: "Successful update.")

      second_journal = work_package.journals.second
      # even when attributes are changed, the initial journal entry is still not showing any changeset
      activity_tab.within_journal_entry(second_journal) do
        activity_tab.expect_journal_details_header(text: "change")
        activity_tab.expect_journal_details_header(text: member.name)
        activity_tab.expect_journal_changed_attribute(text: "Subject")
      end

      # merges the second journal entry with the comment made by the user right afterwards
      activity_tab.add_comment(text: "First comment")

      activity_tab.within_journal_entry(second_journal) do
        activity_tab.expect_no_journal_details_header
        activity_tab.expect_journal_notes_header(text: member.name)
        activity_tab.expect_journal_notes(text: "First comment")
      end

      travel_to 1.hour.from_now

      # the journals will not be merged due to the time difference

      wp_page.update_attributes(subject: "A new subject!!!") # rubocop:disable Rails/ActiveRecordAliases

      third_journal = work_package.journals.third

      activity_tab.within_journal_entry(third_journal) do
        activity_tab.expect_journal_details_header(text: "change")
        activity_tab.expect_journal_details_header(text: member.name)
        activity_tab.expect_journal_changed_attribute(text: "Subject")
      end
    end
  end

  context "when multiple users are commenting on a workpackage" do
    current_user { admin }
    let(:work_package) { create(:work_package, project:, author: admin) }

    before do
      # set WORK_PACKAGES_ACTIVITIES_TAB_POLLING_INTERVAL_IN_MS to 1000
      # to speed up the polling interval for test duration
      ENV["WORK_PACKAGES_ACTIVITIES_TAB_POLLING_INTERVAL_IN_MS"] = "1000"

      # for some reason the journal is set to the "Anonymous"
      # although the work_package is created by the admin
      # so we need to update the journal to the admin manually to simulate the real world case
      work_package.journals.first.update!(user: admin)

      wp_page.visit!
      wp_page.wait_for_activity_tab
    end

    after do
      ENV.delete("WORK_PACKAGES_ACTIVITIES_TAB_POLLING_INTERVAL_IN_MS")
    end

    it "shows the comment of another user without browser reload", :aggregate_failures do
      # simulate member creating a comment
      sleep 1 # the comment needs to be created after the component is mounted
      first_journal = create(:work_package_journal, user: member, notes: "First comment by member", journable: work_package,
                                                    version: 2)

      # the comment is shown without browser reload
      activity_tab.expect_journal_notes(text: "First comment by member")

      # simulate comments made within the polling interval
      create(:work_package_journal, user: member, notes: "Second comment by member", journable: work_package, version: 3)
      create(:work_package_journal, user: member, notes: "Third comment by member", journable: work_package, version: 4)

      activity_tab.add_comment(text: "First comment by admin")

      expect(activity_tab.get_all_comments_as_arrary).to eq([
                                                              "First comment by member",
                                                              "Second comment by member",
                                                              "Third comment by member",
                                                              "First comment by admin"
                                                            ])

      first_journal.update!(notes: "First comment by member updated")

      # properly updates the comment when the comment is updated
      activity_tab.expect_journal_notes(text: "First comment by member updated")
    end
  end

  describe "filtering" do
    current_user { admin }
    let(:work_package) { create(:work_package, project:, author: admin) }

    context "when the work package has no comments" do
      before do
        # for some reason the journal is set to the "Anonymous"
        # although the work_package is created by the admin
        # so we need to update the journal to the admin manually to simulate the real world case
        work_package.journals.first.update!(user: admin)

        wp_page.visit!
        wp_page.wait_for_activity_tab
      end

      it "filters the activities based on type and shows an empty state" do
        # expect no empty state due to the initial journal entry
        activity_tab.expect_no_empty_state
        # expect the initial journal entry to be shown
        activity_tab.expect_journal_details_header(text: "created")

        activity_tab.filter_journals(:only_comments)

        # expect empty state
        activity_tab.expect_empty_state
        activity_tab.expect_no_journal_details_header(text: "created")

        activity_tab.filter_journals(:only_changes)

        # expect only the changes
        activity_tab.expect_no_empty_state
        activity_tab.expect_journal_details_header(text: "created")

        activity_tab.filter_journals(:all)

        # expect all journal entries
        activity_tab.expect_no_empty_state
        activity_tab.expect_journal_details_header(text: "created")

        # filter for comments again
        activity_tab.filter_journals(:only_comments)

        # expect empty state again
        activity_tab.expect_empty_state
        activity_tab.expect_no_journal_details_header(text: "created")

        # add a comment
        activity_tab.add_comment(text: "First comment by admin")

        # the empty state should be removed
        activity_tab.expect_no_empty_state
      end
    end

    context "when the work package has comments and changesets" do
      before do
        # for some reason the journal is set to the "Anonymous"
        # although the work_package is created by the admin
        # so we need to update the journal to the admin manually to simulate the real world case
        work_package.journals.first.update!(user: admin)

        create(:work_package_journal, user: admin, notes: "First comment by admin", journable: work_package, version: 2)
        create(:work_package_journal, user: admin, notes: "Second comment by admin", journable: work_package, version: 3)

        wp_page.visit!
        wp_page.wait_for_activity_tab
      end

      it "filters the activities based on type", :aggregate_failures do
        # add a non-comment journal entry by changing the work package attributes
        wp_page.update_attributes(subject: "A new subject") # rubocop:disable Rails/ActiveRecordAliases
        wp_page.expect_and_dismiss_toaster(message: "Successful update.")

        # expect all journal entries
        activity_tab.expect_journal_notes(text: "First comment by admin")
        activity_tab.expect_journal_notes(text: "Second comment by admin")
        activity_tab.expect_journal_changed_attribute(text: "Subject")

        activity_tab.filter_journals(:only_comments)

        # expect only the comments
        activity_tab.expect_journal_notes(text: "First comment by admin")
        activity_tab.expect_journal_notes(text: "Second comment by admin")
        activity_tab.expect_no_journal_changed_attribute(text: "Subject")

        activity_tab.filter_journals(:only_changes)

        # expect only the changes
        activity_tab.expect_no_journal_notes(text: "First comment by admin")
        activity_tab.expect_no_journal_notes(text: "Second comment by admin")
        activity_tab.expect_journal_changed_attribute(text: "Subject")

        activity_tab.filter_journals(:all)

        # expect all journal entries
        activity_tab.expect_journal_notes(text: "First comment by admin")
        activity_tab.expect_journal_notes(text: "Second comment by admin")
        activity_tab.expect_journal_changed_attribute(text: "Subject")

        # strip journal entries with comments and changesets down to the comments

        # creating a journal entry with both a comment and a changeset
        activity_tab.add_comment(text: "Third comment by admin")
        wp_page.update_attributes(subject: "A new subject!!!") # rubocop:disable Rails/ActiveRecordAliases
        wp_page.expect_and_dismiss_toaster(message: "Successful update.")

        latest_journal = work_package.journals.last

        activity_tab.within_journal_entry(latest_journal) do
          activity_tab.expect_journal_notes_header(text: admin.name)
          activity_tab.expect_journal_notes(text: "Third comment by admin")
          activity_tab.expect_journal_changed_attribute(text: "Subject")
          activity_tab.expect_no_journal_details_header
        end

        activity_tab.filter_journals(:only_comments)

        activity_tab.within_journal_entry(latest_journal) do
          activity_tab.expect_journal_notes_header(text: admin.name)
          activity_tab.expect_journal_notes(text: "Third comment by admin")
          activity_tab.expect_no_journal_changed_attribute
          activity_tab.expect_no_journal_details_header
        end

        activity_tab.filter_journals(:only_changes)

        activity_tab.within_journal_entry(latest_journal) do
          activity_tab.expect_no_journal_notes_header
          activity_tab.expect_no_journal_notes
          activity_tab.expect_journal_details_header(text: "change")
          activity_tab.expect_journal_details_header(text: admin.name)
          activity_tab.expect_journal_changed_attribute(text: "Subject")
        end
      end
    end
  end

  describe "sorting" do
    current_user { admin }
    let(:work_package) { create(:work_package, project:, author: admin) }

    before do
      # for some reason the journal is set to the "Anonymous"
      # although the work_package is created by the admin
      # so we need to update the journal to the admin manually to simulate the real world case
      work_package.journals.first.update!(user: admin)

      create(:work_package_journal, user: admin, notes: "First comment by admin", journable: work_package, version: 2)
      create(:work_package_journal, user: admin, notes: "Second comment by admin", journable: work_package, version: 3)

      wp_page.visit!
      wp_page.wait_for_activity_tab
    end

    it "sorts the activities based on the sorting preference", :aggregate_failures do
      # expect the default sorting to be asc
      expect(activity_tab.get_all_comments_as_arrary).to eq([
                                                              "First comment by admin",
                                                              "Second comment by admin"
                                                            ])
      activity_tab.set_journal_sorting(:desc)

      expect(activity_tab.get_all_comments_as_arrary).to eq([
                                                              "Second comment by admin",
                                                              "First comment by admin"
                                                            ])

      activity_tab.set_journal_sorting(:asc)

      expect(activity_tab.get_all_comments_as_arrary).to eq([
                                                              "First comment by admin",
                                                              "Second comment by admin"
                                                            ])

      # expect a new comment to be added at the bottom
      # when the sorting is set to asc
      #
      # creating a new comment
      activity_tab.add_comment(text: "Third comment by admin")

      expect(activity_tab.get_all_comments_as_arrary).to eq([
                                                              "First comment by admin",
                                                              "Second comment by admin",
                                                              "Third comment by admin"
                                                            ])

      activity_tab.set_journal_sorting(:desc)
      activity_tab.add_comment(text: "Fourth comment by admin")

      expect(activity_tab.get_all_comments_as_arrary).to eq([
                                                              "Fourth comment by admin",
                                                              "Third comment by admin",
                                                              "Second comment by admin",
                                                              "First comment by admin"
                                                            ])
    end
  end

  describe "notification bubble" do
    let(:work_package) { create(:work_package, project:, author: admin) }
    let!(:first_comment_by_admin) do
      create(:work_package_journal, user: admin, notes: "First comment by admin", journable: work_package, version: 2)
    end
    let!(:journal_mentioning_admin) do
      create(:work_package_journal, user: member, notes: "First comment by member mentioning @#{admin.name}",
                                    journable: work_package, version: 3)
    end
    let!(:notificaton_for_admin) do
      create(:notification, recipient: admin, resource: work_package, journal: journal_mentioning_admin, reason: :mentioned)
    end

    context "when admin is visiting the work package" do
      current_user { admin }

      before do
        wp_page.visit!
        wp_page.wait_for_activity_tab
      end

      it "shows the notification bubble", :aggregate_failures do
        activity_tab.within_journal_entry(journal_mentioning_admin) do
          activity_tab.expect_notification_bubble
        end
      end

      it "removes the notification bubble after the comment is read", :aggregate_failures do
        notificaton_for_admin.update!(read_ian: true)

        wp_page.visit!
        wp_page.wait_for_activity_tab

        activity_tab.within_journal_entry(journal_mentioning_admin) do
          activity_tab.expect_no_notification_bubble
        end
      end
    end

    context "when member is visiting the work package" do
      current_user { member }

      before do
        wp_page.visit!
        wp_page.wait_for_activity_tab
      end

      it "does not show the notification bubble", :aggregate_failures do
        activity_tab.within_journal_entry(journal_mentioning_admin) do
          activity_tab.expect_no_notification_bubble
        end
      end
    end
  end

  describe "edit comments" do
    let(:work_package) { create(:work_package, project:, author: admin) }
    let!(:first_comment_by_admin) do
      create(:work_package_journal, user: admin, notes: "First comment by admin", journable: work_package, version: 2)
    end
    let!(:first_comment_by_member) do
      create(:work_package_journal, user: member, notes: "First comment by member", journable: work_package, version: 3)
    end

    context "when admin is visiting the work package" do
      current_user { admin }

      before do
        wp_page.visit!
        wp_page.wait_for_activity_tab
      end

      it "can edit own comments", :aggregate_failures do
        # edit own comment
        activity_tab.edit_comment(first_comment_by_admin, text: "First comment by admin edited")

        # expect the edited comment to be shown
        activity_tab.within_journal_entry(first_comment_by_admin) do
          activity_tab.expect_journal_notes(text: "First comment by admin edited")
        end

        # cannot edit other user's comment
        # the edit button should not be shown
        activity_tab.within_journal_entry(first_comment_by_member) do
          page.find_test_selector("op-wp-journal-#{first_comment_by_member.id}-action-menu").click
          expect(page).not_to have_test_selector("op-wp-journal-#{first_comment_by_member.id}-edit")
        end
      end
    end
  end

  describe "quote comments" do
    let(:work_package) { create(:work_package, project:, author: admin) }
    let!(:first_comment_by_admin) do
      create(:work_package_journal, user: admin, notes: "First comment by admin", journable: work_package, version: 2)
    end
    let!(:first_comment_by_member) do
      create(:work_package_journal, user: member, notes: "First comment by member", journable: work_package, version: 3)
    end

    context "when admin is visiting the work package" do
      current_user { admin }

      before do
        wp_page.visit!
        wp_page.wait_for_activity_tab
      end

      it "can quote other user's comments", :aggregate_failures do
        # quote other user's comment
        # not adding additional text in this spec to the spec as I didn't find a way to add text the editor component
        activity_tab.quote_comment(first_comment_by_member)

        # expect the quoted comment to be shown
        activity_tab.expect_journal_notes(text: "A Member wrote:\nFirst comment by member")
      end
    end
  end

  describe "rescue editor content" do
    let(:work_package) { create(:work_package, project:, author: admin) }
    let(:second_work_package) { create(:work_package, project:, author: admin) }

    current_user { admin }

    before do
      wp_page.visit!
      wp_page.wait_for_activity_tab
    end

    it "rescues the editor content when navigating to another workpackage tab", :aggregate_failures do
      # add a comment, but do not save it
      activity_tab.add_comment(text: "First comment by admin", save: false)

      # navigate to another tab and back
      page.find("li[data-tab-id=\"relations\"]").click
      page.find("li[data-tab-id=\"activity\"]").click

      # expect the editor content to be rescued on the client side
      within("#work-package-journal-form") do
        editor = FormFields::Primerized::EditorFormField.new("notes", selector: "#work-package-journal-form")
        editor.expect_value("First comment by admin")
        # save the comment, which was rescued on the client side
        page.find_test_selector("op-submit-work-package-journal-form").click
      end

      # expect the comment to be added properly
      activity_tab.expect_journal_notes(text: "First comment by admin")
    end

    it "scopes the rescued content to the work package", :aggregate_failures do
      # add a comment to the first work package, but do not save it
      activity_tab.add_comment(text: "First comment by admin", save: false)

      # navigate to another tab in order to prevent the browser native confirm dialog of the unsaved changes
      page.find("li[data-tab-id=\"relations\"]").click

      # navigate to the second work package
      wp_page = Pages::FullWorkPackage.new(second_work_package, project)
      wp_page.visit!
      wp_page.wait_for_activity_tab

      # wait for the stimulus component to be mounted, TODO: get rid of static sleep
      sleep 1
      # open the editor
      page.find_by_id("open-work-package-journal-form").click

      # expect the editor content to be empty
      within("#work-package-journal-form") do
        editor = FormFields::Primerized::EditorFormField.new("notes", selector: "#work-package-journal-form")
        editor.expect_value("")
      end
    end

    it "scopes the rescued content to the user", :aggregate_failures do
      # add a comment to the first work package, but do not save it
      activity_tab.add_comment(text: "First comment by admin", save: false)

      # navigate to another tab in order to prevent the browser native confirm dialog of the unsaved changes
      page.find("li[data-tab-id=\"relations\"]").click

      logout
      login_as(member)

      # navigate to the same workpackage, but as a different user
      wp_page.visit!
      wp_page.wait_for_activity_tab

      # wait for the stimulus component to be mounted, TODO: get rid of static sleep
      sleep 1
      # open the editor
      page.find_by_id("open-work-package-journal-form").click

      # expect the editor content to be empty
      within("#work-package-journal-form") do
        editor = FormFields::Primerized::EditorFormField.new("notes", selector: "#work-package-journal-form")
        editor.expect_value("")
      end

      logout
      login_as(admin)

      # navigate to the same workpackage, but as a different user
      wp_page.visit!
      wp_page.wait_for_activity_tab

      # wait for the stimulus component to be mounted, TODO: get rid of static sleep
      sleep 1

      # expect the editor to be opened and content to be rescued for the correct user
      within("#work-package-journal-form") do
        editor = FormFields::Primerized::EditorFormField.new("notes", selector: "#work-package-journal-form")
        editor.expect_value("First comment by admin")
      end
    end
  end

  describe "auto scrolling" do
    current_user { admin }
    let(:work_package) { create(:work_package, project:, author: admin) }

    # create enough comments to make the journal container scrollable
    20.times do |i|
      let!(:"comment_#{i + 1}") do
        create(:work_package_journal, user: admin, notes: "Comment #{i + 1}", journable: work_package, version: i + 2)
      end
    end

    describe "scrolls to comment specified in the URL" do
      context "when sorting set to asc" do
        let!(:admin_preferences) { create(:user_preference, user: admin, others: { comments_sorting: :asc }) }

        before do
          visit project_work_package_path(project, work_package.id, "activity", anchor: "activity-1")
          wp_page.wait_for_activity_tab
        end

        it "scrolls to the comment specified in the URL", :aggregate_failures do
          sleep 1 # wait for auto scrolling to finish
          activity_tab.expect_journal_container_at_position(50) # would be at the bottom if no anchor would be provided
        end
      end

      context "when sorting set to desc" do
        let!(:admin_preferences) { create(:user_preference, user: admin, others: { comments_sorting: :desc }) }

        before do
          visit project_work_package_path(project, work_package.id, "activity", anchor: "activity-1")
          wp_page.wait_for_activity_tab
        end

        it "scrolls to the comment specified in the URL", :aggregate_failures do
          sleep 1 # wait for auto scrolling to finish
          activity_tab.expect_journal_container_at_bottom # would be at the top if no anchor would be provided
        end
      end
    end

    context "when sorting set to asc" do
      let!(:admin_preferences) { create(:user_preference, user: admin, others: { comments_sorting: :asc }) }

      before do
        # set WORK_PACKAGES_ACTIVITIES_TAB_POLLING_INTERVAL_IN_MS to 1000
        # to speed up the polling interval for test duration
        ENV["WORK_PACKAGES_ACTIVITIES_TAB_POLLING_INTERVAL_IN_MS"] = "1000"

        wp_page.visit!
        wp_page.wait_for_activity_tab
      end

      it "scrolls to the bottom when the newest journal entry is on the bottom", :aggregate_failures do
        sleep 1 # wait for auto scrolling to finish
        activity_tab.expect_journal_container_at_bottom

        # auto-scrolls to the bottom when a new comment is added by the user
        # add a comment
        activity_tab.add_comment(text: "New comment by admin")
        activity_tab.expect_journal_notes(text: "New comment by admin") # wait for the comment to be added
        activity_tab.expect_journal_container_at_bottom

        # auto-scrolls to the bottom when a new comment is added by another user
        # add a comment
        latest_journal_version = work_package.journals.last.version
        create(:work_package_journal, user: member, notes: "New comment by member", journable: work_package,
                                      version: latest_journal_version + 1)
        activity_tab.expect_journal_notes(text: "New comment by member") # wait for the comment to be added
        sleep 1 # wait for auto scrolling to finish
        activity_tab.expect_journal_container_at_bottom
      end
    end

    context "when sorting set to desc" do
      let!(:admin_preferences) { create(:user_preference, user: admin, others: { comments_sorting: :desc }) }

      before do
        wp_page.visit!
        wp_page.wait_for_activity_tab
      end

      it "does not scroll to the bottom as the newest journal entry is on the top", :aggregate_failures do
        sleep 1 # wait for auto scrolling to finish
        activity_tab.expect_journal_container_at_top
      end
    end

    # describe "scrolling to the bottom when sorting set to asc" do
    #   it "scrolls to the bottom when the oldest journal entry is on top", :aggregate_failures do
    #     # add a comment
    #     activity_tab.add_comment(text: "First comment by admin")

    #     # scroll to the top
    #     page.execute_script("document.querySelector('.op-wp-journals-container').scrollTop = 0")

    #     # add another comment
    #     activity_tab.add_comment(text: "Second comment by admin")

    #     # expect the oldest comment to be at the bottom
    #     activity_tab.expect_journal_notes(text: "First comment by admin")
    #   end
    # end
  end
end