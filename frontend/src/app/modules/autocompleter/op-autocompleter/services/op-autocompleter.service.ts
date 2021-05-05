import { Injectable } from '@angular/core';
import { ApiV3FilterBuilder, FilterOperator } from 'core-app/components/api/api-v3/api-v3-filter-builder';
import { debounceTime, distinctUntilChanged, map, switchMap } from 'rxjs/operators';
import { APIv3ResourceCollection } from 'core-app/modules/apiv3/paths/apiv3-resource';
import { UserResource } from 'core-app/modules/hal/resources/user-resource';
import { APIv3UserPaths } from 'core-app/modules/apiv3/endpoints/users/apiv3-user-paths';
import { APIV3WorkPackagePaths } from 'core-app/modules/apiv3/endpoints/work_packages/api-v3-work-package-paths';
import { WorkPackageResource } from 'core-app/modules/hal/resources/work-package-resource';
import {HalResource} from 'core-app/modules/hal/resources/hal-resource';
import {APIV3Service} from "core-app/modules/apiv3/api-v3.service";
import {of, Observable} from "rxjs";
import {UntilDestroyedMixin} from "core-app/helpers/angular/until-destroyed.mixin";

@Injectable()

export class OpAutocompleterService extends UntilDestroyedMixin {

  constructor(
    private apiV3Service:APIV3Service,
  ) {
    super();
  }
  // A method for fetching data with different resource type and different filter
  public loadAvailable(matching:string, resource:resource, filters?: IAPIFilter[], searchKey?:string):Observable<HalResource[]> {
    const finalFilters:ApiV3FilterBuilder = this.createFilters(filters ?? [], matching, searchKey);

    const filteredData = (this.apiV3Service[resource] as
      APIv3ResourceCollection<UserResource|WorkPackageResource, APIv3UserPaths|APIV3WorkPackagePaths>)
      .filtered(finalFilters).get()
      .pipe(map(collection => collection.elements));
      return filteredData;
   
  }

  // A method for building filters
  protected createFilters(filters:IAPIFilter[], matching:string, searchKey?:string) {
    const finalFilters = new ApiV3FilterBuilder();

    for (const filter of filters) {
      finalFilters.add(filter.name, filter.operator, filter.values);
    }
    if (matching) {
      finalFilters.add(searchKey ?? '', '**', [matching]);
    }
    return finalFilters;
  }

  // A method for returning data based on the resource type
  // If you need to fetch our default date sources like work_packages or users,
  // you should use the default method (loadAvailable), otherwise you should implement a function for
  // your desired resourse
  public loadData(matching:string,  resource:resource, filters?:IAPIFilter[], searchKey?:string) {
    switch (resource) {
      // in this case we can add more functions for fetching usual resources
      default: {
         return this.loadAvailable(matching, resource, filters, searchKey);
         break;
      }
   }
  }
}
