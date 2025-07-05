import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';

interface CustomerData {
  id: string;
  full_name: string;
  phone: string;
  email: string;
  bookingHistory: Array<{
    id: string;
    booking_date: string;
    booking_time: string;
    status: string;
    service_name: string;
    provider_name: string;
    total_price: number;
  }>;
}

export const useReturningCustomer = (phone: string) => {
  const [customer, setCustomer] = useState<CustomerData | null>(null);
  const [loading, setLoading] = useState(false);
  const [isReturning, setIsReturning] = useState(false);

  useEffect(() => {
    if (phone && phone.length > 8) { // Basic phone validation
      checkReturningCustomer(phone);
    } else {
      setCustomer(null);
      setIsReturning(false);
    }
  }, [phone]);

  const checkReturningCustomer = async (phoneNumber: string) => {
    if (!phoneNumber) return;
    
    setLoading(true);
    try {
      // Check if user exists by phone
      const { data: userData, error: userError } = await supabase
        .from('users')
        .select('id, full_name, phone, email')
        .eq('phone', phoneNumber)
        .maybeSingle();

      if (userError) {
        console.error('Error checking returning customer:', userError);
        setLoading(false);
        return;
      }

      if (userData) {
        // Fetch booking history
        const { data: bookingData, error: bookingError } = await supabase
          .from('bookings')
          .select(`
            id,
            booking_date,
            booking_time,
            status,
            total_price,
            services(name),
            providers(business_name)
          `)
          .eq('client_id', userData.id)
          .order('booking_date', { ascending: false })
          .limit(5);

        if (bookingError) {
          console.error('Error fetching booking history:', bookingError);
        }

        const customerWithHistory: CustomerData = {
          ...userData,
          bookingHistory: bookingData?.map(booking => ({
            id: booking.id,
            booking_date: booking.booking_date,
            booking_time: booking.booking_time,
            status: booking.status,
            service_name: booking.services?.name || 'Servicio',
            provider_name: booking.providers?.business_name || 'Proveedor',
            total_price: booking.total_price
          })) || []
        };

        setCustomer(customerWithHistory);
        setIsReturning(true);
      } else {
        setCustomer(null);
        setIsReturning(false);
      }
    } catch (error) {
      console.error('Unexpected error checking customer:', error);
    } finally {
      setLoading(false);
    }
  };

  return { customer, loading, isReturning, checkReturningCustomer };
};