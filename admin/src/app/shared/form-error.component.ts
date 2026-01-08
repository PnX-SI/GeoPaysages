import { Component, Input, Host, SkipSelf } from '@angular/core';
import { FormArray, FormGroup, FormGroupDirective } from '@angular/forms';

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
    // Utilise la fonction récursive pour vérifier si ce contrôle et ses sous-contrôles contiennent des erreurs
    const control = this.form.form.get(this.controlName);

    if (control instanceof FormGroup || control instanceof FormArray) {
      // Vérifie récursivement tous les contrôles à l'intérieur du FormGroup ou FormArray
      return this.checkAllControlsInvalid(control, this.errorKey);
    } else {
      // Si c'est un contrôle unique, vérifie l'erreur directement
      return control && control.hasError(this.errorKey) && (control.dirty || this.form.submitted);
    }
  }

  get error_msg() {
    if (this.controlName === 'login') {
      if (this.errorKey === 'login') {
        return 'Identifant incorrect';
      } else if (this.errorKey === 'required') {
        return '* Champs requis';
      }
    }
    if (this.controlName === 'password') {
      if (this.errorKey === 'password') {
        return 'Mot de passe incorrect';
      } else if (this.errorKey === 'required') {
        return '* Champs requis';
      }
    }
    if (this.controlName === 'lat') {
      if (this.errorKey === 'lat') {
        return 'Entrer une latitude valide';
      } else if (this.errorKey === 'required') {
        return '* Champs requis';
      }
    }
    if (this.controlName === 'lng') {
      if (this.errorKey === 'lng') {
        return 'Entrer une longitude valide';
      } else if (this.errorKey === 'required') {
        return '* Champs requis';
      }
    }
    return '* Champs requis';

  }

  checkAllControlsInvalid(formGroup: FormGroup | FormArray, errorKey: string): boolean {
    let isInvalid = false;
  
    Object.keys(formGroup.controls).forEach(controlName => {
      const control = formGroup.get(controlName);
  
      if (control instanceof FormGroup || control instanceof FormArray) {
        if (this.checkAllControlsInvalid(control, errorKey)) {
          isInvalid = true;
        }
      } else if (control && control.hasError(errorKey) && (control.dirty || control.touched)) {
        isInvalid = true;
      }
    });
  
    return isInvalid;
  }
}
