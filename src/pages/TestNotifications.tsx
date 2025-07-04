import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';
import { Mail, Webhook, Send, MessageCircle } from 'lucide-react';

const TestNotifications = () => {
  const [loading, setLoading] = useState(false);
  const [testData, setTestData] = useState({
    providerEmail: 'theralphcherry@gmail.com',
    highlevelWebhookUrl: '',
    businessName: 'Barberia El Rafas',
    serviceName: 'Corte de Cabello',
    clientName: 'Cliente Prueba',
    clientPhone: '+521234567890',
    bookingDate: '2025-07-05',
    bookingTime: '14:00',
    price: '200',
    duration: '30',
    notes: 'Esto es una prueba del sistema de notificaciones'
  });

  const createTestBooking = async () => {
    try {
      console.log('Creating test booking with data:', testData);
      
      // Get provider data with better error handling
      const { data: providers, error: providerError } = await supabase
        .from('providers')
        .select('id, user_id, business_name, is_active')
        .ilike('business_name', '%barberia%')
        .eq('is_active', true)
        .limit(5);

      console.log('Found providers:', providers);
      
      if (providerError) {
        console.error('Provider query error:', providerError);
        toast.error(`Provider query failed: ${providerError.message}`);
        return null;
      }

      if (!providers || providers.length === 0) {
        toast.error('No providers found with "barberia" in name');
        return null;
      }

      // Use the first provider found
      const provider = providers[0];
      console.log('Using provider:', provider);

      // Get or create service
      const { data: services, error: serviceError } = await supabase
        .from('services')
        .select('id, name, is_active')
        .eq('provider_id', provider.id)
        .eq('is_active', true)
        .limit(1);

      console.log('Found services:', services);

      let serviceId;
      if (!services || services.length === 0) {
        console.log('Creating new service...');
        const { data: newService, error: createServiceError } = await supabase
          .from('services')
          .insert({
            provider_id: provider.id,
            name: testData.serviceName,
            price: parseInt(testData.price),
            duration_minutes: parseInt(testData.duration),
            category: 'corte_barberia',
            is_active: true
          })
          .select()
          .single();

        if (createServiceError) {
          console.error('Service creation error:', createServiceError);
          toast.error(`Failed to create service: ${createServiceError.message}`);
          return null;
        }
        serviceId = newService.id;
        console.log('Created service:', newService);
      } else {
        serviceId = services[0].id;
        console.log('Using existing service:', services[0]);
      }

      // Create test booking
      console.log('Creating booking...');
      const { data: booking, error: bookingError } = await supabase
        .from('bookings')
        .insert({
          provider_id: provider.id,
          service_id: serviceId,
          booking_date: testData.bookingDate,
          booking_time: testData.bookingTime,
          total_price: parseInt(testData.price),
          status: 'pending',
          client_notes: testData.notes
        })
        .select()
        .single();

      if (bookingError) {
        console.error('Booking creation error:', bookingError);
        toast.error(`Booking creation failed: ${bookingError.message}`);
        return null;
      }

      console.log('Created booking:', booking);

      // Create guest booking info
      console.log('Creating guest booking info...');
      const { error: guestError } = await supabase
        .from('guest_bookings')
        .insert({
          booking_id: booking.id,
          guest_name: testData.clientName,
          guest_phone: testData.clientPhone,
          guest_email: 'cliente@test.com'
        });

      if (guestError) {
        console.error('Guest booking error:', guestError);
        toast.error(`Guest booking failed: ${guestError.message}`);
        return null;
      }

      console.log('Test booking created successfully:', booking.id);
      return booking.id;
    } catch (error) {
      console.error('Error creating test booking:', error);
      toast.error(`Error creating test booking: ${error.message}`);
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

  const testHighLevelWebhook = async () => {
    setLoading(true);
    try {
      if (!testData.highlevelWebhookUrl) {
        toast.error('Please enter your HighLevel webhook URL');
        return;
      }

      const bookingId = await createTestBooking();
      if (!bookingId) return;

      const { data, error } = await supabase.functions.invoke('send-highlevel-webhook', {
        body: { 
          bookingId,
          webhookUrl: testData.highlevelWebhookUrl
        }
      });

      if (error) throw error;

      toast.success('HighLevel webhook sent successfully!');
      console.log('HighLevel webhook response:', data);
    } catch (error) {
      console.error('HighLevel webhook test error:', error);
      toast.error(`HighLevel webhook test failed: ${error.message}`);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="container mx-auto p-6 max-w-4xl">
      <div className="mb-6">
        <h1 className="text-3xl font-bold mb-2">Test Notification Systems</h1>
        <p className="text-muted-foreground">Test email and HighLevel webhook notifications for bookings</p>
      </div>

      <div className="grid gap-6 md:grid-cols-3">
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

        {/* HighLevel Webhook Test */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Webhook className="h-5 w-5" />
              HighLevel Webhook
            </CardTitle>
            <CardDescription>
              Test HighLevel webhook integration for automation
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-3 mb-4">
              <div>
                <Label>HighLevel Webhook URL</Label>
                <Input
                  value={testData.highlevelWebhookUrl}
                  onChange={(e) => setTestData(prev => ({ ...prev, highlevelWebhookUrl: e.target.value }))}
                  placeholder="https://hooks.zapier.com/hooks/catch/..."
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
              onClick={testHighLevelWebhook} 
              disabled={loading}
              className="w-full"
            >
              <Webhook className="h-4 w-4 mr-2" />
              Test HighLevel Webhook
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