
import { Database } from '@/integrations/supabase/types';

export type ServiceCategory = Database['public']['Enums']['service_category'];

export interface Service {
  name: string;
  price: number;
  duration: number;
  description: string;
  category: ServiceCategory; // Keep for backward compatibility
  mainCategoryId?: string;
  subcategoryId?: string;
}
