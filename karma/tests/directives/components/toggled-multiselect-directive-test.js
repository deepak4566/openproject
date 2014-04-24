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

describe('toggledMultiselect Directive', function() {
    var compile, element, rootScope, scope;

    beforeEach(angular.mock.module('openproject.uiComponents', 'openproject.workPackages.helpers'));
    beforeEach(module('templates'));

    beforeEach(inject(function($rootScope, $compile) {
      var html;
      html = '<toggled-multiselect icon-name="cool-icon.png" name="name" values="values" available-options="options"></toggled-multiselect>';

      element = angular.element(html);
      rootScope = $rootScope;
      scope = $rootScope.$new();

      compile = function() {
        $compile(element)(scope);
        scope.$digest();
      };
    }));

    describe('element', function() {
      beforeEach(function() {
        scope.name    = "BO' SELECTA";
        scope.values  = [
          'a', 'b', 'c'
        ];
        scope.options = [
          ['New York', 'NY'],
          ['California', 'CA']
        ];

        compile();
      });

      it('should render a div', function() {
        expect(element.prop('tagName')).to.equal('DIV');
      });

      it('should render two SELECTs, one of which are hidden by default', function() {
        expect(element.find('select').size()).to.equal(2);
        expect(element.find('select.ng-hide').size()).to.equal(1);
      });

      it('should render two OPTIONs for displayed SELECT', function() {
        var select = element.find('select:not(.ng-hide)').first();
        expect(select.find('option').size()).to.equal(2);

        var option = select.find('option').first();
        expect(option.val()).to.equal('NY');
        expect(option.text()).to.equal('New York');
      });

      xit('should render a link that toggles multi-select', function() {
        var a = element.find('a');
        expect(element.find('select.ng-hide').size()).to.equal(1);
        a.click();
        scope.$apply();
        expect(element.find('select.ng-hide').size()).to.equal(1);
      });
    });
});
