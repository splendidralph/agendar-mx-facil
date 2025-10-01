import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Clock, CheckCircle } from 'lucide-react';
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
        {selectedService ? (
          <div className="mb-4 p-3 bg-primary/10 border border-primary/20 rounded-lg flex items-start gap-2">
            <CheckCircle className="h-5 w-5 text-primary mt-0.5 flex-shrink-0" />
            <div>
              <p className="text-sm font-medium text-foreground">Servicio seleccionado</p>
              <p className="text-xs text-muted-foreground mt-0.5">Puedes cambiar tu selección abajo</p>
            </div>
          </div>
        ) : (
          <div className="mb-6">
            <h3 className="text-xl font-semibold text-foreground mb-2">Selecciona un servicio</h3>
            <p className="text-sm text-muted-foreground">Elige el servicio que deseas reservar</p>
          </div>
        )}
        
        {services.length === 0 ? (
          <div className="text-center py-12">
            <p className="text-muted-foreground">No hay servicios disponibles</p>
          </div>
        ) : (
          <div className="space-y-3">
            {services.map((service) => {
              const isSelected = selectedService?.id === service.id;
              return (
                <div
                  key={service.id}
                  className={cn(
                    "relative p-4 rounded-xl cursor-pointer smooth-transition touch-manipulation border-2",
                    isSelected
                      ? "shadow-lg scale-[1.02] bg-primary/5"
                      : "border-border hover:border-primary/30 hover:shadow-sm active:scale-95"
                  )}
                  style={isSelected ? { 
                    borderColor: themeClasses.primary,
                  } : undefined}
                  onClick={() => onServiceSelect(service)}
                >
                  {isSelected && (
                    <CheckCircle 
                      className="absolute top-3 right-3 h-5 w-5" 
                      style={{ color: themeClasses.primary }}
                    />
                  )}
                  <div className="flex justify-between items-start">
                    <div className="flex-1 pr-2">
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
                      <div className="text-2xl font-bold" style={{ color: themeClasses.primary }}>
                        ${service.price}
                      </div>
                      <div className="text-xs text-muted-foreground">MXN</div>
                    </div>
                  </div>
                </div>
              );
            })}
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
          {selectedService ? (
            <span className="flex items-center gap-2 text-primary">
              <CheckCircle className="h-4 w-4" />
              Servicio seleccionado - puedes cambiar tu selección
            </span>
          ) : (
            'Elige el servicio que deseas reservar'
          )}
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-3">
        {services.length === 0 ? (
          <div className="text-center py-8">
            <p className="text-muted-foreground">No hay servicios disponibles</p>
          </div>
        ) : (
          <div className="grid gap-3">
            {services.map((service) => {
              const isSelected = selectedService?.id === service.id;
              return (
                <div
                  key={service.id}
                  className={cn(
                    "relative p-4 rounded-xl cursor-pointer smooth-transition touch-manipulation border-2",
                    isSelected
                      ? "shadow-lg bg-primary/5"
                      : "border-border hover:border-primary/30 hover:shadow-sm"
                  )}
                  style={isSelected ? { 
                    borderColor: themeClasses.primary,
                  } : undefined}
                  onClick={() => onServiceSelect(service)}
                >
                  {isSelected && (
                    <CheckCircle 
                      className="absolute top-3 right-3 h-5 w-5" 
                      style={{ color: themeClasses.primary }}
                    />
                  )}
                  <div className="flex justify-between items-start">
                    <div className="flex-1 pr-2">
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
                      <div className="text-2xl font-bold" style={{ color: themeClasses.primary }}>
                        ${service.price}
                      </div>
                      <div className="text-xs text-muted-foreground">MXN</div>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </CardContent>
    </Card>
  );
};

export default ServiceSelectionStep;