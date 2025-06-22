
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Separator } from "@/components/ui/separator";
import { MapPin, Tag, DollarSign, Star } from "lucide-react";

interface SearchFiltersProps {
  selectedCity: string;
  setSelectedCity: (city: string) => void;
  selectedCategory: string;
  setSelectedCategory: (category: string) => void;
  priceRange: string;
  setPriceRange: (range: string) => void;
  minRating: string;
  setMinRating: (rating: string) => void;
}

const SearchFilters = ({
  selectedCity,
  setSelectedCity,
  selectedCategory,
  setSelectedCategory,
  priceRange,
  setPriceRange,
  minRating,
  setMinRating,
}: SearchFiltersProps) => {
  const cities = ["Tijuana", "Ciudad de México", "Guadalajara", "Monterrey", "Puebla"];
  const categories = ["Barbería", "Salón de Belleza", "Nails", "Masajes", "Spa"];
  const priceRanges = [
    { value: "0-200", label: "$0 - $200 MXN" },
    { value: "200-500", label: "$200 - $500 MXN" },
    { value: "500-1000", label: "$500 - $1000 MXN" },
    { value: "1000+", label: "$1000+ MXN" }
  ];
  const ratings = [
    { value: "4.5", label: "4.5+ estrellas" },
    { value: "4.0", label: "4.0+ estrellas" },
    { value: "3.5", label: "3.5+ estrellas" }
  ];

  return (
    <Card className="bg-card/80 backdrop-blur-sm">
      <CardHeader>
        <CardTitle className="text-lg flex items-center space-x-2">
          <span>Filtros</span>
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-6">
        {/* City Filter */}
        <div className="space-y-3">
          <div className="flex items-center space-x-2 text-sm font-medium text-foreground">
            <MapPin className="h-4 w-4" />
            <span>Ciudad</span>
          </div>
          <Select value={selectedCity} onValueChange={setSelectedCity}>
            <SelectTrigger>
              <SelectValue placeholder="Todas las ciudades" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="">Todas las ciudades</SelectItem>
              {cities.map((city) => (
                <SelectItem key={city} value={city}>
                  {city}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        <Separator />

        {/* Category Filter */}
        <div className="space-y-3">
          <div className="flex items-center space-x-2 text-sm font-medium text-foreground">
            <Tag className="h-4 w-4" />
            <span>Categoría</span>
          </div>
          <Select value={selectedCategory} onValueChange={setSelectedCategory}>
            <SelectTrigger>
              <SelectValue placeholder="Todas las categorías" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="">Todas las categorías</SelectItem>
              {categories.map((category) => (
                <SelectItem key={category} value={category}>
                  {category}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        <Separator />

        {/* Price Range Filter */}
        <div className="space-y-3">
          <div className="flex items-center space-x-2 text-sm font-medium text-foreground">
            <DollarSign className="h-4 w-4" />
            <span>Rango de Precio</span>
          </div>
          <Select value={priceRange} onValueChange={setPriceRange}>
            <SelectTrigger>
              <SelectValue placeholder="Cualquier precio" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="">Cualquier precio</SelectItem>
              {priceRanges.map((range) => (
                <SelectItem key={range.value} value={range.value}>
                  {range.label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        <Separator />

        {/* Rating Filter */}
        <div className="space-y-3">
          <div className="flex items-center space-x-2 text-sm font-medium text-foreground">
            <Star className="h-4 w-4" />
            <span>Calificación</span>
          </div>
          <Select value={minRating} onValueChange={setMinRating}>
            <SelectTrigger>
              <SelectValue placeholder="Cualquier calificación" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="">Cualquier calificación</SelectItem>
              {ratings.map((rating) => (
                <SelectItem key={rating.value} value={rating.value}>
                  {rating.label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
      </CardContent>
    </Card>
  );
};

export default SearchFilters;
