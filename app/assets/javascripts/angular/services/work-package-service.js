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

angular.module('openproject.services')

.constant('DEFAULT_FILTER_PARAMS', {'fields[]': 'status_id', 'operators[status_id]': 'o'})

.service('WorkPackageService', [
  '$http',
  'PathHelper',
  'WorkPackagesHelper',
  'HALAPIResource',
  'DEFAULT_FILTER_PARAMS',
  function($http, PathHelper, WorkPackagesHelper, HALAPIResource, DEFAULT_FILTER_PARAMS) {
  var workPackage;

  var WorkPackageService = {
    getWorkPackage: function(id) {
      var resource = HALAPIResource.setup("work_packages/" + id);
      return resource.fetch().then(function (wp) {
        workPackage = wp;
        return workPackage;
      }).fail(function(error){
        // Do something sensible
      });
    },

    getWorkPackagesByQueryId: function(projectIdentifier, queryId) {
      var url = projectIdentifier ? PathHelper.apiProjectWorkPackagesPath(projectIdentifier) : PathHelper.apiWorkPackagesPath();

      var params = queryId ? { query_id: queryId } : DEFAULT_FILTER_PARAMS;

      return WorkPackageService.doQuery(url, params);
    },

    getWorkPackagesFromUrlQueryParams: function(projectIdentifier, location) {
      var url = projectIdentifier ? PathHelper.apiProjectWorkPackagesPath(projectIdentifier) : PathHelper.apiWorkPackagesPath();
      var params = {};
      angular.extend(params, location.search());

      return WorkPackageService.doQuery(url, params);
    },

    getWorkPackages: function(projectIdentifier, query, paginationOptions) {
      var url = projectIdentifier ? PathHelper.apiProjectWorkPackagesPath(projectIdentifier) : PathHelper.apiWorkPackagesPath();
      var params = angular.extend(query.toUpdateParams(), {
        page: paginationOptions.page,
        per_page: paginationOptions.perPage
      });

      return WorkPackageService.doQuery(url, params);
    },

    loadWorkPackageColumnsData: function(workPackages, columnNames, group_by) {
      var url = PathHelper.apiWorkPackagesColumnDataPath();

      var params = {
        'ids[]': workPackages.map(function(workPackage){
          return workPackage.id;
        }),
        'column_names[]': columnNames,
        'group_by': group_by
      };

      return WorkPackageService.doQuery(url, params);
    },

    // Note: Should this be on a project-service?
    getWorkPackagesSums: function(projectIdentifier, query, columns){
      var columnNames = columns.map(function(column){
        return column.name;
      });

      if (projectIdentifier){
        var url = PathHelper.apiProjectWorkPackagesSumsPath(projectIdentifier);
      } else {
        var url = PathHelper.apiWorkPackagesSumsPath();
      }

      var params = angular.extend(query.toParams(), {
        'column_names[]': columnNames
      });

      return WorkPackageService.doQuery(url, params);
    },

    augmentWorkPackagesWithColumnsData: function(workPackages, columns, group_by) {
      var columnNames = columns.map(function(column) {
        return column.name;
      });

      return WorkPackageService.loadWorkPackageColumnsData(workPackages, columnNames, group_by)
        .then(function(data){
          var columnsData = data.columns_data;
          var columnsMeta = data.columns_meta;

          angular.forEach(columns, function(column, i){
            column.total_sum = columnsMeta.total_sums[i];
            if (columnsMeta.group_sums) column.group_sums = columnsMeta.group_sums[i];

            angular.forEach(workPackages, function(workPackage, j) {
              WorkPackagesHelper.augmentWorkPackageWithData(workPackage, column.name, !!column.custom_field, columnsData[i][j]);
            });
          });

          return workPackages;
        });
    },

    doQuery: function(url, params) {
      return $http({
        method: 'GET',
        url: url,
        params: params,
        headers: {'Content-Type': 'application/x-www-form-urlencoded'}
      }).then(function(response){
        return response.data;
      });
    },

    performBulkDelete: function(workPackages) {
      var params = {
        'ids[]': workPackages.map(function(wp) {
          return wp.id;
        })
      };
      return $http['delete'](PathHelper.workPackagesBulkDeletePath(), { params: params });
    }
  };

  return WorkPackageService;
}]);
