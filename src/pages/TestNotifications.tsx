import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';
import { Mail, Send, MessageCircle } from 'lucide-react';

const TestNotifications = () => {
  const [loading, setLoading] = useState(false);
  const [testData, setTestData] = useState({
    providerEmail: 'theralphcherry@gmail.com',
    businessName: 'Barberia El Rafas',
    serviceName: 'Corte de Cabello',
    clientName: 'Cliente Prueba',
    clientPhone: '+11234567890',
    bookingDate: '2025-07-05',
    bookingTime: '14:00',
    price: '200',
    duration: '30',
    notes: 'Esto es una prueba del sistema de notificaciones'
  });

  const createTestBooking = async () => {
    try {
      console.log('Creating test booking with data:', testData);
      
      // Get provider data - only providers WITH WhatsApp numbers
      const { data: providers, error: providerError } = await supabase
        .from('providers')
        .select('id, user_id, business_name, is_active, whatsapp_phone')
        .ilike('business_name', '%barberia%')
        .eq('is_active', true)
        .not('whatsapp_phone', 'is', null)
        .neq('whatsapp_phone', '')
        .limit(5);

      if (providerError) {
        console.error('Provider query error:', providerError);
        toast.error(`Provider query failed: ${providerError.message}`);
        return null;
      }

      if (!providers || providers.length === 0) {
        toast.error('No providers found with WhatsApp numbers configured');
        return null;
      }

      const provider = providers[0];
      console.log('Using provider:', provider);

      // Get or create service
      const { data: services } = await supabase
        .from('services')
        .select('id, name, is_active')
        .eq('provider_id', provider.id)
        .eq('is_active', true)
        .limit(1);

      let serviceId;
      if (!services || services.length === 0) {
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
          toast.error(`Failed to create service: ${createServiceError.message}`);
          return null;
        }
        serviceId = newService.id;
      } else {
        serviceId = services[0].id;
      }

      // Use the create-booking edge function instead of direct database calls
      const { data, error } = await supabase.functions.invoke('create-booking', {
        body: {
          providerId: provider.id,
          serviceId: serviceId,
          bookingDate: testData.bookingDate,
          bookingTime: testData.bookingTime,
          clientData: {
            name: testData.clientName,
            phone: testData.clientPhone,
            email: 'cliente@test.com',
            notes: testData.notes
          },
          isGuest: true
        }
      });

      if (error) {
        console.error('Booking creation error:', error);
        toast.error(`Booking creation failed: ${error.message}`);
        return null;
      }

      console.log('Booking created successfully:', data);
      toast.success('Test booking created successfully!');
      return data.bookingId;
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