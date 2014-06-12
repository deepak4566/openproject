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

angular.module('openproject.workPackages.controllers')

.factory('sortingModal', ['btfModal', function(btfModal) {
  return btfModal({
    controller:   'SortingModalController',
    controllerAs: 'modal',
    templateUrl:  '/templates/work_packages/modals/sorting.html'
  });
}])

.controller('SortingModalController', ['sortingModal',
  '$scope',
  '$filter',
  'QueryService',
  'I18n',
  function(sortingModal, $scope, $filter, QueryService, I18n) {
  this.name    = 'Sorting';
  this.closeMe = sortingModal.deactivate;

  $scope.sortByOptions = {};

  $scope.initSortation = function(){
    var currentSortation = QueryService.getSortation();

    $scope.sortElements = currentSortation.sortElements.map(function(element){
      return [$scope.availableColumnsData.filter(function(column) { return column.id == element.field; })[0],
              $scope.availableDirectionsData.filter(function(direction) { return direction.id == element.direction; })[0]];
    });

    while($scope.sortElements.length < 3) {
      $scope.sortElements.push([]);
    }
  };

  $scope.getAvailableColumnsData = function(term, result) {
    result($filter('filter')($scope.availableColumnsData, { label: term }));
  };

  $scope.getDirectionsData = function(term, result) {
    result($filter('filter')($scope.availableDirectionsData, { label: term }));
  };

  $scope.updateSortation = function(){
    var sortElements = $scope.sortElements
      .filter(function(element){
        return element.length == 2;
      })
      .map(function(element){
        return { field: element[0].id, direction: element[1].id };
      });
    QueryService.updateSortElements(sortElements);

    sortingModal.deactivate();
  };

  QueryService.loadAvailableColumns()
    .then(function(available_columns){
      $scope.availableColumns = available_columns;
      $scope.availableColumnsData = available_columns
        .filter(function(column){
          return !!column.sortable;
        })
        .map(function(column){
          return { id: column.name, label: column.title, other: column.title };
        });
      $scope.initSortation();
    });

  $scope.availableDirectionsData = [{ id: 'desc', label: I18n.t('js.label_descending')}, { id: 'asc', label: I18n.t('js.label_ascending')}];
}]);
