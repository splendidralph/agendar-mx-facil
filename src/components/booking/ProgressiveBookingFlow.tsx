import { useState, useEffect, Children, cloneElement, isValidElement } from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import { ChevronLeft, ChevronRight, Check } from 'lucide-react';
import { useIsMobile } from '@/hooks/use-mobile';
import { cn } from '@/lib/utils';
import { useTheme } from '@/contexts/ThemeContext';
import { toast } from 'sonner';

interface Service {
  id: string;
  name: string;
  description: string;
  price: number;
  duration_minutes: number;
}

interface ProgressiveBookingFlowProps {
  services: Service[];
  providerId: string;
  selectedService: Service | null;
  selectedDate: Date | undefined;
  selectedTime: string;
  clientData: any;
  onServiceSelect: (service: Service) => void;
  onDateTimeSelect: (date: Date, time: string) => void;
  onClientDataChange: (data: any) => void;
  onSubmit: () => void;
  onStepChange?: (step: BookingStep) => void;
  children: React.ReactNode[];
}

type BookingStep = 'service' | 'datetime' | 'details' | 'confirmation';

const ProgressiveBookingFlow = ({
  services,
  providerId,
  selectedService,
  selectedDate,
  selectedTime,
  clientData,
  onServiceSelect,
  onDateTimeSelect,
  onClientDataChange,
  onSubmit,
  onStepChange,
  children
}: ProgressiveBookingFlowProps) => {
  const [currentStep, setCurrentStep] = useState<BookingStep>('service');
  const [isTransitioning, setIsTransitioning] = useState(false);
  const [isManualNavigation, setIsManualNavigation] = useState(false);
  const [completedSteps, setCompletedSteps] = useState<Set<BookingStep>>(new Set());
  const [highestStepReached, setHighestStepReached] = useState<BookingStep>('service');
  const isMobile = useIsMobile();
  const { getThemeClasses } = useTheme();
  const themeClasses = getThemeClasses();

  const steps = [
    { id: 'service', label: 'Servicio', progress: 25 },
    { id: 'datetime', label: 'Fecha y Hora', progress: 50 },
    { id: 'details', label: 'Tus Datos', progress: 75 },
    { id: 'confirmation', label: 'Confirmar', progress: 100 }
  ];

  const currentStepIndex = steps.findIndex(step => step.id === currentStep);
  const currentStepData = steps[currentStepIndex];

  // Container sizing based on step
  const getContainerSize = () => {
    switch (currentStep) {
      case 'service': return 'max-w-4xl';
      case 'datetime': return 'max-w-2xl';
      case 'details': return 'max-w-lg';
      case 'confirmation': return 'max-w-md';
      default: return 'max-w-2xl';
    }
  };

  // Check if current step is complete
  const isStepComplete = () => {
    switch (currentStep) {
      case 'service': return !!selectedService;
      case 'datetime': return !!(selectedDate && selectedTime);
      case 'details': return !!(clientData.name && clientData.phone);
      case 'confirmation': return true;
      default: return false;
    }
  };

  // Track step completion when step conditions are met
  useEffect(() => {
    if (isStepComplete()) {
      setCompletedSteps(prev => new Set([...prev, currentStep]));
    }
  }, [currentStep, selectedService, selectedDate, selectedTime, clientData.name, clientData.phone]);

  // Track highest step reached
  useEffect(() => {
    const stepOrder: BookingStep[] = ['service', 'datetime', 'details', 'confirmation'];
    const currentIndex = stepOrder.indexOf(currentStep);
    const highestIndex = stepOrder.indexOf(highestStepReached);
    
    if (currentIndex > highestIndex) {
      setHighestStepReached(currentStep);
    }
  }, [currentStep, highestStepReached]);

  // Auto-advance logic with manual navigation protection and toast feedback
  useEffect(() => {
    // Reset manual navigation flag after longer delay
    if (isManualNavigation) {
      const timer = setTimeout(() => {
        console.log('Booking Flow: Resetting manual navigation flag');
        setIsManualNavigation(false);
      }, 3000);
      return () => clearTimeout(timer);
    }
  }, [isManualNavigation]);

  useEffect(() => {
    // Don't auto-advance if user just manually navigated or is transitioning
    if (isManualNavigation || isTransitioning) {
      console.log('Booking Flow: Skipping auto-advance - manual navigation or transitioning');
      return;
    }

    const stepOrder: BookingStep[] = ['service', 'datetime', 'details', 'confirmation'];
    const currentIndex = stepOrder.indexOf(currentStep);
    const highestIndex = stepOrder.indexOf(highestStepReached);

    // Only auto-advance if we're making forward progress (not returning to a completed step)
    const isForwardProgress = currentIndex >= highestIndex;
    
    if (!isForwardProgress) {
      console.log('Booking Flow: Skipping auto-advance - user returned to previous step');
      return;
    }

    // Auto-advance with feedback toast and delay
    if (currentStep === 'service' && selectedService && !selectedDate && !completedSteps.has('datetime')) {
      console.log('Booking Flow: Auto-advancing from service to datetime (first time)');
      toast.success('✓ Servicio seleccionado');
      setTimeout(() => setCurrentStep('datetime'), 800);
    } else if (currentStep === 'datetime' && selectedDate && selectedTime && !clientData.name && !completedSteps.has('details')) {
      console.log('Booking Flow: Auto-advancing from datetime to details (first time)');
      toast.success('✓ Fecha y hora seleccionadas');
      setTimeout(() => setCurrentStep('details'), 800);
    }
  }, [selectedService, selectedDate, selectedTime, clientData.name, currentStep, isManualNavigation, isTransitioning, completedSteps, highestStepReached]);

  const handleStepTransition = (newStep: BookingStep, isManual = false) => {
    console.log(`Booking Flow: Transitioning to ${newStep}, manual: ${isManual}`);
    if (isManual) {
      setIsManualNavigation(true);
    }
    setIsTransitioning(true);
    setTimeout(() => {
      setCurrentStep(newStep);
      onStepChange?.(newStep);
      setIsTransitioning(false);
    }, 150);
  };

  const canNavigateToStep = (stepId: BookingStep) => {
    const stepOrder: BookingStep[] = ['service', 'datetime', 'details', 'confirmation'];
    const targetIndex = stepOrder.indexOf(stepId);
    const currentIndex = stepOrder.indexOf(currentStep);
    const highestIndex = stepOrder.indexOf(highestStepReached);
    
    // Can navigate to current step or any completed step (up to highest reached)
    return targetIndex <= highestIndex || targetIndex === currentIndex;
  };

  const canGoNext = () => {
    return isStepComplete() && currentStepIndex < steps.length - 1;
  };

  const canGoPrev = () => {
    return currentStepIndex > 0;
  };

  const handleNext = () => {
    if (canGoNext()) {
      const nextStep = steps[currentStepIndex + 1].id as BookingStep;
      handleStepTransition(nextStep);
    }
  };

  const handlePrev = () => {
    if (canGoPrev()) {
      const prevStep = steps[currentStepIndex - 1].id as BookingStep;
      handleStepTransition(prevStep, true); // Mark as manual navigation
    }
  };

  if (isMobile) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-secondary to-background">
        {/* Mobile Progress Header */}
        <div className="sticky top-0 z-50 bg-card/95 backdrop-blur-sm border-b border-border/50 p-4">
          <div className="flex items-center justify-between mb-3">
            <Button
              variant="ghost"
              size="sm"
              onClick={handlePrev}
              disabled={!canGoPrev()}
              className="h-8 w-8 p-0"
            >
              <ChevronLeft className="h-4 w-4" />
            </Button>
            <div className="text-center flex-1">
              <h3 className="font-semibold text-sm">{currentStepData.label}</h3>
              <div className="flex items-center justify-center gap-1.5 mt-1">
                {steps.map((step, index) => {
                  const isCompleted = completedSteps.has(step.id as BookingStep);
                  const isCurrent = step.id === currentStep;
                  const canNavigate = canNavigateToStep(step.id as BookingStep);
                  
                  return (
                    <button
                      key={step.id}
                      onClick={() => canNavigate && handleStepTransition(step.id as BookingStep, true)}
                      disabled={!canNavigate}
                      className={cn(
                        "w-2 h-2 rounded-full transition-all",
                        isCurrent && "w-6",
                        isCompleted ? "bg-primary" : "bg-muted",
                        canNavigate && !isCurrent && "hover:scale-125 cursor-pointer",
                        !canNavigate && "opacity-40"
                      )}
                    />
                  );
                })}
              </div>
            </div>
            <div className="w-8" />
          </div>
          <Progress value={currentStepData.progress} className="h-1" />
        </div>

        {/* Mobile Content */}
        <div className="p-4">
          <div className={cn(
            "transition-all duration-300 ease-in-out",
            isTransitioning && "opacity-50 scale-95"
          )}>
            {Children.map(children, (child, index) => {
              if (index === currentStepIndex && isValidElement(child)) {
                return cloneElement(child, {
                  ...child.props,
                  onEditService: () => handleStepTransition('service' as BookingStep, true),
                  onEditDateTime: () => handleStepTransition('datetime' as BookingStep, true)
                } as any);
              }
              return null;
            })}
          </div>
        </div>

        {/* Mobile Bottom CTA */}
        {currentStep !== 'confirmation' && (
          <div className="fixed bottom-0 left-0 right-0 p-4 bg-card/95 backdrop-blur-sm border-t border-border/50">
            <Button
              onClick={currentStep === 'details' ? onSubmit : handleNext}
              disabled={!isStepComplete()}
              className={`w-full h-12 text-lg font-semibold shadow-lg ${themeClasses.gradient} text-primary-foreground hover:opacity-90`}
            >
              {currentStep === 'details' ? 'Confirmar Reserva' : 'Continuar'}
              <ChevronRight className="h-5 w-5 ml-2" />
            </Button>
          </div>
        )}
      </div>
    );
  }

  // Desktop/Tablet Layout
  return (
    <div className="min-h-screen bg-gradient-to-br from-secondary to-background">
      <div className="container mx-auto px-4 py-8">
        <div className={cn(
          "mx-auto transition-all duration-500 ease-in-out",
          getContainerSize()
        )}>
          {/* Desktop Progress Header */}
          <div className="mb-8">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-2xl font-bold text-foreground">Reservar Cita</h2>
              <div className="flex items-center space-x-3">
                {steps.map((step, index) => {
                  const isCompleted = completedSteps.has(step.id as BookingStep);
                  const isCurrent = step.id === currentStep;
                  const canNavigate = canNavigateToStep(step.id as BookingStep);
                  
                  return (
                    <div key={step.id} className="flex items-center">
                      <button
                        onClick={() => canNavigate && handleStepTransition(step.id as BookingStep, true)}
                        disabled={!canNavigate}
                        className={cn(
                          "w-10 h-10 rounded-full flex items-center justify-center text-sm font-medium transition-all relative group",
                          isCurrent && `${themeClasses.gradient} text-primary-foreground shadow-lg scale-110`,
                          !isCurrent && isCompleted && "bg-primary text-primary-foreground",
                          !isCurrent && !isCompleted && "bg-muted text-muted-foreground",
                          canNavigate && !isCurrent && "hover:scale-105 hover:shadow-md cursor-pointer",
                          !canNavigate && "opacity-40 cursor-not-allowed"
                        )}
                      >
                        {isCompleted && !isCurrent ? (
                          <Check className="h-5 w-5" />
                        ) : (
                          index + 1
                        )}
                        {canNavigate && !isCurrent && (
                          <span className="absolute -bottom-8 left-1/2 -translate-x-1/2 text-xs whitespace-nowrap opacity-0 group-hover:opacity-100 transition-opacity bg-card px-2 py-1 rounded shadow-lg">
                            {step.label}
                          </span>
                        )}
                      </button>
                      {index < steps.length - 1 && (
                        <div className={cn(
                          "w-12 h-0.5 mx-1 transition-colors",
                          isCompleted ? "bg-primary" : "bg-muted"
                        )} />
                      )}
                    </div>
                  );
                })}
              </div>
            </div>
            <Progress value={currentStepData.progress} className="h-2" />
          </div>

          {/* Desktop Content */}
          <Card className={cn(
            "border-border/50 shadow-2xl overflow-hidden transition-all duration-500 ease-in-out",
            isTransitioning && "scale-95 opacity-80"
          )}>
            <CardContent className="p-0">
              {Children.map(children, (child, index) => {
                if (index === currentStepIndex && isValidElement(child)) {
                  return cloneElement(child, {
                    ...child.props,
                    onEditService: () => handleStepTransition('service' as BookingStep, true),
                    onEditDateTime: () => handleStepTransition('datetime' as BookingStep, true)
                  } as any);
                }
                return null;
              })}
            </CardContent>
          </Card>

          {/* Desktop Navigation */}
          {currentStep !== 'confirmation' && (
            <div className="flex justify-between mt-6">
              <Button
                variant="outline"
                onClick={handlePrev}
                disabled={!canGoPrev()}
                className="px-6"
              >
                <ChevronLeft className="h-4 w-4 mr-2" />
                Anterior
              </Button>
              <Button
                onClick={currentStep === 'details' ? onSubmit : handleNext}
                disabled={!isStepComplete()}
                className={`px-6 ${themeClasses.gradient} text-primary-foreground hover:opacity-90`}
              >
                {currentStep === 'details' ? 'Confirmar Reserva' : 'Continuar'}
                <ChevronRight className="h-4 w-4 ml-2" />
              </Button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default ProgressiveBookingFlow;