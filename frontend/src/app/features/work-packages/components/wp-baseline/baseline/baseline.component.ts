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

import {
  ChangeDetectionStrategy,
  Component,
  EventEmitter,
  HostBinding,
  Input,
  OnInit,
  Output,
} from '@angular/core';

import { I18nService } from 'core-app/core/i18n/i18n.service';
import { UntilDestroyedMixin } from 'core-app/shared/helpers/angular/until-destroyed.mixin';
import { HalResourceService } from 'core-app/features/hal/services/hal-resource.service';
import SpotDropAlignmentOption from 'core-app/spot/drop-alignment-options';
import { WeekdayService } from 'core-app/core/days/weekday.service';
import { DayResourceService } from 'core-app/core/state/days/day.service';
import { IDay } from 'core-app/core/state/days/day.model';
import { TimezoneService } from 'core-app/core/datetime/timezone.service';
import { ConfigurationService } from 'core-app/core/config/configuration.service';
import { Observable } from 'rxjs';
import {
  DEFAULT_TIMESTAMP,
  WorkPackageViewBaselineService,
} from 'core-app/features/work-packages/routing/wp-view-base/view-services/wp-view-baseline.service';

@Component({
  selector: 'op-baseline',
  changeDetection: ChangeDetectionStrategy.OnPush,
  templateUrl: './baseline.component.html',
  styleUrls: ['./baseline.component.sass'],
})
export class OpBaselineComponent extends UntilDestroyedMixin implements OnInit {
  @HostBinding('class.op-baseline') className = true;

  @Output() submitted = new EventEmitter<void>();

  @Input() showActionBar? = false;

  public dropDownDescription = '';

  public nonWorkingDays$:Observable<IDay[]> = this.wpTableBaseline.nonWorkingDays$;

  public selectedDate = '';

  public selectedTime = '00:00';

  public selectedFilter = '-';

  public selectedTimezoneFormattedTime = `${this.selectedTime}+00:00`;

  public filterSelected = false;

  public daysNumber = 0;

  public tooltipPosition = SpotDropAlignmentOption.TopRight;

  public text = {
    toggle_title: this.I18n.t('js.baseline.toggle_title'),
    drop_down_none_option: this.I18n.t('js.baseline.drop_down.none'),
    header_description: this.I18n.t('js.baseline.header_description'),
    clear: this.I18n.t('js.baseline.clear'),
    apply: this.I18n.t('js.baseline.apply'),
    show_changes_since: this.I18n.t('js.baseline.show_changes_since'),
    time: this.I18n.t('js.baseline.time'),
    help_description: this.I18n.t('js.baseline.help_description'),
    timeZone: this.configuration.isTimezoneSet() ? moment().tz(this.configuration.timezone()).zoneAbbr() : 'local',
    time_description: () => this.I18n.t('js.baseline.time_description', { time: this.selectedTimezoneFormattedTime, days: this.daysNumber }),
  };

  public baselineAvailableValues = [
    {
      value: 'oneDayAgo',
      title: this.I18n.t('js.baseline.drop_down.yesterday'),
    },
    {
      value: 'lastWorkingDay',
      title: this.I18n.t('js.baseline.drop_down.last_working_day'),
    },
    {
      value: 'oneWeekAgo',
      title: this.I18n.t('js.baseline.drop_down.last_week'),
    },
    {
      value: 'oneMonthAgo',
      title: this.I18n.t('js.baseline.drop_down.last_month'),
    },
    {
      value: 'aSpecificDate',
      title: this.I18n.t('js.baseline.drop_down.a_specific_date'),
    },
    {
      value: 'betweenTwoSpecificDates',
      title: this.I18n.t('js.baseline.drop_down.between_two_specific_dates'),
    },
  ];

  constructor(
    readonly I18n:I18nService,
    readonly wpTableBaseline:WorkPackageViewBaselineService,
    readonly halResourceService:HalResourceService,
    readonly weekdaysService:WeekdayService,
    readonly daysService:DayResourceService,
    readonly timezoneService:TimezoneService,
    readonly configuration:ConfigurationService,
  ) {
    super();
  }

  public ngOnInit():void {
    if (this.wpTableBaseline.isActive()) {
      const value = this.wpTableBaseline.current[0];
      const [date, timeWithZone] = value.split('@');
      const time = timeWithZone.split(/[+-]/)[0];

      this.filterChange(date);
      this.selectedTime = time || '00:00';
      this.selectedTimezoneFormattedTime = timeWithZone || '00:00+00:00';
      this.filterSelected = true;
    }
  }

  public clearSelection():void {
    this.filterSelected = false;
    this.selectedTime = '0:00';
    this.selectedDate = '';
    this.selectedFilter = '-';
    this.dropDownDescription = '';
  }

  public onSubmit(e:Event):void {
    e.preventDefault();
    this.onSave();
  }

  public onSave() {
    if (this.selectedFilter === '-') {
      this.wpTableBaseline.disable();
    } else {
      const filterString = `${this.selectedFilter}@${this.selectedTimezoneFormattedTime}`;
      this.wpTableBaseline.update([filterString, DEFAULT_TIMESTAMP]);
    }

    this.submitted.emit();
  }

  public timeChange(value:string):void {
    this.selectedTime = value;
    const dateTime= `${this.selectedDate}  ${value}`;
    this.selectedTimezoneFormattedTime = this.timezoneService.formattedTime(dateTime, 'HH:mmZ');
  }

  public filterChange(value:string):void {
    if (value !== '-') {
      this.filterSelected = true;
      this.selectedFilter = value;
      switch (value) {
        case 'oneDayAgo':
          this.dropDownDescription = this.wpTableBaseline.yesterdayDate();
          this.daysNumber = this.wpTableBaseline.daysNumber;
          break;
        case 'lastWorkingDay':
          this.dropDownDescription = this.wpTableBaseline.lastWorkingDate();
          this.daysNumber = this.wpTableBaseline.daysNumber;
          break;
        case 'oneWeekAgo':
          this.dropDownDescription = this.wpTableBaseline.lastweekDate();
          this.daysNumber =this.wpTableBaseline.daysNumber;
          break;
        case 'oneMonthAgo':
          this.dropDownDescription = this.wpTableBaseline.lastMonthDate();
          this.daysNumber = this.wpTableBaseline.daysNumber;
          break;
        default:
          this.dropDownDescription = '';
          this.daysNumber = 0;
          break;
      }
      this.selectedDate = this.dropDownDescription;
    } else {
      this.clearSelection();
    }
  }
}
