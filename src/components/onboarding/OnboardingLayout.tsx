import { ReactNode } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';
import { Skeleton } from '@/components/ui/skeleton';
import { ArrowLeft } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { LanguageToggleOnboarding } from '@/components/ui/language-toggle';
import { useLanguage } from '@/contexts/LanguageContext';
import { LogoIcon } from '@/components/branding/LogoIcon';
import { LogoText } from '@/components/branding/LogoText';

interface OnboardingLayoutProps {
  children: ReactNode;
  currentStep: number;
  totalSteps: number;
  stepTitle: string;
  loading?: boolean;
  canGoBack?: boolean;
  onGoBack?: () => void;
}


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
  const { t } = useLanguage();
  
  const STEP_NAMES = [
    t('onboarding.steps.profile'),
    t('onboarding.steps.services'),
    t('onboarding.steps.contact'),
    t('onboarding.steps.preview')
  ];

  return (
    <div className="min-h-screen gradient-hero">
      {/* Header */}
      <header className="bg-white border-b border-border sticky top-0 z-50 shadow-lg">
        <div className="container mx-auto px-4 py-6">
          <div className="flex items-center justify-between">
            <button 
              onClick={() => window.location.href = '/'}
              className="flex items-center space-x-4 hover:opacity-80 transition-opacity cursor-pointer"
            >
              <LogoIcon className="h-10 w-10" />
              <LogoText className="text-3xl" />
            </button>
            
            <div className="flex items-center space-x-2">
              <LanguageToggleOnboarding />
              {canGoBack && onGoBack && (
                <Button
                  onClick={onGoBack}
                  variant="ghost"
                  size="sm"
                  className="md:hidden text-foreground hover:bg-secondary"
                >
                  <ArrowLeft className="h-5 w-5" />
                </Button>
              )}
            </div>
          </div>
        </div>
      </header>

      <div className="container mx-auto px-4 py-6 md:py-8">
        <div className="max-w-2xl mx-auto">
          {/* Progress Section */}
          <div className="mb-8 md:mb-12">
            <div className="text-center mb-8">
              <h1 className="text-3xl md:text-4xl font-bold text-white mb-3 font-poppins">
                {t('onboarding.title')}
              </h1>
              <p className="text-white text-lg mb-6">
                {t('onboarding.step', { current: currentStep.toString(), total: totalSteps.toString(), title: stepTitle })}
              </p>
            </div>
            
            <div className="space-y-6">
              {/* Enhanced Progress Bar */}
              <div className="relative">
                <Progress 
                  value={progressPercentage} 
                  className="h-3 md:h-4 bg-white border-0 shadow-lg" 
                />
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
                          : 'bg-secondary text-muted-foreground border-border'
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
                          : 'bg-secondary'
                      }`}
                    />
                  ))}
                </div>
              </div>
            </div>
          </div>

          {/* Enhanced Step Content */}
          <Card className="bg-white shadow-lg border border-border/20">
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