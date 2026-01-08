// src/app/services/translation.service.ts
import { Injectable } from '@angular/core';
import { defaultLangDB } from '../constants/app.constants';

@Injectable({
  providedIn: 'root'
})
export class TranslationService {
  defaultLang = defaultLangDB
  
  getTranslation(langId: string, obj: any, property: string) {
    const translation = obj.translations.find(translation => translation.lang_id === langId);
    if (translation) {
      return translation[property];
    }
    // Si aucune traduction, retourner une chaîne vide ou undefined si la propriété n'existe pas
    return '';
  }
}
