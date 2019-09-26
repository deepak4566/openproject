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

import {DisplayFieldService} from "core-app/modules/fields/display/display-field.service";
import {TextDisplayField} from "core-app/modules/fields/display/field-types/display-text-field.module";
import {FloatDisplayField} from "core-app/modules/fields/display/field-types/display-float-field.module";
import {IntegerDisplayField} from "core-app/modules/fields/display/field-types/display-integer-field.module";
import {ResourceDisplayField} from "core-app/modules/fields/display/field-types/display-resource-field.module";
import {ResourcesDisplayField} from "core-app/modules/fields/display/field-types/display-resources-field.module";
import {FormattableDisplayField} from "core-app/modules/fields/display/field-types/display-formattable-field.module";
import {DurationDisplayField} from "core-app/modules/fields/display/field-types/display-duration-field.module";
import {DateDisplayField} from "core-app/modules/fields/display/field-types/display-date-field.module";
import {DateTimeDisplayField} from "core-app/modules/fields/display/field-types/display-datetime-field.module";
import {BooleanDisplayField} from "core-app/modules/fields/display/field-types/display-boolean-field.module";
import {ProgressDisplayField} from "core-app/modules/fields/display/field-types/display-progress-field.module";
import {WorkPackageDisplayField} from "core-app/modules/fields/display/field-types/display-work-package-field.module";
import {SpentTimeDisplayField} from "core-app/modules/fields/display/field-types/display-spent-time-field.module";
import {IdDisplayField} from "core-app/modules/fields/display/field-types/display-id-field.module";
import {HighlightedResourceDisplayField} from "core-app/modules/fields/display/field-types/display-highlighted-resource-field.module";
import {TypeDisplayField} from "core-app/modules/fields/display/field-types/display-type-field.module";
import {UserDisplayField} from "core-app/modules/fields/display/field-types/display-user-field.modules";
import {MultipleUserFieldModule} from "core-app/modules/fields/display/field-types/display-multiple-user-field.module";

export function initializeCoreDisplayFields(displayFieldService:DisplayFieldService) {
  return () => {
    displayFieldService.defaultFieldType = 'text';
    displayFieldService
      .addFieldType(TextDisplayField, 'text', ['String'])
      .addFieldType(FloatDisplayField, 'float', ['Float'])
      .addFieldType(IntegerDisplayField, 'integer', ['Integer'])
      .addFieldType(HighlightedResourceDisplayField, 'highlight', [
        'Status',
        'Priority'
      ])
      .addFieldType(TypeDisplayField, 'type', ['Type'])
      .addFieldType(ResourceDisplayField, 'resource', [
        'Project',
        'Version',
        'Category',
        'CustomOption'])
      .addFieldType(ResourcesDisplayField, 'resources', ['[]CustomOption'])
      .addFieldType(MultipleUserFieldModule, 'users', ['[]User'])
      .addFieldType(FormattableDisplayField, 'formattable', ['Formattable'])
      .addFieldType(DurationDisplayField, 'duration', ['Duration'])
      .addFieldType(DateDisplayField, 'date', ['Date'])
      .addFieldType(DateTimeDisplayField, 'datetime', ['DateTime'])
      .addFieldType(BooleanDisplayField, 'boolean', ['Boolean'])
      .addFieldType(ProgressDisplayField, 'progress', ['percentageDone'])
      .addFieldType(WorkPackageDisplayField, 'work_package', ['WorkPackage'])
      .addFieldType(SpentTimeDisplayField, 'spentTime', ['spentTime'])
      .addFieldType(IdDisplayField, 'id', ['id'])
      .addFieldType(UserDisplayField, 'user', ['User']);
  };
}
