
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Calendar, Search, MapPin, Star, Filter } from "lucide-react";
import { useNavigate } from "react-router-dom";
import SearchFilters from "@/components/explore/SearchFilters";
import ProviderCard from "@/components/explore/ProviderCard";
import { mockProviders } from "@/data/mockProviders";

const Explore = () => {
  const navigate = useNavigate();
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedCity, setSelectedCity] = useState("all");
  const [selectedCategory, setSelectedCategory] = useState("all");
  const [priceRange, setPriceRange] = useState("all");
  const [minRating, setMinRating] = useState("all");
  const [showFilters, setShowFilters] = useState(false);

  // Filter providers based on search criteria
  const filteredProviders = mockProviders.filter(provider => {
    const matchesSearch = searchQuery === "" || 
      provider.name?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      provider.category?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      provider.description?.toLowerCase().includes(searchQuery.toLowerCase());
    
    const matchesCity = selectedCity === "all" || provider.city === selectedCity;
    const matchesCategory = selectedCategory === "all" || provider.category === selectedCategory;
    const matchesRating = minRating === "all" || provider.rating >= parseFloat(minRating);
    
    return matchesSearch && matchesCity && matchesCategory && matchesRating;
  });

  return (
    <div className="min-h-screen bg-gradient-to-br from-secondary/30 to-background">
      {/* Header */}
      <header className="bg-card/80 backdrop-blur-sm border-b border-border sticky top-0 z-50">
        <div className="container mx-auto px-4 py-4">
          <div className="flex justify-between items-center">
            <div className="flex items-center space-x-3">
              <div className="gradient-primary text-primary-foreground p-2.5 rounded-xl shadow-lg">
                <Calendar className="h-6 w-6" />
              </div>
              <span className="text-2xl font-bold text-foreground font-poppins">Bookeasy.mx</span>
            </div>
            
            <div className="flex items-center space-x-2">
              <Button 
                variant="outline"
                onClick={() => navigate('/')}
                className="hidden sm:flex"
              >
                Inicio
              </Button>
              <Button 
                onClick={() => navigate('/register')}
                className="btn-primary"
              >
                Unirse
              </Button>
            </div>
          </div>
        </div>
      </header>

      <div className="container mx-auto px-4 py-8">
        {/* Page Title */}
        <div className="text-center mb-8">
          <h1 className="text-3xl md:text-4xl font-bold text-foreground mb-4">
            Encuentra tu profesional ideal
          </h1>
          <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
            Descubre y reserva con los mejores barberos y estilistas en tu ciudad
          </p>
        </div>

        {/* Search Bar */}
        <div className="max-w-2xl mx-auto mb-8">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground h-5 w-5" />
            <Input
              placeholder="Buscar por nombre, servicio o ubicación..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-10 h-12 text-base"
            />
          </div>
        </div>

        {/* Filter Toggle (Mobile) */}
        <div className="flex justify-between items-center mb-6 md:hidden">
          <span className="text-sm text-muted-foreground">
            {filteredProviders.length} profesionales encontrados
          </span>
          <Button
            variant="outline"
            size="sm"
            onClick={() => setShowFilters(!showFilters)}
            className="flex items-center space-x-2"
          >
            <Filter className="h-4 w-4" />
            <span>Filtros</span>
          </Button>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
          {/* Filters Sidebar */}
          <div className={`lg:col-span-1 ${showFilters ? 'block' : 'hidden lg:block'}`}>
            <SearchFilters
              selectedCity={selectedCity}
              setSelectedCity={setSelectedCity}
              selectedCategory={selectedCategory}
              setSelectedCategory={setSelectedCategory}
              priceRange={priceRange}
              setPriceRange={setPriceRange}
              minRating={minRating}
              setMinRating={setMinRating}
            />
          </div>

          {/* Results */}
          <div className="lg:col-span-3">
            {/* Results Count (Desktop) */}
            <div className="hidden md:flex justify-between items-center mb-6">
              <span className="text-sm text-muted-foreground">
                {filteredProviders.length} profesionales encontrados
              </span>
              <Select>
                <SelectTrigger className="w-48">
                  <SelectValue placeholder="Ordenar por" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="rating">Mejor calificados</SelectItem>
                  <SelectItem value="price-low">Precio: Menor a mayor</SelectItem>
                  <SelectItem value="price-high">Precio: Mayor a menor</SelectItem>
                  <SelectItem value="newest">Más recientes</SelectItem>
                </SelectContent>
              </Select>
            </div>

            {/* No Providers Message */}
            <div className="text-center py-16">
              <div className="gradient-primary text-primary-foreground p-4 rounded-2xl w-fit mx-auto mb-6">
                <Search className="h-8 w-8" />
              </div>
              <h3 className="text-xl font-semibold text-foreground mb-2">
                Aún no hay profesionales registrados
              </h3>
              <p className="text-muted-foreground mb-6">
                Los proveedores de servicios aparecerán aquí una vez que se registren en la plataforma
              </p>
              <Button
                onClick={() => navigate('/register')}
                className="btn-primary"
              >
                Registrarse como proveedor
              </Button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Explore;
