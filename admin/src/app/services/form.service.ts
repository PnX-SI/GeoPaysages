import { Injectable } from '@angular/core';
import { FormGroup, FormBuilder, Validators, AbstractControl, FormArray, ValidatorFn, ValidationErrors } from '@angular/forms';
import { LatlngValidator } from '../shared/latlng-validator';
import { Language } from '../types';
import { LanguageService } from './language.service';

@Injectable()
export class FormService {
  public disabled = true;
  private availableLangDB:Language[]
  constructor(private _fb: FormBuilder, private languageService: LanguageService) {
    this.availableLangDB = this.languageService.getLanguagesDB();
  }

  initFormlanguage(): FormGroup {
    const formLanguage = this._fb.group({
      id: [
        null,
        [
          Validators.required
        ]
      ],
      label: [
        null,
        [Validators.required]
      ],
      is_default: [false],
      is_published: [false],
    });
    return formLanguage;
  }
  

  initFormObservatory(availableLang:Language[]): FormGroup {
    const formSite = this._fb.group({
      ref: [null],
      color: [null],
      geom: [null],
    });
    const translations = this._fb.group({});
    availableLang.forEach(lang => {
    translations.addControl(lang.id, this._fb.group({
      title: [null],
      is_published: [false],
    }));
  });

  // Ajout du FormGroup des traductions au FormGroup principal
  formSite.addControl('translations', translations);
   // Subscribe to changes on general fields as well
   formSite.valueChanges.subscribe(() => {
     this.applyConditionalValidators(formSite, this.availableLangDB, 'is_published', ['title']);
  });
  
    return formSite;
  }

  initFormSite(availableLang): FormGroup {
    console.log("INSIDE INIT FORM SITE", "availableLang", availableLang);
    const formSite = this._fb.group({
      ref_site: [null],
      code_city_site: [null, Validators.required],
      id_observatory: [null, Validators.required],
      lng: [null, { validators: LatlngValidator.lng, updateOn: 'blur' }],
      lat: [null, { validators: LatlngValidator.lat, updateOn: 'blur' }],
      id_theme: [null, Validators.required],
      id_stheme: [null, Validators.required],
      notice: [null],
      main_theme_id: [null],
    });
  // Champs traductibles pour chaque langue
  const translations = this._fb.group({});
  availableLang.forEach(lang => {
    translations.addControl(lang.id, this._fb.group({
      name_site: [null],
      desc_site: [null],
      testim_site: [null],
      legend_site: [null],
      publish_site: [false]
    }));
  });

  // Ajout du FormGroup des traductions au FormGroup principal
  formSite.addControl('translations', translations);
   // Subscribe to changes on general fields as well
   formSite.valueChanges.subscribe(() => {
    this.applyConditionalValidators(formSite,this.availableLangDB, 'publish_site', ['name_site', 'legend_site']);
  });
    return formSite;
  }

  initFormPhoto(): FormGroup {
    const formPhoto = this._fb.group({
      id_role: [null],
      display_gal_photo: [false, Validators.required],
      id_licence_photo: [null],
      date_photo: [null],
      // legende_photo: [null],
      filter_date: [null, Validators.required],
      photo_file: [null],
      main_photo: [null],
    });
    return formPhoto;
  }

  applyConditionalValidators(
    formGroup: FormGroup,
    availableLang: Language[],
    conditionalProperty: string,
    fieldsToValidate: string[]
  ) {
    const setOrClearValidators = (control: AbstractControl | null, required: boolean) => {
      if (control) {
        required ? control.setValidators(Validators.required) : control.clearValidators();
        control.updateValueAndValidity({ onlySelf: true });
      }
    };
  
    availableLang.forEach(lang => {
      const conditionalControl = formGroup.get(['translations', lang.id, conditionalProperty]);
      const isRequired = conditionalControl && conditionalControl.value === true;
      fieldsToValidate.forEach(field => {
        const fieldControl = formGroup.get(['translations', lang.id, field]);
        setOrClearValidators(fieldControl, isRequired);
  
        // Appliquer le validateur conditionnel si nécessaire
        if (isRequired) {
          if (fieldControl) {
            fieldControl.setValidators(this.conditionalRequiredValidator(conditionalProperty));
          }
        } else {
          if (fieldControl) {
            fieldControl.clearValidators();
          }
        }
  
        // Mettre à jour la validité du champ après avoir modifié les validateurs
        if (fieldControl) {
          fieldControl.updateValueAndValidity({ onlySelf: true });
        }
      });
    });
  }
  
  
  
  
  
