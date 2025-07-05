import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';
import { Mail, Send, MessageCircle, User, Phone, AlertCircle, CheckCircle, Info } from 'lucide-react';
import { CustomPhoneInput } from '@/components/ui/phone-input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Alert, AlertDescription } from '@/components/ui/alert';

interface Provider {
  id: string;
  business_name: string;
  user_id: string;
  is_active: boolean;
  users?: { email: string; full_name: string | null };
  notification_preferences?: { 
    whatsapp_phone: string | null; 
    whatsapp_enabled: boolean;
    email_enabled: boolean;
  }[];
}

const TestNotifications = () => {
  const [loading, setLoading] = useState(false);
  const [providers, setProviders] = useState<Provider[]>([]);
  const [selectedProviderId, setSelectedProviderId] = useState<string>('');
  const [selectedProvider, setSelectedProvider] = useState<Provider | null>(null);
  const [debugLog, setDebugLog] = useState<string[]>([]);
  const [testData, setTestData] = useState({
    serviceName: 'Corte de Cabello',
    clientName: 'Cliente Prueba',
    clientPhone: '+525512345678',
    bookingDate: '2025-07-05',
    bookingTime: '14:00',
    price: '200',
    duration: '30',
    notes: 'Esto es una prueba del sistema de notificaciones'
  });

  const addDebugLog = (message: string) => {
    const timestamp = new Date().toLocaleTimeString();
    setDebugLog(prev => [...prev, `[${timestamp}] ${message}`]);
    console.log(message);
  };

  const clearDebugLog = () => {
    setDebugLog([]);
  };

  // Load providers on component mount
  useEffect(() => {
    loadProviders();
  }, []);

  // Update selected provider when selection changes
  useEffect(() => {
    if (selectedProviderId && providers.length > 0) {
      const provider = providers.find(p => p.id === selectedProviderId);
      setSelectedProvider(provider || null);
    } else {
      setSelectedProvider(null);
    }
  }, [selectedProviderId, providers]);

  const loadProviders = async () => {
    try {
      addDebugLog('Loading providers with WhatsApp notifications...');
      
      const { data: providersData, error } = await supabase
        .from('providers')
        .select(`
          id, business_name, user_id, is_active,
          users!inner(email, full_name),
          notification_preferences(whatsapp_phone, whatsapp_enabled, email_enabled)
        `)
        .eq('is_active', true)
        .order('business_name');

      if (error) {
        addDebugLog(`❌ Error loading providers: ${error.message}`);
        toast.error('Failed to load providers');
        return;
      }

      // Filter providers that have WhatsApp enabled and phone configured
      const validProviders = providersData?.filter(provider => {
        const prefs = provider.notification_preferences?.[0];
        return prefs?.whatsapp_enabled && prefs?.whatsapp_phone;
      }) || [];

      setProviders(validProviders);
      addDebugLog(`✅ Loaded ${validProviders.length} providers with WhatsApp notifications`);
      
      if (validProviders.length === 0) {
        addDebugLog('⚠️ No providers found with WhatsApp notifications enabled');
      }
    } catch (error) {
      addDebugLog(`❌ Exception loading providers: ${error.message}`);
      toast.error('Failed to load providers');
    }
  };

  const createTestBooking = async () => {
    if (!selectedProvider) {
      toast.error('Please select a provider first');
      return null;
    }

    try {
      clearDebugLog();
      addDebugLog(`🚀 Creating test booking for ${selectedProvider.business_name}`);
      addDebugLog(`📱 Provider WhatsApp: ${selectedProvider.notification_preferences?.[0]?.whatsapp_phone}`);
      
      const provider = selectedProvider;

      // Get or create service
      addDebugLog('🔍 Looking for existing services...');
      const { data: services } = await supabase
        .from('services')
        .select('id, name, is_active')
        .eq('provider_id', provider.id)
        .eq('is_active', true)
        .limit(1);

      let serviceId;
      if (!services || services.length === 0) {
        addDebugLog('➕ Creating new service...');
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
          addDebugLog(`❌ Failed to create service: ${createServiceError.message}`);
          toast.error(`Failed to create service: ${createServiceError.message}`);
          return null;
        }
        serviceId = newService.id;
        addDebugLog(`✅ Created service: ${newService.name} (${serviceId})`);
      } else {
        serviceId = services[0].id;
        addDebugLog(`✅ Using existing service: ${services[0].name} (${serviceId})`);
      }

      // Use the create-booking edge function instead of direct database calls
      addDebugLog('📅 Creating booking via edge function...');
      const bookingPayload = {
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
      };
      
      addDebugLog(`📦 Booking payload: ${JSON.stringify(bookingPayload, null, 2)}`);
      
      const { data, error } = await supabase.functions.invoke('create-booking', {
        body: bookingPayload
      });

      if (error) {
        addDebugLog(`❌ Booking creation failed: ${error.message}`);
        toast.error(`Booking creation failed: ${error.message}`);
        return null;
      }

      addDebugLog(`✅ Booking created successfully! ID: ${data.bookingId}`);
      toast.success('Test booking created successfully!');
      return data.bookingId;
    } catch (error) {
      addDebugLog(`❌ Exception creating booking: ${error.message}`);
      toast.error(`Error creating test booking: ${error.message}`);
      return null;
    }
  };

  const testEmailNotification = async () => {
    if (!selectedProvider) {
      toast.error('Please select a provider first');
      return;
    }
    
    setLoading(true);
    try {
      addDebugLog('📧 Starting email notification test...');
      const bookingId = await createTestBooking();
      if (!bookingId) return;

      addDebugLog('📤 Sending email notification...');
      const { data, error } = await supabase.functions.invoke('send-booking-notification', {
        body: { bookingId }
      });

      if (error) {
        addDebugLog(`❌ Email notification failed: ${error.message}`);
        throw error;
      }

      addDebugLog('✅ Email notification sent successfully!');
      toast.success('Email notification sent successfully!');
      console.log('Email response:', data);
    } catch (error) {
      addDebugLog(`❌ Email test failed: ${error.message}`);
      toast.error(`Email test failed: ${error.message}`);
    } finally {
      setLoading(false);
    }
  };

  const testWhatsAppNotification = async () => {
    if (!selectedProvider) {
      toast.error('Please select a provider first');
      return;
    }
    
    setLoading(true);
    try {
      addDebugLog('📱 Starting WhatsApp notification test...');
      const bookingId = await createTestBooking();
      if (!bookingId) return;

      addDebugLog('📤 Sending WhatsApp notification...');
      const { data, error } = await supabase.functions.invoke('send-whatsapp-notification', {
        body: { bookingId }
      });

      if (error) {
        addDebugLog(`❌ WhatsApp notification failed: ${error.message}`);
        throw error;
      }

      addDebugLog('✅ WhatsApp notification sent successfully!');
      toast.success('WhatsApp notification sent successfully!');
      console.log('WhatsApp response:', data);
    } catch (error) {
      addDebugLog(`❌ WhatsApp test failed: ${error.message}`);
      toast.error(`WhatsApp test failed: ${error.message}`);
    } finally {
      setLoading(false);
    }
  };


  return (
    <div className="container mx-auto p-6 max-w-6xl">
      <div className="mb-6">
        <h1 className="text-3xl font-bold mb-2">Test Notification Systems</h1>
        <p className="text-muted-foreground">Test email and WhatsApp notifications with reliable provider selection</p>
      </div>

      {/* Provider Selection */}
      <Card className="mb-6">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <User className="h-5 w-5" />
            Provider Selection
          </CardTitle>
          <CardDescription>
            Select the exact provider to test notifications with
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <div>
              <Label>Select Provider</Label>
              <Select value={selectedProviderId} onValueChange={setSelectedProviderId}>
                <SelectTrigger>
                  <SelectValue placeholder="Choose a provider to test with..." />
                </SelectTrigger>
                <SelectContent>
                  {providers.map((provider) => (
                    <SelectItem key={provider.id} value={provider.id}>
                      <div className="flex flex-col">
                        <span className="font-medium">{provider.business_name}</span>
                        <span className="text-sm text-muted-foreground">
                          📱 {provider.notification_preferences?.[0]?.whatsapp_phone} • 
                          📧 {provider.users?.email}
                        </span>
                      </div>
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            {selectedProvider && (
              <Alert>
                <CheckCircle className="h-4 w-4" />
                <AlertDescription>
                  <div className="space-y-2">
                    <div><strong>Business:</strong> {selectedProvider.business_name}</div>
                    <div><strong>Email:</strong> {selectedProvider.users?.email}</div>
                    <div><strong>WhatsApp:</strong> {selectedProvider.notification_preferences?.[0]?.whatsapp_phone}</div>
                    <div><strong>Provider ID:</strong> {selectedProvider.id}</div>
                  </div>
                </AlertDescription>
              </Alert>
            )}

            {providers.length === 0 && (
              <Alert>
                <AlertCircle className="h-4 w-4" />
                <AlertDescription>
                  No providers found with WhatsApp notifications enabled. Make sure at least one provider has WhatsApp configured.
                </AlertDescription>
              </Alert>
            )}
          </div>
        </CardContent>
      </Card>

      <div className="grid gap-6 lg:grid-cols-2">
        {/* Email Test */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Mail className="h-5 w-5" />
              Email Notifications
            </CardTitle>
            <CardDescription>
              Test email notifications via Resend
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Button 
              onClick={testEmailNotification} 
              disabled={loading || !selectedProvider}
              className="w-full"
            >
              <Send className="h-4 w-4 mr-2" />
              {loading ? 'Sending...' : 'Test Email Notification'}
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
              Test WhatsApp notifications via Twilio
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Button 
              onClick={testWhatsAppNotification} 
              disabled={loading || !selectedProvider}
              className="w-full"
            >
              <MessageCircle className="h-4 w-4 mr-2" />
              {loading ? 'Sending...' : 'Test WhatsApp Notification'}
            </Button>
          </CardContent>
        </Card>
      </div>

      {/* Test Data */}
      <Card className="mt-6">
        <CardHeader>
          <CardTitle>Test Booking Data</CardTitle>
          <CardDescription>
            Configure the booking details for testing
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
              <CustomPhoneInput
                value={testData.clientPhone}
                onChange={(value) => setTestData(prev => ({ ...prev, clientPhone: value || '' }))}
                placeholder="+52 55 1234-5678"
                defaultCountry="MX"
              />
            </div>
            <div>
              <Label>Price ($)</Label>
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

      {/* WhatsApp Template Setup */}
      <Card className="mt-6">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <MessageCircle className="h-5 w-5" />
            WhatsApp Message Templates Setup
          </CardTitle>
          <CardDescription>
            Required for WhatsApp business notifications outside 24-hour window
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Alert className="mb-4">
            <Info className="h-4 w-4" />
            <AlertDescription>
              <div className="space-y-2">
                <p><strong>Step 1:</strong> Create Message Templates in Twilio Console</p>
                <p><strong>Step 2:</strong> Wait for WhatsApp approval (24-48 hours)</p>
                <p><strong>Step 3:</strong> Add Template SIDs to Supabase secrets</p>
              </div>
            </AlertDescription>
          </Alert>
          
          <div className="space-y-4">
            <div>
              <h4 className="font-medium mb-2">Template 1: New Booking Notification</h4>
              <div className="bg-muted/30 rounded-lg p-3 text-sm font-mono">
                <div className="mb-2 font-semibold">Template Content:</div>
                <div>🗓️ *Nueva reserva para {'{{1}}'}*</div>
                <div className="mt-1">📋 *Detalles:*</div>
                <div>• Servicio: {'{{2}}'}</div>
                <div>• Fecha: {'{{3}}'}</div>
                <div>• Hora: {'{{4}}'}</div>
                <div>• Duración: {'{{5}}'}</div>
                <div>• Precio: {'{{6}}'}</div>
                <div className="mt-1">👤 *Cliente:*</div>
                <div>• Nombre: {'{{7}}'}</div>
                <div>• Teléfono: {'{{8}}'}</div>
                <div>• Notas: {'{{9}}'}</div>
                <div className="mt-1">⏳ Estado: Pendiente de confirmación</div>
                <div className="mt-1">_Mensaje automático de BookEasy.mx_</div>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Debug Log */}
      <Card className="mt-6">
        <CardHeader>
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Info className="h-5 w-5" />
              <CardTitle>Debug Log</CardTitle>
            </div>
            <Button 
              variant="outline" 
              size="sm" 
              onClick={clearDebugLog}
              disabled={debugLog.length === 0}
            >
              Clear Log
            </Button>
          </div>
          <CardDescription>
            Real-time debugging information for notification testing
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="bg-muted/30 rounded-lg p-4 max-h-64 overflow-y-auto">
            {debugLog.length === 0 ? (
              <p className="text-muted-foreground text-sm">No debug logs yet. Run a notification test to see detailed information.</p>
            ) : (
              <div className="space-y-1">
                {debugLog.map((log, index) => (
                  <div key={index} className="text-sm font-mono text-foreground/80">
                    {log}
                  </div>
                ))}
              </div>
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default TestNotifications;