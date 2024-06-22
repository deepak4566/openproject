/*
 * -- copyright
 * OpenProject is an open source project management software.
 * Copyright (C) 2023 the OpenProject GmbH
 *
 * This program is free software; you can redistribute it and/or
 * modify it under the terms of the GNU General Public License version 3.
 *
 * OpenProject is a fork of ChiliProject, which is a fork of Redmine. The copyright follows:
 * Copyright (C) 2006-2013 Jean-Philippe Lang
 * Copyright (C) 2010-2013 the ChiliProject Team
 *
 * This program is free software; you can redistribute it and/or
 * modify it under the terms of the GNU General Public License
 * as published by the Free Software Foundation; either version 2
 * of the License, or (at your option) any later version.
 *
 * This program is distributed in the hope that it will be useful,
 * but WITHOUT ANY WARRANTY; without even the implied warranty of
 * MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.  See the
 * GNU General Public License for more details.
 *
 * You should have received a copy of the GNU General Public License
 * along with this program; if not, write to the Free Software
 * Foundation, Inc., 51 Franklin Street, Fifth Floor, Boston, MA  02110-1301, USA.
 *
 * See COPYRIGHT and LICENSE files for more details.
 * ++
 *
 */

import { Controller } from '@hotwired/stimulus';

interface InternalFilterValue {
  name:string;
  operator:string;
  value:string[];
}

export default class FiltersFormController extends Controller {
  static paramsToCopy = ['sortBy', 'columns', 'query_id', 'per_page'];

  static targets = [
    'filterFormToggle',
    'filterForm',
    'filter',
    'addFilterSelect',
    'spacer',
    'operator',
    'filterValueContainer',
    'filterValueSelect',
    'days',
    'singleDay',
    'simpleValue',
  ];

  declare readonly filterFormToggleTarget:HTMLButtonElement;
  declare readonly filterFormTarget:HTMLFormElement;
  declare readonly filterTargets:HTMLElement[];
  declare readonly addFilterSelectTarget:HTMLSelectElement;
  declare readonly spacerTarget:HTMLElement;
  declare readonly operatorTargets:HTMLSelectElement[];
  declare readonly filterValueContainerTargets:HTMLElement[];
  declare readonly filterValueSelectTargets:HTMLSelectElement[];
  declare readonly daysTargets:HTMLInputElement[];
  declare readonly singleDayTargets:HTMLInputElement[];
  declare readonly simpleValueTargets:HTMLInputElement[];

  static values = {
    displayFilters: { type: Boolean, default: false },
    outputFormat: { type: String, default: 'params' },
  };

  declare displayFiltersValue:boolean;
  declare outputFormatValue:string;

  connect() {
    const urlParams = new URLSearchParams(window.location.search);
    this.displayFiltersValue = urlParams.has('filters');
  }

  toggleDisplayFilters() {
    this.displayFiltersValue = !this.displayFiltersValue;
  }

  displayFiltersValueChanged() {
    this.toggleButtonActive();
    this.toggleFilterFormVisible();
  }

  toggleButtonActive() {
    if (this.displayFiltersValue) {
      this.filterFormToggleTarget.setAttribute('aria-pressed', 'true');
    } else {
      this.filterFormToggleTarget.removeAttribute('aria-pressed');
    }
  }

  toggleFilterFormVisible() {
    this.filterFormTarget.classList.toggle('-expanded', this.displayFiltersValue);
  }

  toggleMultiSelect({ params: { filterName } }:{ params:{ filterName:string } }) {
    const valueContainer = this.filterValueContainerTargets.find((filterValueContainer) => filterValueContainer.getAttribute('data-filter-name') === filterName);
    const singleSelect = this.filterValueSelectTargets.find((selectField) => !selectField.multiple && selectField.getAttribute('data-filter-name') === filterName);
    const multiSelect = this.filterValueSelectTargets.find((selectField) => selectField.multiple && selectField.getAttribute('data-filter-name') === filterName);
    if (valueContainer && singleSelect && multiSelect) {
      if (valueContainer.classList.contains('multi-value')) {
        const valueToSelect = this.getValueToSelect(multiSelect);
        this.setSelectOptions(singleSelect, valueToSelect);
      } else {
        const valueToSelect = this.getValueToSelect(singleSelect);
        this.setSelectOptions(multiSelect, valueToSelect);
      }
      valueContainer.classList.toggle('multi-value');
    }
  }

