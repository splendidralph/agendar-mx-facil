
import { Database } from '@/integrations/supabase/types';
import { MainCategory, Subcategory } from './category';

export type ServiceCategory = Database['public']['Enums']['service_category'];

export interface OnboardingData {
  step: number;
  businessName: string;
  category: string; // Keep for backward compatibility during migration
  mainCategory?: MainCategory;
  subcategory?: Subcategory;
  bio: string;
  address: string;
  instagramHandle: string;
  whatsappPhone: string;
  username: string;
  // Location hierarchy data
  delegacion: string;
  delegacionId?: string;
  colonia: string;
  postalCode: string;
  groupLabel?: string;
  // New three-tier location system
  city_id?: string;
  zone_id?: string;
  latitude?: number;
  longitude?: number;
  serviceRadiusKm: number;
  prefersLocalClients: boolean;
  services: Array<{
    name: string;
    price: number;
    duration: number;
    description: string;
    category: ServiceCategory;
  }>;
}

export interface OnboardingService {
  name: string;
  price: number;
  duration: number;
  description: string;
  category: ServiceCategory; // Keep for backward compatibility
  mainCategoryId?: string;
  subcategoryId?: string;
}
