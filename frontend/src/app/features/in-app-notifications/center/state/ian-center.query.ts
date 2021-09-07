import { Query } from '@datorama/akita';
import {
  IAN_FACET_FILTERS,
  IanCenterState,
  IanCenterStore,
} from 'core-app/features/in-app-notifications/center/state/ian-center.store';
import { InAppNotificationsResourceService } from 'core-app/core/state/in-app-notifications/in-app-notifications.service';
import {
  map,
  switchMap,
} from 'rxjs/operators';
import { Apiv3ListParameters } from 'core-app/core/apiv3/paths/apiv3-list-resource.interface';
import { InAppNotification } from 'core-app/core/state/in-app-notifications/in-app-notification.model';
import { selectCollectionAsEntities$ } from 'core-app/core/state/collection-store';

export class IanCenterQuery extends Query<IanCenterState> {
  activeFacet$ = this.select('activeFacet');

  notLoaded$ = this.select('notLoaded');

  paramsChanges$ = this.select(['params', 'activeFacet']);

  selectNotifications$ = this
    .paramsChanges$
    .pipe(
      switchMap(() => selectCollectionAsEntities$<InAppNotification>(this.resourceService, this.params)),
    );

  aggregatedCenterNotifications$ = this
    .selectNotifications$
    .pipe(
      map((notifications) => (
        _.groupBy(notifications, (notification) => notification._links.resource?.href || 'none')
      )),
    );

  notifications$ = this
    .aggregatedCenterNotifications$
    .pipe(
      map((items) => Object.values(items)),
    );

  hasNotifications$ = this
    .notifications$
    .pipe(
      map((items) => items.length > 0),
    );

  hasMoreThanPageSize$ = this
    .notLoaded$
    .pipe(
      map((notLoaded) => notLoaded > 0),
    );

  get params():Apiv3ListParameters {
    const state = this.store.getValue();
    return { ...state.params, filters: IAN_FACET_FILTERS[state.activeFacet] };
  }

  constructor(
    protected store:IanCenterStore,
    protected resourceService:InAppNotificationsResourceService,
  ) {
    super(store);
  }
}
