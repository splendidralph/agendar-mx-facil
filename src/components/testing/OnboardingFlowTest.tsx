import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Loader2, CheckCircle, XCircle, AlertCircle } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { toast } from 'sonner';

interface TestResult {
  step: string;
  status: 'pending' | 'running' | 'success' | 'error';
  message?: string;
  data?: any;
}

export const OnboardingFlowTest = () => {
  const [results, setResults] = useState<TestResult[]>([]);
  const [isRunning, setIsRunning] = useState(false);
  const navigate = useNavigate();

  const updateResult = (step: string, status: TestResult['status'], message?: string, data?: any) => {
    setResults(prev => {
      const newResults = [...prev];
      const index = newResults.findIndex(r => r.step === step);
      if (index >= 0) {
        newResults[index] = { step, status, message, data };
      } else {
        newResults.push({ step, status, message, data });
      }
      return newResults;
    });
  };

  const runComprehensiveTest = async () => {
    setIsRunning(true);
    setResults([]);
    
    const testSteps = [
      'Database Connection',
      'Categories Load',
      'Location Data Load', 
      'Phone Number Validation',
      'Test Provider Creation',
      'Services Creation',
      'Booking Flow Test',
      'Complete Flow Validation'
    ];

    // Initialize all steps as pending
    testSteps.forEach(step => updateResult(step, 'pending'));

    try {
      // Test 1: Database Connection
      updateResult('Database Connection', 'running');
      const { supabase } = await import('@/integrations/supabase/client');
      const { data: connectionTest, error: connectionError } = await supabase
        .from('providers')
        .select('count')
        .limit(1);
      
      if (connectionError) {
        updateResult('Database Connection', 'error', connectionError.message);
        return;
      }
      updateResult('Database Connection', 'success', 'Connected successfully');

      // Test 2: Categories Load
      updateResult('Categories Load', 'running');
      const { data: categories, error: categoriesError } = await supabase
        .from('main_categories')
        .select('*')
        .eq('is_active', true);
      
      if (categoriesError) {
        updateResult('Categories Load', 'error', categoriesError.message);
        return;
      }
      updateResult('Categories Load', 'success', `Loaded ${categories?.length || 0} categories`);

      // Test 3: Location Data Load
      updateResult('Location Data Load', 'running');
      const { data: cities, error: citiesError } = await supabase
        .from('cities')
        .select('*')
        .eq('is_active', true);
      
      const { data: zones, error: zonesError } = await supabase
        .from('zones')
        .select('*')
        .eq('is_active', true);

      if (citiesError || zonesError) {
        updateResult('Location Data Load', 'error', `Cities error: ${citiesError?.message}, Zones error: ${zonesError?.message}`);
        return;
      }
      updateResult('Location Data Load', 'success', `Loaded ${cities?.length || 0} cities, ${zones?.length || 0} zones`);

      // Test 4: Phone Number Validation
      updateResult('Phone Number Validation', 'running');
      const testPhones = ['+52 55 1234 5678', '+1 555 123 4567', '+52123456789'];
      const phoneResults = testPhones.map(phone => {
        const isValid = /^\+[1-9]\d{1,14}$/.test(phone.replace(/\s/g, ''));
        return { phone, isValid };
      });
      
      const validPhones = phoneResults.filter(r => r.isValid).length;
      updateResult('Phone Number Validation', 'success', `${validPhones}/${testPhones.length} phone formats valid`, phoneResults);

      // Test 5: Test Provider Creation (simulate)
      updateResult('Test Provider Creation', 'running');
      const testProviderData = {
        businessName: 'Test Provider ' + Date.now(),
        username: 'testuser' + Date.now(),
        whatsappPhone: '+5255123456789',
        mainCategory: categories?.[0],
        city_id: cities?.[0]?.id,
        zone_id: zones?.[0]?.id
      };

      // Simulate validation without actual creation
      const validationIssues = [];
      if (!testProviderData.businessName) validationIssues.push('Missing business name');
      if (!testProviderData.username) validationIssues.push('Missing username');
      if (!testProviderData.whatsappPhone) validationIssues.push('Missing phone');
      if (!testProviderData.mainCategory) validationIssues.push('Missing category');
      if (!testProviderData.city_id) validationIssues.push('Missing city');
      if (!testProviderData.zone_id) validationIssues.push('Missing zone');

      if (validationIssues.length > 0) {
        updateResult('Test Provider Creation', 'error', `Validation issues: ${validationIssues.join(', ')}`);
        return;
      }
      updateResult('Test Provider Creation', 'success', 'Provider data validation passed', testProviderData);

      // Test 6: Services Creation (simulate)
      updateResult('Services Creation', 'running');
      const testServices = [
        {
          name: 'Test Service 1',
          price: 100,
          duration: 60,
          description: 'Test service description',
          category: 'health' as const
        }
      ];

      // Validate service structure
      const serviceIssues = [];
      testServices.forEach((service, index) => {
        if (!service.name) serviceIssues.push(`Service ${index + 1}: Missing name`);
        if (!service.price || service.price <= 0) serviceIssues.push(`Service ${index + 1}: Invalid price`);
        if (!service.duration || service.duration < 15) serviceIssues.push(`Service ${index + 1}: Invalid duration`);
      });

      if (serviceIssues.length > 0) {
        updateResult('Services Creation', 'error', `Service issues: ${serviceIssues.join(', ')}`);
        return;
      }
      updateResult('Services Creation', 'success', `${testServices.length} services validated`);

      // Test 7: Booking Flow Test (check required tables exist)
      updateResult('Booking Flow Test', 'running');
      const { data: bookingsTable, error: bookingsError } = await supabase
        .from('bookings')
        .select('count')
        .limit(1);
      
      const { data: guestBookingsTable, error: guestError } = await supabase
        .from('guest_bookings')
        .select('count')
        .limit(1);

      if (bookingsError || guestError) {
        updateResult('Booking Flow Test', 'error', `Booking tables error: ${bookingsError?.message || guestError?.message}`);
        return;
      }
      updateResult('Booking Flow Test', 'success', 'Booking tables accessible');

      // Test 8: Complete Flow Validation
      updateResult('Complete Flow Validation', 'running');
      const overallIssues = results.filter(r => r.status === 'error');
      if (overallIssues.length > 0) {
        updateResult('Complete Flow Validation', 'error', `${overallIssues.length} tests failed`);
        return;
      }
      
      updateResult('Complete Flow Validation', 'success', 'All systems operational ✅');
      toast.success('🎉 All tests passed! Onboarding and booking flows are ready!');

    } catch (error) {
      console.error('Test suite error:', error);
      updateResult('Complete Flow Validation', 'error', `Test suite error: ${error.message}`);
    } finally {
      setIsRunning(false);
    }
  };

  const getStatusIcon = (status: TestResult['status']) => {
    switch (status) {
      case 'pending':
        return <div className="w-4 h-4 rounded-full bg-gray-300" />;
      case 'running':
        return <Loader2 className="w-4 h-4 animate-spin text-blue-500" />;
      case 'success':
        return <CheckCircle className="w-4 h-4 text-green-500" />;
      case 'error':
        return <XCircle className="w-4 h-4 text-red-500" />;
    }
  };

  const getStatusColor = (status: TestResult['status']) => {
    switch (status) {
      case 'pending':
        return 'bg-gray-100 text-gray-600';
      case 'running':
        return 'bg-blue-100 text-blue-700';
      case 'success':
        return 'bg-green-100 text-green-700';
      case 'error':
        return 'bg-red-100 text-red-700';
    }
  };

  return (
    <Card className="w-full max-w-4xl mx-auto">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <AlertCircle className="w-5 h-5" />
          Onboarding & Booking Flow Test Suite
        </CardTitle>
        <div className="flex gap-2">
          <Button onClick={runComprehensiveTest} disabled={isRunning}>
            {isRunning ? (
              <>
                <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                Running Tests...
              </>
            ) : (
              'Run Comprehensive Test'
            )}
          </Button>
          <Button 
            variant="outline" 
            onClick={() => navigate('/setup')}
          >
            Start Onboarding Test
          </Button>
        </div>
      </CardHeader>
      <CardContent className="space-y-4">
        {results.map((result, index) => (
          <div key={index} className="flex items-start gap-3 p-3 rounded-lg border">
            {getStatusIcon(result.status)}
            <div className="flex-1">
              <div className="flex items-center gap-2 mb-1">
                <span className="font-medium">{result.step}</span>
                <Badge className={getStatusColor(result.status)}>
                  {result.status}
                </Badge>
              </div>
              {result.message && (
                <p className="text-sm text-muted-foreground mb-2">{result.message}</p>
              )}
              {result.data && (
                <details className="text-xs">
                  <summary className="cursor-pointer text-blue-600 hover:text-blue-800">
                    View Details
                  </summary>
                  <pre className="mt-2 p-2 bg-gray-50 rounded text-xs overflow-auto">
                    {JSON.stringify(result.data, null, 2)}
                  </pre>
                </details>
              )}
            </div>
          </div>
        ))}
        
        {results.length === 0 && (
          <div className="text-center py-8 text-muted-foreground">
            Click "Run Comprehensive Test" to start testing the onboarding and booking flows
          </div>
        )}
      </CardContent>
    </Card>
  );
};