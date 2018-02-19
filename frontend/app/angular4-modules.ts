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

import {NgModule} from '@angular/core';
import {BrowserModule} from '@angular/platform-browser';
import {UpgradeModule} from '@angular/upgrade/static';
import {FormsModule} from '@angular/forms';
import {TablePaginationComponent} from 'core-app/components/table-pagination/table-pagination.component';
import {AccessibleByKeyboardDirectiveUpgraded} from 'core-app/ui_components/accessible-by-keyboard-directive-upgraded';
import {SimpleTemplateRenderer} from 'core-components/angular/simple-template-renderer';
import {OpIcon} from 'core-components/common/icon/op-icon';
import {ContextMenuService} from 'core-components/context-menus/context-menu.service';
import {HasDropdownMenuDirective} from 'core-components/context-menus/has-dropdown-menu/has-dropdown-menu-directive';
import {WorkPackagesListComponent} from 'core-components/routing/wp-list/wp-list.component';
import {States} from 'core-components/states.service';
import {PaginationService} from 'core-components/table-pagination/pagination-service';
import {WorkPackageDisplayFieldService} from 'core-components/wp-display/wp-display-field/wp-display-field.service';
import {WorkPackageEditingService} from 'core-components/wp-edit-form/work-package-editing-service';
import {WorkPackageNotificationService} from 'core-components/wp-edit/wp-notification.service';
import {WorkPackageTableColumnsService} from 'core-components/wp-fast-table/state/wp-table-columns.service';
import {WorkPackageTableFocusService} from 'core-components/wp-fast-table/state/wp-table-focus.service';
import {WorkPackageTableGroupByService} from 'core-components/wp-fast-table/state/wp-table-group-by.service';
import {WorkPackageTableHierarchiesService} from 'core-components/wp-fast-table/state/wp-table-hierarchy.service';
import {WorkPackageTablePaginationService} from 'core-components/wp-fast-table/state/wp-table-pagination.service';
import {WorkPackageTableRelationColumnsService} from 'core-components/wp-fast-table/state/wp-table-relation-columns.service';
import {WorkPackageTableSelection} from 'core-components/wp-fast-table/state/wp-table-selection.service';
import {WorkPackageTableSortByService} from 'core-components/wp-fast-table/state/wp-table-sort-by.service';
import {WorkPackageTableTimelineService} from 'core-components/wp-fast-table/state/wp-table-timeline.service';
import {WpInlineCreateDirectiveUpgraded} from 'core-components/wp-inline-create/wp-inline-create.directive';
import {KeepTabService} from 'core-components/wp-panels/keep-tab/keep-tab.service';
import {WorkPackageRelationsService} from 'core-components/wp-relations/wp-relations.service';
import {WpResizerDirectiveUpgraded} from 'core-components/wp-resizer/wp-resizer.directive';
import {SortHeaderDirective} from 'core-components/wp-table/sort-header/sort-header.directive';
import {WorkPackageTablePaginationComponent} from 'core-components/wp-table/table-pagination/wp-table-pagination.component';
import {WorkPackageTimelineTableController} from 'core-components/wp-table/timeline/container/wp-timeline-container.directive';
import {WorkPackageTableTimelineRelations} from 'core-components/wp-table/timeline/global-elements/wp-timeline-relations.directive';
import {WorkPackageTableTimelineStaticElements} from 'core-components/wp-table/timeline/global-elements/wp-timeline-static-elements.directive';
import {WorkPackageTableTimelineGrid} from 'core-components/wp-table/timeline/grid/wp-timeline-grid.directive';
import {WorkPackageTimelineHeaderController} from 'core-components/wp-table/timeline/header/wp-timeline-header.directive';
import {WorkPackageTableRefreshService} from 'core-components/wp-table/wp-table-refresh-request.service';
import {WorkPackageTableSumsRowController} from 'core-components/wp-table/wp-table-sums-row/wp-table-sums-row.directive';
import {WorkPackagesTableController,} from 'core-components/wp-table/wp-table.directive';
import {
  $qToken,
  $rootScopeToken, $stateToken,
  $timeoutToken,
  columnsModalToken,
  FocusHelperToken,
  halRequestToken,
  I18nToken,
  NotificationsServiceToken,
  PathHelperToken,
  upgradeService,
  upgradeServiceWithToken
} from './angular4-transition-utils';
import {WpCustomActionComponent} from 'core-components/wp-custom-actions/wp-custom-actions/wp-custom-action.component';
import {WpCustomActionsComponent} from 'core-components/wp-custom-actions/wp-custom-actions.component';
import {WorkPackageCacheService} from 'core-components/work-packages/work-package-cache.service';
import {HideSectionComponent} from 'core-components/common/hide-section/hide-section.component';
import {HideSectionService} from 'core-components/common/hide-section/hide-section.service';
import {AddSectionDropdownComponent} from 'core-components/common/hide-section/add-section-dropdown/add-section-dropdown.component';
import {HideSectionLinkComponent} from 'core-components/common/hide-section/hide-section-link/hide-section-link.component';
import {GonRef} from 'core-components/common/gon-ref/gon-ref';
import {AuthorisationService} from 'core-components/common/model-auth/model-auth.service';
import {WorkPackageTableFiltersService} from 'core-components/wp-fast-table/state/wp-table-filters.service';
import {WorkPackageTableSumService} from 'core-components/wp-fast-table/state/wp-table-sum.service';
import {WorkPackagesListService} from 'core-components/wp-list/wp-list.service';
import {WorkPackagesListChecksumService} from 'core-components/wp-list/wp-list-checksum.service';
import {LoadingIndicatorService} from 'core-components/common/loading-indicator/loading-indicator.service';
import {WorkPackageCreateButtonComponent} from 'core-components/wp-buttons/wp-create-button/wp-create-button.component';
import {WorkPackageFilterButtonComponent} from 'core-components/wp-buttons/wp-filter-button/wp-filter-button.directive';
import {WorkPackageDetailsViewButtonComponent} from 'core-components/wp-buttons/wp-details-view-button/wp-details-view-button.component';
import {WorkPackageTimelineButtonComponent} from 'core-components/wp-buttons/wp-timeline-toggle-button/wp-timeline-toggle-button.component';
import {WorkPackageZenModeButtonComponent} from 'core-components/wp-buttons/wp-zen-mode-toggle-button/wp-zen-mode-toggle-button.component';
import {WorkPackageFilterContainerComponent} from 'core-components/filters/filter-container/filter-container.directive';
import WorkPackageFiltersService from 'core-components/filters/wp-filters/wp-filters.service';
import {Ng1QueryFiltersComponentWrapper} from 'core-components/filters/query-filters/query-filters-ng1-wrapper.component';

