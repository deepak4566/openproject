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

.factory('settingsModal', ['btfModal', function(btfModal) {
  return btfModal({
    controller:   'SettingsModalController',
    controllerAs: 'modal',
    templateUrl:  '/templates/work_packages/modals/settings.html'
  });
}])

.controller('SettingsModalController', ['$scope', 'settingsModal', 'QueryService',
  function($scope, settingsModal, QueryService) {
  this.name    = 'Settings';
  this.closeMe = settingsModal.deactivate;
  $scope.query = QueryService.getQuery();
  $scope.deleteQuery = false;

  $scope.updateQuery = function(deleteQuery) {
    QueryService.saveQuery()
      .then(function(data){
        settingsModal.deactivate();
        $scope.$emit('flashMessage', data.status);
      });
    };
}]);
