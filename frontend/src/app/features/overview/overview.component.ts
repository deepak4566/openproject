import { Component } from '@angular/core';
import { GridPageComponent } from 'core-app/shared/components/grids/grid/page/grid-page.component';
import { GRID_PROVIDERS } from 'core-app/shared/components/grids/grid/grid.component';

@Component({
  selector: 'overview',
  templateUrl: '../../shared/components/grids/grid/page/grid-page.component.html',
  styleUrls: ['../../shared/components/grids/grid/page/grid-page.component.sass'],
  providers: GRID_PROVIDERS,
})
export class OverviewComponent extends GridPageComponent {
  protected i18nNamespace():string {
    return 'overviews';
  }

  protected isTurboFrameSidebarEnabled():boolean {
    return this.currentProject.customFieldsCount !== '0';
  }

  protected turboFrameSidebarSrc():string {
    return `${this.pathHelper.staticBase}/projects/${this.currentProject.identifier ?? ''}/project_custom_fields_sidebar`;
  }

  protected turboFrameSidebarId():string {
    return 'project-custom-fields-sidebar';
  }

  protected gridScopePath():string {
    return this.pathHelper.projectPath(this.currentProject.identifier ?? '');
  }
}
