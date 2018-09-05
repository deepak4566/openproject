import {QueryResource} from 'core-app/modules/hal/resources/query-resource';
import {WorkPackageQueryStateService, WorkPackageTableBaseService} from './wp-table-base.service';
import {TableState} from 'core-components/wp-table/table-state/table-state';
import {Injectable} from '@angular/core';
import {States} from 'core-components/states.service';
import {HighlightingMode} from "core-components/wp-fast-table/builders/highlighting/highlighting-mode.const";

@Injectable()
export class WorkPackageTableHighlightingService extends WorkPackageTableBaseService<HighlightingMode> implements WorkPackageQueryStateService {
  public constructor(readonly states:States,
                     readonly tableState:TableState) {
    super(tableState);
  }

  public get state() {
    return this.tableState.highlighting;
  }

  public get current():HighlightingMode {
    return this.state.getValueOr('inline');
  }

  public get isInline() {
    return this.current === 'inline';
  }

  public get isDisabled() {
    return this.current === 'none';
  }

  public update(value:HighlightingMode) {
    this.state.putValue(value);
  }

  public valueFromQuery(query:QueryResource):HighlightingMode {
    return query.highlightingMode || 'inline';
  }

  public hasChanged(query:QueryResource) {
    return query.highlightingMode !== this.current;
  }

  public applyToQuery(query:QueryResource):boolean {
    query.highlightingMode = this.current;

    return false;
  }
}
