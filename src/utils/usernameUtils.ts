
import { supabase } from '@/integrations/supabase/client';

export const generateUsername = (businessName: string): string => {
  return businessName
    .toLowerCase()
    // Handle Spanish accents and special characters
    .normalize('NFD').replace(/[\u0300-\u036f]/g, '')
    .replace(/[^a-z0-9\s]/g, '')
    .replace(/\s+/g, '-')
    .slice(0, 30);
};

export const generateUniqueUsername = async (businessName: string, excludeUserId?: string): Promise<string> => {
  const baseUsername = generateUsername(businessName);
  
  // Check if base username is available
  const isBaseAvailable = await checkUsernameAvailability(baseUsername, excludeUserId);
  if (isBaseAvailable) {
    return baseUsername;
  }
  
  // Try with numbers 2-99
  for (let i = 2; i <= 99; i++) {
    const numberedUsername = `${baseUsername}-${i}`;
    const isAvailable = await checkUsernameAvailability(numberedUsername, excludeUserId);
    if (isAvailable) {
      return numberedUsername;
    }
  }
  
  // Fallback to timestamp if all numbers are taken
  const timestamp = Date.now().toString().slice(-6);
  return `${baseUsername}-${timestamp}`;
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
