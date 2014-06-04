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

# Root class of the API
# This is the place for all API wide configuration, helper methods, exceptions
# rescuing, mounting of differnet API versions etc.

module API
  class Root < Grape::API
    prefix :api
    content_type 'hal+json', 'application/hal+json'
    format 'hal+json'
    cascade false

    helpers do
      def current_user
        user_id = env['action_dispatch.request.unsigned_session_cookie']['user_id']
        return nil if user_id.nil?
        @current_user ||= User.find(user_id)
      end

      def authorize(api, endpoint, project = nil, projects = nil, global = false)
        binding.pry
        raise API::Errors::Unauthenticated.new if current_user.nil?
        is_authorized = AuthorizationService.new(api, endpoint, project, projects, global, current_user).perform
        unless is_authorized
          raise API::Errors::Unauthorized.new(current_user)
        end
        is_authorized
      end
    end

    rescue_from API::Errors::Validation, API::Errors::UnwritableProperty, API::Errors::Unauthorized,
      API::Errors::Unauthenticated do |e|
      Rack::Response.new(e.to_json, e.code, e.headers).finish
    end

    rescue_from ActiveRecord::RecordNotFound do |e|
      not_found = API::Errors::NotFound.new(e.message)
      Rack::Response.new(not_found.to_json, not_found.code, not_found.headers).finish
    end

    mount API::V3::Root
  end
end
