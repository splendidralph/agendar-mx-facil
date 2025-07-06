import ShareCard from './ShareCard';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { TrendingUp, Users, Eye, Share2 } from 'lucide-react';

interface PromotionManagerProps {
  provider: any;
}

const PromotionManager = ({ provider }: PromotionManagerProps) => {
  return (
    <div className="space-y-6">
      {/* Promotion Overview */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <Card className="glassmorphism">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Vistas del Perfil</CardTitle>
            <Eye className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">---</div>
            <p className="text-xs text-muted-foreground">
              Próximamente
            </p>
          </CardContent>
        </Card>
        
        <Card className="glassmorphism">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Clicks desde Redes</CardTitle>
            <Share2 className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">---</div>
            <p className="text-xs text-muted-foreground">
              Próximamente
            </p>
          </CardContent>
        </Card>
        
        <Card className="glassmorphism">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Nuevos Clientes</CardTitle>
            <Users className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">---</div>
            <p className="text-xs text-muted-foreground">
              Próximamente
            </p>
          </CardContent>
        </Card>
        
        <Card className="glassmorphism">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Tasa de Conversión</CardTitle>
            <TrendingUp className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">---%</div>
            <p className="text-xs text-muted-foreground">
              Próximamente
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Share Card Component */}
      <ShareCard provider={provider} />

      {/* Promotion Tips */}
      <Card className="glassmorphism">
        <CardHeader>
          <CardTitle>Estrategias de Promoción</CardTitle>
          <CardDescription>
            Maximiza tu alcance con estas estrategias comprobadas
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-3">
            <div className="flex items-start gap-3">
              <div className="w-2 h-2 rounded-full bg-primary mt-2"></div>
              <div>
                <h4 className="font-medium text-foreground">Instagram Stories</h4>
                <p className="text-sm text-muted-foreground">
                  Comparte tu imagen promocional como story y fíjala como destacado permanente
                </p>
              </div>
            </div>
            
            <div className="flex items-start gap-3">
              <div className="w-2 h-2 rounded-full bg-primary mt-2"></div>
              <div>
                <h4 className="font-medium text-foreground">Grupos de WhatsApp</h4>
                <p className="text-sm text-muted-foreground">
                  Comparte en grupos locales de tu colonia y vecindario
                </p>
              </div>
            </div>
            
            <div className="flex items-start gap-3">
              <div className="w-2 h-2 rounded-full bg-primary mt-2"></div>
              <div>
                <h4 className="font-medium text-foreground">Facebook Local</h4>
                <p className="text-sm text-muted-foreground">
                  Publica en grupos de compra-venta locales y páginas de tu colonia
                </p>
              </div>
            </div>
            
            <div className="flex items-start gap-3">
              <div className="w-2 h-2 rounded-full bg-primary mt-2"></div>
              <div>
                <h4 className="font-medium text-foreground">Boca a Boca Digital</h4>
                <p className="text-sm text-muted-foreground">
                  Pide a tus clientes satisfechos que compartan tu link
                </p>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default PromotionManager;