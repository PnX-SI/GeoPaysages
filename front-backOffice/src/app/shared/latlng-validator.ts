import { AbstractControl } from '@angular/forms';

export class LatlngValidator {

    static lat(control: AbstractControl) {
        const regEx = /^-?(?:90(?:(?:\.0{1,6})?)|(?:[0-9]|[1-8][0-9])(?:(?:\.[0-9]{1,6})?))$/;
        const valid = regEx.test(control.value);
        return valid ? null : { lat: true };
    }
    static lng(control: AbstractControl) {
        const regEx = /^-?(?:180(?:(?:\.0{1,6})?)|(?:[0-9]|[1-9][0-9]|1[1-7][0-9])(?:(?:\.[0-9]{1,6})?))$/;
        const valid = regEx.test(control.value);
        return valid ? null : { lng: true };
    }
}
