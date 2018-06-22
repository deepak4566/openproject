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

import {WorkPackageResource} from 'core-app/modules/hal/resources/work-package-resource';
import {WorkPackageChangeset} from '../../wp-edit-form/work-package-changeset';
import {ConfigurationService} from 'core-app/modules/common/config/configuration.service';
import {FormattableEditField} from "core-app/modules/fields/edit/field-types/formattable-edit-field";

export class WorkPackageCommentField extends FormattableEditField {
  public _value:any;
  public isBusy:boolean = false;

  public ConfigurationService:ConfigurationService = this.$injector.get(ConfigurationService);

  constructor(public workPackage:WorkPackageResource) {
    super(
      new WorkPackageChangeset(WorkPackageCommentField.$injector, workPackage),
      'comment',
      {name: I18n.t('js.label_comment')} as any
    );

    this.initializeFieldValue();
  }

  public get value() {
    return this._value;
  }

  public set value(val:any) {
    this._value = val;
  }

  public get required() {
    return true;
  }

  public initializeFieldValue(withText?:string):void {
    if (!withText) {
      this.rawValue = '';
      return;
    }

    if (this.rawValue.length > 0) {
      this.rawValue += '\n';
    }

    this.rawValue += withText;
  }

}
