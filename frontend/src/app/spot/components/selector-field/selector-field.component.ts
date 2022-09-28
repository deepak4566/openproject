import {
  Component,
  ContentChild,
  HostBinding,
  Input,
  Optional,
} from '@angular/core';
import {
  AbstractControl,
  FormGroupDirective,
  NgControl,
} from '@angular/forms';

@Component({
  selector: 'spot-selector-field',
  templateUrl: './selector-field.component.html',
})
export class SpotSelectorFieldComponent {
  @HostBinding('class.spot-form-field') className = true;

  @HostBinding('class.spot-selector-field') classNameCheckbox = true;

  @HostBinding('class.spot-form-field_invalid') get errorClassName():boolean {
    return this.showErrorMessage;
  }

  @Input() label = '';

  @Input() reverseLabel = false;

  @Input() hidden = false;

  @Input() required = false;

  @Input() showValidationErrorOn:'change' | 'blur' | 'submit' | 'never' = 'submit';

  @Input() control?:AbstractControl;

  @Input() helpTextAttribute?:string;

  @Input() helpTextAttributeScope?:string;

  @ContentChild(NgControl) ngControl:NgControl;

  internalID = `spot-selector-field-${+new Date()}`;

  get errorsID():string {
    return `${this.internalID}-errors`;
  }

  get descriptionID():string {
    return `${this.internalID}-description`;
  }

  get describedByID():string {
    return this.showErrorMessage ? this.errorsID : this.descriptionID;
  }

  get formControl():AbstractControl|undefined|null {
    return this.ngControl?.control || this.control;
  }

  get showErrorMessage():boolean {
    if (!this.formControl) {
      return false;
    }

    if (this.showValidationErrorOn === 'submit') {
      return this.formControl.invalid && this.formGroupDirective?.submitted;
    } if (this.showValidationErrorOn === 'blur') {
      return this.formControl.invalid && this.formControl.touched;
    } if (this.showValidationErrorOn === 'change') {
      return this.formControl.invalid && this.formControl.dirty;
    }

    return false;
  }

  constructor(
    @Optional() private formGroupDirective:FormGroupDirective,
  ) {}
}
