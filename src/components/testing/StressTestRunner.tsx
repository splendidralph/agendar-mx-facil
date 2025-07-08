import { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import { Badge } from '@/components/ui/badge';
import { Zap, Clock, Users, AlertTriangle } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';

interface StressTestMetrics {
  totalRequests: number;
  successfulRequests: number;
  failedRequests: number;
  averageResponseTime: number;
  minResponseTime: number;
  maxResponseTime: number;
  concurrentUsers: number;
  requestsPerSecond: number;
  errorRate: number;
}

interface StressTestConfig {
  concurrentUsers: number;
  requestsPerUser: number;
  testDuration: number; // seconds
  rampUpTime: number; // seconds
}

export const StressTestRunner = () => {
  const [isRunning, setIsRunning] = useState(false);
  const [progress, setProgress] = useState(0);
  const [metrics, setMetrics] = useState<StressTestMetrics | null>(null);
  const [config, setConfig] = useState<StressTestConfig>({
    concurrentUsers: 10,
    requestsPerUser: 5,
    testDuration: 30,
    rampUpTime: 10
  });

  // Simulate concurrent phone validation requests
  const phoneValidationStressTest = async () => {
    const testPhones = [
      '+525512345678', '+16192737962', '+447712345678', '+34612345678',
      '+815012345678', '+33612345678', '+4915012345678', '+19175551234'
    ];

    const startTime = Date.now();
    const promises: Promise<any>[] = [];
    const results: { success: boolean; responseTime: number; error?: string }[] = [];

    for (let user = 0; user < config.concurrentUsers; user++) {
      for (let req = 0; req < config.requestsPerUser; req++) {
        const promise = (async () => {
          const requestStart = Date.now();
          try {
            const phone = testPhones[Math.floor(Math.random() * testPhones.length)];
            const regex = /^\+[1-9]\d{1,14}$/;
            const isValid = regex.test(phone);
            
            // Simulate validation processing time
            await new Promise(resolve => setTimeout(resolve, Math.random() * 100));
            
            const responseTime = Date.now() - requestStart;
            results.push({ success: true, responseTime });
            
            return { phone, isValid, responseTime };
          } catch (error) {
            const responseTime = Date.now() - requestStart;
            results.push({ 
              success: false, 
              responseTime, 
              error: error instanceof Error ? error.message : 'Unknown error' 
            });
            throw error;
          }
        })();
        
        promises.push(promise);
        
        // Stagger requests during ramp-up
        if (user < config.rampUpTime) {
          await new Promise(resolve => setTimeout(resolve, 1000 / config.concurrentUsers));
        }
      }
    }

    await Promise.allSettled(promises);
    const totalTime = Date.now() - startTime;

    return {
      totalRequests: results.length,
      successfulRequests: results.filter(r => r.success).length,
      failedRequests: results.filter(r => !r.success).length,
      averageResponseTime: results.reduce((sum, r) => sum + r.responseTime, 0) / results.length,
      minResponseTime: Math.min(...results.map(r => r.responseTime)),
      maxResponseTime: Math.max(...results.map(r => r.responseTime)),
      concurrentUsers: config.concurrentUsers,
      requestsPerSecond: (results.length / totalTime) * 1000,
      errorRate: (results.filter(r => !r.success).length / results.length) * 100
    };
  };

  // Database stress test
  const databaseStressTest = async () => {
    const startTime = Date.now();
    const promises: Promise<any>[] = [];
    const results: { success: boolean; responseTime: number; operation: string }[] = [];

    for (let user = 0; user < config.concurrentUsers; user++) {
      const promise = (async () => {
        for (let req = 0; req < config.requestsPerUser; req++) {
          const requestStart = Date.now();
          try {
            // Random database operations
            const operations = [
              () => supabase.from('cities').select('*').eq('is_active', true),
              () => supabase.from('zones').select('*').eq('is_active', true),
              () => supabase.from('locations').select('*').limit(10),
              () => supabase.from('providers').select('id, business_name, whatsapp_phone').eq('profile_completed', true).limit(5),
              () => supabase.from('services').select('*').eq('is_active', true).limit(10)
            ];
            
            const operation = operations[Math.floor(Math.random() * operations.length)];
            const operationName = operation.toString().match(/from\('([^']+)'\)/)?.[1] || 'unknown';
            
            const { error } = await operation();
            if (error) throw error;
            
            const responseTime = Date.now() - requestStart;
            results.push({ success: true, responseTime, operation: operationName });
            
          } catch (error) {
            const responseTime = Date.now() - requestStart;
            results.push({ 
              success: false, 
              responseTime, 
              operation: 'failed'
            });
          }
          
          // Small delay between requests from same user
          await new Promise(resolve => setTimeout(resolve, 50));
        }
      })();
      
      promises.push(promise);
    }

    await Promise.allSettled(promises);
    const totalTime = Date.now() - startTime;

    return {
      totalRequests: results.length,
      successfulRequests: results.filter(r => r.success).length,
      failedRequests: results.filter(r => !r.success).length,
      averageResponseTime: results.reduce((sum, r) => sum + r.responseTime, 0) / results.length,
      minResponseTime: Math.min(...results.map(r => r.responseTime)),
      maxResponseTime: Math.max(...results.map(r => r.responseTime)),
      concurrentUsers: config.concurrentUsers,
      requestsPerSecond: (results.length / totalTime) * 1000,
      errorRate: (results.filter(r => !r.success).length / results.length) * 100
    };
  };

  const runStressTest = async () => {
    setIsRunning(true);
    setProgress(0);
    
    try {
      toast.info('Starting stress test...');
      
      // Run phone validation stress test
      setProgress(25);
      const phoneMetrics = await phoneValidationStressTest();
      
      setProgress(50);
      toast.info('Phone validation test completed, starting database test...');
      
      // Run database stress test
      const dbMetrics = await databaseStressTest();
      
      setProgress(75);
      
      // Combine metrics
      const combinedMetrics: StressTestMetrics = {
        totalRequests: phoneMetrics.totalRequests + dbMetrics.totalRequests,
        successfulRequests: phoneMetrics.successfulRequests + dbMetrics.successfulRequests,
        failedRequests: phoneMetrics.failedRequests + dbMetrics.failedRequests,
        averageResponseTime: (phoneMetrics.averageResponseTime + dbMetrics.averageResponseTime) / 2,
        minResponseTime: Math.min(phoneMetrics.minResponseTime, dbMetrics.minResponseTime),
        maxResponseTime: Math.max(phoneMetrics.maxResponseTime, dbMetrics.maxResponseTime),
        concurrentUsers: config.concurrentUsers,
        requestsPerSecond: (phoneMetrics.requestsPerSecond + dbMetrics.requestsPerSecond) / 2,
        errorRate: ((phoneMetrics.failedRequests + dbMetrics.failedRequests) / (phoneMetrics.totalRequests + dbMetrics.totalRequests)) * 100
      };
      
      setMetrics(combinedMetrics);
      setProgress(100);
      
      toast.success('Stress test completed successfully!');
    } catch (error) {
      toast.error('Stress test failed');
      console.error('Stress test error:', error);
    } finally {
      setIsRunning(false);
    }
  };

  const getPerformanceColor = (value: number, thresholds: { good: number; warning: number }) => {
    if (value <= thresholds.good) return 'text-green-600';
    if (value <= thresholds.warning) return 'text-yellow-600';
    return 'text-red-600';
  };

  return (
    <div className="space-y-6">
      {/* Configuration */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Zap className="h-5 w-5" />
            Stress Test Configuration
          </CardTitle>
          <CardDescription>
            Configure load testing parameters
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <div>
              <label className="text-sm font-medium">Concurrent Users</label>
              <input
                type="number"
                value={config.concurrentUsers}
                onChange={(e) => setConfig(prev => ({ ...prev, concurrentUsers: parseInt(e.target.value) || 10 }))}
                className="w-full mt-1 px-3 py-2 border rounded"
                min="1"
                max="100"
                disabled={isRunning}
              />
            </div>
            <div>
              <label className="text-sm font-medium">Requests per User</label>
              <input
                type="number"
                value={config.requestsPerUser}
                onChange={(e) => setConfig(prev => ({ ...prev, requestsPerUser: parseInt(e.target.value) || 5 }))}
                className="w-full mt-1 px-3 py-2 border rounded"
                min="1"
                max="50"
                disabled={isRunning}
              />
            </div>
            <div>
              <label className="text-sm font-medium">Test Duration (s)</label>
              <input
                type="number"
                value={config.testDuration}
                onChange={(e) => setConfig(prev => ({ ...prev, testDuration: parseInt(e.target.value) || 30 }))}
                className="w-full mt-1 px-3 py-2 border rounded"
                min="10"
                max="300"
                disabled={isRunning}
              />
            </div>
            <div>
              <label className="text-sm font-medium">Ramp-up Time (s)</label>
              <input
                type="number"
                value={config.rampUpTime}
                onChange={(e) => setConfig(prev => ({ ...prev, rampUpTime: parseInt(e.target.value) || 10 }))}
                className="w-full mt-1 px-3 py-2 border rounded"
                min="5"
                max="60"
                disabled={isRunning}
              />
            </div>
          </div>
          
          <div className="mt-4 flex items-center justify-between">
            <div className="text-sm text-muted-foreground">
              Total requests: {config.concurrentUsers * config.requestsPerUser * 2} 
              (phone validation + database operations)
            </div>
            <Button onClick={runStressTest} disabled={isRunning}>
              {isRunning ? 'Running...' : 'Start Stress Test'}
            </Button>
          </div>
          
          {isRunning && (
            <div className="mt-4">
              <Progress value={progress} className="w-full" />
              <p className="text-sm text-muted-foreground mt-1">
                Progress: {progress}%
              </p>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Results */}
      {metrics && (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-lg">Total Requests</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{metrics.totalRequests}</div>
              <div className="flex gap-2 mt-2">
                <Badge variant="default">
                  {metrics.successfulRequests} Success
                </Badge>
                <Badge variant="destructive">
                  {metrics.failedRequests} Failed
                </Badge>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-lg flex items-center gap-2">
                <Clock className="h-4 w-4" />
                Response Time
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className={`text-2xl font-bold ${getPerformanceColor(metrics.averageResponseTime, { good: 100, warning: 500 })}`}>
                {metrics.averageResponseTime.toFixed(0)}ms
              </div>
              <div className="text-sm text-muted-foreground">
                {metrics.minResponseTime}ms - {metrics.maxResponseTime}ms
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-lg flex items-center gap-2">
                <Users className="h-4 w-4" />
                Throughput
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className={`text-2xl font-bold ${getPerformanceColor(100 / metrics.requestsPerSecond, { good: 10, warning: 50 })}`}>
                {metrics.requestsPerSecond.toFixed(1)} req/s
              </div>
              <div className="text-sm text-muted-foreground">
                {metrics.concurrentUsers} concurrent users
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-lg flex items-center gap-2">
                <AlertTriangle className="h-4 w-4" />
                Error Rate
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className={`text-2xl font-bold ${getPerformanceColor(metrics.errorRate, { good: 1, warning: 5 })}`}>
                {metrics.errorRate.toFixed(1)}%
              </div>
              <div className="text-sm text-muted-foreground">
                {metrics.failedRequests} / {metrics.totalRequests} failed
              </div>
            </CardContent>
          </Card>
        </div>
      )}

      {/* Performance Analysis */}
      {metrics && (
        <Card>
          <CardHeader>
            <CardTitle>Performance Analysis</CardTitle>
            <CardDescription>
              Automated analysis of stress test results
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {metrics.errorRate === 0 && (
                <div className="p-3 bg-green-50 border border-green-200 rounded text-green-800">
                  ✅ Excellent: No errors detected during stress test
                </div>
              )}
              
              {metrics.errorRate > 0 && metrics.errorRate <= 1 && (
                <div className="p-3 bg-yellow-50 border border-yellow-200 rounded text-yellow-800">
                  ⚠️ Good: Low error rate ({metrics.errorRate.toFixed(1)}%) - within acceptable limits
                </div>
              )}
              
              {metrics.errorRate > 1 && (
                <div className="p-3 bg-red-50 border border-red-200 rounded text-red-800">
                  ❌ Poor: High error rate ({metrics.errorRate.toFixed(1)}%) - requires investigation
                </div>
              )}
              
              {metrics.averageResponseTime <= 100 && (
                <div className="p-3 bg-green-50 border border-green-200 rounded text-green-800">
                  ✅ Excellent: Very fast average response time ({metrics.averageResponseTime.toFixed(0)}ms)
                </div>
              )}
              
              {metrics.averageResponseTime > 100 && metrics.averageResponseTime <= 500 && (
                <div className="p-3 bg-yellow-50 border border-yellow-200 rounded text-yellow-800">
                  ⚠️ Good: Acceptable response time ({metrics.averageResponseTime.toFixed(0)}ms)
                </div>
              )}
              
              {metrics.averageResponseTime > 500 && (
                <div className="p-3 bg-red-50 border border-red-200 rounded text-red-800">
                  ❌ Poor: Slow response time ({metrics.averageResponseTime.toFixed(0)}ms) - optimization needed
                </div>
              )}
              
              {metrics.requestsPerSecond >= 10 && (
                <div className="p-3 bg-green-50 border border-green-200 rounded text-green-800">
                  ✅ Excellent: High throughput ({metrics.requestsPerSecond.toFixed(1)} req/s)
                </div>
              )}
              
              {metrics.requestsPerSecond < 10 && metrics.requestsPerSecond >= 2 && (
                <div className="p-3 bg-yellow-50 border border-yellow-200 rounded text-yellow-800">
                  ⚠️ Moderate: Acceptable throughput ({metrics.requestsPerSecond.toFixed(1)} req/s)
                </div>
              )}
              
              {metrics.requestsPerSecond < 2 && (
                <div className="p-3 bg-red-50 border border-red-200 rounded text-red-800">
                  ❌ Poor: Low throughput ({metrics.requestsPerSecond.toFixed(1)} req/s) - performance issues
                </div>
              )}
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
};