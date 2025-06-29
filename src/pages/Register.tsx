
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Calendar, ChevronLeft, Link2 } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { toast } from "sonner";

const Register = () => {
  const navigate = useNavigate();
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    phone: "",
    category: ""
  });

  const categories = [
    "Barbería",
    "Salón de Belleza", 
    "Cosmetología",
    "Manicure y Pedicure",
    "Masajes",
    "Maquillaje",
    "Estética",
    "Otro"
  ];

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    console.log("Registro:", formData);
    toast.success("¡Perfil creado exitosamente! Ahora configura tu link personalizado.");
    navigate('/onboarding');
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
            <div className="gradient-primary text-primary-foreground p-3 rounded-xl w-fit mx-auto mb-4">
              <Link2 className="h-6 w-6" />
            </div>
            <h1 className="text-3xl font-bold text-bookeasy-900 mb-2">
              Obtén Tu Link Personal
            </h1>
            <p className="text-bookeasy-600">
              Crea tu perfil y obtén tu bookeasy.mx/@username en minutos
            </p>
          </div>

          <Card className="animate-slide-up border-bookeasy-100">
            <CardHeader>
              <CardTitle className="text-bookeasy-800">Información Básica</CardTitle>
              <CardDescription>
                Cuéntanos sobre ti para crear tu link personalizado
              </CardDescription>
            </CardHeader>
            <CardContent>
              <form onSubmit={handleSubmit} className="space-y-4">
                <div>
                  <Label htmlFor="email" className="text-bookeasy-700">Email *</Label>
                  <Input
                    id="email"
                    name="email"
                    type="email"
                    required
                    value={formData.email}
                    onChange={handleChange}
                    className="border-bookeasy-200 focus:border-bookeasy-400"
                    placeholder="maria@ejemplo.com"
                  />
                </div>

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
                  <Label htmlFor="category" className="text-bookeasy-700">Tu Especialidad *</Label>
                  <select
                    id="category"
                    name="category"
                    required
                    value={formData.category}
                    onChange={handleChange}
                    className="w-full px-3 py-2 border border-bookeasy-200 rounded-md focus:outline-none focus:border-bookeasy-400 bg-white"
                  >
                    <option value="">Selecciona tu especialidad</option>
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

                <Button 
                  type="submit" 
                  className="w-full bg-gradient-primary hover:opacity-90 text-white smooth-transition"
                >
                  Crear Mi Link Personal
                </Button>
              </form>
            </CardContent>
          </Card>

          <div className="text-center mt-6">
            <div className="bg-bookeasy-50 border border-bookeasy-200 rounded-lg p-4 mb-4">
              <p className="text-sm text-bookeasy-700 font-medium mb-1">
                Tu link será algo como:
              </p>
              <p className="font-mono text-bookeasy-900 bg-white px-3 py-1 rounded border">
                bookeasy.mx/@tuusername
              </p>
            </div>
            <p className="text-sm text-bookeasy-600">
              Al crear tu perfil, aceptas nuestros términos y condiciones
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Register;
