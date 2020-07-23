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

import {APIv3GettableResource, APIv3ResourceCollection} from "core-app/modules/apiv3/paths/apiv3-resource";
import {HalResource} from "core-app/modules/hal/resources/hal-resource";
import {ProjectResource} from "core-app/modules/hal/resources/project-resource";
import {CollectionResource} from "core-app/modules/hal/resources/collection-resource";
import {APIV3Service} from "core-app/modules/apiv3/api-v3.service";

export class Apiv3MembershipsPaths extends APIv3ResourceCollection<HalResource, APIv3GettableResource> {
  constructor(protected apiRoot:APIV3Service,
              protected basePath:string) {
    super(apiRoot, basePath, 'memberships');
  }

  // /api/v3/memberships/available_projects
  readonly available_projects = this.subResource<CollectionResource<ProjectResource>>('available_projects');
}
