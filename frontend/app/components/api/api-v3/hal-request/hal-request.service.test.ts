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

import {opApiModule} from '../../../../angular-modules';
import {HalRequestService} from './hal-request.service';
import {HalResource} from '../hal-resources/hal-resource.service';

describe('halRequest service', () => {
  var $httpBackend:ng.IHttpBackendService;
  var $rootScope:ng.IRootScopeService;
  var halRequest:HalRequestService;

  beforeEach(angular.mock.module(opApiModule.name));
  beforeEach(angular.mock.inject(function (_$httpBackend_, _$rootScope_, _halRequest_) {
    [$httpBackend, $rootScope, halRequest] = _.toArray(arguments);
  }));

  it('should exist', () => {
    expect(halRequest).to.exist;
  });

  describe('when requesting data', () => {
    var resource:HalResource;
    var promise:ng.IPromise<HalResource>;
    var method:string;
    var data:any;
    const methods = ['get', 'put', 'post', 'patch', 'delete'];
    const runExpectations = () => {
      it('should return a HalResource', () => {
        expect(resource).to.be.an.instanceOf(HalResource);
      });
    };
    const respond = status => {
      $httpBackend.expect(method.toUpperCase(), 'href', data).respond(status, {});
      promise
        .then(res => resource = res)
        .catch(res => resource = res);
      $httpBackend.flush();
    };
    const runRequests = callback => {
      methods.forEach(requestMethod => {
        describe(`when performing a ${requestMethod} request`, () => {
          beforeEach(() => {
            method = requestMethod;

            if (method !== 'get') {
              data = {foo: 'bar'};
            }

            callback();
          });

          describe('when no error occurs', () => {
            beforeEach(() => respond(200));
            runExpectations();
          });

          describe('when an error occurs', () => {
            beforeEach(() => respond(400));
            runExpectations();
          });
        });
      });
    };

    describe('when calling the http methods of the service', () => {
      runRequests(() => {
        promise = halRequest[method]('href', data);
      });
    });

    describe('when calling request()', () => {
      runRequests(() => {
        promise = halRequest.request(method, 'href', data);
      });
    });

    describe('when requesting a null href', () => {
      beforeEach(() => {
        promise = halRequest.request('get', null);
      });

      afterEach(() => {
        $rootScope.$apply();
      });

      it('should return a fulfilled promise', () => {
        expect(promise).to.eventually.be.fulfilled;
      });

      it('should return a null promise', () => {
        expect(promise).to.eventually.be.null;
      });
    });
  });
});
