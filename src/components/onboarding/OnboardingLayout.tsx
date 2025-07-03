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
    <div className="min-h-screen gradient-hero">
      {/* Header */}
      <header className="bg-white/25 backdrop-blur-xl border-b border-white/40 sticky top-0 z-50 shadow-xl">
        <div className="container mx-auto px-4 py-6">
          <div className="flex items-center justify-between">
            <button 
              onClick={() => window.location.href = '/'}
              className="flex items-center space-x-4 hover:opacity-80 transition-opacity cursor-pointer"
            >
              <div className="bg-white/60 backdrop-blur-md text-white p-3 rounded-2xl shadow-xl border-2 border-white/40">
                <Calendar className="h-7 w-7 drop-shadow-sm" />
              </div>
              <span className="text-3xl font-bold text-white font-poppins tracking-tight drop-shadow-sm">Bookeasy.mx</span>
            </button>
            
            {canGoBack && onGoBack && (
              <Button
                onClick={onGoBack}
                variant="ghost"
                size="sm"
                className="md:hidden text-white hover:bg-white/20"
              >
                <ArrowLeft className="h-5 w-5" />
              </Button>
            )}
          </div>
        </div>
      </header>

      <div className="container mx-auto px-4 py-6 md:py-8">
        <div className="max-w-2xl mx-auto">
          {/* Progress Section */}
          <div className="mb-8 md:mb-12">
            <div className="text-center mb-8">
              <h1 className="text-3xl md:text-4xl font-bold text-white mb-3 font-poppins">
                Configura tu Perfil
              </h1>
              <p className="text-white/80 text-lg mb-6">
                Paso {currentStep} de {totalSteps}: {stepTitle}
              </p>
            </div>
            
            <div className="space-y-6">
              {/* Enhanced Progress Bar */}
              <div className="relative">
                <Progress 
                  value={progressPercentage} 
                  className="h-3 md:h-4 bg-white/20 border-0 shadow-lg" 
                />
                <div className="absolute top-0 left-0 right-0 h-full gradient-accent rounded-full opacity-20" />
              </div>
              
              {/* Enhanced Step indicators - hidden on mobile, shown on desktop */}
              <div className="hidden md:flex justify-between text-sm">
                {STEP_NAMES.map((step, index) => (
                  <div
                    key={step}
                    className={`flex flex-col items-center space-y-2 ${
                      index + 1 <= currentStep
                        ? 'text-white font-semibold'
                        : 'text-white/60'
                    }`}
                  >
                    <div
                      className={`w-8 h-8 rounded-full flex items-center justify-center text-xs font-bold border-2 smooth-transition ${
                        index + 1 <= currentStep
                          ? 'bg-white text-primary border-white shadow-lg scale-110'
                          : 'bg-white/20 text-white/80 border-white/40'
                      }`}
                    >
                      {index + 1}
                    </div>
                    <span className="text-xs text-center max-w-20">{step}</span>
                  </div>
                ))}
              </div>
              
              {/* Enhanced Mobile step indicator */}
              <div className="flex md:hidden justify-center">
                <div className="flex space-x-3">
                  {Array.from({ length: totalSteps }, (_, index) => (
                    <div
                      key={index}
                      className={`w-3 h-3 rounded-full smooth-transition ${
                        index + 1 <= currentStep
                          ? 'bg-white shadow-lg scale-125'
                          : 'bg-white/30'
                      }`}
                    />
                  ))}
                </div>
              </div>
            </div>
          </div>

          {/* Enhanced Step Content */}
          <Card className="glassmorphism shadow-2xl border-white/20 backdrop-blur-lg">
            <CardHeader className="pb-6">
              <CardTitle className="text-center text-foreground text-xl md:text-2xl font-poppins font-bold">
                {stepTitle}
              </CardTitle>
            </CardHeader>
            <CardContent className="px-6 md:px-8 pb-8">
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