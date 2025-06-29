
import { supabase } from '@/integrations/supabase/client';

export const generateUsername = (businessName: string): string => {
  return businessName
    .toLowerCase()
    .replace(/[^a-z0-9\s]/g, '')
    .replace(/\s+/g, '-')
    .slice(0, 30);
};

export const checkUsernameAvailability = async (username: string): Promise<boolean> => {
  if (!username) return false;

  try {
    const { data, error } = await supabase
      .from('providers')
      .select('username')
      .eq('username', username)
      .single();

    if (error && error.code === 'PGRST116') {
      return true; // Username is available
    }

    return false; // Username is taken
  } catch (error) {
    console.error('Error checking username availability:', error);
    return false;
  }
};
