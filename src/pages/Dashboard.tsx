
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Calendar, Clock, Phone, Instagram, Link, TrendingUp, Users, DollarSign } from "lucide-react";
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
    <div className="min-h-screen bg-gradient-to-br from-secondary to-background">
      {/* Header */}
      <header className="bg-card/80 backdrop-blur-sm border-b border-border">
        <div className="container mx-auto px-4 py-4 flex justify-between items-center">
          <div className="flex items-center space-x-3">
            <div className="gradient-primary text-primary-foreground p-2.5 rounded-xl shadow-lg">
              <Calendar className="h-6 w-6" />
            </div>
            <span className="text-2xl font-bold text-foreground font-poppins">Bookeasy.mx</span>
          </div>
          <div className="flex items-center space-x-4">
            <span className="text-muted-foreground hidden sm:inline font-inter">¡Hola, José!</span>
            <Button 
              variant="outline"
              onClick={() => navigate('/')}
              className="border-border text-foreground hover:bg-secondary"
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
            <h1 className="text-3xl font-bold text-foreground mb-2">
              Mi Dashboard
            </h1>
            <p className="text-muted-foreground font-inter">
              Gestiona tus citas y perfil profesional
            </p>
          </div>

          {/* Quick Stats */}
          <div className="grid md:grid-cols-4 gap-6 mb-8">
            <Card className="animate-slide-up border-border/50 shadow-lg card-hover">
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-muted-foreground font-semibold">Citas Hoy</p>
                    <p className="text-3xl font-bold text-foreground">3</p>
                    <p className="text-xs text-primary font-medium">+2 vs ayer</p>
                  </div>
                  <div className="gradient-primary p-3 rounded-xl">
                    <Calendar className="h-6 w-6 text-primary-foreground" />
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card className="animate-slide-up border-border/50 shadow-lg card-hover" style={{ animationDelay: '0.1s' }}>
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-muted-foreground font-semibold">Esta Semana</p>
                    <p className="text-3xl font-bold text-foreground">12</p>
                    <p className="text-xs text-primary font-medium">+25%</p>
                  </div>
                  <div className="gradient-accent p-3 rounded-xl">
                    <TrendingUp className="h-6 w-6 text-accent-foreground" />
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card className="animate-slide-up border-border/50 shadow-lg card-hover" style={{ animationDelay: '0.2s' }}>
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-muted-foreground font-semibold">Clientes</p>
                    <p className="text-3xl font-bold text-foreground">48</p>
                    <p className="text-xs text-primary font-medium">+8 nuevos</p>
                  </div>
                  <div className="bg-primary/10 p-3 rounded-xl">
                    <Users className="h-6 w-6 text-primary" />
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card className="animate-slide-up border-border/50 shadow-lg card-hover" style={{ animationDelay: '0.3s' }}>
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-muted-foreground font-semibold">Ingresos</p>
                    <p className="text-3xl font-bold text-foreground">$2,400</p>
                    <p className="text-xs text-primary font-medium">Esta semana</p>
                  </div>
                  <div className="bg-accent/10 p-3 rounded-xl">
                    <DollarSign className="h-6 w-6 text-accent" />
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>

          <div className="grid lg:grid-cols-3 gap-8">
            {/* Booking Link */}
            <Card className="lg:col-span-1 animate-slide-up border-border/50 shadow-lg" style={{ animationDelay: '0.4s' }}>
              <CardHeader>
                <CardTitle className="text-foreground">Tu Link de Reservas</CardTitle>
                <CardDescription className="font-inter">
                  Comparte este link con tus clientes
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="p-4 bg-secondary/50 rounded-xl border border-border/50">
                  <p className="text-sm font-mono text-foreground break-all">{bookingLink}</p>
                </div>
                <Button 
                  onClick={copyLink}
                  className="w-full btn-primary shadow-lg"
                >
                  <Link className="h-4 w-4 mr-2" />
                  Copiar Link
                </Button>
                <Button 
                  variant="outline"
                  className="w-full border-border text-foreground hover:bg-secondary"
                  onClick={() => navigate('/booking/demo')}
                >
                  Ver Mi Perfil
                </Button>
              </CardContent>
            </Card>

            {/* Recent Bookings */}
            <Card className="lg:col-span-2 animate-slide-up border-border/50 shadow-lg" style={{ animationDelay: '0.5s' }}>
              <CardHeader>
                <CardTitle className="text-foreground">Citas Recientes</CardTitle>
                <CardDescription className="font-inter">
                  Tus próximas citas programadas
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {recentBookings.map((booking, index) => (
                    <div key={booking.id} className="flex items-center justify-between p-4 border border-border/50 rounded-xl hover:bg-secondary/30 smooth-transition animate-scale-in" style={{ animationDelay: `${0.6 + index * 0.1}s` }}>
                      <div className="flex-1">
                        <div className="flex items-center space-x-4">
                          <div className="w-10 h-10 gradient-primary rounded-full flex items-center justify-center text-primary-foreground font-bold text-sm">
                            {booking.client.split(' ').map(n => n[0]).join('')}
                          </div>
                          <div>
                            <p className="font-semibold text-foreground">{booking.client}</p>
                            <p className="text-sm text-muted-foreground font-inter">{booking.service}</p>
                          </div>
                        </div>
                      </div>
                      <div className="text-right mr-4">
                        <p className="font-semibold text-foreground">{booking.date}</p>
                        <p className="text-sm text-muted-foreground">{booking.time}</p>
                      </div>
                      <div>
                        <span className={`px-3 py-1 rounded-full text-xs font-semibold ${
                          booking.status === 'Confirmado' 
                            ? 'bg-primary/10 text-primary' 
                            : 'bg-accent/10 text-accent'
                        }`}>
                          {booking.status}
                        </span>
                      </div>
                    </div>
                  ))}
                </div>
                <div className="mt-6 text-center">
                  <Button variant="outline" className="border-border text-foreground hover:bg-secondary">
                    Ver Todas las Citas
                  </Button>
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
