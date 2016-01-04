// -- copyright
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
// ++

/**
 * Replaces the PathHelper service in its function, providing a way to generate safe paths
 * without having to store them directly in a service.
 */

angular
  .module('openproject.workPackages.services')
  .factory('apiPaths', apiPaths);

function apiPaths($document) {
  var apiPaths, paths = {
    appBasePath: $document.find('meta[name=app_base_path]').attr('content'),
    apiExperimental: '/api/experimental/',
    apiV2: '/api/v2/',
    apiV3: '/api/v3/'
  };

  return apiPaths = {
    get appBasePath() {
      return paths.appBasePath;
    },

    path: function (path) {
      return paths.appBasePath + path;
    },

    v3: function (path) {
      return apiPaths.path(paths.apiV3) + path;
    }
  };
}
