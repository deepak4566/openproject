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

import {Inject, Injectable, Injector, OnDestroy, OnInit} from '@angular/core';
import {StateService, Transition} from '@uirouter/core';
import {PathHelperService} from 'core-app/modules/common/path-helper/path-helper.service';
import {componentDestroyed} from 'ng2-rx-componentdestroyed';
import {States} from '../states.service';
import {WorkPackageResource} from 'core-app/modules/hal/resources/work-package-resource';
import {RootResource} from 'core-app/modules/hal/resources/root-resource';
import {WorkPackageCacheService} from '../work-packages/work-package-cache.service';
import {WorkPackageChangeset} from '../wp-edit-form/work-package-changeset';
import {WorkPackageEditingService} from '../wp-edit-form/work-package-editing-service';
import {WorkPackageFilterValues} from '../wp-edit-form/work-package-filter-values';
import {WorkPackageNotificationService} from '../wp-edit/wp-notification.service';
import {WorkPackageTableFiltersService} from '../wp-fast-table/state/wp-table-filters.service';
import {WorkPackageCreateService} from './wp-create.service';
import {takeUntil} from 'rxjs/operators';
import {RootDmService} from 'core-app/modules/hal/dm-services/root-dm.service';
import {OpTitleService} from 'core-components/html/op-title.service';
import {I18nService} from "core-app/modules/common/i18n/i18n.service";
import {
  IWorkPackageEditingServiceToken
} from "../wp-edit-form/work-package-editing.service.interface";
import {IWorkPackageCreateServiceToken} from "core-components/wp-new/wp-create.service.interface";
import {CurrentUserService} from "core-app/components/user/current-user.service";


@Injectable()
export class WorkPackageCreateController implements OnInit, OnDestroy {
  public successState:string;
  public newWorkPackage:WorkPackageResource;
  public parentWorkPackage:WorkPackageResource;
  public changeset:WorkPackageChangeset;
  protected wpEditing:WorkPackageEditingService = this.injector.get<WorkPackageEditingService>(IWorkPackageEditingServiceToken);

  public stateParams = this.$transition.params('to');
  public text = {
    button_settings: this.I18n.t('js.button_settings')
  };

  constructor(readonly $transition:Transition,
              readonly $state:StateService,
              readonly I18n:I18nService,
              readonly titleService:OpTitleService,
              readonly injector:Injector,
              readonly currentUser:CurrentUserService,
              protected wpNotificationsService:WorkPackageNotificationService,
              protected states:States,
              @Inject(IWorkPackageCreateServiceToken) protected wpCreate:WorkPackageCreateService,
              protected wpTableFilters:WorkPackageTableFiltersService,
              protected wpCacheService:WorkPackageCacheService,
              protected pathHelper:PathHelperService,
              protected RootDm:RootDmService) {

  }

  public ngOnInit() {
    this.newWorkPackageFromParams(this.stateParams)
      .then((changeset:WorkPackageChangeset) => {
        this.changeset = changeset;
        this.newWorkPackage = changeset.workPackage;

        this.setTitle();

        this.wpCacheService.updateWorkPackage(this.newWorkPackage);
        this.wpEditing.updateValue('new', changeset);

        if (this.stateParams['parent_id']) {
          this.changeset.setValue(
            'parent',
            { href: this.pathHelper.api.v3.work_packages.id(this.stateParams['parent_id']).path }
          );
        }

        // Load the parent simply to display the type name :-/
        if (this.stateParams['parent_id']) {
          this.wpCacheService.loadWorkPackage(this.stateParams['parent_id'])
            .values$()
            .pipe(
              takeUntil(componentDestroyed(this))
            )
            .subscribe(parent => {
              this.parentWorkPackage = parent;
            });
        }
      })
      .catch((error:any) => {
        if (error.errorIdentifier === 'urn:openproject-org:api:v3:errors:MissingPermission') {
          this.RootDm.load().then((root:RootResource) => {
            if (!root.user) {
              // Not logged in
              let url = URI(this.pathHelper.loginPath());
              url.search({back_url: url});
              window.location.href = url.toString();
            }
          });
          this.wpNotificationsService.handleRawError(error);
        }
      });
  }

  public ngOnDestroy() {
    // Nothing to do
  }

  public switchToFullscreen() {
    this.$state.go('work-packages.new', this.$state.params);
  }

  protected setTitle() {
    this.titleService.setFirstPart(this.I18n.t('js.work_packages.create.title'));
  }

  protected newWorkPackageFromParams(stateParams:any):Promise<WorkPackageChangeset> {
    const type = parseInt(stateParams.type);

    // If there is an open edit for this type, continue it
    const changeset = this.wpEditing.state('new').value;
    if (changeset !== undefined) {
      const changeType = changeset.workPackage.type;

      const hasChanges = !changeset.empty;
      const typeEmpty = (!changeType && !type);
      const typeMatches = (changeType && changeType.idFromLink === type.toString());

      if (hasChanges && (typeEmpty || typeMatches)) {
        return Promise.resolve(changeset);
      }
    }

    return this.wpCreate.createNewTypedWorkPackage(stateParams.projectPath, type).then(changeset => {
      const filter = new WorkPackageFilterValues(this.currentUser, changeset, this.wpTableFilters.current, ['type']);
      return filter.applyDefaultsFromFilters().then(() => changeset);
    });
  }

  public cancelAndBackToList() {
    this.wpEditing.stopEditing(this.newWorkPackage.id);
    this.$state.go('work-packages.list', this.$state.params);
  }
}