  private getValueToSelect(selectElement:HTMLSelectElement) {
    return selectElement.selectedOptions[0]?.value;
  }

  private setSelectOptions(selectElement:HTMLSelectElement, selectedValue:string) {
    Array.from(selectElement.options).forEach((option) => {
      option.selected = option.value === selectedValue;
    });
  }

  addFilter(event:Event) {
    const selectedFilterName = (event.target as HTMLSelectElement).value;
    const selectedFilter = this.filterTargets.find((filter) => filter.getAttribute('filter-name') === selectedFilterName);
    if (selectedFilter) {
      selectedFilter.classList.remove('hidden');
    }
    this.disableSelection();
    this.reselectPlaceholderOption();
    this.setSpacerVisibility();
  }

  private disableSelection() {
    this.addFilterSelectTarget.selectedOptions[0].setAttribute('disabled', 'disabled');
  }

  private reselectPlaceholderOption() {
    this.addFilterSelectTarget.options[0].setAttribute('selected', 'selected');
  }

  removeFilter({ params: { filterName } }:{ params:{ filterName:string } }) {
    const filterToRemove = this.filterTargets.find((filter) => filter.getAttribute('filter-name') === filterName);
    filterToRemove?.classList.add('hidden');

    const selectOptions = Array.from(this.addFilterSelectTarget.options);
    const removedFilterOption = selectOptions.find((option) => option.value === filterName);
    removedFilterOption?.removeAttribute('disabled');
    this.setSpacerVisibility();
  }

  private setSpacerVisibility() {
    if (this.anyFiltersStillVisible()) {
      this.spacerTarget.classList.remove('hidden');
    } else {
      this.spacerTarget.classList.add('hidden');
    }
  }

  private anyFiltersStillVisible() {
    return this.filterTargets.some((filter) => !filter.classList.contains('hidden'));
  }

  private readonly noValueOperators = ['*', '!*', 't', 'w'];
  private readonly daysOperators = ['>t-', '<t-', 't-', '<t+', '>t+', 't+'];
  private readonly onDateOperator = '=d';
  private readonly betweenDatesOperator = '<>d';

  setValueVisibility({ target, params: { filterName } }:{ target:HTMLSelectElement, params:{ filterName:string } }) {
    const selectedOperator = target.value;
    const valueContainer = this.filterValueContainerTargets.find((filterValueContainer) => filterValueContainer.getAttribute('data-filter-name') === filterName);
    if (valueContainer) {
      if (this.noValueOperators.includes(selectedOperator)) {
        valueContainer.classList.add('hidden');
      } else {
        valueContainer.classList.remove('hidden');
      }

      if (this.daysOperators.includes(selectedOperator)) {
        valueContainer.classList.add('days');
        valueContainer.classList.remove('on-date');
        valueContainer.classList.remove('between-dates');
      } else if (selectedOperator === this.onDateOperator) {
        valueContainer.classList.add('on-date');
        valueContainer.classList.remove('days');
        valueContainer.classList.remove('between-dates');
      } else if (selectedOperator === this.betweenDatesOperator) {
        valueContainer.classList.add('between-dates');
        valueContainer.classList.remove('days');
        valueContainer.classList.remove('on-date');
      }
    }
  }

  sendForm() {
    const ajaxIndicator = document.querySelector('#ajax-indicator') as HTMLElement;
    ajaxIndicator.style.display = '';

    const params = new URLSearchParams();

    params.append('filters', this.buildFiltersParam(this.parseFilters()));

    const currentParams = new URLSearchParams(window.location.search);
    FiltersFormController.paramsToCopy.forEach((name) => {
      if (currentParams.has(name)) {
        params.append(name, currentParams.get(name) as string);
      }
    });

    window.location.href = `${window.location.pathname}?${params.toString()}`;
  }

  private parseFilters():InternalFilterValue[] {
    const advancedFilters = this.filterTargets.filter((filter) => !filter.classList.contains('hidden'));
    const filters:InternalFilterValue[] = [];

    advancedFilters.forEach((filter) => {
      const filterName = filter.getAttribute('filter-name');
      const filterType = filter.getAttribute('filter-type');
      const parsedOperator = this.operatorTargets.find((operator) => operator.getAttribute('data-filter-name') === filterName)?.value;

      if (filterName && filterType && parsedOperator) {
        const parsedValue = this.parseFilterValue(filterName, filterType, parsedOperator) as string[]|null;

        if (parsedValue) {
          filters.push({ name: filterName, operator: parsedOperator, value: parsedValue });
        }
      }
    });

    return filters;
  }

