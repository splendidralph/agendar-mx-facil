
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Calendar, ChevronLeft } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { toast } from "sonner";

const Register = () => {
  const navigate = useNavigate();
  const [formData, setFormData] = useState({
    name: "",
    business: "",
    phone: "",
    email: "",
    category: ""
  });

  const categories = [
    "Barbería",
    "Salón de Belleza",
    "Spa",
    "Estética",
    "Manicure y Pedicure",
    "Masajes",
    "Otro"
  ];

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    console.log("Registro:", formData);
    toast.success("¡Perfil creado exitosamente! Ahora configura tus servicios.");
    navigate('/setup');
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    setFormData(prev => ({
      ...prev,
      [e.target.name]: e.target.value
    }));
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-bookeasy-50 to-white">
      {/* Header */}
      <header className="bg-white/80 backdrop-blur-sm border-b border-bookeasy-100">
        <div className="container mx-auto px-4 py-4 flex items-center">
          <Button 
            variant="ghost" 
            onClick={() => navigate('/')}
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
        <div className="max-w-md mx-auto">
          <div className="text-center mb-8 animate-fade-in">
            <h1 className="text-3xl font-bold text-bookeasy-900 mb-2">
              Crea Tu Perfil
            </h1>
            <p className="text-bookeasy-600">
              Comienza a recibir reservas en minutos
            </p>
          </div>

          <Card className="animate-slide-up border-bookeasy-100">
            <CardHeader>
              <CardTitle className="text-bookeasy-800">Información Básica</CardTitle>
              <CardDescription>
                Cuéntanos sobre tu negocio
              </CardDescription>
            </CardHeader>
            <CardContent>
              <form onSubmit={handleSubmit} className="space-y-4">
                <div>
                  <Label htmlFor="name" className="text-bookeasy-700">Tu Nombre *</Label>
                  <Input
                    id="name"
                    name="name"
                    type="text"
                    required
                    value={formData.name}
                    onChange={handleChange}
                    className="border-bookeasy-200 focus:border-bookeasy-400"
                    placeholder="Ej. María González"
                  />
                </div>

                <div>
                  <Label htmlFor="business" className="text-bookeasy-700">Nombre del Negocio *</Label>
                  <Input
                    id="business"
                    name="business"
                    type="text"
                    required
                    value={formData.business}
                    onChange={handleChange}
                    className="border-bookeasy-200 focus:border-bookeasy-400"
                    placeholder="Ej. Salón María"
                  />
                </div>

                <div>
                  <Label htmlFor="category" className="text-bookeasy-700">Categoría *</Label>
                  <select
                    id="category"
                    name="category"
                    required
                    value={formData.category}
                    onChange={handleChange}
                    className="w-full px-3 py-2 border border-bookeasy-200 rounded-md focus:outline-none focus:border-bookeasy-400 bg-white"
                  >
                    <option value="">Selecciona tu categoría</option>
                    {categories.map(cat => (
                      <option key={cat} value={cat}>{cat}</option>
                    ))}
                  </select>
                </div>

                <div>
                  <Label htmlFor="phone" className="text-bookeasy-700">Teléfono *</Label>
                  <Input
                    id="phone"
                    name="phone"
                    type="tel"
                    required
                    value={formData.phone}
                    onChange={handleChange}
                    className="border-bookeasy-200 focus:border-bookeasy-400"
                    placeholder="Ej. +52 55 1234 5678"
                  />
                </div>

                <div>
                  <Label htmlFor="email" className="text-bookeasy-700">Email</Label>
                  <Input
                    id="email"
                    name="email"
                    type="email"
                    value={formData.email}
                    onChange={handleChange}
                    className="border-bookeasy-200 focus:border-bookeasy-400"
                    placeholder="maria@ejemplo.com"
                  />
                </div>

                <Button 
                  type="submit" 
                  className="w-full bg-gradient-primary hover:opacity-90 text-white smooth-transition"
                >
                  Crear Mi Perfil
                </Button>
              </form>
            </CardContent>
          </Card>

          <div className="text-center mt-6 text-sm text-bookeasy-600">
            Al crear tu perfil, aceptas nuestros términos y condiciones
          </div>
        </div>
      </div>
    </div>
  );
};

export default Register;
