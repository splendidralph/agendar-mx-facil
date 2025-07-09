import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Clock } from 'lucide-react';
import { cn } from '@/lib/utils';
import { useTheme } from '@/contexts/ThemeContext';

interface Service {
  id: string;
  name: string;
  description: string;
  price: number;
  duration_minutes: number;
}

interface ServiceSelectionStepProps {
  services: Service[];
  selectedService: Service | null;
  onServiceSelect: (service: Service) => void;
  isMobile?: boolean;
}

const ServiceSelectionStep = ({ 
  services, 
  selectedService, 
  onServiceSelect,
  isMobile = false 
}: ServiceSelectionStepProps) => {
  const { getThemeClasses } = useTheme();
  const themeClasses = getThemeClasses();
  if (isMobile) {
    return (
      <div className="space-y-3">
        <div className="mb-6">
          <h3 className="text-xl font-semibold text-foreground mb-2">Selecciona un servicio</h3>
          <p className="text-sm text-muted-foreground">Elige el servicio que deseas reservar</p>
        </div>
        
        {services.length === 0 ? (
          <div className="text-center py-12">
            <p className="text-muted-foreground">No hay servicios disponibles</p>
          </div>
        ) : (
          <div className="space-y-3">
            {services.map((service) => (
              <div
                key={service.id}
                className={cn(
                  "p-4 border rounded-xl cursor-pointer smooth-transition touch-manipulation",
                  selectedService?.id === service.id
                    ? `border-[${themeClasses.primary}] bg-[${themeClasses.primary}]/5 shadow-md scale-105`
                    : `border-border hover:border-[${themeClasses.primary}]/50 hover:shadow-sm active:scale-95`
                )}
                onClick={() => onServiceSelect(service)}
              >
                <div className="flex justify-between items-start">
                  <div className="flex-1">
                    <h3 className="font-semibold text-foreground text-lg">{service.name}</h3>
                    {service.description && (
                      <p className="text-sm text-muted-foreground mt-1 mb-2">{service.description}</p>
                    )}
                    <div className="flex items-center text-sm text-muted-foreground">
                      <Clock className="h-4 w-4 mr-1" />
                      {service.duration_minutes} minutos
                    </div>
                  </div>
                  <div className="text-right ml-4">
                    <div className={`text-2xl font-bold text-[${themeClasses.primary}]`}>
                      ${service.price}
                    </div>
                    <div className="text-xs text-muted-foreground">MXN</div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    );
  }

  return (
    <Card className="border-none shadow-none">
      <CardHeader className="pb-4">
        <CardTitle className="text-foreground">Selecciona un servicio</CardTitle>
        <CardDescription>
          Elige el servicio que deseas reservar
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-3">
        {services.length === 0 ? (
          <div className="text-center py-8">
            <p className="text-muted-foreground">No hay servicios disponibles</p>
          </div>
        ) : (
          <div className="grid gap-3">
            {services.map((service) => (
              <div
                key={service.id}
                className={cn(
                  "p-4 border rounded-xl cursor-pointer smooth-transition touch-manipulation",
                  selectedService?.id === service.id
                    ? `border-[${themeClasses.primary}] bg-[${themeClasses.primary}]/5 shadow-md`
                    : `border-border hover:border-[${themeClasses.primary}]/50 hover:shadow-sm`
                )}
                onClick={() => onServiceSelect(service)}
              >
                <div className="flex justify-between items-start">
                  <div className="flex-1">
                    <h3 className="font-semibold text-foreground text-lg">{service.name}</h3>
                    {service.description && (
                      <p className="text-sm text-muted-foreground mt-1 mb-2">{service.description}</p>
                    )}
                    <div className="flex items-center text-sm text-muted-foreground">
                      <Clock className="h-4 w-4 mr-1" />
                      {service.duration_minutes} minutos
                    </div>
                  </div>
                  <div className="text-right">
                    <div className={`text-2xl font-bold text-[${themeClasses.primary}]`}>
                      ${service.price}
                    </div>
                    <div className="text-xs text-muted-foreground">MXN</div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </CardContent>
    </Card>
  );
};

export default ServiceSelectionStep;