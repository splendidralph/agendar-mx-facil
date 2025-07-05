import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import ReviewForm from "@/components/reviews/ReviewForm";
import { 
  Calendar, 
  Clock, 
  MapPin, 
  Phone, 
  MessageCircle, 
  LogOut,
  User,
  ArrowLeft,
  Star,
  RefreshCw,
  Edit3
} from "lucide-react";
import { toast } from "sonner";
import { format } from 'date-fns';
import { es } from 'date-fns/locale';
import { useAuth } from "@/hooks/useAuth";

interface Booking {
  id: string;
  booking_date: string;
  booking_time: string;
  status: 'pending' | 'confirmed' | 'cancelled' | 'completed';
  total_price: number;
  client_notes?: string;
  services: {
    name: string;
    duration_minutes: number;
  };
  providers: {
    business_name: string;
    phone?: string;
    whatsapp_phone?: string;
    address?: string;
    username: string;
    id: string;
  };
  guest_bookings?: {
    guest_name: string;
    guest_phone: string;
    guest_email?: string;
  }[];
}

const CustomerDashboard = () => {
  const [bookings, setBookings] = useState<Booking[]>([]);
  const [loading, setLoading] = useState(true);
  const [showReviewForm, setShowReviewForm] = useState<string | null>(null);
  const navigate = useNavigate();
  const { user, signOut } = useAuth();

  useEffect(() => {
    if (!user) {
      navigate('/mi-cuenta-login');
      return;
    }
    fetchBookings();
  }, [user, navigate]);

  const fetchBookings = async () => {
    try {
      const { data, error } = await supabase
        .from('bookings')
        .select(`
          *,
          services(name, duration_minutes),
          providers(business_name, phone, whatsapp_phone, address, username, id),
          guest_bookings(guest_name, guest_phone, guest_email)
        `)
        .eq('client_id', user?.id)
        .order('booking_date', { ascending: false })
        .order('booking_time', { ascending: false });

      if (error) {
        console.error('Error fetching bookings:', error);
        toast.error("Error cargando las citas");
        return;
      }

      setBookings(data || []);
    } catch (error) {
      console.error('Unexpected error:', error);
      toast.error("Error inesperado");
    } finally {
      setLoading(false);
    }
  };

  const handleSignOut = async () => {
    try {
      await signOut();
      toast.success("Sesión cerrada");
      navigate('/');
    } catch (error) {
      console.error('Error signing out:', error);
      toast.error("Error cerrando sesión");
    }
  };

  const getStatusBadge = (status: string) => {
    const statusConfig = {
      pending: { label: 'Pendiente', variant: 'secondary' as const },
      confirmed: { label: 'Confirmada', variant: 'default' as const },
      cancelled: { label: 'Cancelada', variant: 'destructive' as const },
      completed: { label: 'Completada', variant: 'outline' as const }
    };
    
    const config = statusConfig[status as keyof typeof statusConfig] || statusConfig.pending;
    return <Badge variant={config.variant}>{config.label}</Badge>;
  };

  const formatBookingDate = (date: string) => {
    return format(new Date(date), "EEEE, d 'de' MMMM", { locale: es });
  };

  const handleContactProvider = (booking: Booking) => {
    const phone = booking.providers.whatsapp_phone || booking.providers.phone;
    if (phone) {
      const message = `Hola, tengo una cita programada para el ${formatBookingDate(booking.booking_date)} a las ${booking.booking_time}. Servicio: ${booking.services.name}`;
      const whatsappUrl = `https://wa.me/${phone.replace(/[^\d]/g, '')}?text=${encodeURIComponent(message)}`;
      window.open(whatsappUrl, '_blank');
    } else {
      toast.error("No hay información de contacto disponible");
    }
  };

  const handleRebook = (booking: Booking) => {
    // Navigate to booking page with pre-selected service
    navigate(`/${booking.providers.username}/booking`);
    toast.success("Te llevamos a reservar de nuevo");
  };

  const handleShowReviewForm = (bookingId: string) => {
    setShowReviewForm(bookingId);
  };

  const handleReviewSubmitted = () => {
    setShowReviewForm(null);
    toast.success("¡Gracias por tu reseña!");
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-secondary to-background flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto mb-4"></div>
          <p>Cargando tus citas...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-secondary to-background">
      {/* Header */}
      <div className="bg-card/80 backdrop-blur-sm border-b border-border">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-3">
              <Button 
                variant="ghost" 
                onClick={() => navigate('/')}
                className="text-foreground hover:bg-secondary"
              >
                <ArrowLeft className="h-4 w-4 mr-2" />
                Inicio
              </Button>
              <Separator orientation="vertical" className="h-6" />
              <div className="flex items-center space-x-2">
                <div className="gradient-primary text-primary-foreground p-2 rounded-xl">
                  <User className="h-5 w-5" />
                </div>
                <span className="text-xl font-bold text-foreground">Mi Cuenta</span>
              </div>
            </div>
            <Button 
              variant="outline" 
              onClick={handleSignOut}
              className="text-foreground"
            >
              <LogOut className="h-4 w-4 mr-2" />
              Cerrar Sesión
            </Button>
          </div>
        </div>
      </div>

      <div className="container mx-auto px-4 py-8">
        <div className="max-w-4xl mx-auto space-y-6">
          {/* Welcome Card */}
          <Card className="border-border/50 shadow-lg">
            <CardHeader>
              <CardTitle className="flex items-center space-x-2">
                <span>¡Bienvenido a tu cuenta!</span>
              </CardTitle>
              <p className="text-muted-foreground">
                Aquí puedes ver y gestionar todas tus citas.
              </p>
            </CardHeader>
          </Card>

          {/* Bookings */}
          <Card className="border-border/50 shadow-lg">
            <CardHeader>
              <CardTitle className="flex items-center space-x-2">
                <Calendar className="h-5 w-5" />
                <span>Mis Citas ({bookings.length})</span>
              </CardTitle>
            </CardHeader>
            <CardContent>
              {bookings.length === 0 ? (
                <div className="text-center py-8">
                  <Calendar className="h-12 w-12 mx-auto text-muted-foreground/50 mb-4" />
                  <p className="text-muted-foreground">No tienes citas registradas</p>
                  <Button 
                    onClick={() => navigate('/explore')}
                    className="mt-4"
                  >
                    Explorar Profesionales
                  </Button>
                </div>
              ) : (
                <div className="space-y-4">
                  {bookings.map((booking) => (
                    <Card key={booking.id} className="border border-border/30">
                      <CardContent className="p-4">
                        {/* Show review form if this booking is selected */}
                        {showReviewForm === booking.id ? (
                          <ReviewForm
                            bookingId={booking.id}
                            providerId={booking.providers.id}
                            providerName={booking.providers.business_name}
                            serviceName={booking.services.name}
                            onReviewSubmitted={handleReviewSubmitted}
                            onCancel={() => setShowReviewForm(null)}
                          />
                        ) : (
                          <div className="flex flex-col lg:flex-row lg:items-center justify-between space-y-4 lg:space-y-0">
                            <div className="space-y-2">
                              <div className="flex items-center space-x-2">
                                <h3 className="font-semibold text-foreground">
                                  {booking.providers.business_name}
                                </h3>
                                {getStatusBadge(booking.status)}
                              </div>
                              <p className="text-sm text-muted-foreground">
                                {booking.services.name} • {booking.services.duration_minutes} min
                              </p>
                              <div className="flex items-center space-x-4 text-sm text-muted-foreground">
                                <div className="flex items-center space-x-1">
                                  <Calendar className="h-4 w-4" />
                                  <span>{formatBookingDate(booking.booking_date)}</span>
                                </div>
                                <div className="flex items-center space-x-1">
                                  <Clock className="h-4 w-4" />
                                  <span>{booking.booking_time}</span>
                                </div>
                              </div>
                              {booking.providers.address && (
                                <div className="flex items-center space-x-1 text-sm text-muted-foreground">
                                  <MapPin className="h-4 w-4" />
                                  <span>{booking.providers.address}</span>
                                </div>
                              )}
                            </div>
                            <div className="flex flex-col space-y-2">
                              <div className="text-right mb-2">
                                <span className="text-lg font-bold text-foreground">
                                  ${booking.total_price}
                                </span>
                              </div>
                              <div className="flex flex-wrap gap-2">
                                <Button
                                  size="sm"
                                  variant="outline"
                                  onClick={() => handleContactProvider(booking)}
                                  className="text-xs"
                                >
                                  <MessageCircle className="h-3 w-3 mr-1" />
                                  Contactar
                                </Button>
                                
                                {booking.status === 'completed' && (
                                  <Button
                                    size="sm"
                                    variant="outline"
                                    onClick={() => handleShowReviewForm(booking.id)}
                                    className="text-xs"
                                  >
                                    <Edit3 className="h-3 w-3 mr-1" />
                                    Reseña
                                  </Button>
                                )}
                                
                                {(booking.status === 'completed' || booking.status === 'confirmed') && (
                                  <Button
                                    size="sm"
                                    variant="outline"
                                    onClick={() => handleRebook(booking)}
                                    className="text-xs"
                                  >
                                    <RefreshCw className="h-3 w-3 mr-1" />
                                    Reservar de nuevo
                                  </Button>
                                )}
                                
                                <Button
                                  size="sm"
                                  variant="outline"
                                  onClick={() => navigate(`/${booking.providers.username}`)}
                                  className="text-xs"
                                >
                                  <Star className="h-3 w-3 mr-1" />
                                  Ver perfil
                                </Button>
                              </div>
                            </div>
                          </div>
                        )}
                      </CardContent>
                    </Card>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
};

export default CustomerDashboard;