
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
      whatsappPhone: data.whatsappPhone,
      hasServices: data.services?.length || 0
    });
    
    // Check if provider exists
    const { data: existingProvider, error: fetchError } = await supabase
      .from('providers')
      .select('id, username')
      .eq('user_id', userId)
      .maybeSingle();

    if (fetchError) {
      console.error('onboardingService: Error fetching provider:', fetchError);
      throw fetchError;
    }

    let providerId = existingProvider?.id;

    if (!existingProvider) {
      console.log('onboardingService: Creating new provider');
      // Create new provider - only set username if it's provided and not empty
      const providerData: any = {
        user_id: userId,
        business_name: data.businessName || '',
        category: data.category || '',
        bio: data.bio || '',
        address: data.address || '',
        instagram_handle: data.instagramHandle || '',
        whatsapp_phone: data.whatsappPhone || '',
        onboarding_step: currentStep,
        profile_completed: false
      };

      // Only include username if it's provided and not empty
      if (data.username && data.username.trim()) {
        providerData.username = data.username.trim();
      }

      const { data: newProvider, error: createError } = await supabase
        .from('providers')
        .insert(providerData)
        .select('id')
        .single();

      if (createError) {
        console.error('onboardingService: Error creating provider:', createError);
        throw createError;
      }
      providerId = newProvider.id;
      console.log('onboardingService: Created new provider with ID:', providerId);
    } else {
      console.log('onboardingService: Updating existing provider with ID:', providerId);
      // Update existing provider - be careful with username updates
      const updateData: any = {
        business_name: data.businessName || '',
        category: data.category || '',
        bio: data.bio || '',
        address: data.address || '',
        instagram_handle: data.instagramHandle || '',
        whatsapp_phone: data.whatsappPhone || '',
        onboarding_step: currentStep,
        profile_completed: currentStep >= 5
      };

      // Only update username if it's different from existing and not empty
      if (data.username && data.username.trim() && data.username.trim() !== existingProvider.username) {
        updateData.username = data.username.trim();
      }

      const { error: updateError } = await supabase
        .from('providers')
        .update(updateData)
        .eq('user_id', userId);

      if (updateError) {
        console.error('onboardingService: Error updating provider:', updateError);
        throw updateError;
      }
    }

    console.log('onboardingService: Successfully saved provider data');
    return providerId;
  } catch (error) {
    console.error('onboardingService: Error saving provider data:', error);
    // Re-throw with more context
    throw new Error(`Failed to save provider data: ${error.message || 'Unknown error'}`);
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
    const { error } = await supabase
      .from('providers')
      .update({
        profile_completed: true,
        onboarding_step: 5
      })
      .eq('user_id', userId);

    if (error) throw error;
    return true;
  } catch (error) {
    console.error('Error completing onboarding:', error);
    throw error;
  }
};
