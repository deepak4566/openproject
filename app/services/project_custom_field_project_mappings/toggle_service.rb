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

module ProjectCustomFieldProjectMappings
  class ToggleService < ::BaseServices::Write
    def persist(service_result)
      if service_result.result.persisted?
        # destroy the mapping if it exists and catch any errors which would not be caught by active record
        begin
          service_result.result.destroy
        rescue StandardError => e
          service_result.errors = e.message
          service_result.success = false
        end
      else
        # create the mapping if it does not exist
        unless service_result.result.save
          service_result.errors = service_result.result.errors
          service_result.success = false
        end
      end

      service_result
    end

    def instance(params)
      instance_class.find_or_initialize_by(
        project_id: params[:project_id],
        custom_field_id: params[:custom_field_id]
      )
    end

    def default_contract_class
      ProjectCustomFieldProjectMappings::UpdateContract
    end
  end
end