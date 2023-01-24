// -- copyright
// OpenProject is an open source project management software.
// Copyright (C) 2012-2022 the OpenProject GmbH
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
  ChangeDetectorRef,
  Component,
  ElementRef,
  EventEmitter,
  forwardRef,
  Injector,
  Input,
  OnInit,
  Output,
  ViewChild,
  ViewEncapsulation,
} from '@angular/core';
import { I18nService } from 'core-app/core/i18n/i18n.service';
import { ControlValueAccessor, NG_VALUE_ACCESSOR } from '@angular/forms';
import {
  onDayCreate,
  parseDate,
  setDates,
} from 'core-app/shared/components/datepicker/helpers/date-modal.helpers';
import { TimezoneService } from 'core-app/core/datetime/timezone.service';
import { DatePicker } from '../datepicker';
import flatpickr from 'flatpickr';
import { DayElement } from 'flatpickr/dist/types/instance';
import { populateInputsFromDataset } from '../../dataset-inputs';

export const opSingleDatePickerSelector = 'op-single-date-picker';

@Component({
  selector: opSingleDatePickerSelector,
  templateUrl: './single-date-picker.component.html',
  styleUrls: ['../styles/datepicker.modal.sass', '../styles/datepicker_mobile.modal.sass'],
  changeDetection: ChangeDetectionStrategy.OnPush,
  encapsulation: ViewEncapsulation.None,
  providers: [
    {
      provide: NG_VALUE_ACCESSOR,
      useExisting: forwardRef(() => OpSingleDatePickerComponent),
      multi: true,
    },
  ],
})
export class OpSingleDatePickerComponent implements ControlValueAccessor, OnInit {
  @Output('closed') closed = new EventEmitter();

  @Output('valueChange') valueChange = new EventEmitter();

  private _value = '';

  @Input() set value(newValue:string) {
    this._value = newValue;
    this.writeWorkingValue(newValue);
  }

  get value() {
    return this._value;
  }

  @Input() id = `flatpickr-input-${+(new Date())}`;

  @Input() name = '';

  @Input() required = false;

  @Input() minimalDate:Date|null = null;

  private _opened = false;

  @Input() set opened(opened:boolean) {
    if (this._opened === !!opened) {
      return;
    }

    this._opened = !!opened;

    if (this._opened) {
      this.initializeDatepicker();
    } else {
      this.closed.emit();
    }
  }

  get opened() {
    return this.opened;
  }

  @Input() showIgnoreNonWorkingDays = true;

  @Input() ignoreNonWorkingDays = false;

  @ViewChild('flatpickrTarget') flatpickrTarget:ElementRef;

  public workingValue = '';

  public workingDate:Date = new Date();

  public datePickerInstance:DatePicker;

  text = {
    save: this.I18n.t('js.button_save'),
    cancel: this.I18n.t('js.button_cancel'),
    date: this.I18n.t('js.work_packages.properties.date'),
    placeholder: this.I18n.t('js.placeholders.default'),
    today: this.I18n.t('js.label_today'),
    ignoreNonWorkingDays: {
      title: this.I18n.t('js.work_packages.datepicker_modal.ignore_non_working_days.title'),
    },
  };

  constructor(
    readonly I18n:I18nService,
    readonly timezoneService:TimezoneService,
    readonly injector:Injector,
    readonly cdRef:ChangeDetectorRef,
    readonly elementRef:ElementRef,
  ) {
    populateInputsFromDataset(this);
  }

  ngOnInit(): void {
    if (!this.value) {
      const today = parseDate(new Date()) as Date;
      this.writeValue(this.timezoneService.formattedISODate(today));
    }
  }

  onInputClick(event:MouseEvent) {
    event.stopPropagation();
  }

  save($event:Event) {
    $event.preventDefault();
    this.valueChange.emit(this.workingValue);
    this.onChange(this.workingValue);
    this.writeValue(this.workingValue);
    this.opened = false;
  }

  setToday():void {
    const today = parseDate(new Date()) as Date;
    this.writeWorkingValue(this.timezoneService.formattedISODate(today));
    this.enforceManualChangesToDatepicker(today);
  }

  changeNonWorkingDays():void {
    this.initializeDatepicker();
    this.cdRef.detectChanges();
  }

  private enforceManualChangesToDatepicker(enforceDate?:Date) {
    const date = parseDate(this.workingDate || '');
    setDates(date, this.datePickerInstance, enforceDate);
  }

  private initializeDatepicker() {
    this.datePickerInstance?.destroy();
    this.datePickerInstance = new DatePicker(
      this.injector,
      this.id,
      this.workingDate || '',
      {
        mode: 'single',
        showMonths: 1,
        inline: true,
        onReady: (_date:Date[], _datestr:string, instance:flatpickr.Instance) => {
          instance.calendarContainer.classList.add('op-datepicker-modal--flatpickr-instance');
        },
        onChange: (dates:Date[]) => {
          if (dates.length > 0) {
            const dateString = this.timezoneService.formattedISODate(dates[0]);
            this.writeWorkingValue(dateString);
            this.enforceManualChangesToDatepicker(dates[0]);
            this.onTouched(dateString);
          }

          this.cdRef.detectChanges();
        },
        onDayCreate: (dObj:Date[], dStr:string, fp:flatpickr.Instance, dayElem:DayElement) => {
          onDayCreate(
            dayElem,
            !this.ignoreNonWorkingDays,
            this.datePickerInstance?.weekdaysService.isNonWorkingDay(dayElem.dateObj),
            !!this.minimalDate && dayElem.dateObj <= this.minimalDate,
          );
        },
      },
      this.flatpickrTarget.nativeElement,
    );
  }

  writeWorkingValue(value:string):void {
    this.workingValue = value;
    this.workingDate = new Date(value);
  }

  writeValue(value:string):void {
    this.writeWorkingValue(value);
    this.value = value;
  }

  onChange = (_:string):void => {};

  onTouched = (_:string):void => {};

  registerOnChange(fn:(_:string) => void):void {
    this.onChange = fn;
  }

  registerOnTouched(fn:(_:string) => void):void {
    this.onTouched = fn;
  }
}
