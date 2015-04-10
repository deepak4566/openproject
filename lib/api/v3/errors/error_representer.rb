#-- encoding: UTF-8
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

require 'roar/decorator'
require 'roar/json/hal'

module API
  module V3
    module Errors
      class ErrorRepresenter < Roar::Decorator
        include Roar::JSON::HAL
        include Roar::Hypermedia

        self.as_strategy = API::Utilities::CamelCasingStrategy.new

        property :_type, exec_context: :decorator
        property :error_identifier, exec_context: :decorator, render_nil: true
        property :message, getter: -> (*) { message }, render_nil: true
        property :details, embedded: true

        collection :errors,
                   embedded: true,
                   class: ::API::Errors::ErrorBase,
                   decorator: ::API::V3::Errors::ErrorRepresenter,
                   if: -> (*) { !Array(errors).empty? }

        def _type
          'Error'
        end

        def error_identifier
          return 'urn:openproject-org:api:v3:errors:MultipleErrors' unless Array(represented.errors).empty?

          case represented
          when ::API::Errors::Conflict
            'urn:openproject-org:api:v3:errors:UpdateConflict'
          when ::API::Errors::NotFound
            'urn:openproject-org:api:v3:errors:NotFound'
          when ::API::Errors::Unauthenticated, ::API::Errors::Unauthorized
            'urn:openproject-org:api:v3:errors:MissingPermission'
          when ::API::Errors::UnwritableProperty
            'urn:openproject-org:api:v3:errors:PropertyIsReadOnly'
          when ::API::Errors::PropertyFormatError
            'urn:openproject-org:api:v3:errors:PropertyFormatError'
          when ::API::Errors::Validation
            'urn:openproject-org:api:v3:errors:PropertyConstraintViolation'
          when ::API::Errors::InvalidRenderContext
            'urn:openproject-org:api:v3:errors:InvalidRenderContext'
          when ::API::Errors::InvalidUserStatusTransition
            'urn:openproject-org:api:v3:errors:InvalidUserStatusTransition'
          when ::API::Errors::InvalidRequestBody
            'urn:openproject-org:api:v3:errors:InvalidRequestBody'
          when ::API::Errors::UnsupportedMediaType
            'urn:openproject-org:api:v3:errors:TypeNotSupported'
          end
        end
      end
    end
  end
end
