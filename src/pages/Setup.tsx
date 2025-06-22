
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Calendar, ChevronLeft, Plus, Trash2 } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { toast } from "sonner";

const Setup = () => {
  const navigate = useNavigate();
  const [services, setServices] = useState([
    { id: 1, name: "", price: "", duration: "" }
  ]);

  const addService = () => {
    setServices(prev => [...prev, { 
      id: Date.now(), 
      name: "", 
      price: "", 
      duration: "" 
    }]);
  };

  const removeService = (id: number) => {
    setServices(prev => prev.filter(service => service.id !== id));
  };

  const updateService = (id: number, field: string, value: string) => {
    setServices(prev => prev.map(service => 
      service.id === id ? { ...service, [field]: value } : service
    ));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    console.log("Servicios:", services);
    toast.success("¡Servicios configurados! Tu perfil está listo.");
    navigate('/dashboard');
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-bookeasy-50 to-white">
      {/* Header */}
      <header className="bg-white/80 backdrop-blur-sm border-b border-bookeasy-100">
        <div className="container mx-auto px-4 py-4 flex items-center">
          <Button 
            variant="ghost" 
            onClick={() => navigate('/register')}
            className="mr-4 text-bookeasy-700 hover:bg-bookeasy-50"
          >
            <ChevronLeft className="h-4 w-4 mr-2" />
            Volver
          </Button>
          <div className="flex items-center space-x-2">
            <div className="bg-gradient-primary text-white p-2 rounded-lg">
              <Calendar className="h-5 w-5" />
            </div>
            <span className="text-xl font-bold text-bookeasy-800">Bookeasy.mx</span>
          </div>
        </div>
      </header>

      <div className="container mx-auto px-4 py-12">
        <div className="max-w-2xl mx-auto">
          <div className="text-center mb-8 animate-fade-in">
            <h1 className="text-3xl font-bold text-bookeasy-900 mb-2">
              Configura Tus Servicios
            </h1>
            <p className="text-bookeasy-600">
              Define los servicios que ofreces y sus precios
            </p>
          </div>

          <Card className="animate-slide-up border-bookeasy-100">
            <CardHeader>
              <CardTitle className="text-bookeasy-800">Mis Servicios</CardTitle>
              <CardDescription>
                Agrega todos los servicios que ofreces
              </CardDescription>
            </CardHeader>
            <CardContent>
              <form onSubmit={handleSubmit} className="space-y-6">
                {services.map((service, index) => (
                  <div key={service.id} className="p-4 border border-bookeasy-200 rounded-lg space-y-4">
                    <div className="flex justify-between items-center">
                      <h3 className="font-medium text-bookeasy-800">
                        Servicio {index + 1}
                      </h3>
                      {services.length > 1 && (
                        <Button
                          type="button"
                          variant="ghost"
                          size="sm"
                          onClick={() => removeService(service.id)}
                          className="text-red-500 hover:text-red-600 hover:bg-red-50"
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      )}
                    </div>

                    <div className="grid md:grid-cols-3 gap-4">
                      <div>
                        <Label className="text-bookeasy-700">Nombre del Servicio *</Label>
                        <Input
                          type="text"
                          required
                          value={service.name}
                          onChange={(e) => updateService(service.id, 'name', e.target.value)}
                          className="border-bookeasy-200 focus:border-bookeasy-400"
                          placeholder="Ej. Corte de cabello"
                        />
                      </div>
                      <div>
                        <Label className="text-bookeasy-700">Precio (MXN) *</Label>
                        <Input
                          type="number"
                          required
                          value={service.price}
                          onChange={(e) => updateService(service.id, 'price', e.target.value)}
                          className="border-bookeasy-200 focus:border-bookeasy-400"
                          placeholder="150"
                        />
                      </div>
                      <div>
                        <Label className="text-bookeasy-700">Duración (min) *</Label>
                        <Input
                          type="number"
                          required
                          value={service.duration}
                          onChange={(e) => updateService(service.id, 'duration', e.target.value)}
                          className="border-bookeasy-200 focus:border-bookeasy-400"
                          placeholder="30"
                        />
                      </div>
                    </div>
                  </div>
                ))}

                <Button
                  type="button"
                  variant="outline"
                  onClick={addService}
                  className="w-full border-dashed border-bookeasy-300 text-bookeasy-600 hover:bg-bookeasy-50"
                >
                  <Plus className="h-4 w-4 mr-2" />
                  Agregar Otro Servicio
                </Button>

                <Button 
                  type="submit" 
                  className="w-full bg-gradient-primary hover:opacity-90 text-white smooth-transition"
                >
                  Continuar al Dashboard
                </Button>
              </form>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
};

export default Setup;
