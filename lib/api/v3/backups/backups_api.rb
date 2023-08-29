#-- copyright
# OpenProject is an open source project management software.
# Copyright (C) 2012-2023 the OpenProject GmbH
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

module API
  module V3
    module Backups
      class BackupsAPI < ::API::OpenProjectAPI
        resources :backups do
          before do
            raise API::Errors::NotFound unless OpenProject::Configuration.backup_enabled?
          end

          after_validation do
            authorize Backup.create_permission, global: true
          end

          params do
            requires :backupToken, type: String
            optional :comment, type: String, desc: 'Comment to help identify the backup later'

            optional(
              :attachments,
              type: Boolean,
              default: true,
              desc: 'Whether or not to include attachments (default: true)'
            )
          end
          post do
            service = ::Backups::CreateService.new(
              user: current_user,
              backup_token: params[:backupToken],
              include_attachments: params[:attachments]
            )
            call = service.call comment: params[:comment].presence, creator: current_user

            if call.failure?
              errors = call.errors.errors

              if err = errors.find { |e| e.type == :invalid_token || e.type == :token_cooldown }
                fail ::API::Errors::Unauthorized, message: err.full_message
              elsif err = errors.find { |e| e.type == :backup_pending }
                fail ::API::Errors::Conflict, message: err.full_message
              elsif err = errors.find { |e| e.type == :limit_reached }
                fail ::API::Errors::TooManyRequests, message: err.full_message
              end

              fail ::API::Errors::ErrorBase.create_and_merge_errors(call.errors)
            end

            status 202

            BackupRepresenter.new call.result, current_user:
          end

          params do
            requires :id, desc: 'Backup id'
          end
          route_param :id do
            before do
              raise API::Errors::NotFound unless OpenProject::Configuration.restore_backup_enabled?
            end

            after_validation do
              authorize Backup.restore_permission, global: true
            end

            params do
              requires :backupToken, type: String
            end
            post :restore do
              service = ::Backups::RestoreService.new user: current_user, backup_token: params[:backupToken]
              call = service.call backup_id: params[:id], preview: false

              if call.failure?
                errors = call.errors.errors

                if err = errors.find { |e| e.type == :invalid_token }
                  fail ::API::Errors::Unauthorized, message: err.full_message
                elsif err = errors.find { |e| e.type == :backup_pending }
                  fail ::API::Errors::Conflict, message: err.full_message
                end

                fail ::API::Errors::ErrorBase.create_and_merge_errors(call.errors)
              end

              status 202

              BackupRepresenter.new call.result, current_user:
            end

            params do
              requires :backupToken, type: String
            end
            post :preview do
              authorize Backup.restore_permission, global: true

              service = ::Backups::RestoreService.new user: current_user, backup_token: params[:backupToken]
              call = service.call backup_id: params[:id], preview: true

              if call.failure?
                errors = call.errors.errors

                if err = errors.find { |e| e.type == :invalid_token }
                  fail ::API::Errors::Unauthorized, message: err.full_message
                elsif err = errors.find { |e| e.type == :backup_pending }
                  fail ::API::Errors::Conflict, message: err.full_message
                end

                fail ::API::Errors::ErrorBase.create_and_merge_errors(call.errors)
              end

              status 202

              BackupRepresenter.new call.result, current_user:
            end
          end
        end
      end
    end
  end
end
