#-- encoding: UTF-8
#-- copyright
# OpenProject is a project management system.
# Copyright (C) 2012-2017 the OpenProject Foundation (OPF)
#
# This program is free software; you can redistribute it and/or
# modify it under the terms of the GNU General Public License version 3.
#
# OpenProject is a fork of ChiliProject, which is a fork of Redmine. The copyright follows:
# Copyright (C) 2006-2017 Jean-Philippe Lang
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

module Type::Attributes
  extend ActiveSupport::Concern

  included do
    # Allow plugins to define constraints
    # that disable a given attribute for this type.
    mattr_accessor :attribute_constraints do
      {}
    end
  end

  class_methods do
    ##
    # Add a constraint for the given attribute
    def add_constraint(attribute, callable)
      unless callable.respond_to?(:call)
        raise ArgumentError, "Expecting callable object for constraint #{key}"
      end

      attribute_constraints[attribute.to_sym] = callable
    end

    ##
    # Provides a map of all work package form attributes as seen when creating
    # or updating a work package. Through this map it can be checked whether or
    # not an attribute is required.
    #
    # E.g.
    #
    #   ::TypesHelper.work_package_form_attributes['author'][:required] # => true
    #
    # @return [Hash{String => Hash}] Map from attribute names to options.
    def all_work_package_form_attributes(merge_date: false)
      rattrs = API::V3::WorkPackages::Schema::WorkPackageSchemaRepresenter.representable_attrs
      definitions = rattrs[:definitions]
      skip = ['_type', '_dependencies', 'attribute_groups', 'links', 'parent_id', 'parent', 'description']
      attributes = definitions.keys
        .reject { |key| skip.include?(key) || definitions[key][:required] }
        .map { |key| [key, definitions[key]] }.to_h

      # within the form date is shown as a single entry including start and due
      if merge_date
        attributes['date'] = { required: false, has_default: false }
        attributes.delete 'due_date'
        attributes.delete 'start_date'
      end

      WorkPackageCustomField.includes(:translations).all.each do |field|
        attributes["custom_field_#{field.id}"] = {
          required: field.is_required,
          has_default: field.default_value.present?,
          display_name: field.name
        }
      end

      attributes
    end
  end

  ##
  # Get all applicale work package attributes
  def work_package_attributes(merge_date: true)
    all_attributes = self.class.all_work_package_form_attributes(merge_date: merge_date)

    # Reject those attributes that are not available for this type.
    all_attributes.select { |key, _| has_attribute? key }
  end

  ##
  # Verify that the given attribute is applicable
  # in this type instance.
  # If a project context is given, that context is passed
  # to the constraint validator.
  def has_attribute?(attribute, project: nil)
    constraint = attribute_constraints[attribute.to_sym]
    constraint.nil? || constraint.call(self, project: project)
  end
end
