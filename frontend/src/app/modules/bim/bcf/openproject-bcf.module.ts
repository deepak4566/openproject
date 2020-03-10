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

import {Injector, NgModule} from '@angular/core';
import {OpenprojectCommonModule} from "core-app/modules/common/openproject-common.module";
import {NgxGalleryModule} from "@kolkov/ngx-gallery";
import {DisplayFieldService} from "core-app/modules/fields/display/display-field.service";
import {BcfImportButtonComponent} from "core-app/modules/bim/bcf/bcf-buttons/bcf-import-button.component";
import {BcfDetectorService} from "core-app/modules/bim/bcf/helper/bcf-detector.service";
import {BcfPathHelperService} from "core-app/modules/bim/bcf/helper/bcf-path-helper.service";
import {BcfExportButtonComponent} from "core-app/modules/bim/bcf/bcf-buttons/bcf-export-button.component";
import {BcfThumbnailDisplayField} from "core-app/modules/bim/bcf/fields/display/bcf-thumbnail-field.module";
import {BcfApiService} from "core-app/modules/bim/bcf/api/bcf-api.service";
import {BcfWpSingleViewComponent} from "core-app/modules/bim/bcf/bcf-wp-single-view/bcf-wp-single-view.component";


@NgModule({
  imports: [
    OpenprojectCommonModule,
    NgxGalleryModule,
  ],
  providers: [
    BcfApiService,
    BcfDetectorService,
    BcfPathHelperService
  ],
  declarations: [
    BcfWpSingleViewComponent,
    BcfImportButtonComponent,
    BcfExportButtonComponent
  ],
  exports: [
    BcfWpSingleViewComponent,
    BcfImportButtonComponent,
    BcfExportButtonComponent
  ]
})
export class OpenprojectBcfModule {
  constructor(injector:Injector, displayFieldService:DisplayFieldService) {
    displayFieldService
      .addFieldType(BcfThumbnailDisplayField, 'bcfThumbnail', [
        'BCF Thumbnail'
      ]);
  }
}

