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

// TODO forward rails routes
angular.module('openproject.helpers')

.service('PathHelper', [function() {
  PathHelper = {
    apiPrefixV2: '/api/v2',
    apiPrefixV3: '/api/v3',

    projectsPath: function(){
      return '/projects';
    },
    projectPath: function(projectIdentifier) {
      return PathHelper.projectsPath() + '/' + projectIdentifier;
    },
    workPackagesPath: function() {
      return '/work_packages';
    },
    workPackagePath: function(id) {
      return '/work_packages/' + id;
    },
    usersPath: function() {
      return '/users';
    },
    userPath: function(id) {
      return PathHelper.usersPath() + '/' + id;
    },
    versionsPath: function() {
      return '/versions';
    },
    versionPath: function(versionId) {
      return PathHelper.versionsPath() + '/' + versionId;
    },
    subProjectsPath: function() {
      return '/sub_projects';
    },

    apiV2ProjectPath: function(projectIdentifier) {
      return PathHelper.apiPrefixV2 + PathHelper.projectPath(projectIdentifier);
    },
    apiV3ProjectsPath: function(){
      return PathHelper.apiPrefixV3 + PathHelper.projectsPath();
    },
    apiV3ProjectPath: function(projectIdentifier) {
      return PathHelper.apiPrefixV3 + PathHelper.projectPath(projectIdentifier);
    },
    apiWorkPackagesPath: function() {
      return PathHelper.apiPrefixV3 + '/work_packages';
    },
    apiProjectWorkPackagesPath: function(projectIdentifier) {
      return PathHelper.apiV3ProjectPath(projectIdentifier) + PathHelper.workPackagesPath();
    },
    apiProjectSubProjectsPath: function(projectIdentifier) {
      return PathHelper.apiV3ProjectPath(projectIdentifier) + PathHelper.subProjectsPath();
    },
    apiAvailableColumnsPath: function() {
      return PathHelper.apiPrefixV3 + '/queries/available_columns';
    },
    apiCustomFieldsPath: function() {
      return PathHelper.apiPrefixV3 + '/queries/custom_field_filters';
    },
    apiProjectCustomFieldsPath: function(projectIdentifier) {
      return PathHelper.apiV3ProjectPath(projectIdentifier) + '/queries/custom_field_filters';
    },
    apiProjectAvailableColumnsPath: function(projectIdentifier) {
      return PathHelper.apiV3ProjectPath(projectIdentifier) + '/queries/available_columns';
    },
    apiWorkPackagesColumnDataPath: function() {
      return PathHelper.apiWorkPackagesPath() + '/column_data';
    },
    apiPrioritiesPath: function() {
      return PathHelper.apiPrefixV2 + '/planning_element_priorities';
    },
    apiStatusesPath: function() {
      return PathHelper.apiPrefixV2 + '/statuses';
    },
    apiProjectStatusesPath: function(projectIdentifier) {
      return PathHelper.apiV2ProjectPath(projectIdentifier) + '/statuses';
    },
    apiGroupsPath: function() {
      return PathHelper.apiPrefixV3 + '/groups';
    },
    apiRolesPath: function() {
      return PathHelper.apiPrefixV3 + '/roles';
    },
    apiWorkPackageTypesPath: function() {
      return PathHelper.apiPrefixV2 + '/planning_element_types';
    },
    apiProjectWorkPackageTypesPath: function(projectIdentifier) {
      return PathHelper.apiV2ProjectPath(projectIdentifier) + '/planning_element_types';
    },
    apiUsersPath: function() {
      return PathHelper.apiPrefixV3 + PathHelper.usersPath();
    },
    apiProjectVersionsPath: function(projectIdentifier) {
      return PathHelper.apiV3ProjectPath(projectIdentifier) + PathHelper.versionsPath();
    },
    apiProjectUsersPath: function(projectIdentifier) {
      return PathHelper.apiV3ProjectPath(projectIdentifier) + PathHelper.usersPath();
    },
    apiProjectWorkPackagesSumsPath: function(projectIdentifier) {
      return PathHelper.apiV3ProjectPath(projectIdentifier) + PathHelper.workPackagesPath() + '/column_sums';
    },
    apiWorkPackagesSumsPath: function() {
      return PathHelper.apiWorkPackagesPath() + '/column_sums';
    }
  };

  return PathHelper;
}]);
