#-- copyright
# OpenProject is a project management system.
# Copyright (C) 2012-2015 the OpenProject Foundation (OPF)
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
# See doc/COPYRIGHT.rdoc for more details.
#++

module API
  module V3
    module Projects
      class ProjectsAPI < ::Cuba
        include API::Helpers

        define do
          res.headers['Content-Type'] = 'application/json; charset=utf-8'

          on ':id' do |id|
            @project = Project.find(id)
            env['project'] = @project

            on get, root do
              authorize(:view_project, context: @project)
              res.write ProjectRepresenter.new(@project).to_json
            end

            on 'available_assignees' do
              run API::V3::Projects::AvailableAssigneesAPI
            end

            on 'available_responsibles' do
              run API::V3::Projects::AvailableResponsiblesAPI
            end

            on 'categories' do
              run API::V3::Categories::CategoriesAPI
            end

            on 'versions' do
              run API::V3::Versions::VersionsAPI
            end
          end
        end
      end
    end
  end
end
