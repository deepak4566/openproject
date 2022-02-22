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

# See also: Getting started with Engines: https://guides.rubyonrails.org/engines.html
# ToDo: What is the name convention for where to store the engine.rb file? Why is
# there an open_project in the path?
module OpenProject::Storages
  class Engine < ::Rails::Engine
    # ToDo: Where is this used/referenced?
    engine_name :openproject_storages

    # ToDo: I understand these are OP specific helpers, but which ones are used?
    # The next line "register" is defined here as well as "add_api_path" etc.
    # ToDo: But why is this included and not referenced?
    include OpenProject::Plugins::ActsAsOpEngine

    # For documentation see the definition of register in "ActsAsOpEngine"
    # This corresponds to the openproject-storage.gemspec
    # Pass a block to the plugin (for defining permissions, menu items and the like)
    register 'openproject-storages',
             author_url: 'https://www.openproject.org',
             bundled: true,
             settings: {},
             name: 'OpenProject Storages' do
      # ToDo: Redmine plugin API?
      # Apparently only defined the name, dependencies and global(?) permissions?
      project_module :storages, dependencies: :work_package_tracking do
        permission :view_file_links,
                   {},
                   dependencies: %i[view_work_packages]
        permission :manage_file_links,
                   {},
                   dependencies: %i[view_file_links]
        permission :manage_storage_in_project,
                   { 'storages/admin/projects_storages': %i[index new create destroy] },
                   dependencies: %i[]
      end

      # Menu extensions
      # Add a "storages_admin_settings" to the admin_menu with the specified link,
      # condition ("if:"), caption and icon.
      menu :admin_menu,
           :storages_admin_settings,
           { controller: '/storages/admin/storages', action: :index },
           if: Proc.new { User.current.admin? },
           caption: :project_module_storages,
           icon: 'icon2 icon-hosting'

      menu :project_menu,
           :settings_projects_storages,
           { controller: '/storages/admin/projects_storages', action: 'index' },
           caption: :project_module_storages,
           parent: :settings
    end

    # ToDo: Why is there |storage_id|? Is this a kind of manual routes.rb?
    add_api_path :storage do |storage_id|
      "#{root}/storages/#{storage_id}"
    end

    add_api_path :file_links do |work_package_id|
      "#{work_package(work_package_id)}/file_links"
    end

    add_api_path :file_link do |work_package_id, file_link_id|
      "#{work_package(work_package_id)}/file_links/#{file_link_id}"
    end

    add_api_path :file_link_download do |work_package_id, file_link_id|
      "#{work_package(work_package_id)}/file_links/#{file_link_id}/download"
    end

    add_api_path :file_link_open do |work_package_id, file_link_id|
      "#{work_package(work_package_id)}/file_links/#{file_link_id}/open"
    end
  end
end
