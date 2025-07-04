import { useEffect, useState } from 'react';
import { useAuth } from '@/hooks/useAuth';
import { loadProviderData } from '@/services/onboardingService';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';

export const OnboardingDebug = () => {
  const { user } = useAuth();
  const [providerData, setProviderData] = useState<any>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const loadData = async () => {
    if (!user?.id) return;
    
    setLoading(true);
    setError(null);
    
    try {
      const data = await loadProviderData(user.id);
      setProviderData(data);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Error loading data');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, [user?.id]);

  if (!user) {
    return <div>Please log in to view debug information</div>;
  }

  return (
    <div className="container mx-auto p-6">
      <Card>
        <CardHeader>
          <CardTitle>Onboarding Debug Information</CardTitle>
          <Button onClick={loadData} disabled={loading}>
            {loading ? 'Loading...' : 'Refresh Data'}
          </Button>
        </CardHeader>
        <CardContent>
          {error && (
            <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-4">
              Error: {error}
            </div>
          )}
          
          <div className="space-y-4">
            <div>
              <h3 className="font-semibold">User Information:</h3>
              <pre className="bg-gray-100 p-3 rounded text-sm overflow-auto">
                {JSON.stringify({
                  id: user.id,
                  email: user.email,
                  created_at: user.created_at
                }, null, 2)}
              </pre>
            </div>
            
            <div>
              <h3 className="font-semibold">Provider Data:</h3>
              <pre className="bg-gray-100 p-3 rounded text-sm overflow-auto max-h-96">
                {JSON.stringify(providerData, null, 2)}
              </pre>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default OnboardingDebug;