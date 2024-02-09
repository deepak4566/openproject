# frozen_string_literal: true

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
#
module Storages::Admin
  class OAuthAccessGrantNudgeModalComponent < ApplicationComponent # rubocop:disable OpenProject/AddPreviewForViewComponent
    options dialog_id: 'storages--oauth-grant-nudge-modal-component',
            dialog_body_id: 'storages--oauth-grant-nudge-modal-body-component',
            confirm_button_text: I18n.t('storages.oauth_grant_nudge_modal.confirm_button_label'),
            authorized: false

    attr_reader :project_storage

    def initialize(project_storage_id:, **options)
      @project_storage = ::Storages::ProjectStorage.find_by(id: project_storage_id)
      super(@project_storage, **options)
    end

    def render?
      @project_storage.present?
    end

    private

    def title
      return if authorized

      I18n.t('storages.oauth_grant_nudge_modal.title')
    end

    def cancel_button_text
      if authorized
        I18n.t('button_close')
      else
        I18n.t('storages.oauth_grant_nudge_modal.cancel_button_label')
      end
    end

    def body_text
      if authorized
        success_title = I18n.t('storages.oauth_grant_nudge_modal.access_granted')
        success_subtitle = I18n.t('storages.oauth_grant_nudge_modal.storage_ready', storage: project_storage.storage.name)
        concat(render(Storages::OpenProjectStorageModalComponent::Body.new(:success, success_subtitle:, success_title:)))
      else
        I18n.t('storages.oauth_grant_nudge_modal.body', storage: project_storage.storage.name)
      end
    end

    def confirm_button_url
      url_helpers.oauth_access_grant_project_settings_project_storage_path(
        project_id: project_storage.project.id,
        id: project_storage
      )
    end
  end
end
