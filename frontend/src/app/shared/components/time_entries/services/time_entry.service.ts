import {
  Injectable,
  Injector,
} from '@angular/core';
import {
  delay,
  map,
  switchMap,
} from 'rxjs/operators';
import { ApiV3Service } from 'core-app/core/apiv3/api-v3.service';
import { TimeEntryResource } from 'core-app/features/hal/resources/time-entry-resource';
import { ApiV3FilterBuilder } from 'core-app/shared/helpers/api-v3/api-v3-filter-builder';
import {
  BehaviorSubject,
  Observable,
  timer,
} from 'rxjs';


@Injectable()
export class TimeEntryService {
  public activeTimer$ = new BehaviorSubject<TimeEntryResource|null>(null);

  constructor(
    readonly injector:Injector,
    readonly apiV3Service:ApiV3Service,
  ) {

    timer(250)
      .pipe(
        switchMap(() => this.getActiveTimeEntry()),
      )
      .subscribe((entry) => this.activeTimer$.next(entry));

    this
      .activeTimer$
      .subscribe((entry) => {
        if (entry) {
          this.renderTimer();
        } else {
          this.removeTimer();
        }
      });
  }

  public getActiveTimeEntry():Observable<TimeEntryResource|null> {
    const filters = new ApiV3FilterBuilder();
    filters.add('ongoing', '=', true);

    return this
      .apiV3Service
      .time_entries
      .filtered(filters)
      .get().pipe(
        map((collection) => collection.elements.pop() || null),
      );
  }

  private renderTimer() {
    const timerElement = document.createElement('span');
    const icon = document.createElement('span');
    timerElement.classList.add('op-principal--timer');
    icon.classList.add('spot-icon', 'spot-icon_time', 'spot-icon_1_25');
    timerElement.appendChild(icon);

    const avatar = document.querySelector<HTMLElement>('.op-top-menu-user-avatar');
    avatar?.appendChild(timerElement);
  }

  private removeTimer() {
    const timerElement = document.querySelector('.op-principal--timer') as HTMLElement;
    timerElement?.remove();
  }
}
