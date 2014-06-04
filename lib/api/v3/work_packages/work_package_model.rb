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

require 'reform/form/coercion'

module API
  module V3
    module WorkPackages
      class WorkPackageModel < Reform::Form
        include Composition
        include Coercion

        model :work_package

        property :subject, on: :work_package, type: String
        property :description, on: :work_package, type: String
        property :start_date, on: :work_package, type: Date
        property :due_date, on: :work_package, type: Date
        property :created_at, on: :work_package, type: DateTime
        property :updated_at, on: :work_package, type: DateTime
        property :author, on: :work_package, type: String
        property :project_id, on: :work_package, type: Integer
        property :responsible_id, on: :work_package, type: Integer
        property :assigned_to_id, on: :work_package, type: Integer
        property :fixed_version_id, on: :work_package, type: Integer

        def type
          work_package.type.try(:name)
        end

        def type=(value)
          type = Type.find(:first, conditions: ['name ilike ?', value])
          work_package.type = type
        end

        def status
          work_package.status.try(:name)
        end

        def status=(value)
          status = Status.find(:first, conditions: ['name ilike ?', value])
          work_package.status = status
        end

        def priority
          work_package.priority.try(:name)
        end

        def priority=(value)
          priority = IssuePriority.find(:first, conditions: ['name ilike ?', value])
          work_package.priority = priority
        end

        def estimated_time
          { units: 'hours', value: work_package.estimated_hours }
        end

        def estimated_time=(value)
          hours = ActiveSupport::JSON.decode(value)['value']
          work_package.estimated_hours = hours
        end

        def version_id=(value)
          work_package.fixed_version_id = value
        end

        def percentage_done
          work_package.done_ratio
        end

        def percentage_done=(value)
          work_package.done_ratio = value
        end

        validates_presence_of :subject, :project_id, :type, :author, :status
        validates_length_of :subject, maximum: 255
      end
    end
  end
end
