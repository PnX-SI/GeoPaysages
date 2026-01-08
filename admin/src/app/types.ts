export enum GroupName {
  ADMIN = 'admin',
  CONTRIBUTOR = 'contributor',
}

export const GROUP_NAMES: GroupName[] = [
  GroupName.CONTRIBUTOR,
  GroupName.ADMIN,
];

export type User = {
  id_role: number;
  id_droit_max: number;
  id_organisme: number;
  identifiant: string;
  nom_role: string;
  prenom_role: string;
}

export type CorRole = {
  id_role: number;
  id_observatory?: number;
  group_name: GroupName;
};

export type ObservatoryType = {
  id: number;
  ref: string;
  color: string;
  thumbnail: string;
  logo: string;
  comparator: string;
  geom: any;
  translations: {
    lang_id: string;
    is_published: boolean;
    title: string;
  }[];
  cor_roles?: CorRole[];
};

export type ObservatoryPostType = Pick<
  ObservatoryType,
  'ref' | 'color' | 'geom'
> & {
  is_published?: boolean;
  title?: string;
  translations?: {
    lang_id: string;
    is_published: boolean;
    title: string;
  }[];
};

// Type pour le patch qui est une version partielle de ObservatoryPostType
export type ObservatoryPatchType = Partial<ObservatoryPostType> & {
  translations?: {
    lang_id: string;
    is_published: boolean;
    title: string;
  }[];
};

export type ObservatoryPatchImageType = {
  filename: string;
};

export interface Language {
  id: string;
  label: string;
  is_default: boolean;
  is_published: boolean;
}

export type LanguagePatchType = {
  label: string;
  is_default: boolean;
  is_published: boolean;
};

export type LibLocales = {
  id: string;
  language: string;
  displayLabel: string;
};
