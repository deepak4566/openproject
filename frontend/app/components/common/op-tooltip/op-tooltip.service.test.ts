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

import {openprojectModule} from '../../../angular-modules';
import {Tooltip} from './op-tooltip.service';
import IAugmentedJQuery = angular.IAugmentedJQuery;
import IScope = angular.IScope;
import SinonSandbox = Sinon.SinonSandbox;

describe('Tooltip service', () => {
  var create;
  var show;
  var remove;

  var tooltip: Tooltip;
  var elements: IAugmentedJQuery;

  beforeEach(angular.mock.module(openprojectModule.name));
  beforeEach(angular.mock.inject(function ($rootElement, $rootScope, $httpBackend, Tooltip) {
    const setElements = () => {
      elements = $rootElement.find('.op-tooltip');
    };

    create = () => {
      const scope = $rootScope.$new();
      scope.templateUrl = 'some-template';
      scope.templateValue = 'the template';

      tooltip = new Tooltip($rootElement, scope, 'templateUrl');
      show();
    };

    show = () => {
      tooltip.show();
      setElements();
    };

    remove = () => {
      tooltip.remove();
      setElements();
    };
  }));

  it('should exist', () => {
    expect(Tooltip).to.exist;
  });

  describe('when showing a tooltip', () => {
    function testTooltip() {
      it('should always display only one toolip', () => {
        expect(elements).to.have.length(1);
      });

      it('should add a tooltip element to the parent element', () => {
        expect(elements.get(0)).to.exist;
      });

      it('should add the tooltip to the active tooltips', () => {
        expect(Tooltip.active).to.contain(tooltip);
      });

      it('should make only one tooltip active', () => {
        expect(Tooltip.active).to.have.length(1);
      });

      it('should compile the provided content', () => {
        expect(elements.first().html()).to.contain('the template');
      });

      describe('when destroying the tooltip', () => {
        beforeEach(() => {
          remove();
        });

        it('should remove the element from the dom', () => {
          expect(elements).to.have.length(0);
        });

        it('should clear the active tooltips', () => {
          expect(Tooltip.active).to.have.length(0);
        });
      });
    }

    beforeEach(angular.mock.inject(($httpBackend) => {
      $httpBackend.expectGET('some-template').respond('{{ templateValue }}');
      create();
      $httpBackend.flush();
    }));
    testTooltip();

    describe('when showing another tooltip', () => {
      beforeEach(() => {
        create();
      });
      testTooltip();
    });

    describe('when showing the same tooltip twice', () => {
      beforeEach(() => {
        show();
      });
      testTooltip();
    });
  });
});
