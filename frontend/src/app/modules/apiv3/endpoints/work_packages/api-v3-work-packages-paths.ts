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

import {
  APIv3GettableResource,
  APIv3ResourceCollection,
  APIv3ResourcePath
} from "core-app/modules/apiv3/paths/apiv3-resource";
import {Injector} from "@angular/core";
import {APIV3WorkPackagePaths} from "core-app/modules/apiv3/endpoints/work_packages/api-v3-work-package-paths";
import {ApiV3FilterBuilder, buildApiV3Filter} from "core-components/api/api-v3/api-v3-filter-builder";
import {CollectionResource} from "core-app/modules/hal/resources/collection-resource";
import {WorkPackageResource} from "core-app/modules/hal/resources/work-package-resource";
import {WorkPackageCollectionResource} from "core-app/modules/hal/resources/wp-collection-resource";
import {Observable} from "rxjs";
import {FormResource} from "core-app/modules/hal/resources/form-resource";
import {APIv3FormResource} from "core-app/modules/apiv3/forms/apiv3-form-resource";
import {APIv3WorkPackageForm} from "core-app/modules/apiv3/endpoints/work_packages/apiv3-work-package-form";
import {APIV3Service} from "core-app/modules/apiv3/api-v3.service";

export class APIV3WorkPackagesPaths extends APIv3ResourceCollection<WorkPackageResource, APIV3WorkPackagePaths> {
  // Base path
  public readonly path:string;

  constructor(readonly apiRoot:APIV3Service,
              protected basePath:string) {
    super(apiRoot, basePath, 'work_packages', APIV3WorkPackagePaths);
  }

  // Static paths

  // /api/v3/(projects/:projectIdentifier)/work_packages/form
  public readonly form:APIv3WorkPackageForm = this.subResource('form', APIv3WorkPackageForm);

  /**
   * Create a work package from a form payload
   *
   * @param payload
   * @return {Promise<WorkPackageResource>}
   */
  public post(payload:Object):Observable<WorkPackageResource> {
    return this
      .halResourceService
      .post<WorkPackageResource>(this.path, payload);
  }

  /**
   * Shortcut to filter work packages by subject or ID
   * @param term
   * @param idOnly
   */
  public filterBySubjectOrId(term:string, idOnly:boolean = false):Observable<CollectionResource<WorkPackageResource>> {
    let filters:ApiV3FilterBuilder = new ApiV3FilterBuilder();

    if (idOnly) {
      filters.add('id', '=', [term]);
    } else {
      filters.add('subjectOrId', '**', [term]);
    }

    return this.filtered(filters);
  }

  /**
   * Loads the work packages collection for the given work package IDs.
   * Returns a WP Collection with schemas and results embedded.
   *
   * @param ids
   * @return {WorkPackageCollectionResource[]}
   */
  public loadCollectionsFor(ids:string[]):Promise<WorkPackageCollectionResource[]> {
    return this
      .halResourceService
      .getAllPaginated<WorkPackageCollectionResource[]>(
      this.path,
      ids.length,
      {
        filters: buildApiV3Filter('id', '=', ids).toJson(),
      }
    );
  }

}
