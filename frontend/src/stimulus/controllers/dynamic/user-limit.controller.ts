/*
 * -- copyright
 * OpenProject is an open source project management software.
 * Copyright (C) 2023 the OpenProject GmbH
 *
 * This program is free software; you can redistribute it and/or
 * modify it under the terms of the GNU General Public License version 3.
 *
 * OpenProject is a fork of ChiliProject, which is a fork of Redmine. The copyright follows:
 * Copyright (C) 2006-2013 Jean-Philippe Lang
 * Copyright (C) 2010-2013 the ChiliProject Team
 *
 * This program is free software; you can redistribute it and/or
 * modify it under the terms of the GNU General Public License
 * as published by the Free Software Foundation; either version 2
 * of the License, or (at your option) any later version.
 *
 * This program is distributed in the hope that it will be useful,
 * but WITHOUT ANY WARRANTY; without even the implied warranty of
 * MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.  See the
 * GNU General Public License for more details.
 *
 * You should have received a copy of the GNU General Public License
 * along with this program; if not, write to the Free Software
 * Foundation, Inc., 51 Franklin Street, Fifth Floor, Boston, MA  02110-1301, USA.
 *
 * See COPYRIGHT and LICENSE files for more details.
 * ++
 */

import { Controller } from '@hotwired/stimulus';
import {
  IUserAutocompleteItem,
} from 'core-app/shared/components/autocompleter/user-autocompleter/user-autocompleter.component';

export default class UserLimitController extends Controller {
  static targets = [
    'limitWarning',
    'inviteUserForm',
  ];

  static values = {
    openSeats: Number,
    // Special case, that the autocompleter is a members-autocompleter, instead of the normal user-autocompleter
    memberAutocompleter: Boolean,
  };

  declare readonly limitWarningTarget:HTMLElement;
  declare readonly hasLimitWarningTarget:HTMLElement;
  declare readonly inviteUserFormTarget:HTMLElement;

  declare readonly openSeatsValue:number;
  declare readonly hasOpenSeatsValue:number;
  declare readonly memberAutocompleterValue:boolean;

  private autocompleter:HTMLElement;
  private autocompleterListener = this.triggerLimitWarningIfReached.bind(this);

  connect() {
    if (this.memberAutocompleterValue) {
      this.autocompleter = this.inviteUserFormTarget.querySelector('opce-members-autocompleter') as HTMLElement;
    } else {
      this.autocompleter = this.inviteUserFormTarget.querySelector('opce-user-autocompleter') as HTMLElement;
    }

    this.autocompleter.addEventListener('change', this.autocompleterListener);
  }

  disconnect() {
    this.autocompleter.removeEventListener('change', this.autocompleterListener);
  }

  triggerLimitWarningIfReached(evt:CustomEvent) {
    const values = evt.detail as IUserAutocompleteItem[];

    if (this.hasLimitWarningTarget && this.hasOpenSeatsValue) {
      const numberOfNewUsers = values.filter(({ id }) => typeof (id) === 'string' && id.includes('@')).length;
      if (numberOfNewUsers > 0 && numberOfNewUsers > this.openSeatsValue) {
        this.limitWarningTarget.classList.remove('d-none');
      } else {
        this.limitWarningTarget.classList.add('d-none');
      }
    }
  }
}
