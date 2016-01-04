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

describe('apiPaths', function() {
  var $document, apiPaths;

  beforeEach(angular.mock.module('openproject.workPackages.services'));
  beforeEach(angular.mock.inject(function (_$document_) {
    $document = _$document_;
    sinon.stub($document, 'find').returns({ attr: function () { return 'my_path' } });
  }));

  beforeEach(angular.mock.inject(function(_$document_, _apiPaths_) {
    apiPaths = _apiPaths_;
  }));

  afterEach(function () {
    $document.find.restore();
  });

  it("should return the 'app_base_path' meta tag value", function () {
    expect(apiPaths.appBasePath).to.eq('my_path');
  });

  it('returns the apiV3 paths with the correct prefixes', function () {
    expect(apiPaths.v3('some_path')).to.eq(apiPaths.appBasePath + '/api/v3/some_path');
  });
});
