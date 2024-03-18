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

module Storages
  class ManageNextcloudIntegrationJob < ApplicationJob
    include GoodJob::ActiveJobExtensions::Concurrency
    using ::Storages::Peripherals::ServiceResultRefinements

    good_job_control_concurrency_with(
      total_limit: 2,
      enqueue_limit: 1,
      perform_limit: 1,
      key: "ManageNextcloudIntegrationJob"
    )
    SINGLE_THREAD_DEBOUNCE_TIME = 4.seconds.freeze
    KEY = :manage_nextcloud_integration_job_debounce_happend_at
    CRON_JOB_KEY = :'Storages::ManageNextcloudIntegrationJob'

    queue_with_priority :above_normal

    class << self
      def debounce
        if debounce_happend_in_current_thread_recently?
          false
        else
          # TODO:
          # Why there is 5 seconds delay?
          # it is like that because for 1 thread and if there is no delay more than
          # SINGLE_THREAD_DEBOUNCE_TIME(4.seconds)
          # then some events can be lost
          #
          # Possibly "true" solutions are:
          # 1. have after_request middleware to schedule one job after a request cycle
          # 2. use concurrent ruby to have 'true' debounce.
          result = set(wait: 5.seconds).perform_later
          RequestStore.store[KEY] = Time.current
          result
        end
      end

      def disable_cron_job_if_needed
        if ::Storages::ProjectStorage.active_automatically_managed.exists?
          GoodJob::Setting.cron_key_enable(CRON_JOB_KEY) unless GoodJob::Setting.cron_key_enabled?(CRON_JOB_KEY)
        elsif GoodJob::Setting.cron_key_enabled?(CRON_JOB_KEY)
          GoodJob::Setting.cron_key_disable(CRON_JOB_KEY)
        end
      end

      private

      def debounce_happend_in_current_thread_recently?
        timestamp = RequestStore.store[KEY]
        timestamp.present? && (timestamp + SINGLE_THREAD_DEBOUNCE_TIME) > Time.current
      end
    end

    def perform
      find_storages do |storage|
        next unless storage.configured?
        result = service_for(storage).call(storage)
        result.match(
          on_success: ->(_) { storage.mark_as_healthy },
          on_failure: ->(errors) { storage.mark_as_unhealthy(reason: errors.to_s) }
        )
      end
    end

    private

    def find_storages(&)
      ::Storages::Storage
        .automatic_management_enabled
        .includes(:oauth_client)
        .find_each(&)
    end

    def service_for(storage)
      return NextcloudGroupFolderPropertiesSyncService if storage.provider_type_nextcloud?
      return OneDriveManagedFolderSyncService if storage.provider_type_one_drive?

      raise 'Unknown Storage'
    end
  end
end
