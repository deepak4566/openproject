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

.factory('Sortation', ['DEFAULT_SORT_CRITERIA', function(DEFAULT_SORT_CRITERIA) {
  var defaultSortDirection = 'asc';

  var Sortation = function(sortation) {
    if (Array.isArray(sortation)) {
      if (sortation.length > 0) {
        // Convert sortation element from API meta format
        this.sortElements = sortation.map(function(sortElement) {
          return {field: sortElement.first(), direction: sortElement.last()};
        });
      } else {
        this.sortElements = this.decodeEncodedSortation(DEFAULT_SORT_CRITERIA);
      }
    } else {
      // Unless it's an array we expect the sortation to be in a serialized form
      this.sortElements = this.decodeEncodedSortation(sortation || DEFAULT_SORT_CRITERIA);
    }
  };

  Sortation.prototype.getPrimarySortationCriterion = function() {
    return this.sortElements[0];
  };

  Sortation.prototype.getDisplayedSortDirectionOfHeader = function(headerName) {
    var sortDirection, displayedSortation = this.getPrimarySortationCriterion();

    if(displayedSortation && displayedSortation.field === headerName) sortDirection = displayedSortation.direction;

    return sortDirection;
  };

  Sortation.prototype.getCurrentSortDirectionOfHeader = function(headerName) {
    var sortDirection;

    angular.forEach(this.sortElements, function(sortation){
      if(sortation && sortation.field === headerName) sortDirection = sortation.direction;
    });

    return sortDirection;
  };

  Sortation.prototype.removeSortElement = function(elementName) {
    index = this.sortElements.map(function(sortation){
      return sortation.field;
    }).indexOf(elementName);

    if (index !== -1) this.sortElements.splice(index, 1);
  };

  Sortation.prototype.addSortElement = function(sortElement) {
    this.removeSortElement(sortElement.field);

    this.sortElements.unshift(sortElement);
  };

  Sortation.prototype.getTargetSortationOfHeader = function(headerName) {
    var targetSortation = angular.copy(this);
    var targetSortDirection = this.getCurrentSortDirectionOfHeader(headerName) === 'asc' ? 'desc' : 'asc';

    targetSortation.addSortElement({field: headerName, direction: targetSortDirection}, targetSortation);

    return targetSortation;
  };

  Sortation.prototype.decodeEncodedSortation = function(encodedSortation) {
    return encodedSortation.split(',').map(function(sortParam) {
      fieldAndDirection = sortParam.split(':');
      return { field: fieldAndDirection[0], direction: fieldAndDirection[1] || defaultSortDirection};
    });
  };

  Sortation.prototype.encode = function() {
    return this.sortElements.map(function(sortation){
      if (sortation.direction === 'asc') {
        return sortation.field;
      } else {
        return [sortation.field, sortation.direction].join(':');
      }
    }).join(',');
  };

  return Sortation;
}]);
