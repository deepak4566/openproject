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

module Storages
  module Peripherals
    module StorageInteraction
      module OneDrive
        class CreateFolderCommand
          using ServiceResultRefinements

          def self.call(storage:, auth_strategy:, folder_name:, parent_location:)
            new(storage).call(auth_strategy:, folder_name:, parent_location:)
          end

          def initialize(storage)
            @storage = storage
          end

          def call(auth_strategy:, folder_name:, parent_location:)
            Authentication[auth_strategy].call(storage: @storage, http_options:) do |http|
              handle_response http.post(uri_for(parent_location), body: payload(folder_name))
            end
          end

          private

          def http_options
            Util.json_content_type
          end

          def uri_for(parent_location)
            return "#{base_uri}/root/children" if parent_location.root?

            "#{base_uri}/items/#{parent_location}/children"
          end

          def handle_response(response)
            case response
            in { status: 200..299 }
              ServiceResult.success(result: file_info_for(MultiJson.load(response.body, symbolize_keys: true)),
                                    message: "Folder was successfully created.")
            in { status: 404 }
              ServiceResult.failure(result: :not_found,
                                    errors: Util.storage_error(code: :not_found, response:, source: self.class))
            in { status: 401 }
              ServiceResult.failure(result: :unauthorized,
                                    errors: Util.storage_error(code: :unauthorized, response:, source: self.class))
            in { status: 409 }
              ServiceResult.failure(result: :already_exists,
                                    errors: Util.storage_error(code: :conflict, response:, source: self.class))
            else
              ServiceResult.failure(result: :error,
                                    errors: Util.storage_error(code: :error, response:, source: self.class))
            end
          end

          def file_info_for(json_file)
            StorageFile.new(
              id: json_file[:id],
              name: json_file[:name],
              size: json_file[:size],
              mime_type: Util.mime_type(json_file),
              created_at: Time.zone.parse(json_file.dig(:fileSystemInfo, :createdDateTime)),
              last_modified_at: Time.zone.parse(json_file.dig(:fileSystemInfo, :lastModifiedDateTime)),
              created_by_name: json_file.dig(:createdBy, :user, :displayName),
              last_modified_by_name: json_file.dig(:lastModifiedBy, :user, :displayName),
              location: Util.extract_location(json_file[:parentReference], json_file[:name]),
              permissions: %i[readable writeable]
            )
          end

          def payload(folder_name)
            {
              name: folder_name,
              folder: {},
              "@microsoft.graph.conflictBehavior" => "fail"
            }.to_json
          end

          def base_uri = "#{@storage.uri}v1.0/drives/#{@storage.drive_id}"
        end
      end
    end
  end
end
