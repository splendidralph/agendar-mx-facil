import { useState, useEffect } from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import { ChevronLeft, ChevronRight } from 'lucide-react';
import { useIsMobile } from '@/hooks/use-mobile';
import { cn } from '@/lib/utils';

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
  children
}: ProgressiveBookingFlowProps) => {
  const [currentStep, setCurrentStep] = useState<BookingStep>('service');
  const [isTransitioning, setIsTransitioning] = useState(false);
  const [isManualNavigation, setIsManualNavigation] = useState(false);
  const [completedSteps, setCompletedSteps] = useState<Set<BookingStep>>(new Set());
  const [highestStepReached, setHighestStepReached] = useState<BookingStep>('service');
  const isMobile = useIsMobile();

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

  // Auto-advance logic with manual navigation protection
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

    // Auto-advance only when progressing forward for the first time
    if (currentStep === 'service' && selectedService && !selectedDate && !completedSteps.has('datetime')) {
      console.log('Booking Flow: Auto-advancing from service to datetime (first time)');
      setTimeout(() => setCurrentStep('datetime'), 300);
    } else if (currentStep === 'datetime' && selectedDate && selectedTime && !clientData.name && !completedSteps.has('details')) {
      console.log('Booking Flow: Auto-advancing from datetime to details (first time)');
      setTimeout(() => setCurrentStep('details'), 300);
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
      setIsTransitioning(false);
    }, 150);
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
            <div className="text-center">
              <h3 className="font-semibold text-sm">{currentStepData.label}</h3>
              <p className="text-xs text-muted-foreground">Paso {currentStepIndex + 1} de {steps.length}</p>
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
            {children[currentStepIndex]}
          </div>
        </div>

        {/* Mobile Bottom CTA */}
        {currentStep !== 'confirmation' && (
          <div className="fixed bottom-0 left-0 right-0 p-4 bg-card/95 backdrop-blur-sm border-t border-border/50">
            <Button
              onClick={currentStep === 'details' ? onSubmit : handleNext}
              disabled={!isStepComplete()}
              className="w-full h-12 text-lg font-semibold shadow-lg"
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
              <div className="flex items-center space-x-2">
                {steps.map((step, index) => (
                  <div
                    key={step.id}
                    className={cn(
                      "w-8 h-8 rounded-full flex items-center justify-center text-sm font-medium transition-all cursor-pointer",
                      index <= currentStepIndex
                        ? "bg-primary text-primary-foreground"
                        : "bg-muted text-muted-foreground"
                    )}
                    onClick={() => {
                      if (index < currentStepIndex) {
                        handleStepTransition(step.id as BookingStep);
                      }
                    }}
                  >
                    {index + 1}
                  </div>
                ))}
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
              {children[currentStepIndex]}
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
                className="px-6"
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