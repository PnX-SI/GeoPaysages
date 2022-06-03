export type ObservatoryType = {
  id: number;
  is_published: boolean;
  ref: string;
  title: string;
  color: string;
  comparator: string;
  geom: any;
};

export type ObservatoryPatchType = Partial<Omit<ObservatoryType, 'id'>>;
