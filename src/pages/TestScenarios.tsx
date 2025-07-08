import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { CheckCircle, XCircle, Clock, Phone, MapPin, User, Calendar, Zap } from 'lucide-react';
import { StressTestRunner } from '@/components/testing/StressTestRunner';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';

interface TestResult {
  id: string;
  name: string;
  status: 'pending' | 'running' | 'passed' | 'failed';
  duration?: number;
  error?: string;
  details?: any;
}

const TestScenarios = () => {
  const navigate = useNavigate();
  const [testResults, setTestResults] = useState<TestResult[]>([]);
  const [isRunning, setIsRunning] = useState(false);

  const updateTestResult = (id: string, updates: Partial<TestResult>) => {
    setTestResults(prev => prev.map(test => 
      test.id === id ? { ...test, ...updates } : test
    ));
  };

  const runTest = async (testFn: () => Promise<any>, testId: string) => {
    const startTime = Date.now();
    updateTestResult(testId, { status: 'running' });
    
    try {
      const result = await testFn();
      const duration = Date.now() - startTime;
      updateTestResult(testId, { 
        status: 'passed', 
        duration, 
        details: result 
      });
      return result;
    } catch (error) {
      const duration = Date.now() - startTime;
      updateTestResult(testId, { 
        status: 'failed', 
        duration, 
        error: error instanceof Error ? error.message : 'Unknown error',
        details: error
      });
      throw error;
    }
  };

  // Test data generators
  const testPhoneNumbers = [
    { phone: '+525512345678', country: 'Mexico', valid: true },
    { phone: '+16192737962', country: 'USA', valid: true },
    { phone: '+447712345678', country: 'UK', valid: true },
    { phone: '+34612345678', country: 'Spain', valid: true },
    { phone: '5512345678', country: 'Mexico', valid: false }, // Missing +
    { phone: '+52551234', country: 'Mexico', valid: false }, // Too short
    { phone: '+0512345678', country: 'Invalid', valid: false }, // Starts with 0
  ];

  const testProviderData = [
    {
      businessName: 'Test Salon México',
      whatsappPhone: '+525512345678',
      city: 'Tijuana',
      zone: 'Zona Río',
      colonia: 'Agua Caliente'
    },
    {
      businessName: 'Test Barbería USA',
      whatsappPhone: '+16192737962',
      city: 'Tijuana',
      zone: 'Centro',
      colonia: 'Centro'
    },
    {
      businessName: 'Test Beauty EU',
      whatsappPhone: '+447712345678',
      city: 'Rosarito',
      zone: 'Centro de Rosarito',
      colonia: 'Centro'
    }
  ];

  const testBookingData = [
    {
      clientName: 'Juan Pérez',
      clientPhone: '+525587654321',
      clientEmail: 'juan@test.com',
      service: 'Corte de Cabello',
      date: new Date(Date.now() + 24 * 60 * 60 * 1000), // Tomorrow
      time: '10:00'
    },
    {
      clientName: 'Maria González',
      clientPhone: '+16195551234',
      clientEmail: 'maria@test.com',
      service: 'Manicure',
      date: new Date(Date.now() + 48 * 60 * 60 * 1000), // Day after tomorrow
      time: '14:30'
    }
  ];

  // Individual test functions
  const testPhoneValidation = async () => {
    const results = [];
    for (const testCase of testPhoneNumbers) {
      const regex = /^\+[1-9]\d{1,14}$/;
      const isValid = regex.test(testCase.phone);
      results.push({
        phone: testCase.phone,
        country: testCase.country,
        expected: testCase.valid,
        actual: isValid,
        passed: testCase.valid === isValid
      });
    }
    return results;
  };

  const testLocationDataIntegrity = async () => {
    const { data: providers, error } = await supabase
      .from('providers')
      .select('id, business_name, city_id, zone_id, colonia')
      .eq('profile_completed', true);

    if (error) throw error;

    const results = {
      totalProviders: providers?.length || 0,
      providersWithCityId: providers?.filter(p => p.city_id).length || 0,
      providersWithZoneId: providers?.filter(p => p.zone_id).length || 0,
      providersWithColonia: providers?.filter(p => p.colonia).length || 0,
      integrity: 'good'
    };

    if (results.providersWithCityId !== results.totalProviders ||
        results.providersWithZoneId !== results.totalProviders) {
      results.integrity = 'poor';
      throw new Error(`Location data incomplete: ${results.providersWithCityId}/${results.totalProviders} have city_id, ${results.providersWithZoneId}/${results.totalProviders} have zone_id`);
    }

    return results;
  };

  const testLocationHierarchy = async () => {
    const { data: cities } = await supabase.from('cities').select('*').eq('is_active', true);
    const { data: zones } = await supabase.from('zones').select('*').eq('is_active', true);
    const { data: locations } = await supabase.from('locations').select('*');

    return {
      cities: cities?.length || 0,
      zones: zones?.length || 0,
      locations: locations?.length || 0,
      zonesWithCities: zones?.filter(z => z.city_id).length || 0,
      locationsWithZones: locations?.filter(l => l.zone_id).length || 0
    };
  };

  const testOnboardingFlow = async () => {
    // Test creating a temporary provider profile
    const { data: user } = await supabase.auth.getUser();
    if (!user.user) throw new Error('No authenticated user');

    const testData = testProviderData[0];
    
    // Get city and zone IDs
    const { data: cities } = await supabase.from('cities').select('*').eq('name', 'Tijuana');
    const { data: zones } = await supabase.from('zones').select('*').eq('display_name', 'Zona Río y Alrededores');
    
    if (!cities?.length || !zones?.length) {
      throw new Error('Required location data not found');
    }

    const profileData = {
      user_id: user.user.id,
      business_name: `${testData.businessName} Test ${Date.now()}`,
      whatsapp_phone: testData.whatsappPhone,
      city_id: cities[0].id,
      zone_id: zones[0].id,
      colonia: testData.colonia,
      category: 'Belleza',
      username: `test_user_${Date.now()}`,
      profile_completed: false
    };

    const { data: provider, error } = await supabase
      .from('providers')
      .insert(profileData)
      .select()
      .single();

    if (error) throw error;

    // Cleanup - mark as test data
    await supabase
      .from('providers')
      .update({ business_name: provider.business_name + ' [TEST]' })
      .eq('id', provider.id);

    return { providerId: provider.id, profileData };
  };

  const testBookingCreation = async () => {
    // Get a test provider
    const { data: providers } = await supabase
      .from('providers')
      .select('id, business_name')
      .eq('profile_completed', true)
      .limit(1);

    if (!providers?.length) throw new Error('No providers available for booking test');

    // Get their services
    const { data: services } = await supabase
      .from('services')
      .select('*')
      .eq('provider_id', providers[0].id)
      .eq('is_active', true)
      .limit(1);

    if (!services?.length) throw new Error('No services available for booking test');

    const testBooking = testBookingData[0];
    const bookingData = {
      provider_id: providers[0].id,
      service_id: services[0].id,
      booking_date: testBooking.date.toISOString().split('T')[0],
      booking_time: testBooking.time,
      total_price: services[0].price,
      status: 'pending' as const
    };

    const { data: booking, error } = await supabase
      .from('bookings')
      .insert(bookingData)
      .select()
      .single();

    if (error) throw error;

    // Create guest booking details
    const guestData = {
      booking_id: booking.id,
      guest_name: testBooking.clientName,
      guest_phone: testBooking.clientPhone,
      guest_email: testBooking.clientEmail
    };

    const { error: guestError } = await supabase
      .from('guest_bookings')
      .insert(guestData);

    if (guestError) throw guestError;

    return { bookingId: booking.id, guestData };
  };

  const testNotificationSystem = async () => {
    // Test notification preferences
    const { data: providers } = await supabase
      .from('providers')
      .select('id, whatsapp_phone')
      .eq('profile_completed', true)
      .not('whatsapp_phone', 'is', null)
      .limit(1);

    if (!providers?.length) throw new Error('No providers with WhatsApp for notification test');

    const { data: preferences } = await supabase
      .from('notification_preferences')
      .select('*')
      .eq('provider_id', providers[0].id)
      .single();

    if (!preferences) throw new Error('No notification preferences found');

    return {
      providerId: providers[0].id,
      whatsappEnabled: preferences.whatsapp_enabled,
      whatsappPhone: preferences.whatsapp_phone,
      phoneValidation: /^\+[1-9]\d{1,14}$/.test(preferences.whatsapp_phone || '')
    };
  };

  const runAllTests = async () => {
    setIsRunning(true);
    
    const tests: TestResult[] = [
      { id: 'phone-validation', name: 'International Phone Validation', status: 'pending' },
      { id: 'location-integrity', name: 'Location Data Integrity', status: 'pending' },
      { id: 'location-hierarchy', name: 'Location Hierarchy', status: 'pending' },
      { id: 'onboarding-flow', name: 'Onboarding Flow', status: 'pending' },
      { id: 'booking-creation', name: 'Booking Creation', status: 'pending' },
      { id: 'notification-system', name: 'Notification System', status: 'pending' }
    ];

    setTestResults(tests);

    try {
      await runTest(testPhoneValidation, 'phone-validation');
      await runTest(testLocationDataIntegrity, 'location-integrity');
      await runTest(testLocationHierarchy, 'location-hierarchy');
      await runTest(testOnboardingFlow, 'onboarding-flow');
      await runTest(testBookingCreation, 'booking-creation');
      await runTest(testNotificationSystem, 'notification-system');

      toast.success('All tests completed!');
    } catch (error) {
      toast.error('Test suite failed');
      console.error('Test suite error:', error);
    } finally {
      setIsRunning(false);
    }
  };

  const getStatusIcon = (status: TestResult['status']) => {
    switch (status) {
      case 'passed': return <CheckCircle className="h-4 w-4 text-green-600" />;
      case 'failed': return <XCircle className="h-4 w-4 text-red-600" />;
      case 'running': return <Clock className="h-4 w-4 text-blue-600 animate-spin" />;
      default: return <Clock className="h-4 w-4 text-gray-400" />;
    }
  };

  const getStatusColor = (status: TestResult['status']) => {
    switch (status) {
      case 'passed': return 'bg-green-100 text-green-700';
      case 'failed': return 'bg-red-100 text-red-700';
      case 'running': return 'bg-blue-100 text-blue-700';
      default: return 'bg-gray-100 text-gray-700';
    }
  };

  return (
    <div className="min-h-screen bg-background p-6">
      <div className="max-w-6xl mx-auto space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold text-foreground">Test Scenarios</h1>
            <p className="text-muted-foreground">Comprehensive testing for international phone system and location data</p>
          </div>
          <div className="flex gap-3">
            <Button onClick={() => navigate('/')} variant="outline">
              ← Back to Home
            </Button>
            <Button 
              onClick={runAllTests} 
              disabled={isRunning}
              className="bg-primary hover:bg-primary/90"
            >
              {isRunning ? 'Running Tests...' : 'Run All Tests'}
            </Button>
          </div>
        </div>

        {/* Test Categories */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          <Card className="border-blue-200 bg-blue-50">
            <CardHeader className="pb-3">
              <CardTitle className="flex items-center gap-2 text-blue-800">
                <Phone className="h-5 w-5" />
                Phone Validation
              </CardTitle>
              <CardDescription>International phone number format testing</CardDescription>
            </CardHeader>
            <CardContent>
              <p className="text-sm text-blue-700">
                Tests E.164 format validation for various countries and edge cases
              </p>
            </CardContent>
          </Card>

          <Card className="border-green-200 bg-green-50">
            <CardHeader className="pb-3">
              <CardTitle className="flex items-center gap-2 text-green-800">
                <MapPin className="h-5 w-5" />
                Location System
              </CardTitle>
              <CardDescription>City/Zone/Colonia hierarchy testing</CardDescription>
            </CardHeader>
            <CardContent>
              <p className="text-sm text-green-700">
                Validates location data integrity and hierarchy relationships
              </p>
            </CardContent>
          </Card>

          <Card className="border-purple-200 bg-purple-50">
            <CardHeader className="pb-3">
              <CardTitle className="flex items-center gap-2 text-purple-800">
                <User className="h-5 w-5" />
                User Flows
              </CardTitle>
              <CardDescription>Onboarding and booking processes</CardDescription>
            </CardHeader>
            <CardContent>
              <p className="text-sm text-purple-700">
                End-to-end testing of critical user journeys
              </p>
            </CardContent>
          </Card>

          <Card className="border-orange-200 bg-orange-50">
            <CardHeader className="pb-3">
              <CardTitle className="flex items-center gap-2 text-orange-800">
                <Zap className="h-5 w-5" />
                Performance Testing
              </CardTitle>
              <CardDescription>Load and stress testing scenarios</CardDescription>
            </CardHeader>
            <CardContent>
              <p className="text-sm text-orange-700">
                High-load scenarios with concurrent users and database stress
              </p>
            </CardContent>
          </Card>
        </div>

        {/* Test Results */}
        {testResults.length > 0 && (
          <Card>
            <CardHeader>
              <CardTitle>Test Results</CardTitle>
              <CardDescription>
                Real-time test execution results with detailed feedback
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              {testResults.map((test, index) => (
                <div key={test.id}>
                  <div className="flex items-center justify-between p-4 rounded-lg border bg-card">
                    <div className="flex items-center gap-3">
                      {getStatusIcon(test.status)}
                      <div>
                        <h4 className="font-medium">{test.name}</h4>
                        {test.duration && (
                          <p className="text-sm text-muted-foreground">
                            {test.duration}ms
                          </p>
                        )}
                      </div>
                    </div>
                    <div className="flex items-center gap-2">
                      <Badge className={getStatusColor(test.status)}>
                        {test.status}
                      </Badge>
                    </div>
                  </div>
                  
                  {test.error && (
                    <div className="mt-2 p-3 bg-red-50 border border-red-200 rounded text-sm text-red-700">
                      <strong>Error:</strong> {test.error}
                    </div>
                  )}
                  
                  {test.details && test.status === 'passed' && (
                    <div className="mt-2 p-3 bg-gray-50 border rounded text-sm">
                      <strong>Details:</strong>
                      <pre className="mt-1 overflow-x-auto">
                        {JSON.stringify(test.details, null, 2)}
                      </pre>
                    </div>
                  )}
                  
                  {index < testResults.length - 1 && <Separator className="my-4" />}
                </div>
              ))}
            </CardContent>
          </Card>
        )}

        {/* Test Data Preview */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <Card>
            <CardHeader>
              <CardTitle>Test Phone Numbers</CardTitle>
              <CardDescription>International phone validation test cases</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-2">
                {testPhoneNumbers.map((phone, index) => (
                  <div key={index} className="flex items-center justify-between text-sm">
                    <span className="font-mono">{phone.phone}</span>
                    <div className="flex items-center gap-2">
                      <span className="text-muted-foreground">{phone.country}</span>
                      <Badge variant={phone.valid ? "default" : "destructive"}>
                        {phone.valid ? 'Valid' : 'Invalid'}
                      </Badge>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Test Provider Data</CardTitle>
              <CardDescription>Sample provider profiles for testing</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                {testProviderData.map((provider, index) => (
                  <div key={index} className="p-3 border rounded-lg">
                    <h4 className="font-medium">{provider.businessName}</h4>
                    <div className="text-sm text-muted-foreground space-y-1">
                      <p>📞 {provider.whatsappPhone}</p>
                      <p>📍 {provider.colonia}, {provider.zone}, {provider.city}</p>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Stress Testing Section */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Zap className="h-5 w-5" />
              Stress Testing
            </CardTitle>
            <CardDescription>
              Load testing for phone validation and database operations
            </CardDescription>
          </CardHeader>
          <CardContent>
            <StressTestRunner />
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default TestScenarios;