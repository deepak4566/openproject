//-- copyright
// OpenProject is a project management system.
// Copyright (C) 2012-2014 the OpenProject Foundation (OPF)
//
// This program is free software; you can redistribute it and/or
// modify it under the terms of the GNU General Public License version 3.
//
// OpenProject is a fork of ChiliProject, which is a fork of Redmine. The copyright follows:
// Copyright (C) 2006-2013 Jean-Philippe Lang
// Copyright (C) 2010-2013 the ChiliProject Team
//
// This program is free software; you can redistribute it and/or
// modify it under the terms of the GNU General Public License
// as published by the Free Software Foundation; either version 2
// of the License, or (at your option) any later version.
//
// This program is distributed in the hope that it will be useful,
// but WITHOUT ANY WARRANTY; without even the implied warranty of
// MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.  See the
// GNU General Public License for more details.
//
// You should have received a copy of the GNU General Public License
// along with this program; if not, write to the Free Software
// Foundation, Inc., 51 Franklin Street, Fifth Floor, Boston, MA  02110-1301, USA.
//
// See doc/COPYRIGHT.rdoc for more details.
//++

angular.module('openproject.models')

.constant('OPERATORS_NOT_REQUIRING_VALUES', ['o', 'c', '!*', '*', 't', 'w'])
.constant('SELECTABLE_FILTER_TYPES', ['list', 'list_optional', 'list_status', 'list_subprojects', 'list_model'])
.factory('Filter', ['OPERATORS_NOT_REQUIRING_VALUES', 'SELECTABLE_FILTER_TYPES', function(OPERATORS_NOT_REQUIRING_VALUES, SELECTABLE_FILTER_TYPES) {
  Filter = function (data) {
    angular.extend(this, data);

    if (this.isSingleInputField() && Array.isArray(this.values)) this.textValue = this.values[0];

    this.pruneValues();
  };

  Filter.prototype = {
    /**
     * @name toParams
     * @function
     *
     * @description Serializes the filter to parameters required by the backend
     * @returns {Object} Request parameters
     */
    toParams: function() {
      var params = {};

      params['op[' + this.name + ']'] = this.operator;
      params['v[' + this.name + '][]'] = this.getValuesAsArray();

      return params;
    },

    isSingleInputField: function() {
      return SELECTABLE_FILTER_TYPES.indexOf(this.type) === -1;
    },

    getValuesAsArray: function() {
      if(this.isSingleInputField()) {
        return [this.textValue];
      } else if (Array.isArray(this.values)) {
        return this.values;
      } else if (this.values) {
        return [this.values];
      } else {
        return [];
      }
    },

    requiresValues: function() {
      return OPERATORS_NOT_REQUIRING_VALUES.indexOf(this.operator) === -1;
    },

    isConfigured: function() {
      return this.operator && (this.hasValues() || !this.requiresValues());
    },

    pruneValues: function() {
      if (this.values) {
        this.values = this.values.filter(function(value) {
          return value !== '';
        });
      }
    },

    hasValues: function() {
      if (this.isSingleInputField()) {
        return !!this.textValue;
      } else {
        return Array.isArray(this.values) ? this.values.length > 0 : !!this.values;
      }
    }
  };

  return Filter;
}]);
