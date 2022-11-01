#-- copyright
# OpenProject is an open source project management software.
# Copyright (C) 2012-2022 the OpenProject GmbH
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

module UserPreferences
  class ParamsContract < ::ParamsContract
    DATE_ALERT_DURATIONS = [nil, 0, 1, 3, 7].freeze
    DATE_ALERT_OVERDUE_DURATIONS = [nil, 1, 3, 7].freeze

    validate :only_one_global_setting,
             if: -> { notifications.present? }
    validate :global_email_alerts,
             if: -> { notifications.present? }
    validate :global_date_alerts,
             if: -> { notifications.present? }
    validate :project_date_alerts,
             if: -> { notifications.present? }

    protected

    def only_one_global_setting
      if global_notifications.count > 1
        errors.add :notification_settings, :only_one_global_setting
      end
    end

    def global_email_alerts
      if project_notifications.any?(method(:email_alerts_set?))
        errors.add :notification_settings, :email_alerts_global
      end
    end

    def global_date_alerts
      if any_of_date_fields_fail_validation?(global_notifications)
        errors.add :notification_settings, :wrong_date
      end
    end

    def project_date_alerts
      if any_of_date_fields_fail_validation?(project_notifications)
        errors.add :notification_settings, :wrong_date
      end
    end

    def any_of_date_fields_fail_validation?(notifications_type)
      notifications_type.any? do |setting|
        setting.slice(:start_date, :due_date).detect do |_, date|
          DATE_ALERT_DURATIONS.exclude?(date)
        end || DATE_ALERT_OVERDUE_DURATIONS.exclude?(setting[:overdue])
      end
    end

    ##
    # Check if the given notification hash has email-only settings set
    def email_alerts_set?(notification_setting)
      NotificationSetting.email_settings.any? do |setting|
        notification_setting[setting] == true
      end
    end

    def global_notifications
      notifications.select { |notification| notification[:project_id].nil? }
    end

    def project_notifications
      notifications.select { |notification| notification[:project_id].present? }
    end

    def notifications
      params[:notification_settings]
    end
  end
end
