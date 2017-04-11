//-- copyright
// OpenProject is a project management system.
// Copyright (C) 2012-2015 the OpenProject Foundation (OPF)
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

import {States} from '../states.service';
import {WorkPackageEditModeStateService} from '../wp-edit/wp-edit-mode-state.service';

import {openprojectModule} from "../../angular-modules";
function wpDetailsToolbar(
  PERMITTED_MORE_MENU_ACTIONS:any,
  $state:ng.ui.IStateService,
  states:States,
  $window:ng.IWindowService,
  I18n:op.I18n,
  HookService:any,
  WorkPackageService:any,
  WorkPackageAuthorization:any,
  wpEditModeState:WorkPackageEditModeStateService) {

  function getPermittedActions(authorization:any, permittedMoreMenuActions:any) {
    var permittedActions = authorization.permittedActionsWithLinks(permittedMoreMenuActions);
    var augmentedActions = { };

    angular.forEach(permittedActions, function(this:any, permission) {
      let css = [ (permission.icon || 'icon-' + permission.key) ];

      this[permission.key] = { link: permission.link, css: css };
    }, augmentedActions);

    return augmentedActions;
  }

  function getPermittedPluginActions(authorization:any) {
    var pluginActions:any = [];
    angular.forEach(HookService.call('workPackageDetailsMoreMenu'), function(action) {
      pluginActions = pluginActions.concat(action);
    });

    var permittedPluginActions = authorization.permittedActionsWithLinks(pluginActions);
    var augmentedPluginActions = { };

    angular.forEach(permittedPluginActions, function(this:any, action) {
      var css:string[] = [].concat(action.css);

      if (css.length === 0) {
        css = ["icon-" + action.key];
      }

      this[action.key] = { link: action.link, css: css };
    }, augmentedPluginActions);

    return augmentedPluginActions;
  }

  return {
    restrict: 'E',
    templateUrl: '/components/wp-details/wp-details-toolbar.directive.html',
    scope: {
      workPackage: '='
    },

    link: function(scope:any, attr:ng.IAttributes, element:ng.IAugmentedJQuery) {

      scope.workPackage.project.$load().then(() => {
        var authorization = new WorkPackageAuthorization(scope.workPackage);

        scope.displayWatchButton = scope.workPackage.hasOwnProperty('unwatch') ||
          scope.workPackage.hasOwnProperty('watch');

        scope.I18n = I18n;
        scope.permittedActions = angular.extend(getPermittedActions(authorization, PERMITTED_MORE_MENU_ACTIONS),
          getPermittedPluginActions(authorization));
        scope.actionsAvailable = Object.keys(scope.permittedActions).length > 0;

        scope.triggerMoreMenuAction = function(action:any, link:any) {
          switch (action) {
            case 'delete':
              deleteSelectedWorkPackage();
              break;
            default:
              $window.location.href = link;
              break;
          }
        };

        scope.wpEditModeState = wpEditModeState;
      });

      function deleteSelectedWorkPackage() {
        var workPackageDeletionId = scope.workPackage.id;
        var promise = WorkPackageService.performBulkDelete([workPackageDeletionId], true);

        promise.success(function() {
          states.focusedWorkPackage.clear();
          $state.go('work-packages.list');
        });
      }
    }
  };
}

openprojectModule.directive('wpDetailsToolbar', wpDetailsToolbar);
