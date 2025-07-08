
import { supabase } from '@/integrations/supabase/client';

export const generateUsername = (businessName: string): string => {
  return businessName
    .toLowerCase()
    .replace(/[^a-z0-9\s]/g, '')
    .replace(/\s+/g, '-')
    .slice(0, 30);
};

export const checkUsernameAvailability = async (username: string, excludeUserId?: string): Promise<boolean> => {
  if (!username) return false;

  try {
    let query = supabase
      .from('providers')
      .select('username, user_id')
      .eq('username', username);

    // If excludeUserId is provided, exclude that user's record
    if (excludeUserId) {
      query = query.neq('user_id', excludeUserId);
    }

    const { data, error } = await query.single();

    if (error && error.code === 'PGRST116') {
      return true; // Username is available
    }

    return false; // Username is taken
  } catch (error) {
    console.error('Error checking username availability:', error);
    return false;
  }
};
