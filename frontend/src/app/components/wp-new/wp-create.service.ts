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

import {Injectable, Injector} from '@angular/core';
import {ApiWorkPackagesService} from '../api/api-work-packages/api-work-packages.service';
import {HalResource} from 'core-app/modules/hal/resources/hal-resource';
import {WorkPackageCacheService} from '../work-packages/work-package-cache.service';
import {Observable, Subject} from 'rxjs';
import {WorkPackageChangeset} from '../wp-edit-form/work-package-changeset';
import {WorkPackageResource} from 'core-app/modules/hal/resources/work-package-resource';
import {HalResourceService} from 'core-app/modules/hal/services/hal-resource.service';
import {IWorkPackageCreateService} from "core-components/wp-new/wp-create.service.interface";

@Injectable()
export class WorkPackageCreateService implements IWorkPackageCreateService {
  protected form:Promise<HalResource>;

  // Allow callbacks to happen on newly created work packages
  protected newWorkPackageCreatedSubject = new Subject<WorkPackageResource>();

  constructor(protected injector:Injector,
              protected wpCacheService:WorkPackageCacheService,
              protected halResourceService:HalResourceService,
              protected apiWorkPackages:ApiWorkPackagesService) {
  }

  public newWorkPackageCreated(wp:WorkPackageResource) {
    this.newWorkPackageCreatedSubject.next(wp);
  }

  public onNewWorkPackage():Observable<WorkPackageResource> {
    return this.newWorkPackageCreatedSubject.asObservable();
  }

  public createNewWorkPackage(projectIdentifier:string) {
    return this.getEmptyForm(projectIdentifier).then(form => {
      return this.fromCreateForm(form);
    });
  }

  public createNewTypedWorkPackage(projectIdentifier:string, type:number) {
    return this.apiWorkPackages.typedCreateForm(type, projectIdentifier).then(form => {
      return this.fromCreateForm(form);
    });
  }

  public fromCreateForm(form:any) {
    let wp = this.halResourceService.createHalResourceOfType<WorkPackageResource>('WorkPackage', form.payload.$plain());
    wp.initializeNewResource(form);

    return new WorkPackageChangeset(this.injector, wp, form);
  }

  /**
   * Create a copy resource from other and the new work package form
   * @param otherForm The work package form of another work package
   * @param form Work Package create form
   */
  public copyFrom(otherForm:any, form:any) {
    let wp = this.halResourceService.createHalResourceOfType<WorkPackageResource>('WorkPackage', otherForm.payload.$plain());

    // Override values from form payload
    wp.lockVersion = form.payload.lockVersion;

    wp.initializeNewResource(form);

    return new WorkPackageChangeset(this.injector, wp, form);
  }

  public copyWorkPackage(copyFromForm:any, projectIdentifier?:string) {
    let request = copyFromForm.payload.$source;

    return this.apiWorkPackages.emptyCreateForm(request, projectIdentifier).then(form => {
      return this.copyFrom(copyFromForm, form);
    });
  }

  public getEmptyForm(projectIdentifier:string|null):Promise<HalResource> {
    if (!this.form) {
      this.form = this.apiWorkPackages.emptyCreateForm({}, projectIdentifier);
    }

    return this.form;
  }
}