@NgModule({
  imports: [
    BrowserModule,
    UpgradeModule,
    FormsModule
  ],
  providers: [
    GonRef,
    HideSectionService,
    upgradeServiceWithToken('$rootScope', $rootScopeToken),
    upgradeServiceWithToken('I18n', I18nToken),
    upgradeServiceWithToken('$state', $stateToken),
    upgradeServiceWithToken('$q', $qToken),
    upgradeServiceWithToken('$timeout', $timeoutToken),
    upgradeServiceWithToken('NotificationsService', NotificationsServiceToken),
    upgradeServiceWithToken('columnsModal', columnsModalToken),
    upgradeServiceWithToken('FocusHelper', FocusHelperToken),
    upgradeServiceWithToken('PathHelper', PathHelperToken),
    upgradeServiceWithToken('halRequest', halRequestToken),
    upgradeService('wpRelations', WorkPackageRelationsService),
    upgradeService('wpCacheService', WorkPackageCacheService),
    upgradeService('wpEditing', WorkPackageEditingService),
    upgradeService('states', States),
    upgradeService('paginationService', PaginationService),
    upgradeService('keepTab', KeepTabService),
    upgradeService('wpTableSelection', WorkPackageTableSelection),
    upgradeService('wpTableFocus', WorkPackageTableFocusService),
    upgradeService('wpTablePagination', WorkPackageTablePaginationService),
    upgradeService('templateRenderer', SimpleTemplateRenderer),
    upgradeService('wpTableRefresh', WorkPackageTableRefreshService),
    upgradeService('wpDisplayField', WorkPackageDisplayFieldService),
    upgradeService('wpTableTimeline', WorkPackageTableTimelineService),
    upgradeService('wpNotificationsService', WorkPackageNotificationService),
    upgradeService('wpTableHierarchies', WorkPackageTableHierarchiesService),
    upgradeService('wpTableSortBy', WorkPackageTableSortByService),
    upgradeService('wpTableFilters', WorkPackageTableFiltersService),
    upgradeService('wpTableSum', WorkPackageTableSumService),
    upgradeService('wpListService', WorkPackagesListService),
    upgradeService('wpListChecksumService', WorkPackagesListChecksumService),
    upgradeService('wpFiltersService', WorkPackageFiltersService),
    upgradeService('loadingIndicator', LoadingIndicatorService),
    upgradeService('wpTableRelationColumns', WorkPackageTableRelationColumnsService),
    upgradeService('wpTableGroupBy', WorkPackageTableGroupByService),
    upgradeService('wpTableColumns', WorkPackageTableColumnsService),
    upgradeService('contextMenu', ContextMenuService),
    upgradeService('authorisationService', AuthorisationService),
  ],
  declarations: [
    WorkPackagesListComponent,
    OpIcon,
    AccessibleByKeyboardDirectiveUpgraded,
    TablePaginationComponent,
    WorkPackageTablePaginationComponent,
    WorkPackageTimelineHeaderController,
    WorkPackageTableTimelineRelations,
    WorkPackageTableTimelineStaticElements,
    WorkPackageTableTimelineGrid,
    WorkPackageTimelineTableController,
    WorkPackagesTableController,
    WorkPackageCreateButtonComponent,
    WorkPackageFilterButtonComponent,
    WorkPackageDetailsViewButtonComponent,
    WorkPackageTimelineButtonComponent,
    WorkPackageZenModeButtonComponent,
    WorkPackageFilterContainerComponent,
    Ng1QueryFiltersComponentWrapper,
    WpResizerDirectiveUpgraded,
    WpCustomActionComponent,
    WpCustomActionsComponent,
    WorkPackageTableSumsRowController,
    SortHeaderDirective,
    HasDropdownMenuDirective,
    WpInlineCreateDirectiveUpgraded,
    HideSectionComponent,
    HideSectionLinkComponent,
    AddSectionDropdownComponent
  ],
  entryComponents: [
    WorkPackagesListComponent,
    WorkPackageTablePaginationComponent,
    WorkPackagesTableController,
    TablePaginationComponent,
    WpCustomActionsComponent,
    HideSectionComponent,
    HideSectionLinkComponent,
    AddSectionDropdownComponent
  ]
})
export class OpenProjectModule {
  constructor(private upgrade:UpgradeModule) {
  }

  // noinspection JSUnusedGlobalSymbols
  ngDoBootstrap() {
    this.upgrade.bootstrap(document.body, ['openproject'], {strictDi: false});
  }
}
