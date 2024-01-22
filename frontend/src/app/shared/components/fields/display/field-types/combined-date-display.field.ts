// -- copyright
// OpenProject is an open source project management software.
// Copyright (C) 2012-2024 the OpenProject GmbH
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

import { DateDisplayField } from 'core-app/shared/components/fields/display/field-types/date-display-field.module';

export class CombinedDateDisplayField extends DateDisplayField {
  public render(element:HTMLElement):void {
    if (this.name === 'date') {
      this.renderSingleDate('date', element);
      return;
    }

    if (this.startDate && (this.startDate === this.dueDate)) {
      this.renderSingleDate('startDate', element);
      return;
    }

    if (!this.startDate && !this.dueDate) {
      element.innerHTML = this.placeholder;
      return;
    }

    this.renderDates(element);
  }

  isEmpty():boolean {
    return false;
  }

  get placeholder():string {
    if (typeof this.context.options.placeholder === 'string') {
      return this.context.options.placeholder;
    }
    return super.placeholder;
  }

  private get startDate():string|null {
    // eslint-disable-next-line @typescript-eslint/no-unsafe-member-access,@typescript-eslint/no-unsafe-return
    return this.resource.startDate;
  }

  private get dueDate():string|null {
    // eslint-disable-next-line @typescript-eslint/no-unsafe-member-access,@typescript-eslint/no-unsafe-return
    return this.resource.dueDate;
  }

  private renderSingleDate(field:'date'|'startDate'|'dueDate', element:HTMLElement):void {
    element.innerHTML = '';

    const dateElement = this.createDateDisplayField(field);

    element.appendChild(dateElement);
  }

  private renderDates(element:HTMLElement):void {
    element.innerHTML = '';

    const startDateElement = this.createDateDisplayField('startDate');
    const dueDateElement = this.createDateDisplayField('dueDate');

    const separator = document.createElement('span');
    separator.textContent = ' - ';

    element.appendChild(startDateElement);
    element.appendChild(separator);
    element.appendChild(dueDateElement);
  }

  private createDateDisplayField(date:'dueDate'|'startDate'|'date'):HTMLElement {
    const dateElement = document.createElement('span');
    const dateDisplayField = new DateDisplayField(date, this.context);
    dateDisplayField.apply(this.resource, this.schema);
    dateDisplayField.render(dateElement, dateDisplayField.valueString);

    return dateElement;
  }
}
