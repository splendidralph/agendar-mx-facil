
import { supabase } from '@/integrations/supabase/client';
import { OnboardingData, ServiceCategory } from '@/types/onboarding';

export const loadProviderData = async (userId: string) => {
  try {
    console.log('onboardingService: Fetching provider data for user:', userId);
    const { data: provider, error } = await supabase
      .from('providers')
      .select('*')
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
        .select('*')
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
    const providerData: any = {
      user_id: userId,
      business_name: data.businessName?.trim() || null, // Allow null during onboarding
      category: data.category?.trim() || null,
      bio: data.bio?.trim() || null,
      address: data.address?.trim() || null,
      instagram_handle: data.instagramHandle?.trim() || null,
      whatsapp_phone: data.whatsappPhone?.trim() || null,
      colonia: data.colonia?.trim() || null,
      postal_code: data.postalCode?.trim() || null,
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
        } else {
          throw new Error(`Error creando perfil: ${createError.message}`);
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
        } else {
          throw new Error(`Error actualizando datos: ${updateError.message}`);
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
    
    // Re-throw the error as-is if it already has a user-friendly message
    if (error instanceof Error && error.message.includes('usuario') || 
        error.message.includes('nombre') || 
        error.message.includes('formato') ||
        error.message.includes('existe')) {
      throw error;
    }
    
    // Otherwise, provide a generic error message
    throw new Error(`Error guardando los datos del proveedor: ${error.message || 'Error desconocido'}`);
  }
};

export const saveServices = async (providerId: string, services: OnboardingData['services']) => {
  try {
    console.log('onboardingService: Saving services for provider:', providerId);
    
    // Delete existing services
    await supabase
      .from('services')
      .delete()
      .eq('provider_id', providerId);

    // Insert new services with proper typing
    const servicesToInsert = services.map(service => ({
      provider_id: providerId,
      name: service.name,
      price: service.price,
      duration_minutes: service.duration,
      description: service.description,
      category: service.category as ServiceCategory,
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
    // First get the provider ID
    const { data: provider, error: providerError } = await supabase
      .from('providers')
      .select('id')
      .eq('user_id', userId)
      .single();

    if (providerError) throw providerError;

    // Update provider completion status
    const { error } = await supabase
      .from('providers')
      .update({
        profile_completed: true,
        onboarding_step: 5
      })
      .eq('user_id', userId);

    if (error) throw error;

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

    return true;
  } catch (error) {
    console.error('Error completing onboarding:', error);
    throw error;
  }
};
