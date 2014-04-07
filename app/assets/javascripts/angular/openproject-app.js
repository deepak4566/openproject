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

// global
angular.module('openproject.services', ['openproject.uiComponents', 'openproject.helpers', 'openproject.workPackages.config']);
angular.module('openproject.helpers', ['openproject.services']);
angular.module('openproject.models', ['openproject.workPackages.config']);

// timelines
angular.module('openproject.timelines', ['openproject.timelines.controllers', 'openproject.timelines.directives', 'openproject.uiComponents']);
angular.module('openproject.timelines.models', ['openproject.helpers']);
angular.module('openproject.timelines.helpers', []);
angular.module('openproject.timelines.controllers', ['openproject.timelines.models']);
angular.module('openproject.timelines.services', ['openproject.timelines.models', 'openproject.timelines.helpers']);
angular.module('openproject.timelines.directives', ['openproject.timelines.models', 'openproject.timelines.services', 'openproject.uiComponents', 'openproject.helpers']);

// work packages
angular.module('openproject.workPackages', ['openproject.workPackages.controllers', 'openproject.workPackages.filters', 'openproject.workPackages.directives', 'openproject.uiComponents']);
angular.module('openproject.workPackages.helpers', ['openproject.helpers']);
angular.module('openproject.workPackages.filters', ['openproject.workPackages.helpers']);
angular.module('openproject.workPackages.config', []);
angular.module('openproject.workPackages.controllers', ['openproject.models', 'openproject.workPackages.helpers', 'openproject.services', 'openproject.workPackages.config']);
angular.module('openproject.workPackages.directives', ['openproject.uiComponents', 'openproject.services']);

// main app
var openprojectApp = angular.module('openproject', ['ui.select2', 'ui.date', 'openproject.uiComponents', 'openproject.timelines', 'openproject.workPackages', 'ngAnimate', 'tmh.dynamicLocale']);

openprojectApp
  .config(['$locationProvider', '$httpProvider', 'tmhDynamicLocaleProvider', function($locationProvider, $httpProvider, tmhDynamicLocaleProvider) {
    $locationProvider.html5Mode(true);
    $httpProvider.defaults.headers.common['X-CSRF-TOKEN'] = jQuery('meta[name=csrf-token]').attr('content'); // TODO find a more elegant way to keep the session alive
    tmhDynamicLocaleProvider.localeLocationPattern('/assets/angular-i18n/angular-locale_{{locale}}.js');
  }])
  .run(['$http', 'tmhDynamicLocale', 'I18n', function($http, tmhDynamicLocale, I18n){
    $http.defaults.headers.common.Accept = 'application/json';

    tmhDynamicLocale.set(I18n.locale === 'de' ? 'de-de' : 'en-us');
  }]);
