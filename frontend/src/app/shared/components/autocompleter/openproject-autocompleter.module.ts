import { NgModule } from "@angular/core";
import { OpenprojectModalModule } from "core-app/shared/components/modal/modal.module";
import { NgSelectModule } from "@ng-select/ng-select";
import { OpenprojectCommonModule } from "core-app/modules/common/openproject-common.module";
import { DraggableAutocompleteComponent } from "core-app/modules/common/draggable-autocomplete/draggable-autocomplete.component";
import { DynamicModule } from "ng-dynamic-component";
import { ColorsAutocompleter } from "core-app/shared/components/colors/colors-autocompleter.component";
import { WorkPackageAutocompleterComponent } from "core-app/shared/components/autocompleter/work-package-autocompleter/wp-autocompleter.component";
import { TimeEntryWorkPackageAutocompleterComponent } from "core-app/shared/components/autocompleter/te-work-package-autocompleter/te-work-package-autocompleter.component";
import { AutocompleteSelectDecorationComponent } from "core-app/shared/components/autocompleter/autocomplete-select-decoration/autocomplete-select-decoration.component";
import { VersionAutocompleterComponent } from "core-app/shared/components/autocompleter/version-autocompleter/version-autocompleter.component";
import { UserAutocompleterComponent } from "core-app/shared/components/autocompleter/user-autocompleter/user-autocompleter.component";
import { CommonModule } from "@angular/common";
import { OpenprojectInviteUserModalModule } from "core-app/features/invite-user-modal/invite-user-modal.module";
import { DragulaModule } from "ng2-dragula";
import {OpAutocompleterComponent} from "core-app/shared/components/autocompleter/op-autocompleter/op-autocompleter.component";
import {OpAutocompleterOptionTemplateDirective} from "core-app/shared/components/autocompleter/op-autocompleter/directives/op-autocompleter-option-template.directive";
import {OpAutocompleterLabelTemplateDirective} from "core-app/shared/components/autocompleter/op-autocompleter/directives/op-autocompleter-label-template.directive";
import {OpAutocompleterHeaderTemplateDirective} from "core-app/shared/components/autocompleter/op-autocompleter/directives/op-autocompleter-header-template.directive";
import { CreateAutocompleterComponent } from "core-app/shared/components/autocompleter/create-autocompleter/create-autocompleter.component";

export const OPENPROJECT_AUTOCOMPLETE_COMPONENTS = [
  CreateAutocompleterComponent,
  VersionAutocompleterComponent,
  WorkPackageAutocompleterComponent,
  TimeEntryWorkPackageAutocompleterComponent,
  DraggableAutocompleteComponent,
  UserAutocompleterComponent,
  ColorsAutocompleter,
  AutocompleteSelectDecorationComponent,
  OpAutocompleterComponent,
  OpAutocompleterOptionTemplateDirective,
  OpAutocompleterLabelTemplateDirective,
  OpAutocompleterHeaderTemplateDirective,
];

@NgModule({
  imports: [
    CommonModule,
    OpenprojectCommonModule,
    OpenprojectModalModule,
    OpenprojectInviteUserModalModule,
    NgSelectModule,
    DragulaModule,

    DynamicModule.withComponents(OPENPROJECT_AUTOCOMPLETE_COMPONENTS)
  ],
  exports: OPENPROJECT_AUTOCOMPLETE_COMPONENTS,
  declarations: OPENPROJECT_AUTOCOMPLETE_COMPONENTS
})
export class OpenprojectAutocompleterModule { }
