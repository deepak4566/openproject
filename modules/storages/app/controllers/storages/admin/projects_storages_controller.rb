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

# This controller manages the creation and deletion of ProjectStorage objects.
# ProjectStorages belong to projects and indicate that the respective
# Storage (i.e. a Nextcloud server) is enabled in the project.
# Please see the standard Rails documentation on controllers:
# https://guides.rubyonrails.org/action_controller_overview.html
# Called by: Calls to the controller methods are initiated by user Web GUI
# actions and mapped to this controller by storages/config/routes.rb.
class Storages::Admin::ProjectsStoragesController < Projects::SettingsController
  using Storages::Peripherals::ServiceResultRefinements
  # This is the resource handled in this controller.
  # So the controller knows that the ID in params (URl) refer to instances of this model.
  # This defines @object as the model instance.
  model_object Storages::ProjectStorage

  before_action :find_model_object, only: %i[edit update destroy] # Fill @object with ProjectStorage
  # No need to before_action :find_project_by_project_id as SettingsController already checks
  # No need to check for before_action :authorize, as the SettingsController already checks this.

  # This MenuController method defines the default menu item to be used (highlighted)
  # when rendering the main menu in the left (part of the base layout).
  # The menu item itself is registered in modules/storages/lib/open_project/storages/engine.rb
  menu_item :settings_projects_storages

  # Show a HTML page with the list of ProjectStorages
  # Called by: Project -> Settings -> File Storages
  def index
    # Just get the list of ProjectStorages associated with the project
    @projects_storages = Storages::ProjectStorage.where(project: @project).includes(:storage)
    # Render the list storages using Ruby "cells" in the /app/cell folder which defines
    # the ways rows are rendered in a table layout.
    render '/storages/project_settings/index'
  end

  # Show a HTML page with a form in order to create a new ProjectStorage
  # Called by: When a user clicks on the "+New" button in Project -> Settings -> File Storages
  def new
    # Create an empty ProjectStorage object, but don't save it to the database yet.
    # @project was calculated in before_action (see comments above).
    # @project_storage is used in the view in order to render the form for a new object
    @project_storage = ::Storages::ProjectStorages::SetAttributesService
                         .new(user: current_user,
                              model: Storages::ProjectStorage.new,
                              contract_class: EmptyContract)
                         .call(project: @project)
                         .result

    # Calculate the list of available Storage objects, subtracting already enabled storages.
    @available_storages = Storages::ProjectStorages::CreateContract.new(@project_storage, current_user).assignable_storages

    # Show the HTML form to create the object.
    render '/storages/project_settings/new'
  end

  # Create a new ProjectStorage object.
  # Called by: The new page above with form-data from that form.
  def create
    # Check params and overwrite creator_id and project_id in untrusted data from the Internet
    # @project was calculated by before_action :find_optional_project.
    service_result = ::Storages::ProjectStorages::CreateService
                       .new(user: current_user)
                       .call(permitted_storage_settings_params)

    # Create success/error messages to the user
    if service_result.success?
      flash[:notice] = I18n.t(:notice_successful_create)
    else
      flash[:error] = service_result.message || I18n.t('notice_internal_server_error')
    end

    redirect_to project_settings_projects_storages_path # Redirect: Project -> Settings -> File Storages
  end

  # Edit page is very similar to new page, except that we don't need to set
  # default attribute values because the object already exists
  # Called by: Global app/config/routes.rb to serve Web page
  def edit
    # Render existing ProjectStorage object
    # @object was calculated in before_action :find_model_object (see comments above).
    # @project_storage is used in the view in order to render the form for a new object
    @project_storage = @object

    render '/storages/project_settings/edit'
  end

  # Update is similar to create above
  # See also: create above
  # See also: https://www.openproject.org/docs/development/concepts/contracted-services/
  # Called by: Global app/config/routes.rb to serve Web page
  def update
    service_result = ::Storages::ProjectStorages::UpdateService
                       .new(user: current_user, model: @object)
                       .call(permitted_storage_settings_params)

    if service_result.success?
      flash[:notice] = I18n.t(:notice_successful_update)
      redirect_to project_settings_projects_storages_path # Redirect: Project -> Settings -> File Storages
    else
      @errors = service_result.errors
      render :edit
    end
  end

  # Purpose: Destroy a ProjectStorage object
  # Called by: By pressing a "Delete" icon in the Project's settings ProjectStorages page
  # It redirects back to the list of ProjectStorages in the project
  def destroy
    # The complex logic for deleting associated objects was moved into a service:
    # https://dev.to/joker666/ruby-on-rails-pattern-service-objects-b19
    Storages::ProjectStorages::DeleteService
      .new(user: current_user, model: @object)
      .call
      .on_failure { |service_result| flash[:error] = service_result.errors.full_messages }

    # Redirect the user to the URL of Projects -> Settings -> File Storages
    redirect_to project_settings_projects_storages_path
  end

  # rubocop:disable Metrics/AbcSize
  def set_permissions
    if OpenProject::FeatureDecisions.managed_project_folders_active?
      find_model_object(:projects_storage_id)
      storage = @projects_storage.storage
      project = @projects_storage.project
      folder = @projects_storage.project_folder_id
      create_folder_command = Storages::Peripherals::StorageRequests.new(storage:).create_folder_command
      create_folder_command.result.call(folder:).match(
        on_success: ->(_) do
          project_users = project.users
          oauth_client = OAuthClient.where(integration_id: @projects_storage.storage_id,
                                           integration_type: 'Storages::Storage').first
          nextcloud_users = OAuthClientToken.where(oauth_client:, user: project_users)
          permissions = nextcloud_users.map do |token|
            user = token.user
            {
              origin_user_id: token.origin_user_id,
              permissions: {
                read_files: user.allowed_to?(:read_files, @project),
                write_files: user.allowed_to?(:write_files, @project),
                create_files: user.allowed_to?(:create_files, @project),
                share_files: user.allowed_to?(:share_files, @project),
                delete_files: user.allowed_to?(:delete_files, @project)
              }
            }
          end

          set_permissions_command = Storages::Peripherals::StorageRequests.new(storage:).set_permissions_command
          set_permissions_command.result.call(folder:, permissions:).match(
            on_success: ->(_) { flash[:notice] = 'Permissions were successfuly updated on the NextCloud side' }, # rubocop:disable Rails/I18nLocaleTexts
            on_failure: ->(error) { flash[:error] = "Error: #{error}" }
          )
        end,
        on_failure: ->(error) do
          flash[:error] = "Error: #{error}"
        end
      )
    end
    redirect_back(fallback_location: project_settings_projects_storages_path(project_id: project.id))
  end
  # rubocop:enable Metrics/AbcSize

  private

  # Define the list of permitted parameters for creating/updating a ProjectStorage.
  # Called by create and update actions above.
  def permitted_storage_settings_params
    # "params" is an instance of ActionController::Parameters
    params
      .require(:storages_project_storage)
      .permit('storage_id', 'project_folder_mode', 'project_folder_id')
      .to_h
      .reverse_merge(project_id: @project.id)
  end
end
