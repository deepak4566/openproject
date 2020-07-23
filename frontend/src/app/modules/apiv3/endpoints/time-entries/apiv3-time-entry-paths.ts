// -- copyright
// OpenProject is an open source project management software.
// Copyright (C) 2012-2020 the OpenProject GmbH
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
// See docs/COPYRIGHT.rdoc for more details.
// ++

import {APIv3ResourcePath} from "core-app/modules/apiv3/paths/apiv3-resource";
import {TimeEntryResource} from "core-app/modules/hal/resources/time-entry-resource";
import {FormResource} from "core-app/modules/hal/resources/form-resource";
import {CachableAPIV3Resource} from "core-app/modules/apiv3/cache/cachable-apiv3-resource";
import {TimeEntryCacheService} from "core-app/modules/apiv3/endpoints/time-entries/time-entry-cache.service";
import {StateCacheService} from "core-app/modules/apiv3/cache/state-cache.service";
import {MultiInputState} from "reactivestates";

export class Apiv3TimeEntryPaths extends CachableAPIV3Resource<TimeEntryResource> {
  // Static paths
  readonly form = new APIv3ResourcePath<FormResource>(this.injector, this.path, 'form');

  protected cacheState():MultiInputState<TimeEntryResource> {
    return this.states.timeEntries;
  }

  protected createCache():StateCacheService<TimeEntryResource> {
    return new TimeEntryCacheService(this.injector, this.cacheStateParameters());
  }
}
