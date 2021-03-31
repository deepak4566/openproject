import {Component, Input} from '@angular/core';
import {WorkPackageResource} from "core-app/modules/hal/resources/work-package-resource";
import {WpTabsService} from "core-components/wp-tabs/services/wp-tabs/wp-tabs.service";
import {Tab} from "core-app/components/wp-tabs/components/wp-tab-wrapper/tab";

@Component({
  selector: 'op-wp-tabs',
  templateUrl: './wp-tabs.component.html',
  styleUrls: ['./wp-tabs.component.scss']
})
export class WpTabsComponent {
  @Input()
  workPackage:WorkPackageResource;
  @Input()
  set view(uiSref:'full' | 'split') {
    this.uiSref = uiSref === 'split' ? '.tabs' : 'work-packages.show.tabs';
  }

  get tabs():Tab[] {
    return this.wpTabsService.getDisplayableTabs(this.workPackage);
  }

  uiSref:string;

  constructor(
    readonly wpTabsService:WpTabsService,
  ) { }
}
