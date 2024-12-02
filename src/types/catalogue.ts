export interface Category {
  id: string;
  name: string;
  description: string;
  icon: string;
  slug: string;
  order: number;
  moduleId: string;
}

export interface CatalogueModule {
  id: string;
  name: string;
  description: string;
  icon: string;
  href: string;
  color: 'blue' | 'green';
  isEnabled: boolean;
  order: number;
  categories: Category[];
}