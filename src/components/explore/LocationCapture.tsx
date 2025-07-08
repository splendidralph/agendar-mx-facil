import { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { MapPin, Search } from "lucide-react";
import { useLocations } from '@/hooks/useLocations';
import { City, Zone, Location } from '@/types/location';

interface LocationCaptureProps {
  onLocationSelected: (location: { colonia: string; postalCode: string }) => void;
  className?: string;
}

const LocationCapture = ({ onLocationSelected, className }: LocationCaptureProps) => {
  const { cities, loading: citiesLoading, getCityById, getZonesByCity, getLocationsByZone } = useLocations();
  
  const [selectedCity, setSelectedCity] = useState<City | null>(null);
  const [selectedZone, setSelectedZone] = useState<Zone | null>(null);
  const [selectedLocation, setSelectedLocation] = useState<Location | null>(null);
  
  const [zones, setZones] = useState<Zone[]>([]);
  const [locations, setLocations] = useState<Location[]>([]);
  
  const [loadingZones, setLoadingZones] = useState(false);
  const [loadingLocations, setLoadingLocations] = useState(false);
  
  const [useCustom, setUseCustom] = useState(false);
  const [customColonia, setCustomColonia] = useState('');
  const [postalCode, setPostalCode] = useState('');

  // Load zones when city is selected
  useEffect(() => {
    if (!selectedCity) {
      setZones([]);
      setSelectedZone(null);
      return;
    }

    const loadZones = async () => {
      setLoadingZones(true);
      try {
        const zonesData = await getZonesByCity(selectedCity.id);
        setZones(zonesData);
      } catch (error) {
        console.error('Error loading zones:', error);
      } finally {
        setLoadingZones(false);
      }
    };

    loadZones();
  }, [selectedCity, getZonesByCity]);

  // Load locations when zone is selected
  useEffect(() => {
    if (!selectedZone) {
      setLocations([]);
      setSelectedLocation(null);
      return;
    }

    const loadLocations = async () => {
      setLoadingLocations(true);
      try {
        const locationsData = await getLocationsByZone(selectedZone.id);
        setLocations(locationsData);
      } catch (error) {
        console.error('Error loading locations:', error);
      } finally {
        setLoadingLocations(false);
      }
    };

    loadLocations();
  }, [selectedZone, getLocationsByZone]);

  // Update postal code when location is selected
  useEffect(() => {
    if (selectedLocation && selectedLocation.postal_code) {
      setPostalCode(selectedLocation.postal_code);
    }
  }, [selectedLocation]);

  const handleCitySelect = (cityName: string) => {
    const city = cities.find(c => c.name === cityName);
    setSelectedCity(city || null);
    setSelectedZone(null);
    setSelectedLocation(null);
    setPostalCode('');
    setUseCustom(false);
  };

  const handleZoneSelect = (zoneName: string) => {
    const zone = zones.find(z => z.name === zoneName);
    setSelectedZone(zone || null);
    setSelectedLocation(null);
    setPostalCode('');
    setUseCustom(false);
  };

  const handleLocationSelect = (locationName: string) => {
    const location = locations.find(l => l.colonia === locationName);
    setSelectedLocation(location || null);
    setUseCustom(false);
  };

  const handleSubmit = () => {
    const location = {
      colonia: useCustom ? customColonia : (selectedLocation?.colonia || ''),
      postalCode: postalCode
    };
    
    if (location.colonia && location.postalCode) {
      onLocationSelected(location);
    }
  };

  const isValid = useCustom 
    ? customColonia.trim() && postalCode.trim()
    : selectedLocation && postalCode;

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
        {/* City Selection */}
        <div>
          <Label className="text-foreground font-semibold">Selecciona tu ciudad</Label>
          <Select value={selectedCity?.name || ''} onValueChange={handleCitySelect} disabled={useCustom || citiesLoading}>
            <SelectTrigger className="mt-2 border-border focus:border-primary">
              <SelectValue placeholder={citiesLoading ? "Cargando ciudades..." : "Elige tu ciudad"} />
            </SelectTrigger>
            <SelectContent className="bg-card border-border">
              {cities.map((city) => (
                <SelectItem key={city.id} value={city.name}>
                  {city.name}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        {/* Zone Selection */}
        {selectedCity && !useCustom && (
          <div>
            <Label className="text-foreground font-semibold">Selecciona tu zona</Label>
            <Select value={selectedZone?.name || ''} onValueChange={handleZoneSelect} disabled={loadingZones}>
              <SelectTrigger className="mt-2 border-border focus:border-primary">
                <SelectValue placeholder={loadingZones ? "Cargando zonas..." : "Elige tu zona"} />
              </SelectTrigger>
              <SelectContent className="bg-card border-border">
                {zones.map((zone) => (
                  <SelectItem key={zone.id} value={zone.name}>
                    {zone.display_name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        )}

        {/* Location/Colonia Selection */}
        {selectedZone && !useCustom && (
          <div>
            <Label className="text-foreground font-semibold">Selecciona tu colonia</Label>
            <Select value={selectedLocation?.colonia || ''} onValueChange={handleLocationSelect} disabled={loadingLocations}>
              <SelectTrigger className="mt-2 border-border focus:border-primary">
                <SelectValue placeholder={loadingLocations ? "Cargando colonias..." : "Elige tu colonia"} />
              </SelectTrigger>
              <SelectContent className="bg-card border-border">
                {locations.map((location) => (
                  <SelectItem key={location.id} value={location.colonia || ''}>
                    <div className="flex justify-between items-center w-full">
                      <span>{location.colonia}</span>
                      {location.professional_count && location.professional_count > 0 && (
                        <span className="text-xs text-muted-foreground ml-2">
                          ({location.professional_count} pros)
                        </span>
                      )}
                    </div>
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        )}

        {/* Custom Option Toggle */}
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

        {/* Custom Colonia Input */}
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

        {/* Postal Code */}
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
            disabled={!useCustom && !!selectedLocation}
          />
        </div>

        {/* Submit Button */}
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