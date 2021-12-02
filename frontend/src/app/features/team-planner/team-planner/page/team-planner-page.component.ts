import {
  ChangeDetectionStrategy,
  Component,
  OnInit,
} from '@angular/core';
import {
  DynamicComponentDefinition,
  PartitionedQuerySpacePageComponent,
  ToolbarButtonComponentDefinition,
  ViewPartitionState,
} from 'core-app/features/work-packages/routing/partitioned-query-space-page/partitioned-query-space-page.component';
import { ZenModeButtonComponent } from 'core-app/features/work-packages/components/wp-buttons/zen-mode-toggle-button/zen-mode-toggle-button.component';
import { WorkPackageFilterButtonComponent } from 'core-app/features/work-packages/components/wp-buttons/wp-filter-button/wp-filter-button.component';
import { WorkPackageFilterContainerComponent } from 'core-app/features/work-packages/components/filters/filter-container/filter-container.directive';
import { QueryParamListenerService } from 'core-app/features/work-packages/components/wp-query/query-param-listener.service';
import { QueryResource } from 'core-app/features/hal/resources/query-resource';

@Component({
  templateUrl: '../../../work-packages/routing/partitioned-query-space-page/partitioned-query-space-page.component.html',
  styleUrls: [
    '../../../work-packages/routing/partitioned-query-space-page/partitioned-query-space-page.component.sass',
  ],
  changeDetection: ChangeDetectionStrategy.OnPush,
  providers: [
    QueryParamListenerService,
  ],
})
export class TeamPlannerPageComponent extends PartitionedQuerySpacePageComponent implements OnInit {
  text = {
    title: this.I18n.t('js.team_planner.title'),
    unsaved_title: this.I18n.t('js.team_planner.unsaved_title'),
  };

  /** Go back using back-button */
  backButtonCallback:() => void;

  /** Current query title to render */
  selectedTitle = this.text.unsaved_title;

  filterContainerDefinition:DynamicComponentDefinition = {
    component: WorkPackageFilterContainerComponent,
  };

  /** We need to pass the correct partition state to the view to manage the grid */
  currentPartition:ViewPartitionState = '-split';

  /** Show a toolbar */
  showToolbar = true;

  /** Toolbar is not editable */
  titleEditingEnabled = false;

  /** Not savable */
  showToolbarSaveButton = false;

  /** Toolbar is always enabled */
  toolbarDisabled = false;

  /** Define the buttons shown in the toolbar */
  toolbarButtonComponents:ToolbarButtonComponentDefinition[] = [
    {
      component: WorkPackageFilterButtonComponent,
    },
    {
      component: ZenModeButtonComponent,
    },
  ];

  public ngOnInit():void {
    super.ngOnInit();

    this.wpTableFilters.hidden.push(
      'assignee',
      'startDate',
      'dueDate',
      'memberOfGroup',
      'assignedToRole',
      'assigneeOrGroup',
    );
  }

  protected set loadingIndicator(promise:Promise<unknown>) {
    this.loadingIndicatorService.indicator('calendar-entry').promise = promise;
  }

  /**
   * We need to set the current partition to the grid to ensure
   * either side gets expanded to full width if we're not in '-split' mode.
   *
   * @param state The current or entering state
   */
  setPartition(state:{ data:{ partition?:ViewPartitionState } }):void {
    this.currentPartition = state.data?.partition || '-split';
  }

  updateTitle(query?:QueryResource):void {
    if (!query?.id) {
      this.selectedTitle = this.text.unsaved_title;
    } else {
      super.updateTitle(query);
    }
  }

  // For shared template compliance
  // eslint-disable-next-line class-methods-use-this, @typescript-eslint/no-unused-vars
  updateTitleName(val:string):void {
  }

  // For shared template compliance
  // eslint-disable-next-line class-methods-use-this, @typescript-eslint/no-unused-vars
  changeChangesFromTitle(val:string):void {
  }
}
