// src/app/pipes/dynamic-translate.pipe.ts
import { Pipe, PipeTransform } from '@angular/core';
import { TranslationService } from '../services/translation.service';

@Pipe({
  name: 'dynamicTranslate',
  pure: true
})
export class DynamicTranslatePipe implements PipeTransform {
  constructor(private translationService: TranslationService) {}

  transform(item: any, langId: string, methodName: string, property: string): string {

    if (this.translationService[methodName] && typeof this.translationService[methodName] === 'function') {
      return this.translationService[methodName](langId, item, property);
    }
    console.warn(`La méthode ${methodName} n'existe pas dans TranslationService`);
    return item[property] || '';
  }
}
