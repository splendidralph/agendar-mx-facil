export interface City {
  id: string;
  name: string;
  state: string;
  is_active: boolean;
  sort_order: number;
  created_at: string;
  updated_at: string;
}

export interface Zone {
  id: string;
  city_id: string;
  name: string;
  display_name: string;
  description?: string;
  is_active: boolean;
  sort_order: number;
  created_at: string;
  updated_at: string;
}

export interface Location {
  id: string;
  city_id?: string;
  zone_id?: string;
  name: string;
  colonia?: string;
  city: string;
  state: string;
  postal_code?: string;
  latitude?: number;
  longitude?: number;
  professional_count?: number;
}

export interface LocationSelection {
  city?: City;
  zone?: Zone;
  location?: Location;
}