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

.controller('DetailsTabWatchersController', ['$scope', 'workPackage', function($scope, workPackage) {
  // available watchers

  $scope.$watch('watchers.length', fetchAvailableWatchers); fetchAvailableWatchers();

  /**
   * @name getResourceIdentifier
   * @function
   *
   * @description
   * Returns the resource identifier of an API resource retrieved via hyperagent
   *
   * @param {Object} resource The resource object
   *
   * @returns {String} identifier
   */
  function getResourceIdentifier(resource) {
    // TODO move to helper
    return resource.links.self.href;
  }

  /**
   * @name getFilteredCollection
   * @function
   *
   * @description
   * Filters collection of HAL resources by entries listed in resourcesToBeFilteredOut
   *
   * @param {Array} collection Array of resources retrieved via hyperagend
   * @param {Array} resourcesToBeFilteredOut Entries to be filtered out
   *
   * @returns {Array} filtered collection
   */
  function getFilteredCollection(collection, resourcesToBeFilteredOut) {
    return collection.filter(function(resource) {
      return resourcesToBeFilteredOut.map(getResourceIdentifier).indexOf(getResourceIdentifier(resource)) === -1;
    });
  }

  function fetchAvailableWatchers() {
    $scope.workPackage.links.availableWatchers
      .fetch()
      .then(function(data) {
        // Temporarily filter out watchers already assigned to the work package on the client-side
        $scope.availableWatchers = getFilteredCollection(data.embedded.availableWatchers, $scope.watchers);
        // TODO do filtering on the API side and replace the update of the available watchers with the code provided in the following line
        // $scope.availableWatchers = data.embedded.availableWatchers;
      });
  }

  $scope.addWatcher = function(id) {
    $scope.workPackage.link('addWatcher', {user_id: id})
      .fetch({ajax: {method: 'POST'}})
      .then($scope.refreshWorkPackage, $scope.outputError);
  };

  $scope.deleteWatcher = function(watcher) {
    watcher.links.removeWatcher
      .fetch({ ajax: watcher.links.removeWatcher.props })
      .then($scope.refreshWorkPackage, $scope.outputError);
  };
}]);
