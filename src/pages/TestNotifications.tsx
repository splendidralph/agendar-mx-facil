import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';
import { Mail, MessageCircle, Send } from 'lucide-react';

const TestNotifications = () => {
  const [loading, setLoading] = useState(false);
  const [testData, setTestData] = useState({
    providerEmail: 'theralphcherry@gmail.com',
    whatsappNumber: '+526193912826',
    businessName: 'Barberia El Rafas',
    serviceName: 'Corte de Cabello',
    clientName: 'Cliente Prueba',
    clientPhone: '+521234567890',
    bookingDate: '2024-07-05',
    bookingTime: '14:00',
    price: '200',
    duration: '30',
    notes: 'Esto es una prueba del sistema de notificaciones'
  });

  const createTestBooking = async () => {
    try {
      // Get provider and service data
      const { data: provider } = await supabase
        .from('providers')
        .select('id, user_id')
        .eq('business_name', 'barberia el rafas')
        .single();

      if (!provider) {
        toast.error('Provider not found');
        return null;
      }

      const { data: service } = await supabase
        .from('services')
        .select('id')
        .eq('provider_id', provider.id)
        .limit(1)
        .single();

      if (!service) {
        // Create a test service if none exists
        const { data: newService } = await supabase
          .from('services')
          .insert({
            provider_id: provider.id,
            name: testData.serviceName,
            price: parseInt(testData.price),
            duration_minutes: parseInt(testData.duration),
            category: 'corte_barberia'
          })
          .select()
          .single();

        if (!newService) {
          toast.error('Failed to create test service');
          return null;
        }
      }

      // Create test booking
      const { data: booking, error } = await supabase
        .from('bookings')
        .insert({
          provider_id: provider.id,
          service_id: service?.id || (await supabase.from('services').select('id').eq('provider_id', provider.id).single()).data?.id,
          booking_date: testData.bookingDate,
          booking_time: testData.bookingTime,
          total_price: parseInt(testData.price),
          status: 'pending',
          client_notes: testData.notes
        })
        .select()
        .single();

      if (error) throw error;

      // Create guest booking info
      await supabase
        .from('guest_bookings')
        .insert({
          booking_id: booking.id,
          guest_name: testData.clientName,
          guest_phone: testData.clientPhone,
          guest_email: 'cliente@test.com'
        });

      return booking.id;
    } catch (error) {
      console.error('Error creating test booking:', error);
      toast.error('Error creating test booking');
      return null;
    }
  };

  const testEmailNotification = async () => {
    setLoading(true);
    try {
      const bookingId = await createTestBooking();
      if (!bookingId) return;

      const { data, error } = await supabase.functions.invoke('send-booking-notification', {
        body: { bookingId }
      });

      if (error) throw error;

      toast.success('Email notification sent successfully!');
      console.log('Email response:', data);
    } catch (error) {
      console.error('Email test error:', error);
      toast.error(`Email test failed: ${error.message}`);
    } finally {
      setLoading(false);
    }
  };

  const testWhatsAppNotification = async () => {
    setLoading(true);
    try {
      const bookingId = await createTestBooking();
      if (!bookingId) return;

      const { data, error } = await supabase.functions.invoke('send-whatsapp-notification', {
        body: { bookingId }
      });

      if (error) throw error;

      toast.success('WhatsApp notification sent successfully!');
      console.log('WhatsApp response:', data);
    } catch (error) {
      console.error('WhatsApp test error:', error);
      toast.error(`WhatsApp test failed: ${error.message}`);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="container mx-auto p-6 max-w-4xl">
      <div className="mb-6">
        <h1 className="text-3xl font-bold mb-2">Test Notification Systems</h1>
        <p className="text-muted-foreground">Test email and WhatsApp notifications for bookings</p>
      </div>

      <div className="grid gap-6 md:grid-cols-2">
        {/* Email Test */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Mail className="h-5 w-5" />
              Email Notifications
            </CardTitle>
            <CardDescription>
              Test Resend email notifications
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-3 mb-4">
              <div>
                <Label>Provider Email</Label>
                <Input
                  value={testData.providerEmail}
                  onChange={(e) => setTestData(prev => ({ ...prev, providerEmail: e.target.value }))}
                />
              </div>
              <div>
                <Label>Business Name</Label>
                <Input
                  value={testData.businessName}
                  onChange={(e) => setTestData(prev => ({ ...prev, businessName: e.target.value }))}
                />
              </div>
            </div>
            <Button 
              onClick={testEmailNotification} 
              disabled={loading}
              className="w-full"
            >
              <Send className="h-4 w-4 mr-2" />
              Test Email
            </Button>
          </CardContent>
        </Card>

        {/* WhatsApp Test */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <MessageCircle className="h-5 w-5" />
              WhatsApp Notifications
            </CardTitle>
            <CardDescription>
              Test Twilio WhatsApp notifications
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-3 mb-4">
              <div>
                <Label>WhatsApp Number</Label>
                <Input
                  value={testData.whatsappNumber}
                  onChange={(e) => setTestData(prev => ({ ...prev, whatsappNumber: e.target.value }))}
                  placeholder="+52XXXXXXXXXX"
                />
              </div>
              <div>
                <Label>Business Name</Label>
                <Input
                  value={testData.businessName}
                  onChange={(e) => setTestData(prev => ({ ...prev, businessName: e.target.value }))}
                />
              </div>
            </div>
            <Button 
              onClick={testWhatsAppNotification} 
              disabled={loading}
              className="w-full"
            >
              <MessageCircle className="h-4 w-4 mr-2" />
              Test WhatsApp
            </Button>
          </CardContent>
        </Card>
      </div>

      {/* Test Data */}
      <Card className="mt-6">
        <CardHeader>
          <CardTitle>Test Booking Data</CardTitle>
          <CardDescription>
            This data will be used for both notification tests
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid gap-4 md:grid-cols-2">
            <div>
              <Label>Service Name</Label>
              <Input
                value={testData.serviceName}
                onChange={(e) => setTestData(prev => ({ ...prev, serviceName: e.target.value }))}
              />
            </div>
            <div>
              <Label>Client Name</Label>
              <Input
                value={testData.clientName}
                onChange={(e) => setTestData(prev => ({ ...prev, clientName: e.target.value }))}
              />
            </div>
            <div>
              <Label>Client Phone</Label>
              <Input
                value={testData.clientPhone}
                onChange={(e) => setTestData(prev => ({ ...prev, clientPhone: e.target.value }))}
              />
            </div>
            <div>
              <Label>Price</Label>
              <Input
                value={testData.price}
                onChange={(e) => setTestData(prev => ({ ...prev, price: e.target.value }))}
              />
            </div>
            <div>
              <Label>Booking Date</Label>
              <Input
                type="date"
                value={testData.bookingDate}
                onChange={(e) => setTestData(prev => ({ ...prev, bookingDate: e.target.value }))}
              />
            </div>
            <div>
              <Label>Booking Time</Label>
              <Input
                type="time"
                value={testData.bookingTime}
                onChange={(e) => setTestData(prev => ({ ...prev, bookingTime: e.target.value }))}
              />
            </div>
            <div className="md:col-span-2">
              <Label>Notes</Label>
              <Textarea
                value={testData.notes}
                onChange={(e) => setTestData(prev => ({ ...prev, notes: e.target.value }))}
              />
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default TestNotifications;