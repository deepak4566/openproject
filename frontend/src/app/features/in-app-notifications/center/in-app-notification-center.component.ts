import { ChangeDetectionStrategy, ChangeDetectorRef, Component, ElementRef, Inject, OnInit } from '@angular/core';
import { OpModalComponent } from "core-app/shared/components/modal/modal.component";
import { OpModalLocalsToken } from "core-app/shared/components/modal/modal.service";
import { OpModalLocalsMap } from "core-app/shared/components/modal/modal.types";
import { I18nService } from "core-app/core/i18n/i18n.service";
import { InAppNotificationsQuery } from "core-app/features/in-app-notifications/store/in-app-notifications.query";
import { InAppNotificationsService } from "core-app/features/in-app-notifications/store/in-app-notifications.service";

@Component({
  selector: 'op-in-app-notification-center',
  templateUrl: './in-app-notification-center.component.html',
  styleUrls: ['./in-app-notification-center.component.sass'],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class InAppNotificationCenterComponent extends OpModalComponent implements OnInit {
  activeFacet$ = this.ianQuery.activeFacet$;
  notifications$ = this.ianQuery.selectAll();
  notificationsCount$ = this.ianQuery.selectCount();
  hasNotifications$ = this.ianQuery.hasNotifications$;

  facets:string[] = ['unread', 'all']

  text = {
    title: 'Notifications',
    mark_all_read: 'Mark all as read',
    button_close: this.I18n.t('js.button_close'),
    no_results: this.I18n.t('js.notice_no_results_to_display'),
    show_all: 'Show all',
    show_unread: 'Show unread',
    facets: {
      unread: 'Unread',
      all: 'All'
    }
  };

  constructor(
    @Inject(OpModalLocalsToken) public locals:OpModalLocalsMap,
    readonly cdRef:ChangeDetectorRef,
    readonly elementRef:ElementRef,
    readonly I18n:I18nService,
    readonly ianService:InAppNotificationsService,
    readonly ianQuery:InAppNotificationsQuery,
  ) {
    super(locals, cdRef, elementRef);
  }

  ngOnInit():void {
    this.ianService.get();
  }

  markAllRead() {
    this.ianService.markAllRead();
    this.closeMe();
  }

  activateFacet(facet:string) {
    this.ianService.setActiveFacet(facet);
    this.ianService.get();
  }

}
