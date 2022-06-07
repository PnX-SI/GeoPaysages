export type ObservatoryType = {
  id: number;
  is_published: boolean;
  ref: string;
  title: string;
  color: string;
  comparator: string;
  geom: any;
};

export type ObservatoryPostType = Pick<
  ObservatoryType,
  'is_published' | 'ref' | 'title' | 'color' | 'geom'
>;
export type ObservatoryPatchType = Partial<ObservatoryPostType>;
