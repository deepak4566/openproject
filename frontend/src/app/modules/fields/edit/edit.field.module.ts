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

import {Field, IFieldSchema} from "core-app/modules/fields/field.base";
import {WorkPackageChangeset} from "core-components/wp-edit-form/work-package-changeset";
import {EditFieldComponent} from "core-app/modules/fields/edit/edit-field.component";


export class EditField extends Field {
  readonly component:typeof EditFieldComponent;

  constructor(public changeset:WorkPackageChangeset,
              public name:string,
              public schema:IFieldSchema) {
    super(changeset.workPackage as any, name, schema);
    this.initialize();
  }

  /**
   * Called when the edit field is open and ready
   * @param {HTMLElement} container
   */
  public $onInit(container:HTMLElement) {
  }

  public onSubmit() {
  }

  public get inFlight() {
    return this.changeset.inFlight;
  }

  public get value() {
    return this.changeset.value(this.name);
  }

  public set value(value:any) {
    this.changeset.setValue(this.name, this.parseValue(value));
  }

  public get placeholder() {
    if (this.name === 'subject') {
      return this.I18n.t('js.placeholders.subject');
    }

    return '';
  }

  /**
   * Initialize the field after constructor was called.
   */
  protected initialize() {
  }

  /**
   * Parse the value from the model for setting
   */
  protected parseValue(val:any) {
    return val;
  }
}
