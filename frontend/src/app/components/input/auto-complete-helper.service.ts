//-- copyright
// OpenProject is a project management system.
// Copyright (C) 2012-2017 the OpenProject Foundation (OPF)
//
// This program is free software; you can redistribute it and/or
// modify it under the terms of the GNU General Public License version 3.
//
// OpenProject is a fork of ChiliProject, which is a fork of Redmine. The copyright follows:
// Copyright (C) 2006-2017 Jean-Philippe Lang
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

import {PathHelperService} from "core-app/modules/common/path-helper/path-helper.service";
import {Injectable} from "@angular/core";
import {HttpClient} from "@angular/common/http";

@Injectable()
export class AutoCompleteHelperService {
  public constructor(private http:HttpClient,
                     private PathHelper:PathHelperService) {}

  public getAtWhoParametersMentionable(at:string, textarea:HTMLElement, projectId:string) {
    return {
      at: at,
      startWithSpace: true,
      searchKey: 'id_principal',
      displayTpl: '<li data-value="#{_type}#${id}">${name}</li>',
      insertTpl: "${typePrefix}#${id}",
      limit: 10,
      highlightFirst: true,
      suffix: '',
      acceptSpaceBar: true,
      textarea: textarea,
      callbacks: {
        remoteFilter: (query:string, callback:Function) => {
          const url:string = this.PathHelper.api.v3.principals(projectId, query);
          this.http.get(url)
            .subscribe((data:any) => {
              if (data) {
                // atjs needs the search key to be a string
                const principals = data["_embedded"]["elements"];
                for (let i = principals.length - 1; i >= 0; i--) {
                  principals[i]['id_principal'] = principals[i]['id'].toString() + ' ' + principals[i]['name'];
                  principals[i]['typePrefix'] = principals[i]['_type'].toLowerCase();
                }

                if (jQuery(textarea).is(':visible')) {
                  callback(principals);
                }
                else {
                  // discard the results if the textarea is no longer visible,
                  // i.e. nobody cares for the results
                  callback([]);
                }
              }
            });
        },
        sorter: function(query:any, items:any, search_key:any) {
          return items; // we do not sort
        }
      }
    };
  }

  public getAtWhoParametersWPID(textarea:HTMLElement) {
    var url = this.PathHelper.workPackageJsonAutoCompletePath();
    return {
      at: '#',
      startWithSpace: true,
      searchKey: 'id_subject',
      displayTpl: '<li data-value="${atwho-at}${id}">${to_s}</li>',
      insertTpl: "${atwho-at}${id}",
      limit: 10,
      highlightFirst: true,
      textarea: textarea,
      callbacks: {
        remoteFilter: (query:string, callback:Function) => {
          if (query.length > 0) {
            this.http.get(url, { params: { q: query, scope: 'all' } })
              .subscribe(function(data:any) {
                if (data) {
                  // atjs needs the search key to be a string
                  for (var i = data.length - 1; i >= 0; i--) {
                    data[i]['id_subject'] = data[i]['id'].toString() + ' ' + data[i]['subject'];
                  }

                  if (jQuery(textarea).is(':visible')) {
                    callback(data);
                  }
                  else {
                    // discard the results if the textarea is no longer visible,
                    // i.e. nobody cares for the results
                    callback([]);
                  }
                }
              });
          }
        },
        sorter: function(query:any, items:any, search_key:any) {
          return items; // we do not sort
        }
      }
    };
  }

  public enableTextareaAutoCompletion(textareas:JQuery, projectId:string|null) {
    textareas.each((i, textarea:HTMLElement) => {

      // only activate autocompleter for mentioniong users if the user is
      // in the context of a project and work package.
      if (projectId && projectId.length > 0) {
        jQuery(textarea).atwho(this.getAtWhoParametersMentionable('@', textarea, projectId));
        jQuery(textarea).atwho(this.getAtWhoParametersMentionable('user#', textarea, projectId));
      }

      jQuery(textarea).atwho(this.getAtWhoParametersWPID(textarea));
    });
  }
}
