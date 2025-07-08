import { Card, CardContent } from "@/components/ui/card";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { MapPin, Tag, DollarSign, Star, X, Filter } from "lucide-react";
import { useState } from "react";
import { useCategories } from "@/hooks/useCategories";

interface MarketplaceFiltersProps {
  selectedCity: string;
  setSelectedCity: (city: string) => void;
  selectedCategory: string;
  setSelectedCategory: (category: string) => void;
  priceRange: string;
  setPriceRange: (range: string) => void;
  minRating: string;
  setMinRating: (rating: string) => void;
  sortBy: string;
  setSortBy: (sort: string) => void;
  onClearFilters: () => void;
  resultsCount: number;
}

const MarketplaceFilters = ({
  selectedCity,
  setSelectedCity,
  selectedCategory,
  setSelectedCategory,
  priceRange,
  setPriceRange,
  minRating,
  setMinRating,
  sortBy,
  setSortBy,
  onClearFilters,
  resultsCount,
}: MarketplaceFiltersProps) => {
  const [showMobileFilters, setShowMobileFilters] = useState(false);

  const cities = ["Tijuana", "Ciudad de México", "Guadalajara", "Monterrey", "Puebla"];
  const { mainCategories } = useCategories();
  
  const priceRanges = [
    { value: "0-200", label: "$0 - $200" },
    { value: "200-500", label: "$200 - $500" },
    { value: "500-1000", label: "$500 - $1000" },
    { value: "1000+", label: "$1000+" }
  ];
  
  const ratings = [
    { value: "4.5", label: "4.5+ estrellas" },
    { value: "4.0", label: "4.0+ estrellas" },
    { value: "3.5", label: "3.5+ estrellas" }
  ];

  const sortOptions = [
    { value: "relevance", label: "Relevancia" },
    { value: "rating", label: "Mejor calificados" },
    { value: "price_low", label: "Precio: menor a mayor" },
    { value: "price_high", label: "Precio: mayor a menor" },
    { value: "newest", label: "Más recientes" }
  ];

  const getActiveFilters = () => {
    const filters = [];
    if (selectedCity !== 'all') filters.push({ type: 'city', value: selectedCity });
    if (selectedCategory !== 'all') filters.push({ type: 'category', value: mainCategories.find(c => c.id === selectedCategory)?.display_name || selectedCategory });
    if (priceRange !== 'all') filters.push({ type: 'price', value: priceRanges.find(p => p.value === priceRange)?.label || priceRange });
    if (minRating !== 'all') filters.push({ type: 'rating', value: ratings.find(r => r.value === minRating)?.label || minRating });
    return filters;
  };

  const removeFilter = (type: string) => {
    switch (type) {
      case 'city': setSelectedCity('all'); break;
      case 'category': setSelectedCategory('all'); break;
      case 'price': setPriceRange('all'); break;
      case 'rating': setMinRating('all'); break;
    }
  };

  const activeFilters = getActiveFilters();

  return (
    <div className="space-y-4">
      {/* Results Summary & Sort */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div className="flex items-center gap-4">
          <p className="text-muted-foreground">
            {resultsCount} profesional{resultsCount !== 1 ? 'es' : ''} encontrado{resultsCount !== 1 ? 's' : ''}
          </p>
          {activeFilters.length > 0 && (
            <Button variant="ghost" size="sm" onClick={onClearFilters} className="text-muted-foreground">
              Limpiar filtros
            </Button>
          )}
        </div>
        
        <div className="flex items-center gap-4">
          <Button
            variant="outline"
            size="sm"
            onClick={() => setShowMobileFilters(!showMobileFilters)}
            className="sm:hidden"
          >
            <Filter className="h-4 w-4 mr-2" />
            Filtros
          </Button>
          
          <Select value={sortBy} onValueChange={setSortBy}>
            <SelectTrigger className="w-[180px]">
              <SelectValue placeholder="Ordenar por" />
            </SelectTrigger>
            <SelectContent>
              {sortOptions.map(option => (
                <SelectItem key={option.value} value={option.value}>
                  {option.label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
      </div>

      {/* Active Filters */}
      {activeFilters.length > 0 && (
        <div className="flex flex-wrap gap-2">
          {activeFilters.map((filter, index) => (
            <Badge key={index} variant="secondary" className="gap-2">
              {filter.value}
              <Button
                variant="ghost"
                size="sm"
                className="h-auto p-0 w-4 h-4"
                onClick={() => removeFilter(filter.type)}
              >
                <X className="h-3 w-3" />
              </Button>
            </Badge>
          ))}
        </div>
      )}

      {/* Desktop Filters */}
      <Card className={`bg-card/80 backdrop-blur-sm ${showMobileFilters ? 'block' : 'hidden sm:block'}`}>
        <CardContent className="p-4">
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            {/* Location Filter */}
            <div className="space-y-2">
              <div className="flex items-center space-x-2 text-sm font-medium text-foreground">
                <MapPin className="h-4 w-4" />
                <span>Ciudad</span>
              </div>
              <Select value={selectedCity} onValueChange={setSelectedCity}>
                <SelectTrigger>
                  <SelectValue placeholder="Todas las ciudades" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">Todas las ciudades</SelectItem>
                  {cities.map((city) => (
                    <SelectItem key={city} value={city}>
                      {city}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            {/* Category Filter */}
            <div className="space-y-2">
              <div className="flex items-center space-x-2 text-sm font-medium text-foreground">
                <Tag className="h-4 w-4" />
                <span>Categoría</span>
              </div>
              <Select value={selectedCategory} onValueChange={setSelectedCategory}>
                <SelectTrigger>
                  <SelectValue placeholder="Todas las categorías" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">Todas las categorías</SelectItem>
                  {mainCategories.map((category) => (
                    <SelectItem key={category.id} value={category.id}>
                      {category.display_name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            {/* Price Range Filter */}
            <div className="space-y-2">
              <div className="flex items-center space-x-2 text-sm font-medium text-foreground">
                <DollarSign className="h-4 w-4" />
                <span>Precio</span>
              </div>
              <Select value={priceRange} onValueChange={setPriceRange}>
                <SelectTrigger>
                  <SelectValue placeholder="Cualquier precio" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">Cualquier precio</SelectItem>
                  {priceRanges.map((range) => (
                    <SelectItem key={range.value} value={range.value}>
                      {range.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            {/* Rating Filter */}
            <div className="space-y-2">
              <div className="flex items-center space-x-2 text-sm font-medium text-foreground">
                <Star className="h-4 w-4" />
                <span>Calificación</span>
              </div>
              <Select value={minRating} onValueChange={setMinRating}>
                <SelectTrigger>
                  <SelectValue placeholder="Cualquier calificación" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">Cualquier calificación</SelectItem>
                  {ratings.map((rating) => (
                    <SelectItem key={rating.value} value={rating.value}>
                      {rating.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default MarketplaceFilters;