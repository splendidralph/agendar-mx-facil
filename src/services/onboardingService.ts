
import { supabase } from '@/integrations/supabase/client';
import { OnboardingData, ServiceCategory } from '@/types/onboarding';
import { sanitizeInput } from '@/utils/securityValidation';

// Enhanced UUID sanitization function - more aggressive
const sanitizeUUID = (value: any): string | null => {
  // Handle all falsy values and common string representations of empty
  if (!value || 
      value === '' || 
      value === 'undefined' || 
      value === 'null' ||
      value === 'NULL' ||
      (typeof value === 'string' && value.trim() === '')) {
    console.log('[UUID_SANITIZE] Converting to null:', value);
    return null;
  }
  
  const result = typeof value === 'string' ? value.trim() : value;
  console.log('[UUID_SANITIZE] Sanitized UUID:', value, '->', result);
  return result;
};

// Enhanced phone sanitization to ensure proper format
const sanitizePhone = (phone: any): string | null => {
  if (!phone || typeof phone !== 'string') return null;
  const trimmed = phone.trim();
  if (trimmed === '') return null;
  
  // Ensure phone starts with + for international format
  if (trimmed && !trimmed.startsWith('+')) {
    console.warn('Phone number missing country code, this should not happen with new phone input');
    return `+52${trimmed}`; // Default to Mexico if somehow missing
  }
  
  return trimmed;
};

export const loadProviderData = async (userId: string) => {
  try {
    console.log('onboardingService: Fetching provider data for user:', userId);
    const { data: provider, error } = await supabase
      .from('providers')
      .select(`
        *,
        main_categories:main_category_id(*),
        subcategories:subcategory_id(*)
      `)
      .eq('user_id', userId)
      .single();

    if (error && error.code !== 'PGRST116') {
      console.error('Error loading provider data:', error);
      return null;
    }

    if (provider) {
      console.log('onboardingService: Found existing provider data:', provider);
      
      // Load services if they exist
      const { data: services } = await supabase
        .from('services')
        .select(`
          *,
          main_categories:main_category_id(*),
          subcategories:subcategory_id(*)
        `)
        .eq('provider_id', provider.id);

      return {
        provider,
        services: services || []
      };
    }

    console.log('onboardingService: No existing provider data found');
    return null;
  } catch (error) {
    console.error('Error loading onboarding data:', error);
    return null;
  }
};

