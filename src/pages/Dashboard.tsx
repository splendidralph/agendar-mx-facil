
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Calendar, Clock, Phone, Instagram, Link } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { toast } from "sonner";

const Dashboard = () => {
  const navigate = useNavigate();
  const [bookingLink] = useState("bookeasy.mx/barberjose");

  const recentBookings = [
    { id: 1, client: "Juan Pérez", service: "Corte + Barba", date: "2024-06-23", time: "10:00", phone: "+52 55 1234 5678", status: "Confirmado" },
    { id: 2, client: "María González", service: "Corte de Cabello", date: "2024-06-23", time: "14:30", phone: "+52 55 8765 4321", status: "Pendiente" },
    { id: 3, client: "Carlos Ruiz", service: "Barba", date: "2024-06-24", time: "09:00", phone: "+52 55 5555 5555", status: "Confirmado" }
  ];

  const copyLink = () => {
    navigator.clipboard.writeText(`https://${bookingLink}`);
    toast.success("¡Link copiado al portapapeles!");
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-bookeasy-50 to-white">
      {/* Header */}
      <header className="bg-white/80 backdrop-blur-sm border-b border-bookeasy-100">
        <div className="container mx-auto px-4 py-4 flex justify-between items-center">
          <div className="flex items-center space-x-2">
            <div className="bg-gradient-primary text-white p-2 rounded-lg">
              <Calendar className="h-6 w-6" />
            </div>
            <span className="text-2xl font-bold text-bookeasy-800 font-poppins">Bookeasy.mx</span>
          </div>
          <div className="flex items-center space-x-4">
            <span className="text-bookeasy-600 hidden sm:inline">¡Hola, José!</span>
            <Button 
              variant="outline"
              onClick={() => navigate('/')}
              className="border-bookeasy-300 text-bookeasy-700"
            >
              Cerrar Sesión
            </Button>
          </div>
        </div>
      </header>

      <div className="container mx-auto px-4 py-8">
        <div className="max-w-6xl mx-auto">
          {/* Welcome Section */}
          <div className="mb-8 animate-fade-in">
            <h1 className="text-3xl font-bold text-bookeasy-900 mb-2">
              Mi Dashboard
            </h1>
            <p className="text-bookeasy-600">
              Gestiona tus citas y perfil profesional
            </p>
          </div>

          {/* Quick Stats */}
          <div className="grid md:grid-cols-3 gap-6 mb-8">
            <Card className="animate-slide-up border-bookeasy-100">
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-bookeasy-600">Citas Hoy</p>
                    <p className="text-2xl font-bold text-bookeasy-800">3</p>
                  </div>
                  <Calendar className="h-8 w-8 text-bookeasy-400" />
                </div>
              </CardContent>
            </Card>

            <Card className="animate-slide-up border-bookeasy-100">
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-bookeasy-600">Esta Semana</p>
                    <p className="text-2xl font-bold text-bookeasy-800">12</p>
                  </div>
                  <Clock className="h-8 w-8 text-bookeasy-400" />
                </div>
              </CardContent>
            </Card>

            <Card className="animate-slide-up border-bookeasy-100">
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-bookeasy-600">Ingresos</p>
                    <p className="text-2xl font-bold text-bookeasy-800">$2,400</p>
                  </div>
                  <div className="text-mexican-green text-2xl">$</div>
                </div>
              </CardContent>
            </Card>
          </div>

          <div className="grid lg:grid-cols-3 gap-8">
            {/* Booking Link */}
            <Card className="lg:col-span-1 animate-slide-up border-bookeasy-100">
              <CardHeader>
                <CardTitle className="text-bookeasy-800">Tu Link de Reservas</CardTitle>
                <CardDescription>
                  Comparte este link con tus clientes
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="p-3 bg-bookeasy-50 rounded-lg border border-bookeasy-200">
                  <p className="text-sm font-mono text-bookeasy-700">{bookingLink}</p>
                </div>
                <Button 
                  onClick={copyLink}
                  className="w-full bg-gradient-primary hover:opacity-90 text-white smooth-transition"
                >
                  <Link className="h-4 w-4 mr-2" />
                  Copiar Link
                </Button>
                <Button 
                  variant="outline"
                  className="w-full border-bookeasy-300 text-bookeasy-700 hover:bg-bookeasy-50"
                  onClick={() => navigate('/booking/demo')}
                >
                  Ver Mi Perfil
                </Button>
              </CardContent>
            </Card>

            {/* Recent Bookings */}
            <Card className="lg:col-span-2 animate-slide-up border-bookeasy-100">
              <CardHeader>
                <CardTitle className="text-bookeasy-800">Citas Recientes</CardTitle>
                <CardDescription>
                  Tus próximas citas programadas
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {recentBookings.map((booking) => (
                    <div key={booking.id} className="flex items-center justify-between p-4 border border-bookeasy-200 rounded-lg hover:bg-bookeasy-50 smooth-transition">
                      <div className="flex-1">
                        <div className="flex items-center space-x-4">
                          <div>
                            <p className="font-medium text-bookeasy-800">{booking.client}</p>
                            <p className="text-sm text-bookeasy-600">{booking.service}</p>
                          </div>
                        </div>
                      </div>
                      <div className="text-right">
                        <p className="font-medium text-bookeasy-800">{booking.date}</p>
                        <p className="text-sm text-bookeasy-600">{booking.time}</p>
                      </div>
                      <div className="ml-4">
                        <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                          booking.status === 'Confirmado' 
                            ? 'bg-green-100 text-green-800' 
                            : 'bg-yellow-100 text-yellow-800'
                        }`}>
                          {booking.status}
                        </span>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;
