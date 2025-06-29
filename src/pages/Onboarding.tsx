
import { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '@/hooks/useAuth';
import { useOnboarding } from '@/hooks/useOnboarding';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';
import { Skeleton } from '@/components/ui/skeleton';
import { Calendar } from 'lucide-react';
import ProfileSetupStep from '@/components/onboarding/ProfileSetupStep';
import ContactStep from '@/components/onboarding/ContactStep';
import UsernameStep from '@/components/onboarding/UsernameStep';
import ServicesStep from '@/components/onboarding/ServicesStep';
import PreviewStep from '@/components/onboarding/PreviewStep';

const Onboarding = () => {
  const navigate = useNavigate();
  const { user, loading: authLoading } = useAuth();
  const { currentStep, loading: onboardingLoading } = useOnboarding();

  useEffect(() => {
    if (!authLoading && !user) {
      console.log('Onboarding: No user found, redirecting to auth');
      navigate('/auth');
    }
  }, [user, authLoading, navigate]);

  // Show loading spinner while auth is loading
  if (authLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto mb-4"></div>
          <p>Cargando...</p>
        </div>
      </div>
    );
  }

  // Redirect if no user
  if (!user) return null;

  const steps = [
    'Perfil',
    'Contacto',
    'Username',
    'Servicios',
    'Vista Previa'
  ];

  const renderStep = () => {
    console.log('Onboarding: renderStep called with currentStep:', currentStep);
    
    if (currentStep === 1) return <ProfileSetupStep />;
    if (currentStep === 2) return <ContactStep />;
    if (currentStep === 3) return <UsernameStep />;
    if (currentStep === 4) return <ServicesStep />;
    if (currentStep === 5) return <PreviewStep />;
    
    // Fallback to step 1 if invalid step
    console.warn('Onboarding: Invalid currentStep, falling back to step 1');
    return <ProfileSetupStep />;
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-secondary to-background">
      {/* Debug Banner */}
      <div 
        style={{ 
          position: 'fixed', 
          top: 0, 
          right: 0, 
          zIndex: 9999,
          background: 'red',
          color: 'white',
          padding: '4px 8px',
          fontSize: '12px',
          fontWeight: 'bold'
        }}
      >
        DEBUG STEP: {currentStep}
      </div>

      {/* Header */}
      <header className="bg-card/80 backdrop-blur-sm border-b border-border">
        <div className="container mx-auto px-4 py-4 flex justify-center items-center">
          <div className="flex items-center space-x-3">
            <div className="gradient-primary text-primary-foreground p-2.5 rounded-xl shadow-lg">
              <Calendar className="h-6 w-6" />
            </div>
            <span className="text-2xl font-bold text-foreground font-poppins">Bookeasy.mx</span>
          </div>
        </div>
      </header>

      <div className="container mx-auto px-4 py-8">
        <div className="max-w-2xl mx-auto">
          {/* Progress Section */}
          <div className="mb-8">
            <h1 className="text-3xl font-bold text-foreground mb-2 text-center">
              Configura tu Perfil
            </h1>
            <p className="text-muted-foreground text-center mb-6">
              Paso {currentStep} de {steps.length}: {steps[currentStep - 1]}
            </p>
            
            <div className="space-y-2">
              <Progress value={(currentStep / steps.length) * 100} className="h-2" />
              <div className="flex justify-between text-sm text-muted-foreground">
                {steps.map((step, index) => (
                  <span
                    key={step}
                    className={`${
                      index + 1 <= currentStep
                        ? 'text-primary font-medium'
                        : 'text-muted-foreground'
                    }`}
                  >
                    {step}
                  </span>
                ))}
              </div>
            </div>
          </div>

          {/* Step Content */}
          <Card className="shadow-lg border-border/50">
            <CardHeader>
              <CardTitle className="text-center text-foreground">
                {steps[currentStep - 1]}
              </CardTitle>
            </CardHeader>
            <CardContent>
              {onboardingLoading ? (
                <div className="space-y-4">
                  <Skeleton className="h-4 w-full" />
                  <Skeleton className="h-4 w-3/4" />
                  <Skeleton className="h-10 w-full" />
                  <Skeleton className="h-10 w-full" />
                  <div className="flex justify-end">
                    <Skeleton className="h-10 w-24" />
                  </div>
                </div>
              ) : (
                renderStep()
              )}
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
};

export default Onboarding;
