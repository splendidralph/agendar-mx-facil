import { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { MapPin, Search } from "lucide-react";
import { useLocations } from '@/hooks/useLocations';
import { City, Zone } from '@/types/location';

interface LocationCaptureProps {
  onLocationSelected: (location: { zone_id: string; city_id: string }) => void;
  className?: string;
}

const LocationCapture = ({ onLocationSelected, className }: LocationCaptureProps) => {
  const { cities, loading: citiesLoading, getZonesByCity } = useLocations();
  
  const [selectedCity, setSelectedCity] = useState<City | null>(null);
  const [selectedZone, setSelectedZone] = useState<Zone | null>(null);
  
  const [zones, setZones] = useState<Zone[]>([]);
  const [loadingZones, setLoadingZones] = useState(false);

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

  const handleCitySelect = (cityName: string) => {
    const city = cities.find(c => c.name === cityName);
    setSelectedCity(city || null);
    setSelectedZone(null);
  };

  const handleZoneSelect = (zoneName: string) => {
    const zone = zones.find(z => z.name === zoneName);
    setSelectedZone(zone || null);
  };

  const handleSubmit = () => {
    if (selectedCity && selectedZone) {
      onLocationSelected({
        city_id: selectedCity.id,
        zone_id: selectedZone.id
      });
    }
  };

  const isValid = selectedCity && selectedZone;

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
          <Select value={selectedCity?.name || ''} onValueChange={handleCitySelect} disabled={citiesLoading}>
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
        {selectedCity && (
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