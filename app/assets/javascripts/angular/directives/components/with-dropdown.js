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

// TODO move to UI components
angular.module('openproject.uiComponents')

  .directive('withDropdown', ['$rootScope', '$window', function ($rootScope, $window) {

    function position(dropdown, trigger) {
      var hOffset = 0,
        vOffset = 0;

      if( dropdown.length === 0 || !trigger ) return;

      // Styling logic taken from jQuery-dropdown plugin: https://github.com/plapier/jquery-dropdown
      // (dual MIT/GPL-Licensed)

      // Position the dropdown relative-to-parent or relative-to-document
      if (dropdown.hasClass('dropdown-relative')) {
        dropdown.css({
          left: dropdown.hasClass('dropdown-anchor-right') ?
            trigger.position().left - (dropdown.outerWidth(true) - trigger.outerWidth(true)) - parseInt(trigger.css('margin-right')) + hOffset :
            trigger.position().left + parseInt(trigger.css('margin-left')) + hOffset,
          top: trigger.position().top + trigger.outerHeight(true) - parseInt(trigger.css('margin-top')) + vOffset
        });
      } else {
        dropdown.css({
          left: dropdown.hasClass('dropdown-anchor-right') ?
            trigger.offset().left - (dropdown.outerWidth() - trigger.outerWidth()) + hOffset : trigger.offset().left + hOffset,
          top: trigger.offset().top + trigger.outerHeight() + vOffset
        });
      }
    }

    return {
      restrict: 'EA',
      scope: {
        dropdownId: '@',
        focusElementId: '@'
      },
      link: function (scope, element, attributes) {
        var dropdown = jQuery("#" + attributes.dropdownId),
          trigger;

        $rootScope.$on('hideAllDropdowns', function(event){
          jQuery('.dropdown').hide();
        });

        angular.element($window).on('resize', function(event) {
          if(dropdown.is(':visible')) {
            position(dropdown, trigger);
          }
        });

        element.on('click', function (event) {
          var showDropdown = dropdown.is(':hidden');

          trigger = jQuery(this);

          event.preventDefault();
          event.stopPropagation();

          scope.$emit('hideAllDropdowns');
          if (showDropdown) dropdown.show();

          position(dropdown, trigger);

          if(attributes.focusElementId) {
            angular.element('#' + attributes.focusElementId).focus();
          }
        });
      }
    };
  }]);
