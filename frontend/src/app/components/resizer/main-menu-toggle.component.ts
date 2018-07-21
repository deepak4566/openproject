//-- copyright
// OpenProject is a project management system.
// Copyright (C) 2012-2015 the OpenProject Foundation (OPF)
//
// This program is free software; you can redistribute it and/or
// modify it under the terms of the GNU General Public License version 3.
//
// OpenProject is a fork of ChiliProject, which is a fork of Redmine. The copyright follows:
// Copyright (C) 2006-2013 Jean-Philippe Lang
// Copyright (C) 2010-2013 the ChiliProject Team
//
// This program is free software; you can redistribute it and/or
// modify it under the terms of the GNU General Public License
// as published by the Free Software Foundation; either version 2
// of the License, or (at your option) any later version.
//
// This program is distributed in the hope that it will be useful,
// but WITHOUT ANY WARRANTY; without even the implied warranty of
// MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.  See the
// GNU General Public License for more details.
//
// You should have received a copy of the GNU General Public License
// along with this program; if not, write to the Free Software
// Foundation, Inc., 51 Franklin Street, Fifth Floor, Boston, MA  02110-1301, USA.
//
// See doc/COPYRIGHT.rdoc for more details.
//++

import {ChangeDetectorRef, Component, OnDestroy, OnInit} from '@angular/core';
import {MainMenuToggleService} from './main-menu-toggle.service';
import {distinctUntilChanged} from 'rxjs/operators';
import {untilComponentDestroyed} from 'ng2-rx-componentdestroyed';
import {MainMenuResizerComponent} from "core-components/resizer/main-menu-resizer.component";
import {DynamicBootstrapper} from "core-app/globals/dynamic-bootstrapper";

@Component({
  selector: 'main-menu-toggle',
  template: `
    <div id="main-menu-toggle"
        aria-haspopup="true"
        [attr.title]="toggleTitle"
        (accessibleClick)="toggleService.toggleNavigation($event)"
        tabindex="0">
      <a icon="icon-hamburger">
        <i class="icon-hamburger" aria-hidden="true"></i>
      </a>
    </div>
  `
})

/*
* Groesse des Menus feststellen
* pruefen, ob kleiner 10 -> Groesse der Sidebar setzen
* collapsed boolean setzen, label im resizer und hamburger icon setzen
*
*/
export class MainMenuToggleComponent implements OnInit, OnDestroy {

  localStorageKey:string = "openProject-mainMenuWidth";
  toggleTitle:string = "";
  showNavigation:boolean;

  constructor(readonly toggleService:MainMenuToggleService,
              readonly cdRef:ChangeDetectorRef) {
  }

  ngOnInit() {
    this.toggleService.initializeMenu();

    this.toggleService.titleData$
      .pipe(
        distinctUntilChanged(),
        untilComponentDestroyed(this)
      )
      .subscribe( setToggleTitle => {
        this.toggleTitle = setToggleTitle;
        this.cdRef.detectChanges();
      });
  }

  ngOnDestroy() {
    // Nothing to do
  }
}

DynamicBootstrapper.register({ selector: 'main-menu-toggle', cls: MainMenuToggleComponent  });
