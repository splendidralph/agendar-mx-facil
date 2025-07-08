
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Calendar, Users, ArrowRight, Link2, Search, Filter, MapPin } from "lucide-react";
import { useNavigate } from "react-router-dom";
import LocationCapture from "@/components/explore/LocationCapture";
import ProviderCard from "@/components/explore/ProviderCard";
import { useProviderFiltering } from "@/hooks/useProviderFiltering";
import { categoryLabels } from "@/utils/serviceCategories";

const Explore = () => {
  const navigate = useNavigate();
  const [locationFilter, setLocationFilter] = useState<{ colonia: string; postalCode: string } | undefined>();
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [showLocationCapture, setShowLocationCapture] = useState(true);

  const { providers, loading, error, filterByCategory, filterBySearch } = useProviderFiltering(locationFilter);

  const handleLocationSelected = (location: { colonia: string; postalCode: string }) => {
    setLocationFilter(location);
    setShowLocationCapture(false);
  };

  const handleChangeLocation = () => {
    setShowLocationCapture(true);
    setLocationFilter(undefined);
  };

  // Apply filters
  const filteredProviders = (() => {
    let filtered = providers;
    
    if (selectedCategory !== 'all') {
      filtered = filterByCategory(selectedCategory);
    }
    
    if (searchTerm.trim()) {
      filtered = filterBySearch(searchTerm);
    }
    
    return filtered;
  })();

  const categories = [
    { value: 'all', label: 'Todos' },
    { value: 'corte_barberia', label: 'Corte & Barbería' },
    { value: 'unas', label: 'Uñas' },
    { value: 'maquillaje_cejas', label: 'Maquillaje & Cejas' },
    { value: 'cuidado_facial', label: 'Cuidado Facial' },
    { value: 'masajes_relajacion', label: 'Masajes & Relajación' },
    { value: 'color_alisado', label: 'Color & Alisado' }
  ];

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
        {showLocationCapture ? (
          <div className="max-w-md mx-auto mt-16">
            <LocationCapture onLocationSelected={handleLocationSelected} />
          </div>
        ) : (
          <>
            {/* Header with location */}
            <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 mb-8">
              <div>
              <h1 className="text-3xl font-bold text-foreground mb-2">
                Profesionales en {locationFilter?.colonia}
              </h1>
              <p className="text-muted-foreground">
                Descubre y reserva con profesionales en tu área local
              </p>
              </div>
              <Button 
                variant="outline" 
                onClick={handleChangeLocation}
                className="flex items-center gap-2"
              >
                <MapPin className="h-4 w-4" />
                Cambiar ubicación
              </Button>
            </div>

            {/* Search and Filters */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8">
              <div className="md:col-span-2">
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground h-4 w-4" />
                  <Input
                    placeholder="Buscar por nombre, servicio o ubicación..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="pl-10 border-border focus:border-primary"
                  />
                </div>
              </div>
              <div>
                <Select value={selectedCategory} onValueChange={setSelectedCategory}>
                  <SelectTrigger className="border-border focus:border-primary">
                    <Filter className="h-4 w-4 mr-2" />
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent className="bg-card border-border">
                    {categories.map(category => (
                      <SelectItem key={category.value} value={category.value}>
                        {category.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>

            {/* Results */}
            {loading ? (
              <div className="text-center py-16">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto mb-4"></div>
                <p className="text-muted-foreground">Cargando profesionales...</p>
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
                  Intenta ajustar tus filtros o cambia tu ubicación
                </p>
                <div className="flex gap-4 justify-center">
                  <Button variant="outline" onClick={() => {
                    setSearchTerm('');
                    setSelectedCategory('all');
                  }}>
                    Limpiar filtros
                  </Button>
                  <Button onClick={handleChangeLocation}>
                    Cambiar ubicación
                  </Button>
                </div>
              </div>
            ) : (
              <>
                <div className="flex justify-between items-center mb-6">
                  <p className="text-muted-foreground">
                    {filteredProviders.length} profesional{filteredProviders.length !== 1 ? 'es' : ''} encontrado{filteredProviders.length !== 1 ? 's' : ''}
                  </p>
                  {locationFilter && (
                    <div className="flex items-center gap-2 text-sm text-muted-foreground">
                      <MapPin className="h-4 w-4" />
                      <span>Ordenado por proximidad</span>
                    </div>
                  )}
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-12">
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
          </>
        )}
      </div>
    </div>
  );
};

export default Explore;
