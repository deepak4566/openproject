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

    helpers do
      def current_user
        return User.current if Rails.env.test?
        user_id = env['rack.session']['user_id']
        User.current = user_id ? User.find(user_id) : User.anonymous
      end

      def authenticate
        raise API::Errors::Unauthenticated.new if current_user.nil? || current_user.anonymous? if Setting.login_required?
      end

      def authorize(permission, context: nil, global: false, user: current_user, allow: true)
        is_authorized = AuthorizationService.new(permission, context: context, global: global, user: user).call
        raise API::Errors::Unauthorized.new(current_user) unless is_authorized && allow
        is_authorized
      end

      def build_representer(obj, model_klass, representer_klass, options = {})
        model = (obj.kind_of?(Array)) ? obj.map{ |o| model_klass.new(o) } : model_klass.new(obj)
        representer_klass.new(model, options).to_json
      end
    end

    rescue_from ActiveRecord::RecordInvalid do |e|
      error = API::Errors::Validation.new(e.record)
      Rack::Response.new(error.to_json, error.code, error.headers).finish
    end

    rescue_from ActiveRecord::RecordNotFound do |e|
      error = API::Errors::NotFound.new(e.message)
      Rack::Response.new(error.to_json, error.code, error.headers).finish
    end

    rescue_from API::Errors::Unauthorized, API::Errors::Unauthenticated, API::Errors::Validation do |e|
      Rack::Response.new(e.to_json, e.code, e.headers).finish
    end

    # run authentication before each request
    before do
      authenticate
    end

    mount API::V3::Root
  end
end
