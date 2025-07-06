import { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';
import { Share2, Download, Instagram, MessageCircle, Facebook, Twitter, Copy, Sparkles, Image as ImageIcon } from 'lucide-react';

interface ShareCardProps {
  provider: any;
}

const ShareCard = ({ provider }: ShareCardProps) => {
  const [loading, setLoading] = useState(false);
  const [generatedImage, setGeneratedImage] = useState<string | null>(null);
  const [selectedFormat, setSelectedFormat] = useState<'story' | 'square'>('story');

  const generateShareImage = async (format: 'story' | 'square') => {
    if (!provider?.id) {
      toast.error('Error: Información del proveedor no disponible');
      return;
    }

    setLoading(true);
    try {
      const { data, error } = await supabase.functions.invoke('generate-share-image', {
        body: { 
          providerId: provider.id,
          format 
        }
      });

      if (error) {
        console.error('Error generating image:', error);
        toast.error('Error generando la imagen');
        return;
      }

      if (data?.image) {
        setGeneratedImage(data.image);
        setSelectedFormat(format);
        toast.success('¡Imagen generada exitosamente!');
      }
    } catch (error) {
      console.error('Unexpected error:', error);
      toast.error('Error inesperado generando la imagen');
    } finally {
      setLoading(false);
    }
  };

  const downloadImage = () => {
    if (!generatedImage) return;

    const link = document.createElement('a');
    link.download = `${provider.username || 'mi-negocio'}-${selectedFormat}.svg`;
    link.href = generatedImage;
    link.click();
    
    toast.success('Imagen descargada');
  };

  const copyToClipboard = async (text: string) => {
    try {
      await navigator.clipboard.writeText(text);
      toast.success('¡Copiado al portapapeles!');
    } catch (error) {
      toast.error('Error copiando al portapapeles');
    }
  };

  const shareToSocial = (platform: string) => {
    const shareUrl = `https://bookeasy.mx/${provider.username}`;
    const shareText = `¡Reserva tu cita conmigo! ${provider.business_name}`;
    
    const urls = {
      whatsapp: `https://wa.me/?text=${encodeURIComponent(`${shareText} ${shareUrl}`)}`,
      facebook: `https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(shareUrl)}`,
      twitter: `https://twitter.com/intent/tweet?text=${encodeURIComponent(shareText)}&url=${encodeURIComponent(shareUrl)}`,
      instagram: '#', // Instagram doesn't support direct web sharing
    };

    if (platform === 'instagram') {
      toast.info('Descarga la imagen y compártela manualmente en Instagram Stories');
      return;
    }

    window.open(urls[platform as keyof typeof urls], '_blank');
  };

  const bookingUrl = `https://bookeasy.mx/${provider.username}`;

  return (
    <Card className="glassmorphism hover-lift">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Share2 className="h-5 w-5" />
          Promocionar en Redes Sociales
        </CardTitle>
        <CardDescription>
          Crea imágenes personalizadas para compartir tu perfil y atraer más clientes
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-6">
        {/* Format Selection */}
        <div className="space-y-3">
          <h4 className="font-medium text-foreground">Formato de imagen:</h4>
          <div className="flex gap-2">
            <Button
              variant={selectedFormat === 'story' ? 'default' : 'outline'}
              size="sm"
              onClick={() => setSelectedFormat('story')}
              className="flex items-center gap-2"
            >
              <Instagram className="h-4 w-4" />
              Instagram Story
              <Badge variant="secondary" className="text-xs">9:16</Badge>
            </Button>
            <Button
              variant={selectedFormat === 'square' ? 'default' : 'outline'}
              size="sm"
              onClick={() => setSelectedFormat('square')}  
              className="flex items-center gap-2"
            >
              <ImageIcon className="h-4 w-4" />
              Cuadrada
              <Badge variant="secondary" className="text-xs">1:1</Badge>
            </Button>
          </div>
        </div>

        {/* Generate Button */}
        <Button
          onClick={() => generateShareImage(selectedFormat)}
          disabled={loading || !provider.username}
          className="w-full gradient-primary text-primary-foreground hover:opacity-90"
        >
          {loading ? (
            <>
              <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
              Generando...
            </>
          ) : (
            <>
              <Sparkles className="h-4 w-4 mr-2" />
              Generar Imagen Promocional
            </>
          )}
        </Button>

        {/* Generated Image Preview */}
        {generatedImage && (
          <div className="space-y-4">
            <div className="border rounded-lg p-4 bg-white/5">
              <div className="flex justify-center mb-4">
                <div className={`${selectedFormat === 'story' ? 'w-48 h-80' : 'w-64 h-64'} border rounded-lg overflow-hidden bg-white shadow-lg`}>
                  <img 
                    src={generatedImage} 
                    alt="Imagen promocional generada"
                    className="w-full h-full object-contain"
                    onLoad={() => console.log('Image loaded successfully')}
                    onError={(e) => {
                      console.error('Image failed to load:', e);
                      console.log('Image src:', generatedImage);
                    }}
                  />
                </div>
              </div>
              
              {/* Download and Share Actions */}
              <div className="space-y-3">
                <div className="flex gap-2">
                  <Button
                    onClick={downloadImage}
                    variant="outline"
                    size="sm"
                    className="flex-1"
                  >
                    <Download className="h-4 w-4 mr-2" />
                    Descargar
                  </Button>
                  <Button
                    onClick={() => copyToClipboard(bookingUrl)}
                    variant="outline"
                    size="sm"
                    className="flex-1"
                  >
                    <Copy className="h-4 w-4 mr-2" />
                    Copiar Link
                  </Button>
                </div>

                {/* Social Media Sharing */}
                <div className="grid grid-cols-2 gap-2">
                  <Button
                    onClick={() => shareToSocial('whatsapp')}
                    variant="outline"
                    size="sm"
                    className="flex items-center gap-2"
                  >
                    <MessageCircle className="h-4 w-4" />
                    WhatsApp
                  </Button>
                  <Button
                    onClick={() => shareToSocial('instagram')}
                    variant="outline"
                    size="sm"
                    className="flex items-center gap-2"
                  >
                    <Instagram className="h-4 w-4" />
                    Instagram
                  </Button>
                  <Button
                    onClick={() => shareToSocial('facebook')}
                    variant="outline"
                    size="sm"
                    className="flex items-center gap-2"
                  >
                    <Facebook className="h-4 w-4" />
                    Facebook
                  </Button>
                  <Button
                    onClick={() => shareToSocial('twitter')}
                    variant="outline"
                    size="sm"
                    className="flex items-center gap-2"
                  >
                    <Twitter className="h-4 w-4" />
                    Twitter
                  </Button>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Sharing Tips */}
        <div className="bg-secondary/30 p-4 rounded-lg border border-border/50">
          <h4 className="font-medium text-foreground mb-2">💡 Tips para promocionar:</h4>
          <ul className="text-sm text-muted-foreground space-y-1">
            <li>• Comparte en Instagram Stories y fíjalo como destacado</li>
            <li>• Usa hashtags relevantes a tu negocio y ubicación</li>
            <li>• Comparte en grupos de WhatsApp de tu colonia</li>
            <li>• Publica en tu perfil personal y de negocio</li>
          </ul>
        </div>

        {/* Your Booking Link */}
        <div className="p-4 bg-white/5 rounded-xl border border-white/10 backdrop-blur-sm">
          <p className="text-sm font-medium text-foreground mb-2">Tu link de reservas:</p>
          <p className="text-sm font-mono text-muted-foreground break-all">
            {bookingUrl}
          </p>
        </div>
      </CardContent>
    </Card>
  );
};

export default ShareCard;