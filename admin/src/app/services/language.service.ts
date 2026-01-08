import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { BehaviorSubject, combineLatest, Observable, of, Subject } from 'rxjs';
import { catchError, map, tap } from 'rxjs/operators';
import { AppConstants } from '../constants/app.constants'; // AppConstants from '../constants/app.constants';
import { TranslateService } from '@ngx-translate/core';
import { Conf } from '../config';
import { Language, LanguagePatchType, LibLocales } from '../types';
@Injectable({
  providedIn: 'root',
})
export class LanguageService {
  private defaultLanguage = AppConstants.DEFAULT_LANGUAGES;
  private languages = AppConstants.LANGUAGES;
  private languageFiles = AppConstants.LANGUAGE_FILES;
  languagesDB:Language[] = [];


  constructor(private http: HttpClient, private translate: TranslateService) {
    this.setDefaultLanguage();
  }

  loadLibLocales(): Observable<LibLocales[]> {
    return this.http.get<any[]>(`${Conf.apiUrl}lib-locales`)
  }
  getAllLanguages(): Observable<Language[]> {
    return this.http.get<Language[]>(`${Conf.apiUrl}langs`);
  }

  getById(id) {
    console.log("id", id)
    return this.http.get<Language>(`${Conf.apiUrl}langs/${id}`);
  }

  post(data: Language) {
    return this.http.post<Language>(`${Conf.apiUrl}langs`, data);
  }

  patch(id, data: LanguagePatchType) {
    return this.http.patch<Language>(`${Conf.apiUrl}langs/${id}`, data);
  }

// Charge les langues triées et retourne une Promise
loadLanguagesSorted(): Promise<void> {
  return new Promise((resolve, reject) => {
    this.http.get<Language[]>(`${Conf.apiUrl}langs`).subscribe(
      (languages) => {
        this.languagesDB = languages.sort((a, b) => {
          if (a.is_default && !b.is_default) return -1;
          if (!a.is_default && b.is_default) return 1;
          return a.label.localeCompare(b.label);
        });
        resolve(); // Résolution de la Promise une fois `languagesDB` défini
      },
      (error) => {
        reject(error);
      }
    );
  });
}

// Récupère les langues triées
getLanguagesDB(): Language[] {
  return this.languagesDB;
}

// Récupère la langue par défaut
getDefaultLanguageDB(): Language | undefined {
  const defaultLanguage = this.languagesDB.find((language) => language.is_default);
  return defaultLanguage ? defaultLanguage : this.languagesDB[0];
}

  // Vérifie si le fichier de langue existe
  checkLanguageExists(language: string): Observable<boolean> {
    const filePath = this.languageFiles[language];
    return this.http.get(filePath).pipe(
      map(() => true),
      catchError(() => of(false)) // Si le fichier n'existe pas, retourne false
    );
  }

  // Récupère les langues disponibles
  getAvailableLanguages(): Observable<string[]> {
    const checks = this.languages.map(lang => this.checkLanguageExists(lang));
    return new Observable<string[]>(observer => {
      const results: string[] = [];
      let completedRequests = 0;

      checks.forEach((check, index) => {
        check.subscribe(exists => {
          if (exists) {
            results.push(this.languages[index]);
          }
          completedRequests++;
          if (completedRequests === checks.length) {
            observer.next(results);
            observer.complete();
          }
        });
      });
    });
  }


 getCurrentLang(): string {
    return this.translate.currentLang
 }
 // Récupère la langue préférée de l'utilisateur depuis le localStorage
 private getPreferredLanguage(): string {
    return localStorage.getItem('preferredLanguage');
  }

private setDefaultLanguage(): void {
    console.log("Setting default language...");
    // Définir la langue par défaut
    this.translate.setDefaultLang(this.defaultLanguage);

    // Obtenir la langue du navigateur
    const browserLang = navigator.language.split('-')[0]; // Extrait 'fr' de 'fr-FR'
    // Récupérer la langue préférée de l'utilisateur
    const preferredLang = this.getPreferredLanguage();

    // Vérifier si la langue du navigateur ou la langue préférée est supportée
    if (this.languages.includes(preferredLang)) {
      this.translate.use(preferredLang); // Utiliser la langue préférée
    } else if (this.languages.includes(browserLang)) {
      this.translate.use(browserLang); // Utiliser la langue du navigateur
    } else {
      this.translate.use(this.defaultLanguage); // Utiliser la langue par défaut si pas supportée
    }
  }

  // Change la langue et la stocke dans le localStorage
  changeLanguage(language: string): void {
    if (this.languages.includes(language)) {
      this.translate.use(language);
      localStorage.setItem('preferredLanguage', language); // Stocke la langue dans localStorage
    }
  }
}
