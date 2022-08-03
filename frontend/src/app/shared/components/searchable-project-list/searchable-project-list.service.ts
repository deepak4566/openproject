import { Injectable } from '@angular/core';
import {
  ApiV3ListFilter,
  ApiV3ListParameters,
  listParamsString,
} from 'core-app/core/apiv3/paths/apiv3-list-resource.interface';
import { BehaviorSubject } from 'rxjs';
import { IProject } from 'core-app/core/state/projects/project.model';
import { getPaginatedResults } from 'core-app/core/apiv3/helpers/get-paginated-results';
import { IHALCollection } from 'core-app/core/apiv3/types/hal-collection.type';
import { finalize } from 'rxjs/operators';
import { ApiV3Service } from 'core-app/core/apiv3/api-v3.service';
import { HttpClient } from '@angular/common/http';
import { KeyCodes } from 'core-app/shared/helpers/keyCodes.enum';
import {
  projectListActionSelector,
  projectListItemDisabled,
  projectListRootSelector,
} from 'core-app/shared/components/project-list/project-list.component';
import { findAllFocusableElementsWithin } from 'core-app/shared/helpers/focus-helpers';

@Injectable()
export class SearchableProjectListService {
  private _searchText = '';

  get searchText():string {
    return this._searchText;
  }

  set searchText(val:string) {
    this._searchText = val;
    this.searchText$.next(val);
  }

  searchText$ = new BehaviorSubject<string>('');

  allProjects$ = new BehaviorSubject<IProject[]>([]);

  fetchingProjects$ = new BehaviorSubject(false);

  constructor(
    readonly http:HttpClient,
    readonly apiV3Service:ApiV3Service,
  ) { }

  public loadAllProjects():void {
    this.fetchingProjects$.next(true);

    getPaginatedResults<IProject>(
      (params) => {
        const collectionURL = listParamsString({ ...this.params, ...params });
        return this.http.get<IHALCollection<IProject>>(this.apiV3Service.projects.path + collectionURL);
      },
    )
      .pipe(
        finalize(() => this.fetchingProjects$.next(false)),
      )
      .subscribe((projects) => {
        this.allProjects$.next(projects);
      });
  }

  public get params():ApiV3ListParameters {
    const filters:ApiV3ListFilter[] = [
      ['active', '=', ['t']],
    ];

    return {
      filters,
      pageSize: -1,
      select: [
        'elements/id',
        'elements/name',
        'elements/identifier',
        'elements/self',
        'elements/ancestors',
        'total',
        'count',
        'pageSize',
      ],
    };
  }

  private handleKeyNavigation(upwards = false):void {
    const focused = document.activeElement as HTMLElement|undefined;

    // If the current focus is within a list action, move focus in direction
    if (focused?.closest(projectListActionSelector)) {
      this.moveFocus(focused, upwards);
      return;
    }

    // If we're moving down, select first
    if (!upwards) {
      const first = document.querySelector<HTMLElement>(`${projectListActionSelector}:not(${projectListItemDisabled})`);
      first?.focus();
    }
  }

  private moveFocus(source:Element, upwards = false):void {
    const activeItem = source.closest(projectListActionSelector) as HTMLElement;
    let nextTarget = this.findNextTarget(activeItem, upwards);

    // If the target is disabled, skip
    while (nextTarget?.matches(projectListItemDisabled)) {
      nextTarget = this.findNextTarget(nextTarget, upwards);
    }

    nextTarget?.focus();
  }

  private findNextTarget(from:HTMLElement, upwards = false):HTMLElement|null|undefined {
    let container:Element|null|undefined = from;

    // eslint-disable-next-line no-constant-condition
    while (true) {
      if (!container || container.matches(projectListRootSelector)) {
        // Move to the input when we reach the top of the list
        if (upwards) {
          return this.findInputElement();
        }
        return null;
      }

      const nextNode:Element|null = upwards ? container.previousElementSibling : container.nextElementSibling;

      // If we don't find anything, move up
      if (!nextNode) {
        container = container.parentElement;
        continue;
      }

      // If we moved to a target, use that
      if (nextNode?.matches(projectListActionSelector)) {
        return nextNode as HTMLElement;
      }
      // Try to find the next action
      const targets = nextNode ? Array.from(nextNode.querySelectorAll<HTMLElement>(projectListActionSelector)) : [];
      const target = upwards ? targets.pop() : targets[0];
      if (target) {
        return target;
      }

      container = nextNode;
    }
  }

  onKeydown(event:KeyboardEvent):void {
    const inputElement = this.findInputElement();

    switch (event.keyCode) {
      case event.shiftKey && KeyCodes.TAB:
      case KeyCodes.UP_ARROW:
        event.preventDefault();
        this.handleKeyNavigation(true);
        break;
      case KeyCodes.TAB:
      case KeyCodes.DOWN_ARROW:
        event.preventDefault();
        this.handleKeyNavigation(false);
        break;
      case KeyCodes.SPACE:
        if (inputElement && event.target !== inputElement) {
          event.preventDefault();
        }
        break;
      case KeyCodes.SHIFT:
      case KeyCodes.ENTER:
        break;
      default:
        if (inputElement && event.target !== inputElement) {
          inputElement.focus();
        }
        break;
    }
  }

  findInputElement():HTMLElement|undefined {
    const focusCatcherContainer = document.querySelectorAll("[data-list-focus-catcher-container='true']")[0];
    if (focusCatcherContainer) {
      return (findAllFocusableElementsWithin(focusCatcherContainer as HTMLElement)[0] as HTMLElement);
    }

    return undefined;
  }
}
