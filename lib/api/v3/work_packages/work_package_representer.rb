#-- encoding: UTF-8
#-- copyright
# OpenProject is a project management system.
# Copyright (C) 2012-2014 the OpenProject Foundation (OPF)
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

require 'roar/decorator'
require 'roar/representer/json/hal'

module API
  module V3
    module WorkPackages
      class WorkPackageRepresenter < Roar::Decorator
        include Roar::Representer::JSON::HAL
        include Roar::Representer::Feature::Hypermedia
        include OpenProject::StaticRouting::UrlHelpers

        self.as_strategy = ::API::Utilities::CamelCasingStrategy.new

        def initialize(model, options = {}, *expand)
          @current_user = options[:current_user]
          @expand = expand

          super(model)
        end

        property :_type, exec_context: :decorator

        link :self do
          {
            href: "#{root_path}api/v3/work_packages/#{represented.model.id}",
            title: "#{represented.subject}"
          }
        end

        link :update do
          {
            href: "#{root_path}api/v3/work_packages/#{represented.model.id}",
            method: :patch,
            title: "Update #{represented.subject}"
          } if current_user_allowed_to(:edit_work_packages, represented.model)
        end

        link :delete do
          {
            href: work_packages_bulk_path(ids: represented.model),
            method: :delete,
            title: "Delete #{represented.subject}"
          } if current_user_allowed_to(:delete_work_packages, represented.model)
        end

        link :log_time do
          {
            href: new_work_package_time_entry_path(represented.model),
            type: 'text/html',
            title: "Log time on #{represented.subject}"
          } if current_user_allowed_to(:log_time, represented.model)
        end

        link :duplicate do
          {
            href: new_project_work_package_path(represented.model.project, copy_from: represented.model),
            type: 'text/html',
            title: "Duplicate #{represented.subject}"
          } if current_user_allowed_to(:add_work_packages, represented.model)
        end

        link :move do
          {
            href: new_work_package_move_path(represented.model),
            type: 'text/html',
            title: "Move #{represented.subject}"
          } if current_user_allowed_to(:move_work_packages, represented.model)
        end

        link :author do
          {
            href: "#{root_path}api/v3/users/#{represented.model.author.id}",
            title: "#{represented.model.author.name} - #{represented.model.author.login}"
          } unless represented.model.author.nil?
        end

        link :responsible do
          {
            href: "#{root_path}api/v3/users/#{represented.model.responsible.id}",
            title: "#{represented.model.responsible.name} - #{represented.model.responsible.login}"
          } unless represented.model.responsible.nil?
        end

        link :assignee do
          {
            href: "#{root_path}api/v3/users/#{represented.model.assigned_to.id}",
            title: "#{represented.model.assigned_to.name} - #{represented.model.assigned_to.login}"
          } unless represented.model.assigned_to.nil?
        end

        link :availableStatuses do
          {
            href: "#{root_path}api/v3/work_packages/#{represented.model.id}/available_statuses",
            title: 'Available Statuses'
          } if @current_user.allowed_to?({ controller: :work_packages, action: :update },
                                         represented.model.project)
        end

        link :availableWatchers do
          {
            href: "#{root_path}api/v3/work_packages/#{represented.model.id}/available_watchers",
            title: 'Available Watchers'
          }
        end

        link :watch do
          {
            href: "#{root_path}api/v3/work_packages/#{represented.model.id}/watchers",
            method: :post,
            data: { user_id: @current_user.id },
            title: 'Watch work package'
          } if !@current_user.anonymous? &&
             current_user_allowed_to(:view_work_packages, represented.model) &&
            !represented.model.watcher_users.include?(@current_user)
        end

        link :unwatch do
          {
            href: "#{root_path}api/v3/work_packages/#{represented.model.id}/watchers/#{@current_user.id}",
            method: :delete,
            title: 'Unwatch work package'
          } if current_user_allowed_to(:view_work_packages, represented.model) && represented.model.watcher_users.include?(@current_user)
        end

        link :addWatcher do
          {
            href: "#{root_path}api/v3/work_packages/#{represented.model.id}/watchers{?user_id}",
            method: :post,
            title: 'Add watcher',
            templated: true
          } if current_user_allowed_to(:add_work_package_watchers, represented.model)
        end

        link :addRelation do
          {
              href: "#{root_path}api/v3/work_packages/#{represented.model.id}/relations",
              method: :post,
              title: 'Add relation'
          } if current_user_allowed_to(:manage_work_package_relations, represented.model)
        end

        link :addComment do
          {
              href: "#{root_path}api/v3/work_packages/#{represented.model.id}/activities",
              method: :post,
              title: 'Add comment'
          } if current_user_allowed_to(:add_work_package_notes, represented.model)
        end

        link :parent do
          {
              href: "#{root_path}api/v3/work_packages/#{represented.model.parent.id}",
              title:  represented.model.parent.subject
          } unless represented.model.parent.nil? || !represented.model.parent.visible?
        end

        links :children do
          visible_children.map do |child|
            { href: "#{root_path}api/v3/work_packages/#{child.id}", title: child.subject }
          end unless visible_children.empty?
        end

        property :id, getter: -> (*) { model.id }, render_nil: true
        property :subject, render_nil: true
        property :type, render_nil: true
        property :description, render_nil: true
        property :raw_description, render_nil: true
        property :status, render_nil: true
        property :is_closed
        property :priority, render_nil: true
        property :start_date, getter: -> (*) { model.start_date.to_datetime.utc.iso8601 unless model.start_date.nil? }, render_nil: true
        property :due_date, getter: -> (*) { model.due_date.to_datetime.utc.iso8601 unless model.due_date.nil? }, render_nil: true
        property :estimated_time, render_nil: true
        property :percentage_done, render_nil: true
        property :version_id, getter: -> (*) { model.fixed_version.try(:id) }, render_nil: true
        property :version_name,  getter: -> (*) { model.fixed_version.try(:name) }, render_nil: true
        property :project_id, getter: -> (*) { model.project.id }
        property :project_name, getter: -> (*) { model.project.try(:name) }
        property :parent_id
        property :created_at, getter: -> (*) { model.created_at.utc.iso8601}, render_nil: true
        property :updated_at, getter: -> (*) { model.updated_at.utc.iso8601}, render_nil: true

        collection :custom_properties, exec_context: :decorator, render_nil: true

        property :author, embedded: true, class: ::API::V3::Users::UserModel, decorator: ::API::V3::Users::UserRepresenter, if: -> (*) { !author.nil? }
        property :responsible, embedded: true, class: ::API::V3::Users::UserModel, decorator: ::API::V3::Users::UserRepresenter, if: -> (*) { !responsible.nil? }
        property :assignee, embedded: true, class: ::API::V3::Users::UserModel, decorator: ::API::V3::Users::UserRepresenter, if: -> (*) { !assignee.nil? }

        property :activities, embedded: true, exec_context: :decorator
        property :watchers, embedded: true, exec_context: :decorator, if: -> (*) { current_user_allowed_to(:view_work_package_watchers, represented.model) }
        collection :attachments, embedded: true, class: ::API::V3::Attachments::AttachmentModel, decorator: ::API::V3::Attachments::AttachmentRepresenter
        property :relations, embedded: true, exec_context: :decorator

        def _type
          'WorkPackage'
        end

        def activities
          represented.activities.map{ |activity| ::API::V3::Activities::ActivityRepresenter.new(activity, current_user: @current_user) }
        end

        def watchers
          represented.watchers.map{ |watcher| ::API::V3::Users::UserRepresenter.new(watcher, work_package: represented.model, current_user: @current_user) }
        end

        def relations
          represented.relations.map{ |relation| RelationRepresenter.new(relation, work_package: represented.model, current_user: @current_user) }
        end

        def custom_properties
            values = represented.model.custom_field_values
            values.map { |v| { name: v.custom_field.name, format: v.custom_field.field_format, value: v.value }}
        end

        def current_user_allowed_to(permission, work_package)
          @current_user && @current_user.allowed_to?(permission, represented.model.project)
        end

        def visible_children
          @visible_children ||= represented.model.children.find_all { |child| child.visible? }
        end
      end
    end
  end
end
