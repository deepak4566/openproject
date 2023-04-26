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
module DemoData
  class ProjectSeeder < Seeder
    # Careful: The seeding recreates the seeded project before it runs, so any changes
    # on the seeded project will be lost.
    def seed_data!
      print_status ' ↳ Updating settings'
      seed_settings

      seed_data.each_data('projects') do |project_data|
        seed_project(project_data)
        Setting.demo_projects_available = true
      end

      print_status ' ↳ Update form configuration with global queries'
      set_form_configuration
    end

    def seed_project(project_data)
      print_status " ↳ Creating project: #{project_data.lookup('name')}"

      project = reset_project(project_data)
      set_project_status(project, project_data)
      set_members(project)
      seed_news(project, project_data)
      set_types(project, project_data)
      seed_categories(project, project_data)
      seed_versions(project, project_data)
      seed_queries(project, project_data)
      seed_project_content(project, project_data)
    end

    def applicable?
      Project.count.zero?
    end

    def seed_settings
      seedable_welcome_settings
        .select { |k,| Settings::Definition[k].writable? }
        .each do |k, v|
        Setting[k] = v
      end
    end

    def seedable_welcome_settings
      welcome = seed_data.lookup('welcome')
      return {} if welcome.blank?

      {
        welcome_title: welcome.lookup('title'),
        welcome_text: welcome.lookup('text'),
        welcome_on_homescreen: 1
      }
    end

    def reset_project(data)
      print_status '   -Creating/Resetting project'
      delete_project(data)
      create_project(data)
    end

    def create_project(project_data)
      Project.create! project_data(project_data)
    end

    def delete_project(data)
      if delete_me = find_project(data)
        delete_me.destroy
      end
    end

    def set_project_status(project, project_data)
      print_status '   -Setting project status.'

      status_code = project_data.lookup('status.code')
      status_explanation = project_data.lookup('status.description')

      if status_code || status_explanation
        Projects::Status.create!(
          project:,
          code: status_code,
          explanation: status_explanation
        )
      end
    end

    def set_members(project)
      print_status '   -Setting members.'

      role = Role.find_by(name: I18n.t(:default_role_project_admin))

      Member.create!(
        project:,
        principal: user,
        roles: [role]
      )
    end

    def set_form_configuration
      Type.all.each do |type|
        BasicData::TypeSeeder.new(seed_data).set_attribute_groups_for_type(type)
      end
    end

    def set_types(project, project_data)
      print_status '   -Assigning types.'

      project.types.clear
      Array(project_data.lookup('types')).each do |type_name|
        type = Type.find_by(name: I18n.t(type_name))
        project.types << type
      end
    end

    def seed_categories(project, project_data)
      print_status '   -Creating categories'

      Array(project_data.lookup('categories')).each do |cat_name|
        project.categories.create name: cat_name
      end
    end

    def seed_news(project, project_data)
      print_status '   -Creating news.'

      project_data.each('news') do |news|
        News.create!(project:,
                     author: user,
                     title: news['title'],
                     summary: news['summary'],
                     description: news['description'])
      end
    end

    def seed_queries(project, project_data)
      print_status '   -Creating queries.'

      Array(project_data.lookup('queries')).each do |config|
        QueryBuilder.new(config, project:, user:).create!
      end
    end

    def seed_versions(project, project_data)
      print_status '   -Creating versions.'

      project_data.each('versions') do |attributes|
        VersionBuilder.new(attributes, project:, user:).create!
      end
    end

    def seed_project_content(project, project_data)
      project_content_seeder_classes.each do |seeder_class|
        print_status "   -#{seeder_class.name.demodulize}"

        seeder = seeder_class.new(project, project_data)
        seeder.seed!
      end
    end

    # override to add additional seeders
    def project_content_seeder_classes
      [
        DemoData::WikiSeeder,
        DemoData::WorkPackageSeeder,
        DemoData::WorkPackageBoardSeeder
      ]
    end

    module Data
      module_function

      def project_data(project_data)
        {
          name: project_data.lookup('name'),
          identifier: project_data.lookup('identifier'),
          description: project_data.lookup('description'),
          enabled_module_names: project_data.lookup('modules'),
          types: Type.all,
          parent: parent_project(project_data)
        }
      end

      def parent_project(project_data)
        identifier = project_data.lookup('parent')
        return nil if identifier.blank?

        Project.find_by(identifier:)
      end

      def find_project(data)
        Project.find_by(identifier: data.lookup('identifier'))
      end
    end

    include Data
  end
end
