import { ReactNode } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';
import { Skeleton } from '@/components/ui/skeleton';
import { Calendar, ArrowLeft } from 'lucide-react';
import { Button } from '@/components/ui/button';

interface OnboardingLayoutProps {
  children: ReactNode;
  currentStep: number;
  totalSteps: number;
  stepTitle: string;
  loading?: boolean;
  canGoBack?: boolean;
  onGoBack?: () => void;
}

const STEP_NAMES = [
  'Perfil & Username',
  'Servicios',
  'Contacto',
  'Vista Previa'
];

export const OnboardingLayout = ({
  children,
  currentStep,
  totalSteps,
  stepTitle,
  loading = false,
  canGoBack = false,
  onGoBack
}: OnboardingLayoutProps) => {
  const progressPercentage = (currentStep / totalSteps) * 100;

  return (
    <div className="min-h-screen bg-gradient-to-br from-secondary to-background">
      {/* Header */}
      <header className="bg-card/80 backdrop-blur-sm border-b border-border sticky top-0 z-50">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-3">
              <div className="gradient-primary text-primary-foreground p-2.5 rounded-xl shadow-lg">
                <Calendar className="h-6 w-6" />
              </div>
              <span className="text-2xl font-bold text-foreground font-poppins">Bookeasy.mx</span>
            </div>
            
            {canGoBack && onGoBack && (
              <Button
                onClick={onGoBack}
                variant="ghost"
                size="sm"
                className="md:hidden"
              >
                <ArrowLeft className="h-4 w-4" />
              </Button>
            )}
          </div>
        </div>
      </header>

      <div className="container mx-auto px-4 py-6 md:py-8">
        <div className="max-w-2xl mx-auto">
          {/* Progress Section */}
          <div className="mb-6 md:mb-8">
            <h1 className="text-2xl md:text-3xl font-bold text-foreground mb-2 text-center">
              Configura tu Perfil
            </h1>
            <p className="text-muted-foreground text-center mb-4 md:mb-6">
              Paso {currentStep} de {totalSteps}: {stepTitle}
            </p>
            
            <div className="space-y-2">
              <Progress value={progressPercentage} className="h-2 md:h-3" />
              
              {/* Step indicators - hidden on mobile, shown on desktop */}
              <div className="hidden md:flex justify-between text-sm text-muted-foreground">
                {STEP_NAMES.map((step, index) => (
                  <span
                    key={step}
                    className={`text-xs md:text-sm ${
                      index + 1 <= currentStep
                        ? 'text-primary font-medium'
                        : 'text-muted-foreground'
                    }`}
                  >
                    {step}
                  </span>
                ))}
              </div>
              
              {/* Mobile step indicator */}
              <div className="flex md:hidden justify-center">
                <div className="flex space-x-2">
                  {Array.from({ length: totalSteps }, (_, index) => (
                    <div
                      key={index}
                      className={`w-2 h-2 rounded-full ${
                        index + 1 <= currentStep
                          ? 'bg-primary'
                          : 'bg-muted'
                      }`}
                    />
                  ))}
                </div>
              </div>
            </div>
          </div>

          {/* Step Content */}
          <Card className="shadow-lg border-border/50">
            <CardHeader className="pb-4">
              <CardTitle className="text-center text-foreground text-lg md:text-xl">
                {stepTitle}
              </CardTitle>
            </CardHeader>
            <CardContent className="px-4 md:px-6 pb-6">
              {loading ? (
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
                children
              )}
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
};