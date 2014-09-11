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

.factory('shareModal', ['btfModal', function(btfModal) {
  return btfModal({
    controller:   'ShareModalController',
    controllerAs: 'modal',
    templateUrl:  '/templates/work_packages/modals/share.html',
    afterFocusOn: '#work-packages-settings-button'
  });
}])

.controller('ShareModalController', [
  '$scope',
  'shareModal',
  'QueryService',
  'AuthorisationService',
  '$rootScope',
  'QUERY_MENU_ITEM_TYPE',
  'queryMenuItemFactory',
  'PathHelper',
  function($scope, shareModal, QueryService, AuthorisationService, $rootScope, QUERY_MENU_ITEM_TYPE, queryMenuItemFactory, PathHelper) {

  this.name    = 'Share';
  this.closeMe = shareModal.deactivate;
  $scope.query = QueryService.getQuery();

  $scope.shareSettings = {
    starred: $scope.query.starred
  };

  function closeAndReport(message) {
    shareModal.deactivate();
    $scope.$emit('flashMessage', message);
  }

  function getQueryPath(query) {
    if (query.project_id) {
      return PathHelper.projectPath(query.project_id) + PathHelper.workPackagesPath() + '?query_id=' + query.id;
    } else {
      return PathHelper.workPackagesPath() + '?query_id=' + query.id;
    }
  }

  function addOrRemoveMenuItem(query) {
    if (!query) return;

    if(query.starred) {
      queryMenuItemFactory.generateMenuItem(query.name, getQueryPath(query), query.id);
    } else {
      $rootScope.$broadcast('openproject.layout.removeMenuItem', {
        itemType: QUERY_MENU_ITEM_TYPE,
        objectId: query.id
      });
    }
  }

  $scope.cannot = AuthorisationService.cannot;

  $scope.saveQuery = function() {
    var messageObject;
    QueryService.saveQuery()
      .then(function(data){
        messageObject = data.status;
        if(data.query) {
          AuthorisationService.initModelAuth("query", data.query._links);
        }
      })
      .then(function(data){
        if($scope.query.starred != $scope.shareSettings.starred){
          QueryService.toggleQueryStarred()
            .then(function(data){
              closeAndReport(messageObject);

              return $scope.query;
            })
            .then(addOrRemoveMenuItem);
        } else {
          closeAndReport(messageObject);
        }
      });
  };
}]);
