import {
  Component,
  Input,
  EventEmitter,
  Output,
  ElementRef,
} from '@angular/core';
import { Observable, of } from 'rxjs';
import { mapTo, switchMap } from 'rxjs/operators';
import { I18nService } from 'core-app/core/i18n/i18n.service';
import { ApiV3Service } from 'core-app/core/apiv3/api-v3.service';
import { RoleResource } from 'core-app/features/hal/resources/role-resource';
import { PrincipalData } from 'core-app/shared/components/principal/principal-types';
import { HalResource } from 'core-app/features/hal/resources/hal-resource';
import { ProjectResource } from 'core-app/features/hal/resources/project-resource';
import { PrincipalType } from '../invite-user.component';

@Component({
  selector: 'op-ium-summary',
  templateUrl: './summary.component.html',
  styleUrls: ['./summary.component.sass'],
})
export class SummaryComponent {
  @Input() type:PrincipalType;

  @Input() project:ProjectResource;

  @Input() role:RoleResource;

  @Input() principalData:PrincipalData;

  @Input() message = '';

  @Output() close = new EventEmitter<void>();

  @Output() back = new EventEmitter<void>();

  @Output() save = new EventEmitter();

  public PrincipalType = PrincipalType;

  public text = {
    title: () => this.I18n.t('js.invite_user_modal.title.invite'),
    projectLabel: this.I18n.t('js.invite_user_modal.project.label'),
    principalLabel: {
      User: this.I18n.t('js.invite_user_modal.principal.label.name_or_email'),
      PlaceholderUser: this.I18n.t('js.invite_user_modal.principal.label.name'),
      Group: this.I18n.t('js.invite_user_modal.principal.label.name'),
    },
    roleLabel: () => this.I18n.t('js.invite_user_modal.role.label', {
      project: this.project?.name,
    }),
    messageLabel: this.I18n.t('js.invite_user_modal.message.label'),
    backButton: this.I18n.t('js.invite_user_modal.back'),
    nextButton: () => this.I18n.t('js.invite_user_modal.summary.next_button', {
      type: this.type,
      principal: this.principal,
    }),
  };

  public get principal() {
    return this.principalData.principal;
  }

  constructor(
    readonly I18n:I18nService,
    readonly elementRef:ElementRef,
    readonly api:ApiV3Service,
  ) { }

  invite() {
    return of(this.principalData)
      .pipe(
        switchMap((principalData:PrincipalData) => this.createPrincipal(principalData)),
        switchMap((principal:HalResource) => this.api.memberships
          .post({
            principal,
            project: this.project,
            roles: [this.role],
            notificationMessage: {
              raw: this.message,
            },
          })
          .pipe(
            mapTo(principal),
          )),
      );
  }

  private createPrincipal(principalData:PrincipalData):Observable<HalResource> {
    const { principal, customFields } = principalData;
    if (principal instanceof HalResource) {
      return of(principal);
    }

    switch (this.type) {
      case PrincipalType.User:
        return this.api.users.post({
          email: principal!.name,
          status: 'invited',
          ...customFields,
        });
      case PrincipalType.Placeholder:
        return this.api.placeholder_users.post({ name: principal!.name });
      default:
        throw new Error('Unsupported PrincipalType given');
    }
  }

  onSubmit($e:Event) {
    $e.preventDefault();

    this
      .invite()
      .subscribe((principal) => this.save.emit({ principal }));
  }
}
