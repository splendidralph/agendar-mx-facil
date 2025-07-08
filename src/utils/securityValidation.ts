import { toast } from 'sonner';

// Security validation utilities
export const sanitizeInput = (input: string, maxLength: number = 255): string => {
  if (!input) return '';
  
  // Remove dangerous characters and trim
  return input
    .trim()
    .replace(/[<>\"'&]/g, '') // Remove XSS-prone characters
    .substring(0, maxLength);
};

export const validateEmail = (email: string): boolean => {
  const emailRegex = /^[^@\s]+@[^@\s]+\.[^@\s]+$/;
  return emailRegex.test(email);
};

export const validatePhoneNumber = (phone: string): boolean => {
  // REQUIRE international format with country code (must start with +)
  const phoneRegex = /^\+[1-9]\d{1,14}$/;
  return phoneRegex.test(phone);
};

export const validatePhoneNumberWithCountryCode = (phone: string): { isValid: boolean; error?: string } => {
  if (!phone || phone.trim() === '') {
    return { isValid: false, error: 'Phone number is required' };
  }
  
  if (!phone.startsWith('+')) {
    return { isValid: false, error: 'Phone number must include country code (e.g., +52 for Mexico, +1 for US/Canada)' };
  }
  
  const phoneRegex = /^\+[1-9]\d{1,14}$/;
  if (!phoneRegex.test(phone)) {
    return { isValid: false, error: 'Invalid international phone number format. Must start with + followed by country code and number' };
  }
  
  return { isValid: true };
};

export const validateUsername = (username: string): boolean => {
  // Username: 3-30 characters, alphanumeric, hyphens, underscores only
  const usernameRegex = /^[a-zA-Z0-9_-]{3,30}$/;
  return usernameRegex.test(username);
};

export const validateInstagramHandle = (handle: string): boolean => {
  // Instagram handle: 1-30 characters, alphanumeric, dots, underscores only
  const instagramRegex = /^[a-zA-Z0-9_.]{1,30}$/;
  return instagramRegex.test(handle);
};

export const validatePostalCode = (postalCode: string): boolean => {
  // Mexican postal code: 5 digits
  const postalRegex = /^\d{5}$/;
  return postalRegex.test(postalCode);
};

export const validateTextLength = (text: string, minLength: number, maxLength: number): boolean => {
  const length = text.trim().length;
  return length >= minLength && length <= maxLength;
};

export const validatePrice = (price: number): boolean => {
  return typeof price === 'number' && price > 0 && price <= 999999;
};

export const validateDuration = (duration: number): boolean => {
  return typeof duration === 'number' && duration >= 15 && duration <= 480;
};

export const validateBookingTime = (time: string): boolean => {
  const timeRegex = /^([01]?[0-9]|2[0-3]):[0-5][0-9]$/;
  return timeRegex.test(time);
};

export const validateBookingDate = (date: string): boolean => {
  const selectedDate = new Date(date);
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  
  return selectedDate >= today;
};

// Rate limiting check (simple client-side check)
const requestCounts = new Map<string, { count: number; lastReset: number }>();

export const checkRateLimit = (identifier: string, maxRequests: number = 10, windowMs: number = 60000): boolean => {
  const now = Date.now();
  const userRequests = requestCounts.get(identifier);
  
  if (!userRequests || now - userRequests.lastReset > windowMs) {
    requestCounts.set(identifier, { count: 1, lastReset: now });
    return true;
  }
  
  if (userRequests.count >= maxRequests) {
    toast.error('Demasiadas solicitudes. Por favor, espera un momento.');
    return false;
  }
  
  userRequests.count++;
  return true;
};

// XSS protection for display text
export const escapeHtml = (text: string): string => {
  const div = document.createElement('div');
  div.textContent = text;
  return div.innerHTML;
};

// Validate and sanitize form data
export const validateAndSanitizeFormData = (data: any): any => {
  const sanitized = { ...data };
  
  for (const [key, value] of Object.entries(sanitized)) {
    if (typeof value === 'string') {
      sanitized[key] = sanitizeInput(value);
    }
  }
  
  return sanitized;
};