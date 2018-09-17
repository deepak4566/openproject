import {QueryResource} from 'core-app/modules/hal/resources/query-resource';
import {WorkPackageQueryStateService, WorkPackageTableBaseService} from './wp-table-base.service';
import {TableState} from 'core-components/wp-table/table-state/table-state';
import {Injectable} from '@angular/core';
import {States} from 'core-components/states.service';
import {HighlightingMode} from "core-components/wp-fast-table/builders/highlighting/highlighting-mode.const";
import {DynamicCssService} from "../../../modules/common/dynamic-css/dynamic-css.service";

@Injectable()
export class WorkPackageTableHighlightingService extends WorkPackageTableBaseService<HighlightingMode> implements WorkPackageQueryStateService {
  public eeShowBanners:boolean = false;

  public constructor(readonly states:States,
                     readonly dynamicCssService:DynamicCssService,
                     readonly tableState:TableState) {
    super(tableState);
    this.eeShowBanners = jQuery('body').hasClass('ee-banners-visible');
  }

  public get state() {
    return this.tableState.highlighting;
  }

  public get current():HighlightingMode {
    return this.filteredMode(this.state.getValueOr('inline'));
  }

  public get isInline() {
    return this.current === 'inline';
  }

  public get isDisabled() {
    return this.current === 'none';
  }

  public update(value:HighlightingMode) {
    super.update(this.filteredMode(value));

    // Load dynamic highlighting CSS if enabled
    if (!this.isDisabled) {
      this.dynamicCssService.requireHighlighting();
    }
  }

  public valueFromQuery(query:QueryResource):HighlightingMode {
    return query.highlightingMode || this.filteredMode('inline');
  }

  public hasChanged(query:QueryResource) {
    return query.highlightingMode !== this.current;
  }

  public applyToQuery(query:QueryResource):boolean {
    query.highlightingMode = this.current;

    return false;
  }

  private filteredMode(mode:HighlightingMode):HighlightingMode {
    if (this.eeShowBanners) {
      return 'none';
    } else {
      return mode;
    }
  }
}
