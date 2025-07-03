import { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { MapPin, Search } from "lucide-react";

interface LocationCaptureProps {
  onLocationSelected: (location: { colonia: string; postalCode: string }) => void;
  className?: string;
}

import { supabase } from '@/integrations/supabase/client';

const LocationCapture = ({ onLocationSelected, className }: LocationCaptureProps) => {
  const [selectedDelegacion, setSelectedDelegacion] = useState('');
  const [selectedColonia, setSelectedColonia] = useState('');
  const [customColonia, setCustomColonia] = useState('');
  const [postalCode, setPostalCode] = useState('');
  const [useCustom, setUseCustom] = useState(false);
  
  const [delegaciones, setDelegaciones] = useState<Array<{id: string, name: string}>>([]);
  const [coloniaGroups, setColoniaGroups] = useState<Array<{id: string, name: string, colonia: string, postal_code: string, group_label: string, professional_count: number}>>([]);
  const [loadingDelegaciones, setLoadingDelegaciones] = useState(false);
  const [loadingColonias, setLoadingColonias] = useState(false);

  // Load delegaciones on mount
  useEffect(() => {
    const loadDelegaciones = async () => {
      setLoadingDelegaciones(true);
      try {
        const { data: delegacionData, error } = await supabase
          .from('delegaciones')
          .select('id, name')
          .eq('is_active', true)
          .order('name');
        
        if (error) throw error;
        setDelegaciones(delegacionData || []);
      } catch (error) {
        console.error('Error loading delegaciones:', error);
      } finally {
        setLoadingDelegaciones(false);
      }
    };
    
    loadDelegaciones();
  }, []);

  // Load colonias when delegación is selected
  useEffect(() => {
    if (!selectedDelegacion) {
      setColoniaGroups([]);
      return;
    }

    const loadColonias = async () => {
      setLoadingColonias(true);
      try {
        const selectedDel = delegaciones.find(d => d.name === selectedDelegacion);
        if (!selectedDel) return;

        const { data: coloniaData, error } = await supabase
          .from('locations')
          .select('id, name, colonia, postal_code, group_label, professional_count')
          .eq('delegacion_id', selectedDel.id)
          .not('colonia', 'is', null)
          .order('group_label, colonia');
        
        if (error) throw error;
        setColoniaGroups(coloniaData || []);
      } catch (error) {
        console.error('Error loading colonias:', error);
      } finally {
        setLoadingColonias(false);
      }
    };
    
    loadColonias();
  }, [selectedDelegacion, delegaciones]);

  const handleDelegacionSelect = (delegacionName: string) => {
    setSelectedDelegacion(delegacionName);
    setSelectedColonia('');
    setPostalCode('');
    setUseCustom(false);
  };

  const handleColoniaSelect = (coloniaName: string) => {
    const colonia = coloniaGroups.find(c => c.colonia === coloniaName);
    if (colonia) {
      setSelectedColonia(coloniaName);
      setPostalCode(colonia.postal_code);
      setUseCustom(false);
    }
  };

  const handleSubmit = () => {
    const location = {
      colonia: useCustom ? customColonia : selectedColonia,
      postalCode: postalCode
    };
    
    if (location.colonia && location.postalCode) {
      onLocationSelected(location);
    }
  };

  const isValid = useCustom 
    ? customColonia.trim() && postalCode.trim()
    : selectedColonia && postalCode && selectedDelegacion;

  return (
    <Card className={`border-border/50 shadow-lg ${className}`}>
      <CardHeader className="text-center">
        <div className="gradient-primary text-primary-foreground p-3 rounded-xl w-fit mx-auto mb-4">
          <MapPin className="h-6 w-6" />
        </div>
        <CardTitle className="text-foreground">¿Dónde te encuentras?</CardTitle>
        <CardDescription className="font-inter">
          Encuentra profesionales cerca de ti
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        <div>
          <Label className="text-foreground font-semibold">Selecciona tu delegación</Label>
          <Select value={selectedDelegacion} onValueChange={handleDelegacionSelect} disabled={useCustom || loadingDelegaciones}>
            <SelectTrigger className="mt-2 border-border focus:border-primary">
              <SelectValue placeholder={loadingDelegaciones ? "Cargando..." : "Elige tu delegación"} />
            </SelectTrigger>
            <SelectContent className="bg-card border-border">
              {delegaciones.map((delegacion) => (
                <SelectItem key={delegacion.id} value={delegacion.name}>
                  {delegacion.name}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        {selectedDelegacion && !useCustom && (
          <div>
            <Label className="text-foreground font-semibold">Selecciona tu área/colonia</Label>
            <Select value={selectedColonia} onValueChange={handleColoniaSelect} disabled={loadingColonias}>
              <SelectTrigger className="mt-2 border-border focus:border-primary">
                <SelectValue placeholder={loadingColonias ? "Cargando..." : "Elige tu colonia"} />
              </SelectTrigger>
              <SelectContent className="bg-card border-border">
                {coloniaGroups.map((colonia) => (
                  <SelectItem key={colonia.id} value={colonia.colonia}>
                    <div className="flex justify-between items-center w-full">
                      <span>{colonia.colonia}</span>
                      {colonia.professional_count > 0 && (
                        <span className="text-xs text-muted-foreground ml-2">
                          ({colonia.professional_count} pros)
                        </span>
                      )}
                    </div>
                    <div className="text-xs text-muted-foreground">
                      {colonia.group_label}
                    </div>
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        )}

        <div className="text-center">
          <Button
            variant="ghost"
            size="sm"
            onClick={() => setUseCustom(!useCustom)}
            className="text-muted-foreground hover:text-foreground"
          >
            {useCustom ? 'Usar lista de colonias' : 'Mi colonia no está en la lista'}
          </Button>
        </div>

        {useCustom && (
          <div>
            <Label htmlFor="custom-colonia" className="text-foreground font-semibold">
              Escribe tu colonia
            </Label>
            <Input
              id="custom-colonia"
              value={customColonia}
              onChange={(e) => setCustomColonia(e.target.value)}
              placeholder="Ej. Roma Sur"
              className="mt-2 border-border focus:border-primary"
            />
          </div>
        )}

        <div>
          <Label htmlFor="postal-code" className="text-foreground font-semibold">
            Código Postal
          </Label>
          <Input
            id="postal-code"
            value={postalCode}
            onChange={(e) => setPostalCode(e.target.value)}
            placeholder="Ej. 22150"
            className="mt-2 border-border focus:border-primary"
            disabled={!useCustom && !!selectedColonia}
          />
        </div>

        <Button
          onClick={handleSubmit}
          disabled={!isValid}
          className="w-full btn-primary py-3"
        >
          <Search className="h-4 w-4 mr-2" />
          Buscar Profesionales
        </Button>
      </CardContent>
    </Card>
  );
};

export default LocationCapture;