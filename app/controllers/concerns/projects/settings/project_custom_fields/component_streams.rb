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

module Projects
  module Settings
    module ProjectCustomFields
      module ComponentStreams
        extend ActiveSupport::Concern

        included do
          def update_sections_via_turbo_stream(
            project: @project,
            project_custom_field_sections: @project_custom_field_sections,
            project_custom_fields_grouped_by_section: @project_custom_fields_grouped_by_section,
            project_custom_field_project_mappings: @project_custom_field_project_mappings
          )
            update_via_turbo_stream(
              component: ::Projects::Settings::ProjectCustomFieldSections::IndexComponent.new(
                project:,
                project_custom_field_sections:,
                project_custom_fields_grouped_by_section:,
                project_custom_field_project_mappings:
              )
            )
          end

          def update_custom_field_row_via_turbo_stream(
            project: @project,
            project_custom_field: @project_custom_field,
            project_custom_field_project_mappings: @project_custom_field_project_mappings
          )
            update_via_turbo_stream(
              component: ::Projects::Settings::ProjectCustomFieldSections::CustomFieldRowComponent.new(
                project:,
                project_custom_field:,
                project_custom_field_project_mappings:
              )
            )
          end
        end
      end
    end
  end
end