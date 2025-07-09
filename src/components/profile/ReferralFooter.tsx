import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { ExternalLink } from 'lucide-react';

const ReferralFooter = () => {
  return (
    <Card className="mt-12 mx-4 mb-8 overflow-hidden border-border/50 shadow-lg">
      <div className="gradient-primary p-8 text-center text-primary-foreground">
        <h3 className="text-xl font-bold mb-2">
          ¿Quieres crear una página como esta?
        </h3>
        <p className="text-sm opacity-90 mb-6">
          Únete a miles de profesionales que ya promocionan sus servicios
        </p>
        <Button 
          variant="secondary"
          size="lg"
          className="bg-white/20 text-white border-white/30 hover:bg-white/30 smooth-transition"
          onClick={() => window.open('https://bookeasy.mx', '_blank', 'noopener,noreferrer')}
        >
          <ExternalLink className="h-4 w-4 mr-2" />
          Crear Mi Página Gratis
        </Button>
        <div className="mt-4 text-xs opacity-75">
          Powered by <span className="font-semibold">BookEasy.mx</span>
        </div>
      </div>
    </Card>
  );
};

export default ReferralFooter;