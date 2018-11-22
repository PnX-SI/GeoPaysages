import { Directive, Self, SkipSelf, Host } from '@angular/core';
import { NgControl, FormGroupDirective } from '@angular/forms';

@Directive({
  // tslint:disable-next-line:directive-selector
  selector: '[InputFeedBack]',
  // tslint:disable-next-line:use-host-property-decorator
  host: {
    '[class.is-invalid]': 'isInvalid'
  }
})
export class InputFeedBackDirective {

  constructor(
    @Host() @SkipSelf() private form: FormGroupDirective,
    @Self() private control: NgControl
  ) {
  }

  get isInvalid() {
    return this.control.invalid && (this.form.submitted);
  }

}