export const saveProviderData = async (userId: string, data: OnboardingData, currentStep: number) => {
  try {
    console.log('onboardingService: Saving provider data for user:', userId, 'step:', currentStep, 'data:', {
      businessName: data.businessName,
      category: data.category,
      username: data.username,
      whatsappPhone: data.whatsappPhone ? '***' : 'empty',
      hasServices: data.services?.length || 0
    });
    
    // First, verify the user exists in our database
    const { data: userData, error: userError } = await supabase
      .from('users')
      .select('id')
      .eq('id', userId)
      .maybeSingle();

    if (userError) {
      console.error('onboardingService: Error checking user existence:', userError);
      throw new Error('Error verificando la cuenta de usuario');
    }

    if (!userData) {
      console.error('onboardingService: User not found in database:', userId);
      throw new Error('INVALID_SESSION'); // Special error code for handling
    }
    
    // Check if provider exists
    const { data: existingProvider, error: fetchError } = await supabase
      .from('providers')
      .select('id, username')
      .eq('user_id', userId)
      .maybeSingle();

    if (fetchError) {
      console.error('onboardingService: Error fetching provider:', fetchError);
      throw new Error(`Error verificando proveedor existente: ${fetchError.message}`);
    }

    let providerId = existingProvider?.id;

    // Prepare provider data - allow null values during onboarding
    // Populate legacy category field from main category only (no subcategory)
    let categoryName = null;
    if (data.mainCategory?.display_name) {
      categoryName = data.mainCategory.display_name;
    } else if (data.category?.trim()) {
      categoryName = data.category.trim();
    }

const providerData: any = {
  user_id: userId,
  business_name: data.businessName ? sanitizeInput(data.businessName).trim() || null : null,
  category: categoryName, // Keep for backward compatibility
  main_category_id: sanitizeUUID(data.mainCategory?.id),
  subcategory_id: null, // No subcategory in 4-step flow
  bio: data.bio ? sanitizeInput(data.bio).trim() || null : null,
  address: data.address ? sanitizeInput(data.address).trim() || null : null,
  whatsapp_phone: sanitizePhone(data.whatsappPhone),
  // Enhanced UUID sanitization for location fields with additional logging
  city_id: sanitizeUUID(data.city_id),
  zone_id: sanitizeUUID(data.zone_id),
  colonia: data.colonia?.trim() || null,
  postal_code: data.postalCode?.trim() || null,
  // CRITICAL FIX: REMOVED non-existent columns (delegacion, delegacionId)
  latitude: data.latitude || null,
  longitude: data.longitude || null,
  service_radius_km: data.serviceRadiusKm || 5,
  prefers_local_clients: data.prefersLocalClients !== false,
  onboarding_step: currentStep,
  profile_completed: false // Keep false during onboarding
};

    // Only include username if it's provided and not empty
    if (data.username && data.username.trim()) {
      providerData.username = data.username.trim();
    }

    if (!existingProvider) {
      console.log('onboardingService: Creating new provider');
      
      const { data: newProvider, error: createError } = await supabase
        .from('providers')
        .insert(providerData)
        .select('id')
        .single();

      if (createError) {
        console.error('onboardingService: Error creating provider:', createError);
        
        // Provide specific error handling for common constraint violations
        if (createError.message.includes('providers_username_key')) {
          throw new Error('Este nombre de usuario ya está en uso. Por favor, elige otro.');
        } else if (createError.message.includes('Username must be')) {
          throw new Error('El formato del nombre de usuario no es válido. Solo letras, números, guiones y guiones bajos.');
        } else if (createError.message.includes('Invalid WhatsApp')) {
          throw new Error('El formato del número de WhatsApp no es válido.');
        } else if (createError.code === '23505') { // Unique constraint violation
          throw new Error('Ya existe un proveedor con estos datos. Verifica la información.');
        } 
        
        // CRITICAL FIX: Explicitly handle NOT NULL violation (23502) - Now correctly diagnosable
        else if (createError.code === '23502') { 
          const columnNameMatch = createError.message.match(/column "(.*?)"/);
          const columnName = columnNameMatch ? columnNameMatch[1] : 'a required field';
          console.error(`Postgres NOT NULL violation on column: ${columnName}`);
          
          let userMessage = 'Error: A mandatory field is missing in the first step.';
          if (columnName === 'business_name') {
             userMessage = 'Your business name is mandatory.';
          } else if (columnName === 'main_category_id' || columnName === 'category') {
             userMessage = 'The main category is mandatory.';
          } else if (columnName === 'user_id') {
             userMessage = 'Session Error: Please log out and try again.';
          } else if (columnName === 'username') {
             userMessage = 'The username is mandatory.';
          }

          // Throw specific user message prefixed with diagnostic code
          throw new Error(`DB_MISSING_FIELD: ${userMessage}`);
        }
        
        // CRITICAL FIX: Explicitly handle FOREIGN KEY violation (23503)
        else if (createError.code === '23503') { 
          console.error('Postgres FOREIGN KEY violation:', createError.message);
          
          if (createError.message.includes('main_category_id')) {
            throw new Error('DB_INVALID_CATEGORY: The selected category is invalid. Please select one from the list.');
          }
          
          throw new Error(`DB_FOREIGN_KEY_ERROR: Data error relating information. SQL Code: ${createError.code}`);
        }
        
        else {
          // FINAL FALLBACK: If error is not handled, throw the specific SQL code for full diagnosis
          console.error(`[UNHANDLED_DB_ERROR] CODE: ${createError.code} MESSAGE: ${createError.message}`);
          throw new Error(`DB_GENERIC_ERROR (Creation - ${createError.code}): ${createError.message}`);
        }
      }
      
      providerId = newProvider.id;
      console.log('onboardingService: Created new provider with ID:', providerId);
    } else {
      console.log('onboardingService: Updating existing provider with ID:', providerId);
      
      // Only update username if it's different from existing and not empty
      if (data.username && data.username.trim() && data.username.trim() !== existingProvider.username) {
        // Username is changing, keep it in the update
      } else {
        // Remove username from update to avoid conflicts
        delete providerData.username;
      }

      const { error: updateError } = await supabase
        .from('providers')
        .update(providerData)
        .eq('user_id', userId);

      if (updateError) {
        console.error('onboardingService: Error updating provider:', updateError);
        
        // Provide specific error handling for common constraint violations
        if (updateError.message.includes('providers_username_key')) {
          throw new Error('Este nombre de usuario ya está en uso. Por favor, elige otro.');
        } else if (updateError.message.includes('Username must be')) {
          throw new Error('El formato del nombre de usuario no es válido. Solo letras, números, guiones y guiones bajos.');
        } else if (updateError.message.includes('Invalid WhatsApp')) {
          throw new Error('El formato del número de WhatsApp no es válido.');
        } 
        
        // CRITICAL FIX: Explicitly handle NOT NULL violation (23502) for UPDATE
        else if (updateError.code === '23502') {
          const columnNameMatch = updateError.message.match(/column "(.*?)"/);
          const columnName = columnNameMatch ? columnNameMatch[1] : 'a required field';
          console.error(`Postgres NOT NULL violation on column: ${columnName}`);
          
          throw new Error(`DB_UPDATE_MISSING_FIELD: The mandatory field is missing: ${columnName}.`);
        }
        
        else {
          console.error(`[UNHANDLED_DB_ERROR] CODE: ${updateError.code} MESSAGE: ${updateError.message}`);
          throw new Error(`DB_GENERIC_ERROR (Update - ${updateError.code}): ${updateError.message}`);
        }
      }
    }

    console.log('onboardingService: Successfully saved provider data');
    return providerId;
  } catch (error) {
    console.error('onboardingService: Error saving provider data:', error);
    
    // Handle special case of invalid session
    if (error.message === 'INVALID_SESSION') {
      throw new Error('Tu sesión ha expirado. Por favor, inicia sesión nuevamente.');
    }
    
    // Re-throw specific diagnostic errors or user-friendly messages
    if (error instanceof Error && error.message.includes('DB_')) {
      throw new Error(error.message);
    }
    
    // Otherwise, provide a generic error message
    throw new Error(`Error saving provider data: ${error.message || 'Unknown Error'}`);
  }
};

