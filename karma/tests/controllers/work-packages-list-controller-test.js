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

/*jshint expr: true*/

describe('WorkPackagesListController', function() {
  var scope, ctrl, win, testParams,
     testProjectService, testWorkPackageService, testQueryService, testPaginationService;
  var buildController;

  beforeEach(module('openproject.api', 'openproject.workPackages.controllers', 'openproject.workPackages.services', 'ng-context-menu', 'btford.modal'));
  beforeEach(inject(function($rootScope, $controller, $timeout) {
    scope = $rootScope.$new();
    win   = {
     location: { pathname: "" }
    };

    var workPackageData = {
      meta: {
      }
    };
    var columnData = {
    };
    var availableQueryiesData = {
    };

    var projectData  = { embedded: { types: [] } };
    var projectsData = [ projectData ];

    testProjectService = {
      getProject: function(identifier) {
        return $timeout(function() {
          return projectData;
        }, 10);
      },
      getProjects: function(identifier) {
        return $timeout(function() {
          return projectsData;
        }, 10);
      }
    };

    testWorkPackageService = {
      getWorkPackages: function () {
      },
      getWorkPackagesByQueryId: function (params) {
        return $timeout(function () {
          return workPackageData;
        }, 10);
      },
      getWorkPackagesFromUrlQueryParams: function () {
        return $timeout(function () {
          return workPackageData;
        }, 10);
      }
    };
    testQueryService = {
      getQuery: function () {
        return {
          getQueryString: function () {
          }
        };
      },
      initQuery: function () {
      },
      getAvailableOptions: function() {
        return {};
      },
      loadAvailableColumns: function () {
        return $timeout(function () {
          return columnData;
        }, 10);
      },
      loadAvailableGroupedQueries: function () {
        return $timeout(function () {
          return availableQueryiesData;
        }, 10);
      },

      loadAvailableUnusedColumns: function() {
        return $timeout(function () {
          return columnData;
        }, 10);
      },

      getTotalEntries: function() {
      },

      setTotalEntries: function() {
        return 10;
      },
    };
    testPaginationService = {
      setPerPageOptions: function () {
      },
      setPerPage: function () {
      },
      setPage: function () {
      }
    };

    testParams = {};

    buildController = function() {
      scope.projectIdentifier = 'test';

      ctrl = $controller("WorkPackagesListController", {
        $scope:  scope,
        $window: win,
        QueryService:       testQueryService,
        PaginationService:  testPaginationService,
        WorkPackageService: testWorkPackageService,
        $stateParams:       testParams
      });
    };

  }));

  describe('initialisation', function() {
    it('should initialise', function() {
      buildController();
      expect(scope.settingUpPage).to.be.defined;
    });
  });
});