  createTranslationsObject(formValue, availableLang, properties) {
    const translations = [];
    // Parcours des langues disponibles
    availableLang.forEach(lang => {
        const langId = lang.id; // Identifier la langue
        const translationGroup = formValue['translations'][langId]; // Accéder au groupe de traductions
        // Vérification si translationGroup est défini avant d'accéder aux valeurs
        const translationObject = { lang_id: langId };

        // Récupération des propriétés spécifiées dynamiquement
        properties.forEach(property => {
            translationObject[property] = translationGroup[property];
        });

        // Ajout de l'objet de traduction au tableau
        translations.push(translationObject);
    });
    return translations;
}

generateErrorMessage(formGroup: FormGroup | FormArray, path: string[] = [], formLabels): string {
  console.log("formLabels", formLabels)
  const errorMessages = [];
 // Liste des identifiants de langue, pour pouvoir les ignorer
  const langIds = this.availableLangDB.map(lang => lang.id);
  // Fonction pour obtenir le label et la langue
  const getLabel = (path: string[]): string => {
    let labelObj = formLabels;
    for (const key of path) {
      if (langIds.includes(key)) continue; 
      if (labelObj && typeof labelObj === 'object') {
        labelObj = labelObj[key];
      }
    }
    return typeof labelObj === 'string' ? labelObj : path[path.length - 1];
  };

  // Fonction pour obtenir le nom de la langue
  const getLangName = (langId: string): string | undefined => {
    console.log("langId", langId)
    const lang = this.availableLangDB.find(lang => lang.id === langId);
    return lang ? lang.label : undefined;
  };
  console.log("formGroup", formGroup)
  // Parcours des contrôles pour identifier ceux qui sont invalides
  Object.keys(formGroup.controls).forEach(controlName => {
    const control = formGroup.get(controlName);
    const currentPath = [...path, controlName];
    console.log("currentPath", currentPath)
    if (control instanceof FormGroup || control instanceof FormArray) {
      console.log("control instanceof FormGroup", control)
      // Appel récursif pour les sous-groupes
      const subMessages = this.generateErrorMessage(control, currentPath, formLabels);
      if (subMessages) {
        errorMessages.push(subMessages);
      }
    } else if (control && control.invalid && (control.dirty || control.touched)) {
      console.log("control", control)
      // Récupère le label et ajoute la langue si nécessaire
      const label = getLabel(currentPath);
      const langId = path.includes('translations') ? path[path.length - 1] : null;
      const langName = langId ? getLangName(langId) : null;

      // Construction du message d'erreur avec langue
      let errorMessage = `Le champ "${label}"`;
      if (langName) {
        errorMessage += ` (Langue: ${langName})`;
      }
      errorMessage += ' est requis.';

      // Ajout du message d'erreur formaté
      if (control.hasError('required')) {
        errorMessages.push(errorMessage);
      }
      if (control.hasError('email')) {
        errorMessages.push(`Le champ "${label}" doit être un email valide${langName ? ` (Langue: ${langName})` : ''}.`);
      }
      if (control.hasError('pattern')) {
        errorMessages.push(`Le champ "${label}" n'est pas valide${langName ? ` (Langue: ${langName})` : ''}.`);
      }
    }
  });

  return errorMessages.join('\n');
}

conditionalRequiredValidator(conditionControlName: string) {
  return function (control: AbstractControl) {
    // Vérifie si le parent existe avant d'appeler .get
    var conditionControl = control.parent ? control.parent.get(conditionControlName) : null;

    // Vérifie la valeur du contrôle de condition
    if (conditionControl && conditionControl.value === true && !control.value) {
      return { required: true }; // Renvoie une erreur si la condition est remplie
    }

    return null; // Retourne null si aucune erreur
  };
}

checkAllControlStatuses(formGroup: FormGroup, parentName: string = ''): boolean {
  let isValid = true;

  // Utiliser Object.keys et every pour évaluer la validité de chaque contrôle
  isValid = Object.keys(formGroup.controls).every(controlName => {
    const control = formGroup.get(controlName);
    const fullControlName = parentName ? `${parentName}.${controlName}` : controlName;

    if (control instanceof FormGroup) {
      // Si le contrôle est un FormGroup, appelez récursivement pour vérifier ses enfants
      return this.checkAllControlStatuses(control, fullControlName);
    } else {
      // Vérifiez le statut du contrôle
      if (control.invalid) {
        return false; // Retourne false si le contrôle est invalide
      } else {
        return true; // Retourne true si le contrôle est valide
      }
    }
  });

  return isValid; // Retourne true si tous les contrôles sont valides, sinon false
}

MinMaxLengthValidator(minLength: number, maxLength: number): ValidatorFn {
  return (control: AbstractControl): ValidationErrors | null => {
    if (!control.value) {
      return null; // Le contrôle est vide, ce qui est géré par le validateur 'required'
    }

    const length = control.value.length;
    if (length < minLength || length > maxLength) {
      return { minMaxLength: { requiredLength: `${minLength}-${maxLength}`, actualLength: length } };
    }
    return null;
  };
}

}
