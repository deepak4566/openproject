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
  AfterViewInit,
  ChangeDetectionStrategy,
  ChangeDetectorRef,
  Component,
  ElementRef,
  EventEmitter,
  Inject,
  Injector,
  ViewEncapsulation
} from "@angular/core";
import {OpModalComponent} from "core-components/op-modals/op-modal.component";
import {InjectField} from "core-app/helpers/angular/inject-field.decorator";
import {I18nService} from "core-app/modules/common/i18n/i18n.service";
import {OpModalLocalsMap} from "core-components/op-modals/op-modal.types";
import {OpModalLocalsToken} from "core-components/op-modals/op-modal.service";
import {TimezoneService} from "core-components/datetime/timezone.service";
import {DatePicker} from "core-app/modules/common/op-date-picker/datepicker";
import {HalResourceEditingService} from "core-app/modules/fields/edit/services/hal-resource-editing.service";
import {ResourceChangeset} from "core-app/modules/fields/changeset/resource-changeset";

type DateKeys = 'date'|'start'|'end';

@Component({
  templateUrl: './datepicker.modal.html',
  styleUrls: ['./datepicker.modal.sass'],
  changeDetection: ChangeDetectionStrategy.OnPush,
  encapsulation: ViewEncapsulation.None
})
export class DatePickerModal extends OpModalComponent implements AfterViewInit {
  @InjectField() I18n:I18nService;
  @InjectField() timezoneService:TimezoneService;
  @InjectField() halEditing:HalResourceEditingService;

  text = {
    save: this.I18n.t('js.button_save'),
    cancel: this.I18n.t('js.button_cancel'),
    clear: this.I18n.t('js.modals.button_clear_all'),
    manualScheduling: this.I18n.t('js.scheduling.manual'),
    date: this.I18n.t('js.work_packages.properties.date'),
    startDate: this.I18n.t('js.work_packages.properties.startDate'),
    endDate: this.I18n.t('js.work_packages.properties.dueDate'),
    placeholder: this.I18n.t('js.placeholders.default')
  };
  public onDataUpdated = new EventEmitter<string>();

  public singleDate = false;

  public scheduleManually = false;

  public htmlId:string = '';

  public dates:{ [key in DateKeys]:string } = {
    date: '',
    start: '',
    end: ''
  };

  private currentlyActivatedDateField:DateKeys;

  private changeset:ResourceChangeset;

  private datePickerInstance:DatePicker;

  constructor(readonly injector:Injector,
              @Inject(OpModalLocalsToken) public locals:OpModalLocalsMap,
              readonly cdRef:ChangeDetectorRef,
              readonly elementRef:ElementRef) {
    super(locals, cdRef, elementRef);
    this.changeset = locals.changeset;
    this.htmlId = `wp-datepicker-${locals.fieldName}`;

    this.singleDate = this.changeset.isWritable('date');
    this.scheduleManually = this.changeset.value('scheduleManually');

    if (this.singleDate) {
      this.dates.date = this.changeset.value('date');
      this.setCurrentActivatedField('date');
    } else {
      this.dates.start = this.changeset.value('startDate');
      this.dates.end = this.changeset.value('dueDate');
      this.setCurrentActivatedField('start');
    }
  }

  ngAfterViewInit():void {
    this.initializeDatepicker();
    this.setRangeClasses();

    this.onDataChange();
  }

  changeSchedulingMode() {
    this.scheduleManually = !this.scheduleManually;
    this.cdRef.detectChanges();
  }

  save():void {
    if (this.singleDate) {
      this.changeset.setValue('date', this.mappedDate('date'));
    } else {
      this.changeset.setValue('startDate', this.mappedDate('start'));
      this.changeset.setValue('dueDate', this.mappedDate('end'));
    }

    this.changeset.setValue('scheduleManually', this.scheduleManually);
    this.closeMe();
  }

  cancel():void {
    this.closeMe();
  }

