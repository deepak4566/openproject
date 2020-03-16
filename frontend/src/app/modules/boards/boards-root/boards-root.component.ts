import {Component, Injector} from "@angular/core";
import {BoardConfigurationService} from "core-app/modules/boards/board/configuration-modal/board-configuration.service";
import {BoardActionsRegistryService} from "core-app/modules/boards/board/board-actions/board-actions-registry.service";
import {BoardStatusActionService} from "core-app/modules/boards/board/board-actions/status/status-action.service";
import {BoardVersionActionService} from "core-app/modules/boards/board/board-actions/version/version-action.service";
import {QueryUpdatedService} from "core-app/modules/boards/board/query-updated/query-updated.service";
import { BoardAssigneeActionService } from '../board/board-actions/assignee/assignee-action.service';

@Component({
  selector: 'boards-entry',
  template: '<ui-view></ui-view>',
  providers: [
    BoardConfigurationService,
    BoardStatusActionService,
    BoardVersionActionService,
    QueryUpdatedService,
    BoardAssigneeActionService
  ]
})
export class BoardsRootComponent {

  constructor(readonly injector:Injector) {

    // Register action services
    const registry = injector.get(BoardActionsRegistryService);
    const statusAction = injector.get(BoardStatusActionService);
    const versionAction = injector.get(BoardVersionActionService);
    const assigneeAction = injector.get(BoardAssigneeActionService);

    registry.add('status', statusAction);
    registry.add('version', versionAction);
    registry.add('assignee', assigneeAction);
  }
}
