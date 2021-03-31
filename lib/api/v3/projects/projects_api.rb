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

module API
  module V3
    module Projects
      class ProjectsAPI < ::API::OpenProjectAPI
        helpers do
          def visible_project_scope
            if current_user.admin?
              Project.all
            else
              Project.visible(current_user)
            end
          end
        end

        resources :projects do
          get &::API::V3::Utilities::Endpoints::Index.new(model: Project,
                                                          scope: -> {
                                                            visible_project_scope
                                                              .includes(ProjectRepresenter.to_eager_load)
                                                          })
                                                     .mount

          post &::API::V3::Utilities::Endpoints::Create.new(model: Project)
                                                       .mount

          mount ::API::V3::Projects::Schemas::ProjectSchemaAPI
          mount ::API::V3::Projects::CreateFormAPI

          mount API::V3::Projects::AvailableParentsAPI

          params do
            requires :id, desc: 'Project id'
          end
          route_param :id do
            after_validation do
              @project = visible_project_scope.find(params[:id])
            end

            get &::API::V3::Utilities::Endpoints::Show.new(model: Project).mount
            patch &::API::V3::Utilities::Endpoints::Update.new(model: Project).mount
            delete &::API::V3::Utilities::Endpoints::Delete.new(model: Project,
                                                                process_service: ::Projects::ScheduleDeletionService)
                                                           .mount

            mount ::API::V3::Projects::UpdateFormAPI

            mount API::V3::Projects::AvailableAssigneesAPI
            mount API::V3::Projects::AvailableResponsiblesAPI
            mount API::V3::Projects::CopyAPI
            mount API::V3::WorkPackages::WorkPackagesByProjectAPI
            mount API::V3::Categories::CategoriesByProjectAPI
            mount API::V3::Versions::VersionsByProjectAPI
            mount API::V3::Types::TypesByProjectAPI
            mount API::V3::Queries::QueriesByProjectAPI
          end
        end
      end
    end
  end
end