  private buildFilterString(filter:InternalFilterValue) {
    const valuesString = filter.value.length > 1 ? `[${filter.value.map((v) => `"${this.replaceDoubleQuotes(v)}"`).join(',')}]` : `"${this.replaceDoubleQuotes(filter.value[0])}"`;

    return `${filter.name} ${filter.operator} ${valuesString}`;
  }

  private buildFilterJSON(filter:InternalFilterValue) {
    return { [filter.name]: { operator: filter.operator, values: filter.value } };
  }

  private buildFiltersParam(filters:InternalFilterValue[]):string {
    if (this.outputFormatValue === 'json') {
      return JSON.stringify(filters.map((filter) => this.buildFilterJSON(filter)));
    }
    return filters.map((filter) => this.buildFilterString(filter)).join('&');
  }

  private replaceDoubleQuotes(value:string) {
    return value && value.length > 0 ? value.replace(/"/g, '\\"') : '';
  }

  private readonly operatorsWithoutValues = ['*', '!*', 't', 'w'];
  private readonly selectFilterTypes = ['list', 'list_all', 'list_optional'];
  private readonly dateFilterTypes = ['datetime_past', 'date'];

  private parseFilterValue(filterName:string, filterType:string, operator:string) {
    const valueContainer = this.filterValueContainerTargets.find((filterValueContainer) => filterValueContainer.getAttribute('data-filter-name') === filterName);

    if (valueContainer) {
      const checkbox = valueContainer.querySelector('input[type="checkbox"]') as HTMLInputElement;
      const isAutocomplete = valueContainer.dataset.filterAutocomplete === 'true';

      if (checkbox) {
        return [checkbox.checked ? 't' : 'f'];
      }

      if (isAutocomplete) {
        return (valueContainer.querySelector('input[name="value"]') as HTMLInputElement)?.value.split(',');
      }

      if (this.operatorsWithoutValues.includes(operator)) {
        return [];
      }

      if (this.selectFilterTypes.includes(filterType)) {
        return this.parseSelectFilterValue(valueContainer, filterName);
      }

      if (this.dateFilterTypes.includes(filterType)) {
        return this.parseDateFilterValue(valueContainer, filterName);
      }

      const value = this.simpleValueTargets.find((simpleValueInput) => simpleValueInput.getAttribute('data-filter-name') === filterName)?.value;

      if (value && value.length > 0) {
        return [value];
      }
    }

    return null;
  }

  private parseSelectFilterValue(valueContainer:HTMLElement, filterName:string) {
    let selectFields;

    if (valueContainer.classList.contains('multi-value')) {
      selectFields = this.filterValueSelectTargets.filter((selectField) => selectField.multiple && selectField.getAttribute('data-filter-name') === filterName);
    } else {
      selectFields = this.filterValueSelectTargets.filter((selectField) => !selectField.multiple && selectField.getAttribute('data-filter-name') === filterName);
    }

    const selectedValues = _.flatten(Array.from(selectFields).map((selectField) => Array.from(selectField.selectedOptions).map((option) => option.value)));

    if (selectedValues.length > 0) {
      return selectedValues;
    }

    return null;
  }

  private parseDateFilterValue(valueContainer:HTMLElement, filterName:string) {
    let value;

    if (valueContainer.classList.contains('days')) {
      const dateValue = this.daysTargets.find((daysField) => daysField.getAttribute('data-filter-name') === filterName)?.value;

      value = _.without([dateValue], '');
    } else if (valueContainer.classList.contains('on-date')) {
      const dateValue = this.singleDayTargets.find((dateInput) => dateInput.id === `on-date-value-${filterName}`)?.value;

      value = _.without([dateValue], '');
    } else if (valueContainer.classList.contains('between-dates')) {
      const fromValue = this.singleDayTargets.find((dateInput) => dateInput.id === `between-dates-from-value-${filterName}`)?.value;
      const toValue = this.singleDayTargets.find((dateInput) => dateInput.id === `between-dates-to-value-${filterName}`)?.value;

      value = [fromValue, toValue];
    }
    if (value && value.length > 0) {
      return value;
    }
    return null;
  }
}
