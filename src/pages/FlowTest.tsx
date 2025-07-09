import { OnboardingFlowTest } from '@/components/testing/OnboardingFlowTest';

const FlowTest = () => {
  return (
    <div className="min-h-screen bg-background p-4">
      <div className="container mx-auto py-8">
        <div className="mb-8 text-center">
          <h1 className="text-3xl font-bold text-foreground mb-2">
            Sistema de Pruebas - Flujo de Onboarding
          </h1>
          <p className="text-muted-foreground">
            Verifica que todos los componentes del sistema funcionen correctamente
          </p>
        </div>
        
        <OnboardingFlowTest />
      </div>
    </div>
  );
};

export default FlowTest;