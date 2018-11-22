import { Component, Input, Host, SkipSelf } from '@angular/core';
import { FormGroupDirective } from '@angular/forms';

@Component({
  selector: 'app-form-error',
  templateUrl: './form-error.component.html'
})

export class FormErrorComponent {
  @Input() controlName: string;
  @Input() errorKey: string;

  constructor(
    @Host() @SkipSelf() private form: FormGroupDirective
  ) {
  }

  get isInvalid() {
    const control = this.form.form.get(this.controlName);
    return control.hasError(this.errorKey) && (control.dirty || this.form.submitted);
  }

  get error_msg() {
    if (this.controlName === 'login') {
      if (this.errorKey === 'login') {
        return 'Identifant incorrect';
      } else if (this.errorKey === 'required') {
        return 'Ce champs est requis';
      }
    } else if (this.controlName === 'password') {
      if (this.errorKey === 'password') {
        return 'Mot de passe incorrect';
      } else if (this.errorKey === 'required') {
        return 'Ce champs est requis';
      }
    }

  }
}
