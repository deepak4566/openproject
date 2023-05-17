import { Injector } from '@angular/core';
import {
  WorkPackageResource,
} from 'core-app/features/hal/resources/work-package-resource';
import { InjectField } from 'core-app/shared/helpers/angular/inject-field.decorator';
import { States } from 'core-app/core/states/states.service';
import { WorkPackageViewBaselineService } from 'core-app/features/work-packages/routing/wp-view-base/view-services/wp-view-baseline.service';
import { tdClassName } from 'core-app/features/work-packages/components/wp-fast-table/builders/cell-builder';
import { QueryColumn } from 'core-app/features/work-packages/components/wp-query/query-column';
import { opIconElement } from 'core-app/shared/helpers/op-icon-builder';
import { WorkPackageViewColumnsService } from 'core-app/features/work-packages/routing/wp-view-base/view-services/wp-view-columns.service';
import { SchemaCacheService } from 'core-app/core/schemas/schema-cache.service';
import { ISchemaProxy } from 'core-app/features/hal/schemas/schema-proxy';
import { I18nService } from 'core-app/core/i18n/i18n.service';
import { IWorkPackageTimestamp } from 'core-app/features/hal/resources/work-package-timestamp-resource';

export const baselineCellName = 'op-table-baseline--column-cell';

export class BaselineColumnBuilder {
  @InjectField() states:States;

  @InjectField() wpTableBaseline:WorkPackageViewBaselineService;

  @InjectField() wpTableColumns:WorkPackageViewColumnsService;

  @InjectField() schemaCache:SchemaCacheService;

  @InjectField() I18n:I18nService;

  constructor(public readonly injector:Injector) {
  }

  public build(workPackage:WorkPackageResource, column:QueryColumn) {
    const td = document.createElement('td');
    td.classList.add(tdClassName, baselineCellName, column.id);
    td.dataset.columnId = column.id;

    const schema = this.schemaCache.of(workPackage);
    const timestamps = workPackage.attributesByTimestamp || [];

    // Nothing to render if we don't have a comparison
    if (timestamps.length <= 1) {
      return td;
    }

    const base = timestamps[0];
    const compare = timestamps[1];

    // Check if added
    const icon = this.changeIcon(base, compare, schema);
    if (icon) {
      td.appendChild(icon);
    }

    return td;
  }

  private changeIcon(
    base:IWorkPackageTimestamp,
    compare:IWorkPackageTimestamp,
    schema:ISchemaProxy,
  ):HTMLElement|null {
    if ((!base._meta.exists && compare._meta.exists) || (!base._meta.matchesFilters && compare._meta.matchesFilters)) {
      const icon = opIconElement('spot-icon', 'spot-icon_1', 'spot-icon_flex', 'spot-icon_add', 'op-table-baseline--icon-added');
      icon.title = this.I18n.t('js.work_packages.baseline.addition_label');
      return icon;
    }

    if ((base._meta.exists && !compare._meta.exists) || (base._meta.matchesFilters && !compare._meta.matchesFilters)) {
      const icon = opIconElement('spot-icon', 'spot-icon_1', 'spot-icon_flex', 'spot-icon_minus1', 'op-table-baseline--icon-removed');
      icon.title = this.I18n.t('js.work_packages.baseline.removal_label');
      return icon;
    }

    if (this.visibleAttributeChanged(base, schema)) {
      const icon = opIconElement('spot-icon', 'spot-icon_1', 'spot-icon_flex', 'spot-icon_arrow-left-right', 'op-table-baseline--icon-changed');
      icon.title = this.I18n.t('js.work_packages.baseline.modification_label');
      return icon;
    }

    return null;
  }

  private visibleAttributeChanged(base:IWorkPackageTimestamp, schema:ISchemaProxy):boolean {
    return !!this
      .wpTableColumns
      .getColumns()
      .find((column) => {
        const name = schema.mappedName(column.id);
        return Object.prototype.hasOwnProperty.call(base, name) || Object.prototype.hasOwnProperty.call(base.$links, name);
      });
  }
}
