require 'spec_helper'
require 'support/components/notifications/center'

describe "Notification center", type: :feature, js: true, with_settings: { journal_aggregation_time_minutes: 0 } do
  # Notice that the setup in this file here is not following the normal rules as
  # it also tests notification creation.
  let!(:project) { FactoryBot.create :project }
  let!(:recipient) do
    # Needs to take place before the work package is created so that the notification listener is set up
    FactoryBot.create :user,
                      member_in_project: project,
                      member_with_permissions: %i[view_work_packages]
  end
  let!(:other_user) do
    FactoryBot.create(:user)
  end
  let(:work_package) do
    FactoryBot.create :work_package, project: project, author: other_user
  end
  let(:work_package2) do
    FactoryBot.create :work_package, project: project, author: other_user
  end
  let(:notification) do
    # Will have been created via the JOURNAL_CREATED event listeners
    work_package.journals.first.notifications.first
  end
  let(:notification2) do
    # Will have been created via the JOURNAL_CREATED event listeners
    work_package2.journals.first.notifications.first
  end

  let(:center) { ::Components::Notifications::Center.new }
  let(:activity_tab) { ::Components::WorkPackages::Activities.new(work_package) }
  let(:split_screen) { ::Pages::SplitWorkPackage.new work_package }

  let(:notifications) do
    [notification, notification2]
  end

  before do
    # The notifications need to be created as a different user
    # as they are otherwise swallowed to avoid self notification.

    User.execute_as(other_user) do
      perform_enqueued_jobs do
        notifications
      end
    end
  end

  describe 'notification for a new journal' do
    current_user { recipient }

    it 'will not show all details of the journal' do
      visit home_path
      center.expect_bell_count 2
      center.open

      center.expect_work_package_item notification
      center.expect_work_package_item notification2
      center.click_item notification
      split_screen.expect_open

      activity_tab.expect_wp_has_been_created_activity work_package
    end
  end

  describe 'basic use case' do
    current_user { recipient }

    it 'can see the notification and dismiss it' do
      visit home_path
      center.expect_bell_count 2
      center.open

      center.expect_work_package_item notification
      center.expect_work_package_item notification2
      center.mark_all_read

      center.expect_bell_count 0
      notification.reload
      expect(notification.read_ian).to be_truthy

      center.expect_no_item notification
      center.expect_no_item notification2
    end

    it 'can open the split screen of the notification' do
      visit home_path
      center.expect_bell_count 2
      center.open

      center.click_item notification
      split_screen.expect_open

      center.expect_item_not_read notification
      center.expect_work_package_item notification2

      center.mark_notification_as_read notification

      retry_block do
        notification.reload
        raise "Expected notification to be marked read" unless notification.read_ian
      end

      center.close
      center.expect_bell_count 1

      center.open
      center.expect_no_item notification
      center.expect_work_package_item notification2
    end

    context 'with multiple notifications per work package' do
      # In this context we have four notifications for two work packages.
      let(:notification3) do
        work_package2.journal_notes = 'A new notification is created here on wp 2'
        work_package2.save!

        # Will have been created via the JOURNAL_CREATED event listeners
        work_package2.journals.last.notifications.first
      end
      let(:notification4) do
        work_package.subject = 'Changing the subject'
        work_package.save!

        # Will have been created via the JOURNAL_CREATED event listeners
        work_package.journals.last.notifications.first
      end
      let(:split_screen2) { ::Pages::SplitWorkPackage.new work_package2 }

      let(:notifications) do
        [notification, notification2, notification3, notification4]
      end


      it 'aggregates notifications per work package and sets all as read when opened' do
        visit home_path
        center.expect_bell_count 4
        center.open

        center.expect_number_of_notifications 2

        # Click on first list item, which should be the youngest notification
        center.click_item notification4

        split_screen.expect_open
        center.mark_notification_as_read notification4

        retry_block do
          notification4.reload
          raise "Expected notification to be marked read" unless notification4.read_ian
        end

        expect(notification.reload.read_ian).to be_truthy
        expect(notification2.reload.read_ian).to be_falsey
        expect(notification3.reload.read_ian).to be_falsey
        expect(notification4.reload.read_ian).to be_truthy

        # Click on second list item, which should be the youngest notification that does
        # not belong to the work package that represents the first list item.
        center.click_item notification3

        split_screen2.expect_open
        center.mark_notification_as_read notification3

        retry_block do
          notification3.reload
          raise "Expected notification to be marked read" unless notification3.read_ian
        end

        expect(notification2.reload.read_ian).to be_truthy
        expect(notification3.reload.read_ian).to be_truthy
      end
    end
  end
end
