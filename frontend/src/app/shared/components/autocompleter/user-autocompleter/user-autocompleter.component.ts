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
  ChangeDetectionStrategy, Component, ElementRef, EventEmitter,
  forwardRef, Injector, Input, OnInit, Output, ViewChild,
} from '@angular/core';
import { HalResourceService } from 'core-app/features/hal/services/hal-resource.service';
import { PathHelperService } from 'core-app/core/path-helper/path-helper.service';
import { I18nService } from 'core-app/core/i18n/i18n.service';
import { Observable } from 'rxjs';
import { map } from 'rxjs/operators';
import { HalResourceNotificationService } from 'core-app/features/hal/services/hal-resource-notification.service';
import { NgSelectComponent } from '@ng-select/ng-select';
import { ApiV3Service } from 'core-app/core/apiv3/api-v3.service';
import { ApiV3FilterBuilder, FilterOperator } from 'core-app/shared/helpers/api-v3/api-v3-filter-builder';
import { populateInputsFromDataset } from 'core-app/shared/components/dataset-inputs';
import { ControlValueAccessor, NG_VALUE_ACCESSOR } from '@angular/forms';
import { ID } from '@datorama/akita';
import { addFiltersToPath } from 'core-app/core/apiv3/helpers/add-filters-to-path';

export const usersAutocompleterSelector = 'op-user-autocompleter';

export interface IUserAutocompleteItem {
  id:ID;
  name:string;
  href:string|null;
  avatar:string|null;
}

@Component({
  templateUrl: './user-autocompleter.component.html',
  selector: usersAutocompleterSelector,
  changeDetection: ChangeDetectionStrategy.OnPush,
  providers: [{
    provide: NG_VALUE_ACCESSOR,
    useExisting: forwardRef(() => UserAutocompleterComponent),
    multi: true,
  }],
})
export class UserAutocompleterComponent implements OnInit, ControlValueAccessor {
  userTracker = (item:any) => item.href || item.id;

  @ViewChild(NgSelectComponent, { static: true }) public ngSelectComponent:NgSelectComponent;

  @Input() public clearAfterSelection = false;

  @Input() public name = '';

  // Load all users as default
  @Input() public url:string = this.apiV3Service.users.path;

  // ID that should be set on the input HTML element. It is used with
  // <label> tags that have `for=""` set
  @Input() public labelForId = '';

  @Input() public allowEmpty = false;

  @Input() public appendTo = '';

  @Input() public multiple = false;

  @Input('value') public _value:IUserAutocompleteItem|IUserAutocompleteItem[]|null = null;

  get value():IUserAutocompleteItem|IUserAutocompleteItem[]|null {
    return this._value;
  }

  set value(value:IUserAutocompleteItem|IUserAutocompleteItem[]|null) {
    this._value = value;
    this.onChange(value);
    this.valueChange.emit(value);
    this.onTouched(value);
    setTimeout(() => {
      this.hiddenInput.nativeElement?.dispatchEvent(new Event('change'));
    }, 100);
  }

  get plainValue():ID|ID[] {
    return (Array.isArray(this.value) ? this.value?.map((i) => i.id) : this.value?.id) || '';
  }

  @Input() public additionalFilters:{ selector:string; operator:FilterOperator, values:string[] }[] = [];

  public inputFilters:ApiV3FilterBuilder = new ApiV3FilterBuilder();

  @Output() public valueChange = new EventEmitter<IUserAutocompleteItem|IUserAutocompleteItem[]|null>();

  @Output() cancel = new EventEmitter();

  @ViewChild('hiddenInput') hiddenInput:ElementRef;

  constructor(
    public elementRef:ElementRef,
    protected halResourceService:HalResourceService,
    protected I18n:I18nService,
    protected halNotification:HalResourceNotificationService,
    readonly pathHelper:PathHelperService,
    readonly apiV3Service:ApiV3Service,
    readonly injector:Injector,
  ) {
    populateInputsFromDataset(this);
  }

  ngOnInit() {
    this.additionalFilters.forEach((filter) => this.inputFilters.add(filter.selector, filter.operator, filter.values));
  }

  public getAvailableUsers(searchTerm:any):Observable<IUserAutocompleteItem[]> {
    // Need to clone the filters to not add additional filters on every
    // search term being processed.
    const searchFilters = this.inputFilters.clone();

    if (searchTerm && searchTerm.length) {
      searchFilters.add('name', '~', [searchTerm]);
    }

    const filteredURL = addFiltersToPath(this.url, searchFilters);

    return this.halResourceService
      .get(filteredURL.toString())
      .pipe(
        map((res) => {
          const options = res.elements.map((el:any) => ({
            name: el.name, id: el.id, href: el.href, avatar: el.avatar,
          }));

          if (this.allowEmpty) {
            options.unshift({ name: this.I18n.t('js.timelines.filter.noneSelection'), href: null, id: null });
          }

          return options;
        }),
      );
  }

  writeValue(value:IUserAutocompleteItem|null):void {
    this.value = value;
  }

  onChange = (_:IUserAutocompleteItem|IUserAutocompleteItem[]|null):void => {};

  onTouched = (_:IUserAutocompleteItem|IUserAutocompleteItem[]|null):void => {};

  registerOnChange(fn:(_:IUserAutocompleteItem|IUserAutocompleteItem[]|null) => void):void {
    this.onChange = fn;
  }

  registerOnTouched(fn:(_:IUserAutocompleteItem|IUserAutocompleteItem[]|null) => void):void {
    this.onTouched = fn;
  }
}
