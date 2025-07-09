
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Calendar, ArrowRight, Link2, Search } from "lucide-react";
import { useNavigate } from "react-router-dom";
import ProviderCard from "@/components/explore/ProviderCard";
import MarketplaceFilters from "@/components/explore/MarketplaceFilters";
import { useProviderFiltering } from "@/hooks/useProviderFiltering";

const Explore = () => {
  const navigate = useNavigate();
  const [locationFilter, setLocationFilter] = useState<{ zone_id: string; city_id: string } | undefined>();
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [selectedCity, setSelectedCity] = useState('all');
  const [priceRange, setPriceRange] = useState('all');
  const [minRating, setMinRating] = useState('all');
  const [sortBy, setSortBy] = useState('relevance');

  const { providers, loading, error, filterByCategory, filterBySearch } = useProviderFiltering(locationFilter);

  // Apply all filters
  const filteredProviders = (() => {
    let filtered = providers;
    
    if (selectedCategory !== 'all') {
      filtered = filterByCategory(selectedCategory);
    }
    
    if (searchTerm.trim()) {
      filtered = filterBySearch(searchTerm);
    }

    // Apply city filter
    if (selectedCity !== 'all') {
      filtered = filtered.filter(provider => 
        provider.city_id === selectedCity ||
        provider.address?.toLowerCase().includes(selectedCity.toLowerCase())
      );
    }

    // Apply price range filter
    if (priceRange !== 'all') {
      const [min, max] = priceRange === '1000+' ? [1000, Infinity] : priceRange.split('-').map(Number);
      filtered = filtered.filter(provider => {
        const startingPrice = provider.services.length > 0 
          ? Math.min(...provider.services.map(s => s.price))
          : 0;
        return startingPrice >= min && (max === Infinity || startingPrice <= max);
      });
    }

    // Apply rating filter
    if (minRating !== 'all') {
      const rating = parseFloat(minRating);
      filtered = filtered.filter(provider => (provider.rating || 0) >= rating);
    }

    // Apply sorting
    filtered.sort((a, b) => {
      switch (sortBy) {
        case 'rating':
          return (b.rating || 0) - (a.rating || 0);
        case 'price_low':
          const priceA = a.services.length > 0 ? Math.min(...a.services.map(s => s.price)) : 0;
          const priceB = b.services.length > 0 ? Math.min(...b.services.map(s => s.price)) : 0;
          return priceA - priceB;
        case 'price_high':
          const priceA2 = a.services.length > 0 ? Math.min(...a.services.map(s => s.price)) : 0;
          const priceB2 = b.services.length > 0 ? Math.min(...b.services.map(s => s.price)) : 0;
          return priceB2 - priceA2;
        case 'newest':
          return new Date(b.created_at || '').getTime() - new Date(a.created_at || '').getTime();
        default: // relevance
          if (locationFilter) {
            if (a.isLocal && !b.isLocal) return -1;
            if (!a.isLocal && b.isLocal) return 1;
          }
          return (b.rating || 0) - (a.rating || 0);
      }
    });
    
    return filtered;
  })();

  const handleClearFilters = () => {
    setSelectedCategory('all');
    setSelectedCity('all');
    setPriceRange('all');
    setMinRating('all');
    setSortBy('relevance');
    setSearchTerm('');
  };

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
                onClick={() => navigate('/auth')}
                className="btn-primary"
              >
                Obtener Mi Link
              </Button>
            </div>
          </div>
        </div>
      </header>

      <div className="container mx-auto px-4 py-8">
        {/* Breadcrumb */}
        <div className="flex items-center space-x-2 text-sm text-muted-foreground mb-6">
          <button onClick={() => navigate('/')} className="hover:text-foreground">
            Inicio
          </button>
          <span>/</span>
          <span className="text-foreground">Explorar Profesionales</span>
        </div>

        {/* Page Header */}
        <div className="mb-8">
          <h1 className="text-3xl md:text-4xl font-bold text-foreground mb-2">
            Profesionales de Belleza y Bienestar
          </h1>
          <p className="text-lg text-muted-foreground">
            Descubre y reserva con los mejores profesionales en tu área
          </p>
        </div>

        {/* Search Bar */}
        <div className="mb-6">
          <div className="relative max-w-2xl">
            <Search className="absolute left-4 top-1/2 transform -translate-y-1/2 text-muted-foreground h-5 w-5" />
            <Input
              placeholder="Buscar servicios, profesionales o ubicaciones..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-12 h-12 text-lg border-border focus:border-primary shadow-sm"
            />
          </div>
        </div>

        {/* Filters */}
        <MarketplaceFilters
          selectedCity={selectedCity}
          setSelectedCity={setSelectedCity}
          selectedCategory={selectedCategory}
          setSelectedCategory={setSelectedCategory}
          priceRange={priceRange}
          setPriceRange={setPriceRange}
          minRating={minRating}
          setMinRating={setMinRating}
          sortBy={sortBy}
          setSortBy={setSortBy}
          onClearFilters={handleClearFilters}
          resultsCount={filteredProviders.length}
        />

        {/* Results */}
        {loading ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6 mt-8">
            {Array.from({ length: 8 }).map((_, i) => (
              <div key={i} className="bg-card rounded-2xl border border-border p-4 animate-pulse">
                <div className="w-full h-48 bg-muted rounded-xl mb-4"></div>
                <div className="h-4 bg-muted rounded mb-2"></div>
                <div className="h-3 bg-muted rounded w-2/3 mb-2"></div>
                <div className="h-3 bg-muted rounded w-1/2"></div>
              </div>
            ))}
          </div>
        ) : error ? (
          <div className="text-center py-16">
            <p className="text-destructive mb-4">{error}</p>
            <Button variant="outline" onClick={() => window.location.reload()}>
              Intentar de nuevo
            </Button>
          </div>
        ) : filteredProviders.length === 0 ? (
          <div className="text-center py-16">
            <div className="gradient-primary text-primary-foreground p-6 rounded-2xl w-fit mx-auto mb-6">
              <Search className="h-8 w-8" />
            </div>
            <h3 className="text-xl font-semibold text-foreground mb-2">
              No encontramos profesionales
            </h3>
            <p className="text-muted-foreground mb-6">
              Intenta ajustar tus filtros de búsqueda
            </p>
            <Button variant="outline" onClick={handleClearFilters}>
              Limpiar todos los filtros
            </Button>
          </div>
        ) : (
          <>
            {/* Results Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6 mt-8 mb-12">
              {filteredProviders.map((provider) => (
                <ProviderCard key={provider.id} provider={provider} />
              ))}
            </div>

            {/* CTA for professionals */}
            <div className="bg-card border border-border/50 rounded-2xl p-8 text-center">
              <div className="gradient-primary text-primary-foreground p-4 rounded-xl w-fit mx-auto mb-6">
                <Link2 className="h-8 w-8" />
              </div>
              <h3 className="text-2xl font-bold text-foreground mb-4">
                ¿Eres profesional?
              </h3>
              <p className="text-muted-foreground mb-6 text-lg">
                Únete a nuestra comunidad y obtén tu link personalizado para recibir reservas
              </p>
              <Button 
                size="lg"
                onClick={() => navigate('/auth')}
                className="btn-primary px-8 py-4"
              >
                Crear Mi Perfil Gratis
                <ArrowRight className="h-5 w-5 ml-2" />
              </Button>
            </div>
          </>
        )}
      </div>
    </div>
  );
};

export default Explore;
