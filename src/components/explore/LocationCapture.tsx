import { useState } from 'react';
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

const mexicoCityColonias = [
  { name: "Roma Norte", postalCode: "06700" },
  { name: "Condesa", postalCode: "06140" },
  { name: "Polanco", postalCode: "11560" },
  { name: "Coyoacán Centro", postalCode: "04000" },
  { name: "San Ángel", postalCode: "01000" },
  { name: "Santa Fe", postalCode: "01210" },
  { name: "Del Valle", postalCode: "03100" },
  { name: "Narvarte", postalCode: "03020" },
  { name: "Doctores", postalCode: "06720" },
  { name: "Escandón", postalCode: "11800" }
];

const LocationCapture = ({ onLocationSelected, className }: LocationCaptureProps) => {
  const [selectedColonia, setSelectedColonia] = useState('');
  const [customColonia, setCustomColonia] = useState('');
  const [postalCode, setPostalCode] = useState('');
  const [useCustom, setUseCustom] = useState(false);

  const handleColoniaSelect = (coloniaName: string) => {
    const colonia = mexicoCityColonias.find(c => c.name === coloniaName);
    if (colonia) {
      setSelectedColonia(coloniaName);
      setPostalCode(colonia.postalCode);
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
    : selectedColonia && postalCode;

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
          <Label className="text-foreground font-semibold">Selecciona tu colonia</Label>
          <Select value={selectedColonia} onValueChange={handleColoniaSelect} disabled={useCustom}>
            <SelectTrigger className="mt-2 border-border focus:border-primary">
              <SelectValue placeholder="Elige tu colonia" />
            </SelectTrigger>
            <SelectContent className="bg-card border-border">
              {mexicoCityColonias.map((colonia) => (
                <SelectItem key={colonia.name} value={colonia.name}>
                  {colonia.name}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

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
            placeholder="Ej. 06700"
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