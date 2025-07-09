import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Palette, Check } from 'lucide-react';

interface ThemeColor {
  id: string;
  name: string;
  displayName: string;
  gradient: string;
  description: string;
}

const themeColors: ThemeColor[] = [
  {
    id: 'blue',
    name: 'blue',
    displayName: 'Azul Profesional',
    gradient: 'gradient-theme-blue',
    description: 'Confiable y profesional'
  },
  {
    id: 'green',
    name: 'green',
    displayName: 'Verde Naturaleza',
    gradient: 'gradient-theme-green',
    description: 'Salud, bienestar y naturaleza'
  },
  {
    id: 'purple',
    name: 'purple',
    displayName: 'Púrpura Creativo',
    gradient: 'gradient-theme-purple',
    description: 'Belleza, creatividad y lujo'
  },
  {
    id: 'orange',
    name: 'orange',
    displayName: 'Naranja Energético',
    gradient: 'gradient-theme-orange',
    description: 'Energía, fitness y vitalidad'
  },
  {
    id: 'pink',
    name: 'pink',
    displayName: 'Rosa Elegante',
    gradient: 'gradient-theme-pink',
    description: 'Belleza y servicios wellness'
  },
  {
    id: 'teal',
    name: 'teal',
    displayName: 'Verde Azulado Moderno',
    gradient: 'gradient-theme-teal',
    description: 'Moderno, tecnológico y limpio'
  },
  {
    id: 'red',
    name: 'red',
    displayName: 'Rojo Dinámico',
    gradient: 'gradient-theme-red',
    description: 'Audaz, urgente y enérgico'
  },
  {
    id: 'indigo',
    name: 'indigo',
    displayName: 'Índigo Premium',
    gradient: 'gradient-theme-indigo',
    description: 'Sofisticado y premium'
  }
];

interface ThemeColorSelectorProps {
  currentTheme: string;
  onThemeChange: (theme: string) => void;
  disabled?: boolean;
}

const ThemeColorSelector = ({ currentTheme, onThemeChange, disabled }: ThemeColorSelectorProps) => {
  const [selectedTheme, setSelectedTheme] = useState(currentTheme);

  const handleThemeSelect = (themeId: string) => {
    setSelectedTheme(themeId);
    onThemeChange(themeId);
  };

  return (
    <Card className="border-border/50 shadow-lg">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Palette className="h-5 w-5" />
          Color del Perfil
        </CardTitle>
        <p className="text-sm text-muted-foreground">
          Elige un color que represente tu marca y personalidad profesional
        </p>
      </CardHeader>
      <CardContent>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
          {themeColors.map((theme) => (
            <div key={theme.id} className="relative">
              <Button
                variant="outline"
                className={`w-full h-20 p-0 overflow-hidden transition-all duration-200 hover:scale-105 ${
                  selectedTheme === theme.id ? 'ring-2 ring-primary ring-offset-2' : ''
                }`}
                onClick={() => handleThemeSelect(theme.id)}
                disabled={disabled}
              >
                <div className={`w-full h-full ${theme.gradient} flex items-center justify-center relative`}>
                  {selectedTheme === theme.id && (
                    <div className="absolute inset-0 bg-white/20 flex items-center justify-center">
                      <Check className="h-6 w-6 text-white drop-shadow-lg" />
                    </div>
                  )}
                </div>
              </Button>
              <div className="mt-2 text-center">
                <p className="text-xs font-medium text-foreground">{theme.displayName}</p>
                <p className="text-xs text-muted-foreground">{theme.description}</p>
              </div>
            </div>
          ))}
        </div>
        
        {selectedTheme !== currentTheme && (
          <div className="mt-4 p-3 bg-muted/50 rounded-lg">
            <p className="text-sm text-muted-foreground">
              💡 Los cambios se aplicarán inmediatamente a tu perfil público
            </p>
          </div>
        )}
      </CardContent>
    </Card>
  );
};

export default ThemeColorSelector;