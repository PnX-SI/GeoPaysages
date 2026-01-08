
export const AppConstants = {
    DEFAULT_LANGUAGES: 'fr',
    LANGUAGES: ['fr', 'en'], // Liste des langues disponibles
    LANGUAGE_FILES: {
      fr: './assets/i18n/fr.json',
      en: './assets/i18n/en.json',
    },
  };
  
export const availableLangDB = [{
  id: 'fr',
  label: 'Français',
  is_default: true,
  is_published: false
},
{
  id: 'en',
  label: 'Anglais',
  is_default: false,
  is_published: true
}
]

export  const defaultLangDB = {langId: 'fr', langLabel: 'Français'} 

export const FormConstants = {
  mandatoryFieldsSite: ['name_site', 'desc_site', 'testim_site', 'legend_site', 'publish_site'],
  mandatoryFieldsObservatory: ['is_published', 'title']
}


export const formLabels = {
  site:{
    ref_site: 'Référence du site',
    code_city_site: 'Code de la ville',
    id_observatory: 'Observatoire',
    lng: 'Longitude',
    lat: 'Latitude',
    id_theme: 'Thème',
    id_stheme: 'Sous-thème',
    notice: 'Notice',
    main_theme_id: 'Thème principal',
    translations: {
      name_site: 'Nom du site',
      desc_site: 'Description',
      testim_site: 'Témoignages',
      legend_site: 'Légende',
      publish_site: 'Publication'
    }
  },
  observatory: {
    geom: 'Zonage',
    ref: 'Référence',
    color: 'Couleur de theme',
    logo: 'Logo',
    thumbnail: 'Vignette',
    translations: {
      is_published: 'Publication',
      title: 'Titre'
    }
  }
};