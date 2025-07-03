import { Star, Quote, MapPin } from "lucide-react";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";

const SocialProofSection = () => {
  const testimonials = [
    {
      name: "María García",
      role: "Estilista",
      location: "CDMX",
      rating: 5,
      text: "Desde que uso Bookeasy, mis clientes pueden reservar 24/7. Mis ingresos aumentaron 40% en solo 2 meses.",
      avatar: "MG"
    },
    {
      name: "Carlos Ruiz",
      role: "Barbero",
      location: "Guadalajara", 
      rating: 5,
      text: "Increíble lo fácil que es compartir mi link en WhatsApp. Mis clientes aman la simplicidad.",
      avatar: "CR"
    },
    {
      name: "Ana Martínez",
      role: "Manicurista",
      location: "Monterrey",
      rating: 5,
      text: "Profesional y confiable. Mis clientas siempre saben cuándo tengo disponibilidad.",
      avatar: "AM"
    }
  ];

  const locations = [
    "Ciudad de México", "Guadalajara", "Monterrey", "Puebla", "Tijuana", "León"
  ];

  return (
    <section className="py-16 px-4">
      <div className="container mx-auto">
        {/* Trust indicators */}
        <div className="text-center mb-12">
          <div className="flex justify-center items-center gap-2 mb-4">
            <div className="flex">
              {[...Array(5)].map((_, i) => (
                <Star key={i} className="h-5 w-5 fill-yellow-400 text-yellow-400" />
              ))}
            </div>
            <span className="text-lg font-semibold text-foreground">4.9/5</span>
            <span className="text-muted-foreground">de 1,200+ reseñas</span>
          </div>
          
          <p className="text-muted-foreground">
            Únete a <span className="font-semibold text-foreground">2,500+ profesionales</span> que 
            ya confían en Bookeasy para gestionar sus reservas
          </p>
        </div>

        {/* Testimonials */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-12">
          {testimonials.map((testimonial, index) => (
            <div 
              key={index}
              className="bento-card hover-lift animate-scale-in"
              style={{ animationDelay: `${index * 0.2}s` }}
            >
              <Quote className="h-8 w-8 text-primary mb-4" />
              
              <p className="text-foreground mb-6 font-medium leading-relaxed">
                "{testimonial.text}"
              </p>
              
              <div className="flex items-center gap-3">
                <Avatar className="h-12 w-12">
                  <AvatarImage src="" />
                  <AvatarFallback className="bg-primary text-primary-foreground font-semibold">
                    {testimonial.avatar}
                  </AvatarFallback>
                </Avatar>
                
                <div className="flex-1">
                  <div className="font-semibold text-foreground">{testimonial.name}</div>
                  <div className="text-sm text-muted-foreground flex items-center gap-1">
                    {testimonial.role} • <MapPin className="h-3 w-3" /> {testimonial.location}
                  </div>
                  <div className="flex mt-1">
                    {[...Array(testimonial.rating)].map((_, i) => (
                      <Star key={i} className="h-3 w-3 fill-yellow-400 text-yellow-400" />
                    ))}
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* Locations */}
        <div className="text-center">
          <p className="text-muted-foreground mb-4">
            Profesionales activos en más de <span className="font-semibold text-foreground">50 ciudades</span>
          </p>
          <div className="flex flex-wrap justify-center gap-3">
            {locations.map((location, index) => (
              <span 
                key={index}
                className="bg-secondary/50 text-secondary-foreground px-4 py-2 rounded-full text-sm font-medium border border-border/50"
              >
                {location}
              </span>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
};

export default SocialProofSection;