import {States} from '../states.service';
import {WorkPackageTablePaginationService} from '../wp-fast-table/state/wp-table-pagination.service';
import {WorkPackageTableHierarchiesService} from '../wp-fast-table/state/wp-table-hierarchy.service';
import {WorkPackageTableTimelineService} from '../wp-fast-table/state/wp-table-timeline.service';
import {WorkPackageTableSumService} from '../wp-fast-table/state/wp-table-sum.service';
import {WorkPackageTableFiltersService} from '../wp-fast-table/state/wp-table-filters.service';
import {WorkPackageTableGroupByService} from '../wp-fast-table/state/wp-table-group-by.service';
import {WorkPackageTableColumnsService} from '../wp-fast-table/state/wp-table-columns.service';
import {QueryResource} from '../api/api-v3/hal-resources/query-resource.service';
import {WorkPackageCollectionResource} from '../api/api-v3/hal-resources/wp-collection-resource.service';
import {SchemaResource} from '../api/api-v3/hal-resources/schema-resource.service';
import {QueryFormResource} from '../api/api-v3/hal-resources/query-form-resource.service';
import {QuerySchemaResourceInterface} from '../api/api-v3/hal-resources/query-schema-resource.service';
import {QueryFilterInstanceSchemaResource} from '../api/api-v3/hal-resources/query-filter-instance-schema-resource.service';
import {WorkPackageCacheService} from '../work-packages/work-package-cache.service';
import {WorkPackageTableRelationColumnsService} from '../wp-fast-table/state/wp-table-relation-columns.service';
import {WorkPackagesListChecksumService} from './wp-list-checksum.service';
import {WorkPackageTableSortByService} from '../wp-fast-table/state/wp-table-sort-by.service';
import {WorkPackageTableAdditionalElementsService} from '../wp-fast-table/state/wp-table-additional-elements.service';
import {AuthorisationService} from 'core-components/common/model-auth/model-auth.service';
import {TableState} from 'core-components/wp-table/table-state/table-state';
import {Injectable} from '@angular/core';

@Injectable()
export class WorkPackageStatesInitializationService {
  constructor(protected states:States,
              protected tableState:TableState,
              protected wpTableColumns:WorkPackageTableColumnsService,
              protected wpTableGroupBy:WorkPackageTableGroupByService,
              protected wpTableSortBy:WorkPackageTableSortByService,
              protected wpTableFilters:WorkPackageTableFiltersService,
              protected wpTableSum:WorkPackageTableSumService,
              protected wpTableTimeline:WorkPackageTableTimelineService,
              protected wpTableHierarchies:WorkPackageTableHierarchiesService,
              protected wpTableRelationColumns:WorkPackageTableRelationColumnsService,
              protected wpTablePagination:WorkPackageTablePaginationService,
              protected wpTableAdditionalElements:WorkPackageTableAdditionalElementsService,
              protected wpCacheService:WorkPackageCacheService,
              protected wpListChecksumService:WorkPackagesListChecksumService,
              protected authorisationService:AuthorisationService) {
  }

  /**
   * Initialize the query and table states from the given query and results.
   * They may or may not come from the same query source.
   *
   * @param query
   * @param results
   */
  public initializeAll(query:QueryResource, results:WorkPackageCollectionResource) {
    this.initializeTable(query, results);

    // Initialize global query states
    this.initializeQueryStates(query);

    // Update checksum if query changed anything relevant
    this.updateChecksumService();
  }

  public initializeTable(query:QueryResource, results:WorkPackageCollectionResource) {
    this.clearTableState();

    // Initialize local table services
    this.initializeTableServices(query, results);

    // Insert values from WP results
    this.updateFromResults(query, results);
  }

  /**
   * Insert new information from the query from to the states.
   *
   * @param query
   * @param form
   */
  public updateStatesFromForm(query:QueryResource, form:QueryFormResource) {
    let schema = form.schema as QuerySchemaResourceInterface;

    _.each(schema.filtersSchemas.elements, (schema:QueryFilterInstanceSchemaResource) => {
      this.states.schemas.get(schema.href as string).putValue(schema);
    });

    this.wpTableFilters.initializeFilters(query, schema);
    this.states.query.form.putValue(form);

    this.states.query.available.columns.putValue(schema.columns.allowedValues);
    this.states.query.available.sortBy.putValue(schema.sortBy.allowedValues);
    this.states.query.available.groupBy.putValue(schema.groupBy.allowedValues);
  }

  public updateChecksumService() {
    this.wpListChecksumService.updateIfDifferent(this.states.query.resource.value!, this.wpTablePagination.current);
  }

  public updateFromResults(query:QueryResource, results:WorkPackageCollectionResource) {
    // Clear table required data states
    this.tableState.additionalRequiredWorkPackages.clear('Clearing additional WPs before updating rows');

    if (results.schemas) {
      _.each(results.schemas.elements, (schema:SchemaResource) => {
        this.states.schemas.get(schema.href as string).putValue(schema);
      });
    }

    this.tableState.query.putValue(query);

    this.tableState.rows.putValue(results.elements);

    this.wpCacheService.updateWorkPackageList(results.elements);

    this.tableState.results.putValue(results);

    this.tableState.groups.putValue(angular.copy(results.groups));

    this.wpTablePagination.initialize(query, results);


    this.wpTableRelationColumns.initialize();

    this.wpTableAdditionalElements.initialize(results.elements);

    this.authorisationService.initModelAuth('work_packages', results.$links);
  }

  private initializeTableServices(query:QueryResource, results:WorkPackageCollectionResource) {
    this.wpTableSum.initialize(query);
    this.wpTableColumns.initialize(query, results);
    this.wpTableSortBy.initialize(query, results);
    this.wpTableGroupBy.initialize(query, results);
    this.wpTableTimeline.initialize(query, results);
    this.wpTableHierarchies.initialize(query, results);
  }

  private initializeQueryStates(query:QueryResource) {
    this.states.query.resource.putValue(query);
    this.authorisationService.initModelAuth('query', query.$links);
  }

  private clearTableState() {
    const reason = 'Clearing states before re-initialization.';

    // Clear immediate input states
    this.tableState.query.clear(reason);
    this.tableState.rows.clear(reason);
    this.tableState.columns.clear(reason);
    this.tableState.sortBy.clear(reason);
    this.tableState.groupBy.clear(reason);
    this.tableState.sum.clear(reason);
    this.tableState.results.clear(reason);
    this.tableState.groups.clear(reason);
    this.tableState.additionalRequiredWorkPackages.clear(reason);

    // Clear rendered state
    this.tableState.rendered.clear(reason);
  }
}
