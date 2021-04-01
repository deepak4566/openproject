// -- copyright
// OpenProject is an open source project management software.
// Copyright (C) 2012-2021 the OpenProject GmbH
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
// MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.  See the
// GNU General Public License for more details.
//
// You should have received a copy of the GNU General Public License
// along with this program; if not, write to the Free Software
// Foundation, Inc., 51 Franklin Street, Fifth Floor, Boston, MA  02110-1301, USA.
//
// See docs/COPYRIGHT.rdoc for more details.

import {Injector, NgModule} from '@angular/core';

import {HookService} from 'core-app/modules/plugins/hook-service';
import {WorkPackageResource} from 'core-app/modules/hal/resources/work-package-resource';
import { Tab } from 'core-app/components/wp-tabs/components/wp-tab-wrapper/tab';
import {OpenprojectCommonModule} from 'core-app/modules/common/openproject-common.module';

import {GitHubTabComponent} from './github-tab/github-tab.component';
import {TabHeaderComponent} from './tab-header/tab-header.component';
import {TabPrsComponent} from './tab-prs/tab-prs.component';
import {GitActionsMenuDirective} from './git-actions-menu/git-actions-menu.directive';
import {GitActionsMenuComponent} from './git-actions-menu/git-actions-menu.component';

function displayable(work_package: WorkPackageResource): boolean {
  return(!!work_package.github);
}

export function initializeGithubIntegrationPlugin(injector:Injector) {
  const hooks = injector.get<HookService>(HookService);
  hooks.registerWorkPackageTab(
    new Tab(
      GitHubTabComponent,
      I18n.t('js.github_integration.work_packages.tab_name'),
      'github',
      displayable
    )
  );
}


@NgModule({
  imports: [
    OpenprojectCommonModule
  ],
  providers: [
  ],
  declarations: [
    GitHubTabComponent,
    TabHeaderComponent,
    TabPrsComponent,
    GitActionsMenuDirective,
    GitActionsMenuComponent,
  ],
  exports: [
    GitHubTabComponent,
    TabHeaderComponent,
    TabPrsComponent,
    GitActionsMenuDirective,
    GitActionsMenuComponent,
  ]
})
export class PluginModule {
  constructor(injector:Injector) {
    initializeGithubIntegrationPlugin(injector);
  }
}
