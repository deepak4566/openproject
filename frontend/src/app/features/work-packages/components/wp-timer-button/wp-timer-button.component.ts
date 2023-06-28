// -- copyright
// OpenProject is an open source project management software.
// Copyright (C) 2012-2023 the OpenProject GmbH
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
// See COPYRIGHT and LICENSE files for more details.
//++

import { WorkPackageResource } from 'core-app/features/hal/resources/work-package-resource';
import {
  ChangeDetectionStrategy,
  ChangeDetectorRef,
  Component,
  HostBinding,
  Injector,
  Input,
  OnInit,
  ViewEncapsulation,
} from '@angular/core';
import { I18nService } from 'core-app/core/i18n/i18n.service';
import { UntilDestroyedMixin } from 'core-app/shared/helpers/angular/until-destroyed.mixin';
import { ApiV3Service } from 'core-app/core/apiv3/api-v3.service';
import { TimeEntryCreateService } from 'core-app/shared/components/time_entries/create/create.service';
import {
  filter,
  map,
  switchMap,
} from 'rxjs/operators';
import {
  firstValueFrom,
  from,
  Observable,
  timer,
} from 'rxjs';
import { TimeEntryResource } from 'core-app/features/hal/resources/time-entry-resource';
import { HalResourceEditingService } from 'core-app/shared/components/fields/edit/services/hal-resource-editing.service';
import * as moment from 'moment';
import { SchemaCacheService } from 'core-app/core/schemas/schema-cache.service';
import { TimezoneService } from 'core-app/core/datetime/timezone.service';
import { TimeEntryService } from 'core-app/shared/components/time_entries/services/time_entry.service';
import { formatElapsedTime } from 'core-app/features/work-packages/components/wp-timer-button/time-formatter.helper';
import { OpModalService } from 'core-app/shared/components/modal/modal.service';
import { StopExistingTimerModalComponent } from 'core-app/shared/components/time_entries/timer/stop-existing-timer-modal.component';
import { TimeEntryEditService } from 'core-app/shared/components/time_entries/edit/edit.service';
import { ConfirmDialogModalComponent } from 'core-app/shared/components/modals/confirm-dialog/confirm-dialog.modal';

export function pad(val:number):string {
  return val > 9 ? val.toString() : "0" + val.toString();
}

@Component({
  selector: 'op-wp-timer-button',
  templateUrl: './wp-timer-button.component.html',
  changeDetection: ChangeDetectionStrategy.OnPush,
  encapsulation: ViewEncapsulation.None,
})
export class WorkPackageTimerButtonComponent extends UntilDestroyedMixin implements OnInit {
  @HostBinding('class.op-wp-timer-button') className = true;

  @Input() public workPackage:WorkPackageResource;

  active:TimeEntryResource|null|undefined;

  elapsed$:Observable<string> = timer(0, 1000)
    .pipe(
      map(() => this.active),
      filter((timeEntry) => timeEntry !== null),
      map((timeEntry:TimeEntryResource) => formatElapsedTime(timeEntry.createdAt as string)),
    );

  text = {
    workPackage: this.I18n.t('js.label_work_package'),
  };

  constructor(
    readonly injector:Injector,
    readonly I18n:I18nService,
    readonly apiV3Service:ApiV3Service,
    readonly timeEntryService:TimeEntryService,
    readonly timeEntryEditService:TimeEntryEditService,
    readonly timeEntryCreateService:TimeEntryCreateService,
    readonly halEditing:HalResourceEditingService,
    readonly modalService:OpModalService,
    readonly schemaCache:SchemaCacheService,
    readonly timezoneService:TimezoneService,
    readonly cdRef:ChangeDetectorRef,
  ) {
    super();
  }

  ngOnInit() {
    this.reload();
  }

  reload():void {
    this
      .timeEntryService
      .activeTimer$
      .pipe(
        this.untilDestroyed(),
      )
      .subscribe((timeEntry) => {
        this.active = timeEntry;
        this.cdRef.detectChanges();
      });
  }

  get activeForWorkPackage():boolean {
    return !!this.active && this.active.workPackage.href === this.workPackage.href;
  }

  clear():void {
    this.timeEntryService.activeTimer$.next(null);
    this.active = null;
    this.cdRef.detectChanges();
  }

  async stop():Promise<unknown> {
    if (this.active) {
      return this.timeEntryEditService.stopTimerAndEdit(this.active);
    }

    return undefined;
  }

  async start():Promise<void> {
    if (this.active) {
      this.showStopModal()
        .then(() => this.stop().then(() => this.startTimer()))
        .catch(() => undefined);
    } else {
      this.startTimer();
    }
  }

  private startTimer():void {
    this.timeEntryCreateService
      .createNewTimeEntry(moment(), this.workPackage, true)
      .pipe(
        switchMap((changeset) => from(this.halEditing.save(changeset))),
        map((result) => result.resource as TimeEntryResource),
      )
      .subscribe((active) => {
        this.timeEntryService.activeTimer$.next(active);
        this.active = active;
        this.cdRef.detectChanges();
      });
  }

  private showStopModal():Promise<void> {
    return new Promise<void>((resolve, reject) => {
      this
        .modalService
        .show(StopExistingTimerModalComponent, this.injector, { timer: this.active })
        .subscribe((modal) => modal.closingEvent.subscribe(() => {
          if (modal.confirmed) {
            resolve();
          } else {
            reject();
          }
        }));
    });
  }
}
