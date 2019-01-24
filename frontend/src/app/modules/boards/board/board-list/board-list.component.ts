import {AfterViewInit, Component, ElementRef, Input, OnInit, ViewChild} from "@angular/core";
import {DynamicBootstrapper} from "core-app/globals/dynamic-bootstrapper";
import {QueryDmService} from "core-app/modules/hal/dm-services/query-dm.service";
import {CurrentProjectService} from "core-components/projects/current-project.service";
import {
  LoadingIndicator,
  LoadingIndicatorService, withLoadingIndicator
} from "core-app/modules/common/loading-indicator/loading-indicator.service";
import {QueryResource} from "core-app/modules/hal/resources/query-resource";
import {WorkPackageTableConfigurationObject} from "core-components/wp-table/wp-table-configuration";
import {Board} from "core-app/modules/boards/board/board";
import {Observable} from "rxjs";
import {share, tap} from "rxjs/operators";

@Component({
  selector: 'board-list',
  templateUrl: './board-list.component.html',
  styleUrls: ['./board-list.component.sass']
})
export class BoardListComponent implements OnInit {
  @Input() queryId:number;

  @ViewChild('loadingIndicator') indicator:ElementRef;

  /** The query resource being loaded */
  public query$:Observable<QueryResource>;

  constructor(private readonly QueryDm:QueryDmService,
              private readonly loadingIndicator:LoadingIndicatorService) {
  }

  ngOnInit():void {
    this.query$ = this.QueryDm
      .stream({}, this.queryId)
      .pipe(
        withLoadingIndicator(this.indicatorInstance, 50)
      );
  }

  get columnsQueryProps() {
    return {
      'columns[]': ['id', 'subject'],
      'showHierarchies': false,
      'pageSize': 500,
    };
  }

  get boardTableConfiguration():WorkPackageTableConfigurationObject {
    return {
      hierarchyToggleEnabled: false,
      columnMenuEnabled: false,
      actionsColumnEnabled: false,
      isEmbedded: true
    };
  }

  private get indicatorInstance() {
    return this.loadingIndicator.indicator(jQuery(this.indicator.nativeElement));
  }
}
