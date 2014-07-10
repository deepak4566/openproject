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

.constant('DEFAULT_WORK_PACKAGE_PROPERTIES', [
  'status', 'assignee', 'responsible',
  'date', 'percentageDone', 'priority',
  'estimatedTime', 'versionName'
])
.constant('USER_TYPE', 'user')

.controller('WorkPackageDetailsController', [
  '$scope',
  '$state',
  '$stateParams',
  'workPackage',
  'I18n',
  'DEFAULT_WORK_PACKAGE_PROPERTIES',
  'USER_TYPE',
  'WorkPackagesHelper',
  'PathHelper',
  'UserService',
  '$q',
  'ConfigurationService',
  function($scope, $state, $stateParams, workPackage, I18n, DEFAULT_WORK_PACKAGE_PROPERTIES, USER_TYPE, WorkPackagesHelper, PathHelper, UserService, $q, ConfigurationService) {

    // initialization
    $scope.I18n = I18n;
    $scope.workPackage = workPackage;
    $scope.$parent.preselectedWorkPackageId = $scope.workPackage.props.id;
    $scope.maxDescriptionLength = 800;


    // resources for tabs

    // activities and latest activities

    $scope.activities = workPackage.embedded.activities;
    $scope.activities.splice(0, 1); // remove first activity (assumes activities are sorted chronologically)

    $scope.latestActitivies = $scope.activities.reverse().slice(0, 3); // this leaves the activities in reverse order

    $scope.activitiesSortedInDescendingOrder = ConfigurationService.commentsSortedInDescendingOrder();

    // restore former order of actvities unless comments are to be sorted in descending order
    if (!$scope.activitiesSortedInDescendingOrder) {
      $scope.activities.reverse();
    }

    // watchers

    $scope.watchers = workPackage.embedded.watchers;

    $scope.$on('$stateChangeSuccess', function(event, toState){
      // forward state to latest / default tab
      if (toState.name === 'work-packages.list.details') {
        $state.go($scope.rememberState.latestWorkPackageDetailsState, $stateParams);
      }

      // remember latest tab
      $scope.rememberState.latestWorkPackageDetailsState = toState.name;
    });

    // work package properties

    $scope.presentWorkPackageProperties = [];
    $scope.emptyWorkPackageProperties = [];
    $scope.userPath = PathHelper.staticUserPath;

    var workPackageProperties = DEFAULT_WORK_PACKAGE_PROPERTIES;

    function getPropertyValue(property, format) {
      if (format === USER_TYPE) {
        return workPackage.embedded[property];
      } else {
        return getFormattedPropertyValue(property);
      }
    }

    function getFormattedPropertyValue(property) {
      if (property === 'date') {
        return getDateProperty();
      } else {
        return WorkPackagesHelper.formatWorkPackageProperty(workPackage.props[property], property);
      }
    }

    function getDateProperty() {
      if (workPackage.props.startDate || workPackage.props.dueDate) {
        var displayedStartDate = WorkPackagesHelper.formatWorkPackageProperty(workPackage.props.startDate, 'startDate') || I18n.t('js.label_no_start_date'),
            displayedEndDate   = WorkPackagesHelper.formatWorkPackageProperty(workPackage.props.dueDate, 'dueDate') || I18n.t('js.label_no_due_date');

        return  displayedStartDate + ' - ' + displayedEndDate;
      }
    }

    function addFormattedValueToPresentProperties(property, label, value, format) {
      var propertyData = {
        property: property,
        label: label,
        format: format,
        value: null
      };
      $q.when(value).then(function(value) {
        propertyData.value = value;
      });
      $scope.presentWorkPackageProperties.push(propertyData);
    }

    function secondRowToBeDisplayed() {
      return !!workPackageProperties
        .slice(3, 6)
        .map(function(property) {
          return workPackage.props[property];
        })
        .reduce(function(a, b) {
          return a || b;
        });
    }

    var userFields = ['assignee', 'author', 'responsible'];

    (function setupWorkPackageProperties() {
      angular.forEach(workPackageProperties, function(property, index) {
        var label  = I18n.t('js.work_packages.properties.' + property),
            format = userFields.indexOf(property) === -1 ? 'text' : USER_TYPE,
            value  = getPropertyValue(property, format);

        if (!!value ||
            index < 3 ||
            index < 6 && secondRowToBeDisplayed()) {
          addFormattedValueToPresentProperties(property, label, value, format);
        } else {
          $scope.emptyWorkPackageProperties.push(label);
        }
      });
    })();

    function getCustomPropertyValue(customProperty) {
      if (!!customProperty.value && customProperty.format === USER_TYPE) {
        return UserService.getUser(customProperty.value);
      } else {
        return customProperty.value;
      }
    }

    (function setupCustomProperties() {
      angular.forEach(workPackage.props.customProperties, function(customProperty) {
        var property = customProperty.name,
            label = customProperty.name,
            value = getCustomPropertyValue(customProperty),
            format = customProperty.format;

        if (customProperty.value) {
          addFormattedValueToPresentProperties(property, label, value, format);
        } else {
         $scope.emptyWorkPackageProperties.push(label);
        }
      });
    })();

    // toggles

    $scope.toggleStates = {
      hideFullDescription: true,
      hideAllAttributes: true
    };

    $scope.editWorkPackage = function() {
      // TODO: Temporarily going to the old edit dialog until we get in-place editing done
      window.location = "/work_packages/" + $scope.workPackage.props.id;
    };
  }
]);
