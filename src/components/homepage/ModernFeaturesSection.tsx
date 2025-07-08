import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Link2, Share2, Calendar } from "lucide-react";

const ModernFeaturesSection = () => {
  const mainFeatures = [
    {
      title: "Sin software complicado",
      description: "No necesitas descargar ni instalar nada",
      highlight: "Funciona desde cualquier navegador"
    },
    {
      title: "Sin descargas ni aplicaciones", 
      description: "Funciona desde cualquier celular o navegador",
      highlight: "Acceso inmediato desde cualquier dispositivo"
    },
    {
      title: "Respuestas automáticas",
      description: "Tus clientes reciben confirmaciones por WhatsApp",
      highlight: "Ahorra tiempo — menos chats, más citas"
    }
  ];

  const whoCanUse = [
    "Barberos y estilistas",
    "Técnicas de uñas",
    "Especialistas en faciales y depilación",
    "Masajistas y terapeutas de bienestar",
    "Nutriólogas y entrenadoras personales",
    "Psicólogas y coaches",
    "Fotógrafas y creativas"
  ];

  const whatIncludes = [
    {
      title: "Tu link personalizado",
      description: "bookeasy.mx/@tuusuario - Fácil de recordar y compartir",
      highlight: "Siempre tuyo, siempre gratuito"
    },
    {
      title: "Calendario automático", 
      description: "Tú eliges tus horarios. El sistema organiza todo",
      highlight: "Sin dobles reservas ni confusiones"
    },
    {
      title: "Confirmaciones por WhatsApp",
      description: "Tus clientes reciben mensajes profesionales automáticamente",
      highlight: "Sin que tú tengas que escribirles"
    }
  ];


  return (
    <>
      {/* Nueva forma de trabajar */}
      <section className="py-20 md:py-28 px-4 section-light pattern-grid">
        <div className="container mx-auto">
          <div className="text-center mb-16 md:mb-20">
            <h2 className="text-3xl sm:text-4xl md:text-5xl lg:text-6xl font-bold mb-8 leading-tight">
              <span className="text-gradient-primary">Una nueva forma</span> de trabajar localmente
            </h2>
            <div className="max-w-4xl mx-auto">
              <p className="text-muted-foreground text-xl md:text-2xl mb-8 leading-relaxed">
                En Bookeasy.mx estamos construyendo más que una herramienta de reservas.
              </p>
              <p className="text-foreground text-xl md:text-2xl font-semibold leading-relaxed">
                Estamos creando la infraestructura digital para que miles de profesionales en México 
                puedan recibir citas, ofrecer sus servicios y crecer — todo desde su barrio.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Qué es Fase 1 */}
      <section className="py-20 md:py-28 px-4 section-primary-dark">
        <div className="container mx-auto">
        <div className="max-w-5xl mx-auto">
            <Badge className="mb-8 card-primary-inverse px-6 py-3 rounded-full text-base font-medium mx-auto block w-fit">
              ¿Qué es la Fase 1?
            </Badge>
            <div className="text-center mb-16">
              <h3 className="text-3xl md:text-4xl font-bold mb-6 text-on-dark">
                <span className="text-gradient-accent-light">Fase 1</span> = Tu link profesional. <span className="text-gradient-bright">Siempre gratis</span>.
              </h3>
              <p className="text-muted-on-dark text-xl leading-relaxed max-w-3xl mx-auto">
                Si ofreces servicios uno a uno en tu colonia, puedes crear tu perfil, 
                compartir tu link y empezar a recibir reservas con confirmaciones automáticas por WhatsApp.
              </p>
            </div>

            {/* Main features grid */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-8 md:gap-10 mb-16">
              {mainFeatures.map((feature, index) => (
                <div 
                  key={index}
                  className="card-primary-inverse group p-8 md:p-10 text-center transition-all duration-500"
                >
                  <h4 className="text-foreground text-xl md:text-2xl font-semibold mb-4">{feature.title}</h4>
                  <p className="text-muted-foreground mb-6 leading-relaxed">
                    {feature.description}
                  </p>
                  <Badge 
                    variant="secondary" 
                    className="bg-accent/20 text-accent-foreground px-4 py-2 rounded-full border-0 font-medium"
                  >
                    {feature.highlight}
                  </Badge>
                </div>
              ))}
            </div>

            <div className="text-center">
              <p className="text-lg font-semibold text-on-dark">
                <span className="text-gradient-bright">Tu link será siempre tuyo y siempre gratuito.</span>
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Ahorra tiempo section */}
      <section className="py-20 md:py-28 px-4 section-dark">
        <div className="container mx-auto">
          <div className="max-w-6xl mx-auto">
            <div className="text-center mb-16">
              <h2 className="text-3xl sm:text-4xl md:text-5xl font-bold mb-8 text-on-dark">
                <span className="text-gradient-accent-light">Ahorra tiempo.</span> Deja de coordinar por mensajes
              </h2>
              <p className="text-muted-on-dark text-xl md:text-2xl max-w-3xl mx-auto leading-relaxed">
                Con Bookeasy, tus clientes ven tu disponibilidad y reservan en automático.
                <span className="block mt-2 font-medium text-gradient-primary-light">
                  Tú solo ajustas tu calendario — y el sistema se encarga del resto.
                </span>
              </p>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 md:gap-16">
              {/* Sin más */}
              <div className="card-white p-8 md:p-10 bg-destructive/5 border-l-4 border-destructive">
                <h3 className="text-2xl font-bold text-destructive mb-6">Sin más:</h3>
                <div className="space-y-4">
                  <p className="text-muted-foreground text-lg">"¿Qué días tienes?"</p>
                  <p className="text-muted-foreground text-lg">"¿A qué hora puedes?"</p>
                  <p className="text-muted-foreground text-lg">"¿Y si cambiamos?"</p>
                </div>
              </div>

              {/* Con Bookeasy */}
              <div className="card-white p-8 md:p-10 bg-accent/5 border-l-4 border-accent">
                <h3 className="text-2xl font-bold text-accent mb-6">Con Bookeasy:</h3>
                <div className="space-y-4">
                  <p className="text-accent text-lg font-medium">✓ Horarios claros</p>
                  <p className="text-accent text-lg font-medium">✓ Reservas automáticas</p>
                  <p className="text-accent text-lg font-medium">✓ Confirmación directa por WhatsApp</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Quién puede usar */}
      <section className="py-20 md:py-28 px-4 section-accent-dark">
        <div className="container mx-auto">
          <div className="max-w-5xl mx-auto">
            <div className="text-center mb-16">
              <h2 className="text-3xl sm:text-4xl md:text-5xl font-bold mb-8 text-on-dark">
                <span className="text-gradient-primary-light">¿Quién puede usar</span> Bookeasy?
              </h2>
              <p className="text-muted-on-dark text-xl leading-relaxed mb-8">
                Este lanzamiento es para ti si:
              </p>
              <div className="card-primary-inverse p-8 md:p-10 max-w-3xl mx-auto text-left">
                <ul className="space-y-3 text-lg text-foreground">
                  <li className="flex items-start gap-3">
                    <span className="text-accent font-bold mt-1">•</span>
                    Ofreces servicios uno a uno en tu colonia
                  </li>
                  <li className="flex items-start gap-3">
                    <span className="text-accent font-bold mt-1">•</span>
                    Trabajas desde casa, a domicilio o tienes tu propio espacio
                  </li>
                  <li className="flex items-start gap-3">
                    <span className="text-accent font-bold mt-1">•</span>
                    Quieres evitar perder tiempo en mensajes
                  </li>
                  <li className="flex items-start gap-3">
                    <span className="text-accent font-bold mt-1">•</span>
                    No tienes página web (o no te ayuda a agendar)
                  </li>
                  <li className="flex items-start gap-3">
                    <span className="text-accent font-bold mt-1">•</span>
                    Quieres verte más profesional de inmediato
                  </li>
                </ul>
              </div>
            </div>

            <div className="text-center">
              <h3 className="text-2xl font-bold mb-8 text-on-dark">
                <span className="text-gradient-accent-light">Ideal para:</span>
              </h3>
              <div className="grid grid-cols-2 md:grid-cols-3 gap-4 max-w-4xl mx-auto">
                {whoCanUse.map((profession, index) => (
                  <div 
                    key={index}
                    className="card-primary-inverse p-4 text-center transition-all duration-300"
                  >
                    <span className="text-foreground font-medium">{profession}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Qué incluye */}
      <section className="py-20 md:py-28 px-4 section-coral">
        <div className="container mx-auto">
            <div className="text-center mb-20 md:mb-24">
              <h2 className="text-3xl sm:text-4xl md:text-5xl font-bold mb-8 leading-tight text-on-dark">
                <span className="text-gradient-bright">¿Qué incluye</span> tu perfil Bookeasy?
              </h2>
            </div>

          {/* What includes features */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 md:gap-10 mb-16">
            {whatIncludes.map((feature, index) => (
              <div 
                key={index}
                className="card-white group p-8 md:p-10 relative overflow-hidden transition-all duration-500"
              >
                <div className="absolute inset-0 bg-gradient-to-br from-primary/5 to-accent/5 opacity-0 group-hover:opacity-100 transition-opacity duration-500"></div>
                <div className="relative z-10">
                  <h3 className="text-foreground text-2xl md:text-3xl font-semibold mb-4">{feature.title}</h3>
                  <p className="text-muted-foreground mb-8 leading-relaxed text-lg">
                    {feature.description}
                  </p>
                  <Badge 
                    variant="secondary" 
                    className="bg-primary/10 text-primary px-4 py-2 rounded-full border-0 font-medium"
                  >
                    {feature.highlight}
                  </Badge>
                </div>
              </div>
            ))}
          </div>

        </div>
      </section>


      {/* Nuestra Visión */}
      <section className="py-20 md:py-28 px-4 section-dark">
        <div className="container mx-auto">
          <div className="max-w-4xl mx-auto text-center">
            <h2 className="text-3xl sm:text-4xl md:text-5xl font-bold mb-8 text-on-dark">
              <span className="text-gradient-accent-light">Nuestra</span> Visión
            </h2>
            <p className="text-muted-on-dark text-xl md:text-2xl mb-12 leading-relaxed">
              Queremos digitalizar los servicios profesionales en México, colonia por colonia.
            </p>

            <div className="card-white p-8 md:p-10">
              <h3 className="text-2xl font-bold mb-4">
                <span className="text-gradient-coral">¿Tienes dudas o quieres saber si calificas?</span>
              </h3>
              <p className="text-muted-foreground text-lg mb-4">
                Escríbenos a: <span className="font-semibold text-gradient-primary">hello@bookeasy.mx</span>
              </p>
              <p className="text-muted-foreground text-lg">
                O mándanos un mensaje por WhatsApp
              </p>
            </div>
          </div>
        </div>
      </section>
    </>
  );
};

export default ModernFeaturesSection;