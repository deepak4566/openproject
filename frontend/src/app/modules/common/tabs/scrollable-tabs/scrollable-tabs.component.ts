import {
  AfterViewInit,
  ChangeDetectionStrategy, ChangeDetectorRef,
  Component,
  ElementRef,
  EventEmitter,
  Input,
  Output,
  ViewChild,
  ViewEncapsulation,
} from "@angular/core";
import { TabDefinition } from "core-app/modules/common/tabs/tab.interface";
import { AngularTrackingHelpers } from "core-components/angular/tracking-functions";

@Component({
  templateUrl: 'scrollable-tabs.component.html',
  selector: 'op-scrollable-tabs',
  changeDetection: ChangeDetectionStrategy.OnPush,
})

export class ScrollableTabsComponent implements AfterViewInit {
  @ViewChild('scrollContainer', { static: true }) scrollContainer:ElementRef;
  @ViewChild('scrollPane', { static: true }) scrollPane:ElementRef;
  @ViewChild('scrollRightBtn', { static: true }) scrollRightBtn:ElementRef;
  @ViewChild('scrollLeftBtn', { static: true }) scrollLeftBtn:ElementRef;

  @Input() public currentTabId = '';
  @Input() public tabs:TabDefinition[] = [];
  @Input() public classes:string[] = [];
  @Input() public narrow = false;
  @Input() public hideLeftButton = true;
  @Input() public hideRightButton = true;

  @Output() public tabSelected = new EventEmitter<TabDefinition>();

  trackById = AngularTrackingHelpers.trackByProperty('id');

  private container:Element;
  private pane:Element;

  constructor(private cdRef:ChangeDetectorRef) {
  }

  ngAfterViewInit():void {
    this.container = this.scrollContainer.nativeElement;
    this.pane = this.scrollPane.nativeElement;

    this.determineScrollButtonVisibility();
    if (this.currentTabId !== '') {
      this.scrollIntoVisibleArea(this.currentTabId);
    }
  }

  public clickTab(tab:TabDefinition, event:Event):void {
    this.currentTabId = tab.id;
    this.tabSelected.emit(tab);

    // If the tab does not provide its own link,
    // avoid propagation
    if (!tab.path) {
      event.preventDefault();
    }
  }

  public onScroll(event:any):void {
    this.determineScrollButtonVisibility();
  }

  private determineScrollButtonVisibility() {
    this.hideLeftButton = (this.pane.scrollLeft <= 0);
    this.hideRightButton = (this.pane.scrollWidth - this.pane.scrollLeft <= this.container.clientWidth);

    this.cdRef.detectChanges();
  }

  public scrollRight():void {
    this.pane.scrollLeft += this.container.clientWidth;
  }

  public scrollLeft():void {
    this.pane.scrollLeft -= this.container.clientWidth;
  }

  private scrollIntoVisibleArea(tabId:string) {
    const tab:JQuery<Element> = jQuery(this.pane).find(`[tab-id=${tabId}]`);
    const position:JQueryCoordinates = tab.position();

    const tabRightBorderAt:number = position.left + Number(tab.outerWidth());

    if (this.pane.scrollLeft + this.container.clientWidth < tabRightBorderAt) {
      this.pane.scrollLeft = tabRightBorderAt - this.container.clientWidth + 40; // 40px to not overlap by buttons
    }
  }
}
