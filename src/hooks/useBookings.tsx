
import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';

export interface BookingData {
  id: string;
  booking_date: string;
  booking_time: string;
  status: 'pending' | 'confirmed' | 'completed' | 'cancelled';
  total_price: number;
  client_notes?: string;
  provider_notes?: string;
  service: {
    id: string;
    name: string;
    duration_minutes: number;
  };
  client_info: {
    name: string;
    phone: string;
    email?: string;
  };
}

export interface BookingStats {
  todayCount: number;
  weekCount: number;
  clientCount: number;
  weekRevenue: number;
}

export const useBookings = (providerId: string) => {
  const [bookings, setBookings] = useState<BookingData[]>([]);
  const [stats, setStats] = useState<BookingStats>({
    todayCount: 0,
    weekCount: 0,
    clientCount: 0,
    weekRevenue: 0
  });
  const [loading, setLoading] = useState(true);

  const fetchBookings = async () => {
    if (!providerId) return;

    try {
      setLoading(true);
      
      // Fetch bookings with related data
      const { data: bookingsData, error: bookingsError } = await supabase
        .from('bookings')
        .select(`
          id,
          booking_date,
          booking_time,
          status,
          total_price,
          client_notes,
          provider_notes,
          client_id,
          services!inner(
            id,
            name,
            duration_minutes
          ),
          guest_bookings(
            guest_name,
            guest_phone,
            guest_email
          )
        `)
        .eq('provider_id', providerId)
        .order('booking_date', { ascending: false })
        .order('booking_time', { ascending: false });

      if (bookingsError) {
        console.error('Error fetching bookings:', bookingsError);
        toast.error('Error cargando las citas');
        return;
      }

      // Transform data to match our interface
      const transformedBookings: BookingData[] = (bookingsData || []).map(booking => ({
        id: booking.id,
        booking_date: booking.booking_date,
        booking_time: booking.booking_time,
        status: booking.status,
        total_price: booking.total_price,
        client_notes: booking.client_notes,
        provider_notes: booking.provider_notes,
        service: {
          id: booking.services.id,
          name: booking.services.name,
          duration_minutes: booking.services.duration_minutes
        },
        client_info: {
          name: booking.guest_bookings?.[0]?.guest_name || 'Cliente registrado',
          phone: booking.guest_bookings?.[0]?.guest_phone || '',
          email: booking.guest_bookings?.[0]?.guest_email || ''
        }
      }));

      setBookings(transformedBookings);
      calculateStats(transformedBookings);
      
    } catch (error) {
      console.error('Error in fetchBookings:', error);
      toast.error('Error cargando las citas');
    } finally {
      setLoading(false);
    }
  };

  const calculateStats = (bookingsData: BookingData[]) => {
    const today = new Date().toISOString().split('T')[0];
    const weekStart = new Date();
    weekStart.setDate(weekStart.getDate() - weekStart.getDay());
    const weekStartStr = weekStart.toISOString().split('T')[0];

    const todayCount = bookingsData.filter(b => b.booking_date === today).length;
    
    const weekBookings = bookingsData.filter(b => b.booking_date >= weekStartStr);
    const weekCount = weekBookings.length;
    const weekRevenue = weekBookings.reduce((sum, b) => sum + Number(b.total_price), 0);
    
    const uniqueClients = new Set(bookingsData.map(b => b.client_info.name)).size;

    setStats({
      todayCount,
      weekCount,
      clientCount: uniqueClients,
      weekRevenue
    });
  };

  const updateBookingStatus = async (bookingId: string, newStatus: BookingData['status']) => {
    try {
      const { error } = await supabase
        .from('bookings')
        .update({ status: newStatus })
        .eq('id', bookingId);

      if (error) throw error;

      setBookings(prev => prev.map(booking => 
        booking.id === bookingId ? { ...booking, status: newStatus } : booking
      ));

      toast.success('Estado de la cita actualizado');
    } catch (error) {
      console.error('Error updating booking status:', error);
      toast.error('Error actualizando la cita');
    }
  };

  const addProviderNotes = async (bookingId: string, notes: string) => {
    try {
      const { error } = await supabase
        .from('bookings')
        .update({ provider_notes: notes })
        .eq('id', bookingId);

      if (error) throw error;

      setBookings(prev => prev.map(booking => 
        booking.id === bookingId ? { ...booking, provider_notes: notes } : booking
      ));

      toast.success('Notas guardadas');
    } catch (error) {
      console.error('Error saving notes:', error);
      toast.error('Error guardando las notas');
    }
  };

  useEffect(() => {
    fetchBookings();
  }, [providerId]);

  return {
    bookings,
    stats,
    loading,
    refetch: fetchBookings,
    updateBookingStatus,
    addProviderNotes
  };
};
