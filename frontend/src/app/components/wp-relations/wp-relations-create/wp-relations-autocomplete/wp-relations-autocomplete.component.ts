//-- copyright
// OpenProject is an open source project management software.
// Copyright (C) 2012-2021 the OpenProject GmbH
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
//++

import {
  AfterContentInit,
  ChangeDetectorRef,
  Component,
  EventEmitter, HostListener,
  Input,
  Output,
  ViewChild,
  ViewEncapsulation,
  NgZone
} from '@angular/core';
import { I18nService } from 'core-app/modules/common/i18n/i18n.service';
import { WorkPackageResource } from 'core-app/modules/hal/resources/work-package-resource';
import { from, Observable, of, Subject } from "rxjs";
import { catchError, debounceTime, distinctUntilChanged, map, switchMap, tap } from "rxjs/operators";
import { NgSelectComponent } from "@ng-select/ng-select";
import { IsolatedQuerySpace } from "core-app/modules/work_packages/query-space/isolated-query-space";
import { PathHelperService } from "core-app/modules/common/path-helper/path-helper.service";
import { WorkPackageCollectionResource } from "core-app/modules/hal/resources/wp-collection-resource";
import { CurrentProjectService } from "core-components/projects/current-project.service";
import { ApiV3Filter } from "core-components/api/api-v3/api-v3-filter-builder";
import { HalResourceService } from "core-app/modules/hal/services/hal-resource.service";
import { SchemaCacheService } from "core-components/schemas/schema-cache.service";
import { WorkPackageNotificationService } from "core-app/modules/work_packages/notifications/work-package-notification.service";
import {OpAutocompleterComponent} from "core-app/modules/autocompleter/op-autocompleter/op-autocompleter.component";
import { HalResource } from 'core-app/modules/hal/resources/hal-resource';

@Component({
  selector: 'wp-relations-autocomplete',
  templateUrl: './wp-relations-autocomplete.html',

  // Allow styling the embedded ng-select
  encapsulation: ViewEncapsulation.None,
  styleUrls: ['./wp-relations-autocomplete.sass']
})
export class WorkPackageRelationsAutocomplete {
  readonly text = {
    placeholder: this.I18n.t('js.relations_autocomplete.placeholder')
  };

  @Input() inputPlaceholder:string = this.text.placeholder;
  @Input() workPackage:WorkPackageResource;
  @Input() selectedRelationType:string;
  @Input() filterCandidatesFor:string;

  /** Do we take the current query filters into account? */
  @Input() additionalFilters:ApiV3Filter[] = [];

  @Input() hiddenOverflowContainer = 'body';
  @ViewChild(OpAutocompleterComponent, { static: true }) public ngSelectComponent:OpAutocompleterComponent;

  @Output() onCancel = new EventEmitter<undefined>();
  @Output() onSelected = new EventEmitter<WorkPackageResource>();
  @Output() onEmptySelected = new EventEmitter<undefined>();

  // Whether we're currently loading
  public isLoading = false;

  getAutocompleterData = (query:string):Observable<HalResource[]> => {
    // Return when the search string is empty
    if (query === null || query.length === 0) {
      this.isLoading = false;
      return of([]);
    }

    // Remove prefix # from search
    query = query.replace(/^#/, '');

    return from(
      this.workPackage.availableRelationCandidates.$link.$fetch({
        query: query,
        filters: JSON.stringify(this.additionalFilters),
        type: this.filterCandidatesFor || this.selectedRelationType
      }) as Promise<WorkPackageCollectionResource>
    )
      .pipe(
        map(collection => collection.elements),
        catchError((error:unknown) => {
          this.notificationService.handleRawError(error);
          return of([]);
        }),
        tap(() => this.isLoading = false)
      );
  };
  public autocompleterOptions = {
    resource:'work_packages',
    getOptionsFn: this.getAutocompleterData
    };

  public appendToContainer = 'body';

  constructor(private readonly querySpace:IsolatedQuerySpace,
              private readonly pathHelper:PathHelperService,
              private readonly notificationService:WorkPackageNotificationService,
              private readonly CurrentProject:CurrentProjectService,
              private readonly halResourceService:HalResourceService,
              private readonly schemaCacheService:SchemaCacheService,
              private readonly cdRef:ChangeDetectorRef,
              private readonly ngZone:NgZone,
              private readonly I18n:I18nService) {
  }

  @HostListener('keydown.escape')
  public reset() {
    this.cancel();
  }

  cancel() {
    this.onCancel.emit();
  }

  public onWorkPackageSelected(workPackage?:WorkPackageResource) {
    if (workPackage) {
      this.schemaCacheService
        .ensureLoaded(workPackage)
        .then(() => {
          this.onSelected.emit(workPackage);
          this.ngSelectComponent.ngSelectInstance.close();
        });
    }
  }

    onOpen() {
    // Force reposition as a workaround for BUG
    // https://github.com/ng-select/ng-select/issues/1259
    this.ngZone.runOutsideAngular(() => {
      setTimeout(() => {
        this.ngSelectComponent.repositionDropdown();
        jQuery(this.hiddenOverflowContainer).one('scroll', () => {
          this.ngSelectComponent.closeSelect();
        });
      }, 25);    
    });
  }
}
