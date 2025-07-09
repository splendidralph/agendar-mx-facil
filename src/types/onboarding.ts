
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
  whatsappPhone: string;
  username: string;
  // New three-tier location system (required for Step 4)
  city_id?: string;
  zone_id?: string;
  colonia?: string; // Made optional since we simplified location system
  // Legacy location fields (keep for migration compatibility)
  delegacion: string;
  delegacionId?: string;
  postalCode: string;
  groupLabel?: string;
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