  clear():void {
    this.dates = {
      date: '',
      start: '',
      end: ''
    };

    this.datePickerInstance.clear();
  }

  updateDate(key:DateKeys, val:string) {
    this.dates[key] = val;
    if (this.validDate(val) && this.datePickerInstance) {
      this.setDatesToDatepicker();
    }
  }

  reposition(element:JQuery<HTMLElement>, target:JQuery<HTMLElement>) {
    element.position({
      my: 'left top',
      at: 'left bottom',
      of: target,
      collision: 'flipfit'
    });
  }

  private initializeDatepicker() {
    this.datePickerInstance = new DatePicker(
      '#flatpickr-input',
      this.singleDate ? this.dates.date : [this.dates.start, this.dates.end],
      {
        mode: this.singleDate ? 'single' : 'multiple',
        inline: true,
        onChange: (dates:Date[]) => {
          this.onDatePickerChange(dates);

          this.onDataChange();
        }
      }
    );
  }

  private setDatesToDatepicker() {
    if (this.singleDate) {
      let date = this.parseDate(this.dates.date);
      this.datePickerInstance.setDates(date);
    } else {
      let dates = [this.parseDate(this.dates.start), this.parseDate(this.dates.end)];
      this.datePickerInstance.setDates(dates);
    }
  }

  private onDatePickerChange(dates:Date[]) {
    switch (dates.length) {
      case 1: {
        this.dates[this.currentlyActivatedDateField] = this.timezoneService.formattedISODate(dates[0]);

        if (!this.singleDate) {
          this.toggleCurrentActivatedField();
        }

        break;
      }
      case 2: {
        let index = this.isStateOfCurrentActivatedDateField('start') ? 0 : 1;
        this.dates[this.currentlyActivatedDateField] = this.timezoneService.formattedISODate(dates[index]);

        this.toggleCurrentActivatedField();
        this.setRangeClasses();
        break;
      }
      default: {
        if (this.isStateOfCurrentActivatedDateField('start')) {
          this.datePickerInstance.setDates([dates[2], dates[1]]);
          this.onDatePickerChange([dates[2], dates[1]]);
        } else {
          this.datePickerInstance.setDates([dates[0], dates[2]]);
          this.onDatePickerChange([dates[0], dates[2]]);
        }
        break;
      }
    }

    this.cdRef.detectChanges();
  }

  private onDataChange() {
    let date = this.dates.date || '';
    let start = this.dates.start || '';
    let end = this.dates.end || '';

    let output = this.singleDate ? date : start + ' - ' + end;
    this.onDataUpdated.emit(output);
  }

  private validDate(date:Date|string) {
    return (date instanceof Date) ||
      (date === '') ||
      !!new Date(date).valueOf();
  }

  /**
   * Map the date to the internal format,
   * setting to null if it's empty.
   * @param key
   */
  private mappedDate(key:DateKeys):string|null {
    const val = this.dates[key];
    return val === '' ? null : val;
  }

  private parseDate(date:Date|string):Date|'' {
    if (date instanceof Date) {
      return date;
    } else if (date === '') {
      return '';
    } else {
      return new Date(date);
    }
  }

  private setCurrentActivatedField(val:DateKeys) {
    this.currentlyActivatedDateField = val;
  }

  private toggleCurrentActivatedField() {
    this.currentlyActivatedDateField = this.currentlyActivatedDateField === 'start' ? 'end' : 'start';
  }

  private isStateOfCurrentActivatedDateField(val:DateKeys):boolean {
    return this.currentlyActivatedDateField === val;
  }

  private setRangeClasses() {
    var selectedElements = document.getElementsByClassName('flatpickr-day selected');
    if (selectedElements.length === 2) {
      selectedElements[0].classList.add('startRange');
      selectedElements[1].classList.add('endRange');

      jQuery(selectedElements[0]).nextUntil('.flatpickr-day.selected').addClass('inRange');
    }
  }
}