export const saveServices = async (
  providerId: string, 
  services: any[], 
  categoryData?: { mainCategoryId?: string; subcategoryId?: string }
) => {
  try {
    console.log('onboardingService: Saving services for provider:', providerId, {
      servicesCount: services.length,
      categoryData
    });
    
    // Delete existing services
    await supabase
      .from('services')
      .delete()
      .eq('provider_id', providerId);

    // Insert new services with main category only (no subcategory)
    const servicesToInsert = services.map(service => ({
      provider_id: providerId,
      name: service.name,
      price: service.price,
      duration_minutes: service.duration,
      description: service.description,
      category: service.category as ServiceCategory, // Keep for backward compatibility
      main_category_id: service.mainCategoryId || categoryData?.mainCategoryId || null,
      subcategory_id: null, // No subcategory in 4-step flow
      is_active: true
    }));

    const { error: servicesError } = await supabase
      .from('services')
      .insert(servicesToInsert);

    if (servicesError) {
      console.error('onboardingService: Error saving services:', servicesError);
      throw servicesError;
    }
    
    console.log('onboardingService: Successfully saved services');
  } catch (error) {
    console.error('Error saving services:', error);
    throw error;
  }
};

export const updateProviderStep = async (userId: string, step: number) => {
  try {
    const { error } = await supabase
      .from('providers')
      .update({ onboarding_step: step })
      .eq('user_id', userId);
      
    if (error) {
      console.error('onboardingService: Error updating step in database:', error);
      throw error;
    }
  } catch (error) {
    console.error('onboardingService: Error updating step:', error);
    throw error;
  }
};

