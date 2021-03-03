import {
  Component,
  OnInit,
  Input,
  EventEmitter,
  Output,
  ElementRef,
} from '@angular/core';
import {
  FormControl,
  FormGroup,
  Validators,
} from '@angular/forms';
import {I18nService} from "core-app/modules/common/i18n/i18n.service";
import {BannersService} from "core-app/modules/common/enterprise/banners.service";
import {IOpOptionListOption} from "core-app/modules/common/option-list/option-list.component";
import {PrincipalType} from '../invite-user.component';

@Component({
  selector: 'op-ium-project-selection',
  templateUrl: './project-selection.component.html',
  styleUrls: ['./project-selection.component.sass'],
})
export class ProjectSelectionComponent implements OnInit {
  @Input() type:PrincipalType;
  @Input() project:any = null;

  @Output() close = new EventEmitter<void>();
  @Output() save = new EventEmitter<{project:any, type:string}>();

  public text = {
    title: this.I18n.t('js.invite_user_modal.title.invite'),
    project: {
      required: this.I18n.t('js.invite_user_modal.project.required'),
    },
    type: {
      required: this.I18n.t('js.invite_user_modal.type.required'),
    },
    nextButton: this.I18n.t('js.invite_user_modal.project.next_button'),
  };

  public typeOptions:IOpOptionListOption<string>[] = [
    {
      value: 'user',
      title: this.I18n.t('js.invite_user_modal.type.user.title'),
      description: this.I18n.t('js.invite_user_modal.type.user.description'),
    },
    {
      value: 'group',
      title: this.I18n.t('js.invite_user_modal.type.group.title'),
      description: this.I18n.t('js.invite_user_modal.type.group.description'),
    },
  ];

  projectAndTypeForm = new FormGroup({
    type: new FormControl(PrincipalType.User, [ Validators.required ]),
    project: new FormControl(null, [ Validators.required ]),
  });

  get typeControl() { return this.projectAndTypeForm.get('type'); }
  get projectControl() { return this.projectAndTypeForm.get('project'); }

  constructor(
    readonly I18n:I18nService,
    readonly elementRef:ElementRef,
    readonly bannersService:BannersService,
  ) {}

  ngOnInit() {
    this.typeControl?.setValue(this.type);
    this.projectControl?.setValue(this.project);

    this.typeOptions.push({
      value: 'placeholder',
      title: this.bannersService.eeShowBanners
        ? this.I18n.t('js.invite_user_modal.type.placeholder.title_no_ee')
        : this.I18n.t('js.invite_user_modal.type.placeholder.title'),
      description: this.bannersService.eeShowBanners
        ? this.I18n.t('js.invite_user_modal.type.placeholder.description_no_ee')
        : this.I18n.t('js.invite_user_modal.type.placeholder.description'),
      disabled: this.bannersService.eeShowBanners,
    });
  }

  onSubmit($e:Event) {
    $e.preventDefault();
    if (this.projectAndTypeForm.invalid) {
      this.projectAndTypeForm.markAllAsTouched();
      return;
    }

    this.save.emit({
      project: this.projectControl?.value,
      type: this.typeControl?.value,
    });
  }
}
