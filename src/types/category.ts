export interface MainCategory {
  id: string;
  name: string;
  display_name: string;
  description?: string;
  icon?: string;
  sort_order: number;
  is_active: boolean;
  created_at: string;
  updated_at: string;
}

export interface Subcategory {
  id: string;
  main_category_id: string;
  name: string;
  display_name: string;
  description?: string;
  icon?: string;
  sort_order: number;
  is_active: boolean;
  created_at: string;
  updated_at: string;
}

export interface CategorySelection {
  mainCategory?: MainCategory;
  subcategory?: Subcategory;
}