export const completeProviderOnboarding = async (userId: string) => {
  try {
    console.log('completeProviderOnboarding: Starting for user:', userId);
    
    // Enhanced UUID sanitization function for defensive programming
    const sanitizeUUIDDefensive = (value: any): string | null => {
      if (!value || 
          value === '' || 
          value === 'undefined' || 
          value === 'null' ||
          value === 'NULL' ||
          (typeof value === 'string' && value.trim() === '')) {
        console.log('[DEFENSIVE_UUID] Converting to null:', value);
        return null;
      }
      
      const result = typeof value === 'string' ? value.trim() : value;
      console.log('[DEFENSIVE_UUID] Sanitized UUID:', value, '->', result);
      return result;
    };
    
    // Get the provider data with all required fields for validation
    const { data: provider, error: providerError } = await supabase
      .from('providers')
      .select(`
        id, 
        category, 
        business_name,
        username,
        whatsapp_phone,
        city_id,
        zone_id,
        main_categories:main_category_id(display_name)
      `)
      .eq('user_id', userId)
      .single();

    if (providerError) {
      console.error('completeProviderOnboarding: Error fetching provider:', providerError);
      throw providerError;
    }

    console.log('completeProviderOnboarding: Provider data before validation:', {
      id: provider.id,
      business_name: provider.business_name,
      username: provider.username,
      category: provider.category,
      whatsapp_phone: provider.whatsapp_phone ? `${provider.whatsapp_phone.substring(0, 3)}***` : 'null',
      city_id: provider.city_id,
      zone_id: provider.zone_id,
      has_main_category: !!provider.main_categories
    });

    // CRITICAL: Pre-validation before attempting to mark profile as completed
    const validationErrors: string[] = [];

    // 1. Business name validation (must be ≥ 2 characters)
    if (!provider.business_name || provider.business_name.trim().length < 2) {
      validationErrors.push('Nombre del negocio debe tener al menos 2 caracteres');
    }

    // 2. Username validation (must be ≥ 3 characters)
    if (!provider.username || provider.username.trim().length < 3) {
      validationErrors.push('Nombre de usuario debe tener al menos 3 caracteres');
    }

    // 3. Category validation (must be populated)
    let categoryToUpdate = provider.category;
    if (!categoryToUpdate && provider.main_categories?.display_name) {
      categoryToUpdate = provider.main_categories.display_name;
    }
    if (!categoryToUpdate || categoryToUpdate.trim() === '') {
      validationErrors.push('Categoría principal es requerida');
    }

    // 4. UUID field validation: REMOVED
    // The previous validation logic was incorrectly using the sanitized NULL value to create a VALIDATION_FAILED error,
    // which blocked the clean data from reaching the DB. We now rely on the database trigger (validate_provider_profile)
    // for this final check.

    // 5. WhatsApp phone validation (must match E.164 format)
    if (!provider.whatsapp_phone) {
      validationErrors.push('Número de teléfono es requerido');
    } else {
      const phoneRegex = /^\+[1-9]\d{1,14}$/;
      if (!phoneRegex.test(provider.whatsapp_phone)) {
        validationErrors.push('Formato de número de teléfono inválido (debe incluir código de país)');
      }
    }

    // If there are validation errors, don't proceed
    if (validationErrors.length > 0) {
      // CRITICAL FIX: Add unique flag to expose detailed error in the client app/logs
      const errorMessage = `Faltan campos requeridos: ${validationErrors.join(', ')}.`;
      console.error('completeProviderOnboarding: Validation failed:', validationErrors);
      throw new Error(`VALIDATION_FAILED: ${errorMessage}`);
    }

    console.log('completeProviderOnboarding: All validations passed');

    // Prepare update data with aggressively sanitized values
    const updateData: any = {
      profile_completed: true,
      onboarding_step: 4,
      // Ensure category is populated
      category: categoryToUpdate,
      // Aggressively sanitize UUID fields to prevent empty strings
      city_id: sanitizeUUIDDefensive(provider.city_id),
      zone_id: sanitizeUUIDDefensive(provider.zone_id)
    };

    console.log('completeProviderOnboarding: Final update payload:', {
      ...updateData,
      whatsapp_phone: provider.whatsapp_phone ? `${provider.whatsapp_phone.substring(0, 3)}***` : 'null'
    });

    const { error } = await supabase
      .from('providers')
      .update(updateData)
      .eq('user_id', userId);

    if (error) {
      console.error('completeProviderOnboarding: Database error:', error);
      
      // Provide specific error messages based on trigger validation
      if (error.message.includes('Business name is required')) {
        throw new Error('El nombre del negocio es requerido y debe tener al menos 2 caracteres');
      } else if (error.message.includes('Username is required')) {
        throw new Error('El nombre de usuario es requerido y debe tener al menos 3 caracteres');
      } else if (error.message.includes('Category is required')) {
        throw new Error('La categoría principal es requerida');
      } else if (error.message.includes('City is required')) {
        throw new Error('La ciudad es requerida');
      } else if (error.message.includes('Zone is required')) {
        throw new Error('La zona es requerida');
      } else if (error.message.includes('Invalid WhatsApp phone')) {
        throw new Error('El formato del número de WhatsApp no es válido');
      } else {
        throw new Error(`Error al completar el perfil: ${error.message}`);
      }
    }

    console.log('completeProviderOnboarding: Provider updated successfully');

    // Create default availability (Monday to Saturday, 9 AM to 7 PM)
    const defaultAvailability = [
      { day_of_week: 1, start_time: '09:00', end_time: '19:00' }, // Monday
      { day_of_week: 2, start_time: '09:00', end_time: '19:00' }, // Tuesday
      { day_of_week: 3, start_time: '09:00', end_time: '19:00' }, // Wednesday
      { day_of_week: 4, start_time: '09:00', end_time: '19:00' }, // Thursday
      { day_of_week: 5, start_time: '09:00', end_time: '19:00' }, // Friday
      { day_of_week: 6, start_time: '09:00', end_time: '19:00' }, // Saturday
    ];

    const availabilityToInsert = defaultAvailability.map(slot => ({
      provider_id: provider.id,
      day_of_week: slot.day_of_week,
      start_time: slot.start_time,
      end_time: slot.end_time,
      is_active: true
    }));

    const { error: availabilityError } = await supabase
      .from('availability')
      .insert(availabilityToInsert);

    if (availabilityError) {
      console.error('Error creating default availability:', availabilityError);
      // Don't throw here - we don't want to block onboarding completion
    }

    console.log('completeProviderOnboarding: Onboarding completed successfully');
    return true;
  } catch (error) {
    console.error('Error completing onboarding:', error);
    // Explicitly re-throw the detailed validation error if it contains the flag
    if (error instanceof Error && error.message.includes('VALIDATION_FAILED:')) {
      throw error;
    }
    throw error;
  }
};
