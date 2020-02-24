// -- copyright
// OpenProject is a project management system.
// Copyright (C) 2012-2018 the OpenProject Foundation (OPF)
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
import {NgModule} from "@angular/core";
import {OpenprojectWorkPackagesModule} from "core-app/modules/work_packages/openproject-work-packages.module";
import {UIRouterModule} from '@uirouter/angular';
import {OpenprojectCommonModule} from "core-app/modules/common/openproject-common.module";
import {IFCViewerComponent} from './ifc-viewer/ifc-viewer.component';
import {IFC_ROUTES} from "core-app/modules/ifc_models/openproject-ifc-models.routes";
import {IFCViewerPageComponent} from "core-app/modules/ifc_models/pages/viewer/ifc-viewer-page.component";
import {BCFContainerComponent} from "core-app/modules/ifc_models/bcf/container/bcf-container.component";
import {EmptyComponent} from "core-app/modules/ifc_models/empty/empty-component";

@NgModule({
  imports: [
    OpenprojectCommonModule,
    OpenprojectWorkPackagesModule,
    UIRouterModule.forChild({
      states: IFC_ROUTES
    })
  ],
  providers: [
  ],
  declarations: [
    // Pages
    IFCViewerPageComponent,

    // Regions of pages
    EmptyComponent,
    BCFContainerComponent,

    IFCViewerComponent
  ],
  exports: [
  ],
  entryComponents: [
  ]
})
export class OpenprojectIFCModelsModule {
}

