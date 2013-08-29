#-- copyright
# OpenProject is a project management system.
#
# Copyright (C) 2012-2013 the OpenProject Team
#
# This program is free software; you can redistribute it and/or
# modify it under the terms of the GNU General Public License version 3.
#
# See doc/COPYRIGHT.rdoc for more details.
#++

module Api
  module V2

    class PlanningElementsController < ApplicationController
      unloadable
      helper :timelines, :planning_elements

      include ::Api::V2::ApiController
      include ExtendedHTTP

      before_filter :find_project_by_project_id,
                    :authorize,
                    :assign_planning_elements, :except => [:index, :list]

      # Attention: find_all_projects_by_project_id needs to mimic all of the above
      #            before filters !!!
      before_filter :find_all_projects_by_project_id, :only => :index

      helper :timelines
      helper :timelines_journals

      accept_key_auth :index, :create, :show, :update, :destroy, :list

      def index
        optimize_planning_elements_for_less_db_queries

        respond_to do |format|
          format.api
        end
      end

      def create
        @planning_element = @planning_elements.new(permitted_params.planning_element)
        successfully_created = @planning_element.save

        respond_to do |format|

          format.api do
            if successfully_created
              redirect_url = api_v2_project_planning_element_url(
                @project, @planning_element,
                # TODO this probably should be (params[:format] ||'xml'), however, client code currently anticipates xml responses.
                :format => 'xml'
              )
              see_other(redirect_url)
            else
              render_validation_errors(@planning_element)
            end
          end
        end
      end

      def show
        @planning_element = @project.planning_elements.find(params[:id])

        respond_to do |format|
          format.api
        end
      end

      def update
        @planning_element = @planning_elements.find(params[:id])
        @planning_element.attributes = permitted_params.planning_element

        successfully_updated = @planning_element.save

        respond_to do |format|
          format.api do
            if successfully_updated
              no_content
            else
              render_validation_errors(@planning_element)
            end
          end
        end
      end

      def list
        options = {:order => 'id'}

        projects = Project.visible.select do |project|
          User.current.allowed_to?(:view_planning_elements, project)
        end

        if params[:ids]
          ids = params[:ids].split(/,/).map(&:strip).select { |s| s =~ /^\d*$/ }.map(&:to_i).sort
          project_ids = projects.map(&:id).sort
          options[:conditions] = ["id IN (?) AND project_id IN (?)", ids, project_ids]
        end

        @planning_elements = WorkPackage.all(options)

        respond_to do |format|
          format.api { render :action => :index }
        end
      end

      def destroy
        @planning_element = @project.planning_elements.find(params[:id])
        @planning_element.destroy

        respond_to do |format|
          format.api
        end
      end

      protected

      # Filters
      def find_all_projects_by_project_id
        if params[:project_id] !~ /,/
          find_project_by_project_id unless performed?
          authorize                  unless performed?
          assign_planning_elements   unless performed?
        else
          # find_project_by_project_id
          ids, identifiers = params[:project_id].split(/,/).map(&:strip).partition { |s| s =~ /^\d*$/ }
          ids = ids.map(&:to_i).sort
          identifiers = identifiers.sort

          @projects = []
          @projects |= Project.all(:conditions => {:id => ids}) unless ids.empty?
          @projects |= Project.all(:conditions => {:identifier => identifiers}) unless identifiers.empty?

          if (@projects.map(&:id) & ids).size != ids.size ||
             (@projects.map(&:identifier) & identifiers).size != identifiers.size
            # => not all projects could be found
            render_404
            return
          end

          # authorize
          # Ignoring projects, where user has no view_planning_elements permission.
          permission = params[:controller].sub api_version, ''
          @projects = @projects.select do |project|
            User.current.allowed_to?({:controller => permission,
                                      :action     => params[:action]},
                                      project)
          end

          if @projects.blank?
            @planning_elements = []
            return
          end

          @planning_elements = WorkPackage.for_projects(@projects).without_deleted
        end
      end

      def assign_planning_elements
        @planning_elements = @project.planning_elements.without_deleted
      end

      # Helpers
      helper_method :include_journals?

      def include_journals?
        params[:include].tap { |i| i.present? && i.include?("journals") }
      end

      # Actual protected methods
      def render_errors(errors)
        options = {:status => :bad_request, :layout => false}
        options.merge!(case params[:format]
          when 'xml';  {:xml => errors}
          when 'json'; {:json => {'errors' => errors}}
          else
            raise "Unknown format #{params[:format]} in #render_validation_errors"
          end
        )
        render options
      end

      def optimize_planning_elements_for_less_db_queries
        # abort if @planning_elements is already an array, using .class check since
        # .is_a? acts weird on named scopes
        return if @planning_elements.class == Array

        # triggering full load to avoid separate queries for count or related models
        @planning_elements = @planning_elements.all(:include => [:type, :project])

        # Replacing association proxies with already loaded instances to avoid
        # further db calls.
        #
        # This assumes, that all planning elements within a project where loaded
        # and that parent-child relations may only occur within a project.
        #
        # It is also dependent on implementation details of ActiveRecord::Base,
        # so it might break in later versions of Rails.
        #
        # See association_instance_get/_set in ActiveRecord::Associations

        ids_hash      = @planning_elements.inject({}) { |h, pe| h[pe.id] = pe; h }
        children_hash = Hash.new { |h,k| h[k] = [] }

        parent_refl, children_refl = [:parent, :children].map{|assoc| WorkPackage.reflect_on_association(assoc)}

        associations = {
          :belongs_to => ActiveRecord::Associations::BelongsToAssociation,
          :has_many => ActiveRecord::Associations::HasManyAssociation
        }

        # 'caching' already loaded parent and children associations
        @planning_elements.each do |pe|
          children_hash[pe.parent_id] << pe

          parent = nil
          if ids_hash.has_key? pe.parent_id
            parent = associations[parent_refl.macro].new(pe, parent_refl)
            parent.target = ids_hash[pe.parent_id]
          end
          pe.send(:association_instance_set, :parent, parent)

          children = associations[children_refl.macro].new(pe, children_refl)
          children.target = children_hash[pe.id]
          pe.send(:association_instance_set, :children, children)
        end
      end
    end
  end
end
