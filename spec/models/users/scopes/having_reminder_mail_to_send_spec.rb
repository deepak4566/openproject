#-- encoding: UTF-8

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

require 'spec_helper'

describe User, '.having_reminder_mail_to_send', type: :model do
  subject(:scope) do
    described_class.having_reminder_mail_to_send(scope_time)
  end

  # Fix the time of the specs to ensure a consistent
  around do |example|
    Timecop.travel(current_time) do
      example.run
    end
  end

  # Let the date be one where workdays are enabled by default
  # to avoid specifying them explictly
  let(:current_time) { "2021-09-30T08:10:59Z".to_datetime }
  let(:scope_time) { "2021-09-30T08:00:00Z".to_datetime }

  let(:paris_user) do
    FactoryBot.create(
      :user,
      firstname: 'Paris',
      preferences: {
        time_zone: "Paris",
        workdays: paris_user_workdays,
        daily_reminders: paris_user_daily_reminders
      }
    )
  end
  let(:paris_user_workdays) { [1, 2, 3, 4, 5] }
  let(:paris_user_daily_reminders) do
    {
      enabled: true,
      times: [hitting_reminder_slot_for("Paris", current_time)]
    }
  end
  let(:notifications) { FactoryBot.create(:notification, recipient: paris_user, created_at: 5.minutes.ago) }
  let(:users) { [paris_user] }

  before do
    notifications
    users
  end

  context 'for a user whose local time is matching the configured time' do
    it 'contains the user' do
      expect(scope)
        .to match_array([paris_user])
    end
  end

  context 'for a user whose local time is matching but the workday is disabled' do
    # Configured date is a thursday = 4
    let(:paris_user_workdays) { [1, 2] }

    it 'is empty' do
      expect(scope)
        .to be_empty
    end
  end

  context 'for a user whose local time is not matching the configured time' do
    let(:current_time) { "2021-09-30T08:20:59Z".to_datetime }
    let(:scope_time) { "2021-09-30T08:15:00Z".to_datetime }

    it 'is empty' do
      expect(scope)
        .to be_empty
    end
  end

  context 'for a user whose local time is on the previous workday' do
    # 8:00 thursday UTC = 22:00 wednesday Hawaii
    let(:hawaii_user) do
      FactoryBot.create(
        :user,
        firstname: 'Hawaii',
        preferences: {
          time_zone: "Hawaii",
          workdays: hawaii_user_workdays,
          daily_reminders: {
            enabled: true,
            times: [hitting_reminder_slot_for("Hawaii", current_time)]
          }
        }
      )
    end
    let(:notifications) do
      FactoryBot.create(:notification, recipient: hawaii_user, created_at: 5.minutes.ago)
    end
    let(:users) { [hawaii_user] }
    let(:hawaii_user_workdays) { paris_user_workdays }

    it 'contains the user' do
      expect(scope)
        .to match_array([hawaii_user])
    end

    context 'when the user disables Wednesday as a workday' do
      let(:hawaii_user_workdays) { [1, 2, 4, 5, 6, 7] }

      it 'is empty' do
        expect(scope)
          .to be_empty
      end
    end
  end

  context 'for a user whose local time is on the next workday' do
    # 12:00 thursday UTC = 03:00 friday @ Samoa
    let(:current_time) { "2021-09-30T12:05:59Z".to_datetime }
    let(:scope_time) { "2021-09-30T12:00:00Z".to_datetime }

    let(:samoa_user) do
      FactoryBot.create(
        :user,
        firstname: 'Samoa',
        preferences: {
          time_zone: "Samoa",
          workdays: samoa_user_workdays,
          daily_reminders: {
            enabled: true,
            times: [hitting_reminder_slot_for("Samoa", current_time)]
          }
        }
      )
    end
    let(:notifications) do
      FactoryBot.create(:notification, recipient: samoa_user, created_at: 5.minutes.ago)
    end
    let(:users) { [samoa_user] }
    let(:samoa_user_workdays) { paris_user_workdays }

    it 'contains the user' do
      expect(scope)
        .to match_array([samoa_user])
    end

    context 'when the user disables Wednesday as a workday' do
      let(:samoa_user_workdays) { [1, 2, 3, 4, 6, 7] }

      it 'is empty' do
        expect(scope)
          .to be_empty
      end
    end
  end

  context 'for a user whose local time is matching the configured time (in a non CET time zone)' do
    let(:moscow_user) do
      FactoryBot.create(
        :user,
        firstname: 'Moscow',
        preferences: {
          time_zone: "Moscow",
          daily_reminders: {
            enabled: true,
            times: [hitting_reminder_slot_for("Moscow", current_time)]
          }
        }
      )
    end
    let(:notifications) do
      FactoryBot.create(:notification, recipient: moscow_user, created_at: 5.minutes.ago)
    end
    let(:users) { [moscow_user] }

    it 'contains the user' do
      expect(scope)
        .to match_array([moscow_user])
    end
  end

  context 'for a user whose local time is matching one of the configured times' do
    let(:paris_user_daily_reminders) do
      {
        enabled: true,
        times: [
          hitting_reminder_slot_for("Paris", current_time - 3.hours),
          hitting_reminder_slot_for("Paris", current_time),
          hitting_reminder_slot_for("Paris", current_time + 3.hours)
        ]
      }
    end

    it 'contains the user' do
      expect(scope)
        .to match_array([paris_user])
    end
  end

  context 'for a user who has configured a slot between the earliest_time (in local time) and his current local time' do
    let(:paris_user_daily_reminders) do
      {
        enabled: true,
        times: [
          hitting_reminder_slot_for("Paris", current_time - 2.hours),
          hitting_reminder_slot_for("Paris", current_time + 3.hours)
        ]
      }
    end
    let(:scope_time) { ActiveSupport::TimeZone['UTC'].parse("06:00") }

    it 'contains the user' do
      expect(scope)
        .to match_array([paris_user])
    end
  end

  context 'for a user who has configured a slot before the earliest_time (in local time) and after his current local time' do
    let(:paris_user_daily_reminders) do
      {
        enabled: true,
        times: [
          hitting_reminder_slot_for("Paris", current_time - 3.hours),
          hitting_reminder_slot_for("Paris", current_time + 1.hour)
        ]
      }
    end
    let(:scope_time) { current_time - 2.hours }

    it 'is empty' do
      expect(scope)
        .to be_empty
    end
  end

  context 'for a user whose local time is matching the configured time but without a notification' do
    let(:notifications) do
      nil
    end

    it 'is empty' do
      expect(scope)
        .to be_empty
    end
  end

  context 'for a user whose local time is matching the configured time but with the reminder being deactivated' do
    let(:paris_user_daily_reminders) do
      {
        enabled: false,
        times: [hitting_reminder_slot_for("Paris", current_time)]
      }
    end

    it 'is empty' do
      expect(scope)
        .to be_empty
    end
  end

  context 'for a user whose local time is matching the configured time but without a daily_reminders setting at 8:00' do
    let(:paris_user) do
      FactoryBot.create(
        :user,
        firstname: 'Paris',
        preferences: {
          time_zone: "Paris"
        }
      )
    end
    let(:current_time) { ActiveSupport::TimeZone['Paris'].parse("2021-09-30T08:09").utc }
    let(:scope_time) { ActiveSupport::TimeZone['Paris'].parse("2021-09-30T08:00") }

    it 'contains the user' do
      expect(scope)
        .to match_array([paris_user])
    end
  end

  context 'for a user whose local time is matching the configured time but without a daily_reminders setting at 10:00' do
    let(:paris_user) do
      FactoryBot.create(
        :user,
        firstname: 'Paris',
        preferences: {
          time_zone: "Paris"
        }
      )
    end
    let(:current_time) { ActiveSupport::TimeZone['Paris'].parse("2021-09-30T10:00").utc }
    let(:scope_time) { ActiveSupport::TimeZone['Paris'].parse("2021-09-30T10:00") }

    it 'is empty' do
      expect(scope)
        .to be_empty
    end
  end

  context 'for a user who is in a 45 min time zone and having reminder set to 8:00 and being executed at 8:10' do
    let(:kathmandu_user) do
      FactoryBot.create(
        :user,
        firstname: 'Kathmandu',
        preferences: {
          time_zone: "Kathmandu",
          daily_reminders: {
            enabled: true,
            times: [hitting_reminder_slot_for("Asia/Kathmandu", current_time)]
          }
        }
      )
    end
    let(:current_time) { ActiveSupport::TimeZone['Asia/Kathmandu'].parse("2021-09-30T08:10").utc }
    let(:scope_time) { ActiveSupport::TimeZone['Asia/Kathmandu'].parse("2021-09-30T08:00").utc }
    let(:notifications) do
      FactoryBot.create(:notification, recipient: kathmandu_user, created_at: 5.minutes.ago)
    end

    let(:users) { [kathmandu_user] }

    it 'contains the user' do
      expect(scope)
        .to match_array([kathmandu_user])
    end
  end

  context 'for a user who is in a 45 min time zone and having reminder set to 8:00 and being executed at 8:40' do
    let(:kathmandu_user) do
      FactoryBot.create(
        :user,
        firstname: 'Kathmandu',
        preferences: {
          time_zone: "Kathmandu",
          daily_reminders: {
            enabled: true,
            times: [hitting_reminder_slot_for("Asia/Kathmandu", current_time)]
          }
        }
      )
    end
    let(:current_time) { ActiveSupport::TimeZone['Asia/Kathmandu'].parse("2021-09-30T08:40").utc }
    let(:scope_time) { ActiveSupport::TimeZone['Asia/Kathmandu'].parse("2021-09-30T08:30").utc }
    let(:notifications) do
      FactoryBot.create(:notification, recipient: kathmandu_user, created_at: 5.minutes.ago)
    end

    let(:users) { [kathmandu_user] }

    it 'is empty' do
      expect(scope)
        .to be_empty
    end
  end

  context 'for a user who is in a 45 min time zone and having reminder set to 8:00 and being executed at 7:55' do
    let(:kathmandu_user) do
      FactoryBot.create(
        :user,
        firstname: 'Kathmandu',
        preferences: {
          time_zone: "Kathmandu",
          daily_reminders: {
            enabled: true,
            times: [hitting_reminder_slot_for("Asia/Kathmandu", current_time)]
          }
        }
      )
    end
    let(:current_time) { ActiveSupport::TimeZone['Asia/Kathmandu'].parse("2021-09-30T07:55").utc }
    let(:scope_time) { ActiveSupport::TimeZone['Asia/Kathmandu'].parse("2021-09-30T07:45").utc }
    let(:notifications) do
      FactoryBot.create(:notification, recipient: kathmandu_user, created_at: 5.minutes.ago)
    end

    let(:users) { [kathmandu_user] }

    it 'is empty' do
      expect(scope)
        .to be_empty
    end
  end

  context 'for a user whose local time is matching the configured time but with an already read notification (IAN)' do
    let(:notifications) do
      FactoryBot.create(:notification, recipient: paris_user, created_at: 5.minutes.ago, read_ian: true)
    end

    it 'is empty' do
      expect(scope)
        .to be_empty
    end
  end

  context 'for a user whose local time is matching the configured time but with an already read notification (reminder)' do
    let(:notifications) do
      FactoryBot.create(:notification, recipient: paris_user, created_at: 5.minutes.ago, mail_reminder_sent: true)
    end

    it 'is empty' do
      expect(scope)
        .to be_empty
    end
  end

  context 'for a user whose local time is matching the configured time but with the user being inactive' do
    let(:notifications) do
      FactoryBot.create(:notification, recipient: paris_user, created_at: 5.minutes.ago)
    end

    before do
      paris_user.locked!
    end

    it 'is empty' do
      expect(scope)
        .to be_empty
    end
  end

  context 'for a user whose local time is before the configured time' do
    let(:paris_user_daily_reminders) do
      {
        enabled: true,
        times: [hitting_reminder_slot_for("Paris", current_time + 1.hour)]
      }
    end

    it 'is empty' do
      expect(scope)
        .to be_empty
    end
  end

  context 'for a user whose local time is after the configured time' do
    let(:paris_user_daily_reminders) do
      {
        enabled: true,
        times: [hitting_reminder_slot_for("Paris", current_time - 1.hour)]
      }
    end

    it 'is empty' do
      expect(scope)
        .to be_empty
    end
  end

  context 'for a user without a time zone' do
    let(:paris_user) do
      FactoryBot.create(
        :user,
        firstname: 'Paris',
        preferences: {
          daily_reminders: {
            enabled: true,
            times: [hitting_reminder_slot_for("UTC", current_time)]
          }
        }
      )
    end

    it 'is including the user as UTC is assumed' do
      expect(scope)
        .to match_array([paris_user])
    end
  end

  context 'for a user without a time zone and daily_reminders at 08:00' do
    let(:paris_user) do
      FactoryBot.create(
        :user,
        firstname: 'Paris',
        preferences: {}
      )
    end
    let(:current_time) { ActiveSupport::TimeZone['UTC'].parse("2021-09-30T08:00").utc }

    it 'is including the user as UTC at 08:00 is assumed' do
      expect(scope)
        .to match_array([paris_user])
    end
  end

  context 'for a user without a time zone and daily_reminders at 10:00' do
    let(:paris_user) do
      FactoryBot.create(
        :user,
        firstname: 'Paris',
        preferences: {}
      )
    end
    let(:current_time) { ActiveSupport::TimeZone['UTC'].parse("2021-09-30T10:00").utc }
    let(:scope_time) { ActiveSupport::TimeZone['UTC'].parse("2021-09-30T10:00").utc }

    it 'is empty as UTC at 08:00 is assumed' do
      expect(scope)
        .to be_empty
    end
  end

  context 'when the provided scope_time is after the current time' do
    let(:scope_time) { Time.current + 1.minute }

    it 'raises an error' do
      expect { scope }
        .to raise_error ArgumentError
    end
  end

  context 'for a user without preferences at 08:00' do
    let(:current_time) { ActiveSupport::TimeZone['UTC'].parse("2021-09-30T08:00").utc }
    let(:scope_time) { ActiveSupport::TimeZone['UTC'].parse("2021-09-30T08:00").utc }

    before do
      paris_user.pref.destroy
    end

    it 'is including the user as UTC at 08:00 is assumed' do
      expect(scope)
        .to match_array([paris_user])
    end
  end

  context 'for a user without preferences at 10:00' do
    let(:current_time) { ActiveSupport::TimeZone['UTC'].parse("2021-09-30T10:00").utc }
    let(:scope_time) { ActiveSupport::TimeZone['UTC'].parse("2021-09-30T10:00").utc }

    before do
      paris_user.pref.destroy
    end

    it 'is empty as UTC at 08:00 is assumed' do
      expect(scope)
        .to be_empty
    end
  end
end
