
import { Database } from '@/integrations/supabase/types';

export type ServiceCategory = Database['public']['Enums']['service_category'];

export interface OnboardingData {
  step: number;
  businessName: string;
  category: string;
  bio: string;
  address: string;
  instagramHandle: string;
  username: string;
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
  category: ServiceCategory;
}
