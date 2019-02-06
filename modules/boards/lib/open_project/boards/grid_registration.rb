module OpenProject
  module Boards
    class GridRegistration < ::Grids::Configuration::Registration
      grid_class 'Boards::Grid'
      to_scope :project_work_package_boards_path

      widgets 'work_package_query'

      defaults(
        row_count: 1,
        column_count: 4,
        widgets: []
      )

      class << self
        def from_scope(scope)
          recognized = Rails.application.routes.recognize_path(scope)

          if recognized[:controller] == 'boards/boards'
            recognized.slice(:project_id, :id, :user_id)&.merge(class: ::Boards::Grid)
          end
        rescue ActionController::RoutingError
          nil
        end

        def all_scopes
          view_allowed = Project.allowed_to(User.current, :view_boards)
          manage_allowed = Project.allowed_to(User.current, :manage_boards)

          board_projects = Project
                           .where(id: view_allowed)
                           .or(Project.where(id: manage_allowed))

          paths = board_projects.map { |p| url_helpers.project_work_package_boards_path(p) }

          paths if paths.any?
        end

        alias_method :super_visible, :visible

        def visible(user = User.current)
          in_project_with_permission(user, :view_boards)
            .or(in_project_with_permission(user, :manage_boards))
        end

        def writable?(model, user)
          super &&
            Project.allowed_to(user, :manage_boards).exists?(model.project_id)
        end

        private

        def in_project_with_permission(user, permission)
          super_visible
            .where(project_id: Project.allowed_to(user, permission))
        end
      end

      private_class_method :super_visible
    end
  end
end
