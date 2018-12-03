import { AbstractControl } from '@angular/forms';

export class LatlngValidator {

    static lat(control: AbstractControl) {
        const regEx = /^-?([1-8]?[0-9]\.{1}\d{1,6}$|90\.{1}0{1,6}$)/;
        const valid = regEx.test(control.value);
        return valid ? null : { lat: true };
    }
    static lng(control: AbstractControl) {
        const regEx = /^-?([1]?[1-7][1-9]|[1]?[1-8][0]|[1-9]?[0-9])\.{1}\d{1,6}/;
        const valid = regEx.test(control.value);
        return valid ? null : { lng: true };
    }
}
