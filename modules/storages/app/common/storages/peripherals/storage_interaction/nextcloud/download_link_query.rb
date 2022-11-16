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

module Storages::Peripherals::StorageInteraction::Nextcloud
  class DownloadLinkQuery < Storages::Peripherals::StorageInteraction::StorageQuery
    using Storages::Peripherals::ServiceResultRefinements

    def initialize(base_uri:, token:, with_refreshed_token:)
      super()

      @base_uri = base_uri
      @uri = URI::join(base_uri, '/ocs/v2.php/apps/dav/api/v1/direct')
      @token = token
      @with_refreshed_token = with_refreshed_token
    end

    def query(file_link)
      outbound_response(file_link)
        .bind { |response_body| direct_download_token(body: response_body) }
        .map { |download_token| download_link(download_token, file_link.origin_name) }
    end

    private

    def outbound_response(file_link)
      @with_refreshed_token.call(@token) do |token|
        begin
          response = ServiceResult.success(
            result: RestClient.post(
              @uri.to_s,
              { fileId: file_link.origin_id },
              {
                'Authorization' => "Bearer #{token.access_token}",
                'OCS-APIRequest' => 'true',
                'Accept' => 'application/json'
              }
            )
          )
        rescue RestClient::Unauthorized
          response = ServiceResult.failure(result: :not_authorized)
        rescue RestClient::NotFound
          response = ServiceResult.failure(result: :not_found)
        rescue StandardError
          response = ServiceResult.failure(result: :error)
        end

        response.bind do |r|
          # The nextcloud API returns a successful response with empty body if the authorization is missing or expired
          r.body.blank? ? ServiceResult.failure(result: :not_authorized) : ServiceResult.success(result: r)
        end
      end
    end

    def download_link(token, origin_name)
      URI::join(@base_uri, "/index.php/apps/integration_openproject/direct/#{token}/#{CGI.escape(origin_name)}")
    end

    def direct_download_token(body:)
      token = parse_direct_download_token(body:)
      if token.blank?
        Rails.logger.error("Received unexpected json response: #{body}")
        return ServiceResult.failure(result: :error)
      end

      ServiceResult.success(result: token)
    end

    def parse_direct_download_token(body:)
      begin
        json = JSON.parse(body)
      rescue JSON::ParserError
        return nil
      end

      direct_download_url = json.dig('ocs', 'data', 'url')
      return nil if direct_download_url.blank?

      path = URI.parse(direct_download_url).path
      return nil if path.blank?

      path.split('/').last
    end
  end
end
