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

module.exports = function($timeout, $window){
  return {
    restrict: 'A',

    link: function(scope, element) {
      function getTable() {
        return element.find('table');
      }

      function getInnerContainer() {
        return element.find('.generic-table--results-container');
      }

      function getBackgrounds() {
        return element.find('.generic-table--header-background,' +
                            '.generic-table--footer-background');
      }

      function getHeadersFooters() {
        return element.find(
          '.generic-table--sort-header-outer,' +
          '.generic-table--header-outer,' +
          '.generic-table--footer-outer'
        );
      }

      function setTableContainerWidths() {
        // adjust overall containers
        var tableWidth = getTable().width(),
          scrollBarWidth = 16;

        // account for a possible scrollbar
        if (tableWidth > document.documentElement.clientWidth - scrollBarWidth) {
          tableWidth += scrollBarWidth;
        }
        if (tableWidth > element.width()) {
          // force containers to the width of the table
          getInnerContainer().width(tableWidth);
          getBackgrounds().width(tableWidth);
        } else {
          // ensure table stretches to container sizes
          getInnerContainer().css('width', '100%');
          getBackgrounds().css('width', '100%');
        }
      }

      function setHeaderFooterWidths() {
        getHeadersFooters().each(function() {
          var parentWidth = angular.element(this).parent().width();
          angular.element(this).css('width', parentWidth + 'px');
        });
      }

      function invalidateWidths() {
        getInnerContainer().css('width', 'auto');
        getBackgrounds().css('width', 'auto');
        getHeadersFooters().each(function() {
          angular.element(this).css('width', 'auto');
        });
      }

      var setTableWidths = function() {
        $timeout(function() {
          invalidateWidths();
          setTableContainerWidths();
          setHeaderFooterWidths();
        });
      };

      $timeout(setTableWidths);
      angular.element($window).on('resize', _.debounce(setTableWidths, 50));
      scope.$on('$stateChangeSuccess', function() {
        $timeout(setTableWidths, 200);
      });
      scope.$on('openproject.layout.navigationToggled', function() {
        $timeout(setTableWidths, 200);
      });
    }
  };
};
