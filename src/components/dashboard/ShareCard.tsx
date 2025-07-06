import { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';
import { Share2, Download, Instagram, MessageCircle, Facebook, Twitter, Copy, Sparkles, Image as ImageIcon, Smartphone } from 'lucide-react';
import { useIsMobile } from '@/hooks/use-mobile';

interface ShareCardProps {
  provider: any;
}

const ShareCard = ({ provider }: ShareCardProps) => {
  const [loading, setLoading] = useState(false);
  const [generatedImage, setGeneratedImage] = useState<string | null>(null);
  const [selectedFormat, setSelectedFormat] = useState<'story' | 'square'>('story');
  const isMobile = useIsMobile();

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
    link.download = `${provider.username || 'mi-negocio'}-${selectedFormat}.png`;
    link.href = generatedImage;
    link.click();
    
    // Auto-copy caption for easier sharing
    const caption = `¡Reserva tu cita conmigo! ${provider.business_name} - bookeasy.mx/${provider.username}`;
    copyToClipboard(caption);
    
    toast.success('Imagen descargada y texto de promoción copiado');
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
    };

    if (platform === 'instagram') {
      handleInstagramShare();
      return;
    }

    window.open(urls[platform as keyof typeof urls], '_blank');
  };

  const handleInstagramShare = async () => {
    // Stories-optimized caption with hashtags and location
    const locationHashtags = provider.colonia ? `#${provider.colonia.replace(/\s+/g, '')} #${provider.category?.replace(/\s+/g, '')}` : `#${provider.category?.replace(/\s+/g, '')}`;
    const caption = `¡Reserva tu cita conmigo! ${provider.business_name} 📱✨\n\n${provider.bio || ''}\n\n✨ Agenda fácil y rápido\n📍 ${provider.colonia || 'Tu zona'}\n🔗 bookeasy.mx/${provider.username}\n\n${locationHashtags} #reserva #story #bookeasy`;
    
    if (isMobile) {
      try {
        // Copy Stories-optimized caption to clipboard first
        await copyToClipboard(caption);
        
        // Show immediate feedback
        toast.success('📱 Abriendo Instagram Stories...', {
          description: 'Texto copiado al portapapeles',
          duration: 3000
        });
        
        // Try Stories-specific deep links in sequence
        const storyUrls = [
          'instagram://story-camera',
          'instagram://stories/new', 
          'instagram://camera'
        ];
        
        let linkWorked = false;
        for (const url of storyUrls) {
          try {
            window.location.href = url;
            linkWorked = true;
            break;
          } catch (e) {
            continue;
          }
        }
        
        // Fallback after attempting deep links
        setTimeout(() => {
          if (generatedImage) {
            downloadImage();
            toast.info('📸 Si Instagram no se abrió:', {
              description: '• Usa la imagen descargada\n• Abre Instagram manualmente\n• Crea nueva Story\n• El texto ya está copiado',
              duration: 6000
            });
          }
        }, 2000);
        
      } catch (error) {
        // Complete fallback
        downloadImage();
        await copyToClipboard(caption);
        toast.info('📱 Compartir en Stories:', {
          description: '1. Imagen descargada\n2. Texto copiado\n3. Abre Instagram\n4. Crea nueva Story',
          duration: 5000
        });
      }
    } else {
      // Desktop: Enhanced Stories workflow
      if (generatedImage) {
        downloadImage();
        await copyToClipboard(caption);
        toast.success('✨ ¡Perfecto para Instagram Stories!', {
          description: '📱 En tu móvil:\n1. Abre Instagram\n2. Toca tu foto de perfil (+)\n3. Selecciona la imagen descargada\n4. Pega el texto copiado\n5. ¡Comparte tu Story!',
          duration: 10000
        });
      }
    }
  };

  // Web Share API for native sharing when available
  const handleNativeShare = async () => {
    if (navigator.share && generatedImage) {
      try {
        // Convert data URL to blob for sharing
        const response = await fetch(generatedImage);
        const blob = await response.blob();
        const file = new File([blob], `${provider.username}-promo.png`, { type: 'image/png' });
        
        await navigator.share({
          title: `${provider.business_name} - Reserva tu cita`,
          text: `¡Reserva tu cita conmigo! ${provider.business_name}`,
          url: `https://bookeasy.mx/${provider.username}`,
          files: [file]
        });
        
        toast.success('¡Compartido exitosamente!');
      } catch (error) {
        // Fallback to regular sharing
        downloadImage();
      }
    } else {
      downloadImage();
    }
  };

  const bookingUrl = `https://bookeasy.mx/${provider.username}`;

  return (
    <div className="space-y-8">
      {/* Main Share Card */}
      <Card className="glassmorphism hover-lift overflow-hidden">
        <CardHeader className="text-center pb-6">
          <div className="mx-auto mb-4 p-3 rounded-full bg-primary/20 w-fit">
            <Share2 className="h-8 w-8 text-primary" />
          </div>
          <CardTitle className="text-2xl font-bold text-foreground mb-2">
            ¡Promociona tu negocio!
          </CardTitle>
          <CardDescription className="text-lg text-muted-foreground max-w-md mx-auto">
            Crea imágenes profesionales para compartir en redes sociales y atraer más clientes
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-8 px-8 pb-8">
          {/* Format Selection */}
          <div className="space-y-6">
            <div className="text-center">
              <h3 className="text-xl font-semibold text-foreground mb-2">Elige tu formato favorito</h3>
              <p className="text-muted-foreground">Selecciona el formato que mejor se adapte a tu estrategia</p>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div 
                onClick={() => setSelectedFormat('story')}
                className={`cursor-pointer p-6 rounded-2xl border-2 transition-all hover:scale-105 ${
                  selectedFormat === 'story' 
                    ? 'border-primary bg-primary/10 shadow-lg' 
                    : 'border-border bg-card/50 hover:border-primary/50'
                }`}
              >
                <div className="text-center space-y-4">
                  <div className="mx-auto w-16 h-28 bg-gradient-to-b from-pink-400 to-purple-600 rounded-xl flex items-center justify-center">
                    <Instagram className="h-8 w-8 text-white" />
                  </div>
                  <div>
                    <h4 className="font-semibold text-foreground mb-1">Instagram Story</h4>
                    <p className="text-sm text-muted-foreground mb-2">Perfecto para stories y destacados</p>
                    <Badge variant="secondary" className="text-xs">9:16</Badge>
                  </div>
                </div>
              </div>
              
              <div 
                onClick={() => setSelectedFormat('square')}
                className={`cursor-pointer p-6 rounded-2xl border-2 transition-all hover:scale-105 ${
                  selectedFormat === 'square' 
                    ? 'border-primary bg-primary/10 shadow-lg' 
                    : 'border-border bg-card/50 hover:border-primary/50'
                }`}
              >
                <div className="text-center space-y-4">
                  <div className="mx-auto w-20 h-20 bg-gradient-to-br from-blue-400 to-cyan-600 rounded-xl flex items-center justify-center">
                    <ImageIcon className="h-8 w-8 text-white" />
                  </div>
                  <div>
                    <h4 className="font-semibold text-foreground mb-1">Formato Cuadrado</h4>
                    <p className="text-sm text-muted-foreground mb-2">Ideal para posts y WhatsApp</p>
                    <Badge variant="secondary" className="text-xs">1:1</Badge>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Generate Button */}
          <div className="text-center space-y-4">
            <Button
              onClick={() => generateShareImage(selectedFormat)}
              disabled={loading || !provider.username}
              size="lg"
              className="w-full max-w-md mx-auto gradient-primary text-primary-foreground hover:opacity-90 shadow-xl text-lg py-6 rounded-2xl"
            >
              {loading ? (
                <>
                  <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white mr-3"></div>
                  Creando tu imagen mágica...
                </>
              ) : (
                <>
                  <Sparkles className="h-5 w-5 mr-3" />
                  ✨ Crear mi imagen promocional
                </>
              )}
            </Button>
            {!provider.username && (
              <p className="text-sm text-muted-foreground">
                Necesitas configurar tu username en Configuración primero
              </p>
            )}
          </div>

          {/* Generated Image Preview */}
          {generatedImage && (
            <div className="space-y-8">
              <div className="text-center">
                <h3 className="text-2xl font-bold text-foreground mb-2">🎉 ¡Tu imagen está lista!</h3>
                <p className="text-muted-foreground">Ahora puedes descargarla y compartirla en tus redes sociales</p>
              </div>
              
              <div className="relative p-8 bg-gradient-to-br from-primary/10 to-accent/10 rounded-3xl border border-primary/20">
                <div className="flex justify-center mb-6">
                  <div className={`${selectedFormat === 'story' ? 'w-48 h-80' : 'w-72 h-72'} border-4 border-white rounded-2xl overflow-hidden bg-white shadow-2xl hover:scale-105 transition-transform duration-300`}>
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
                
                {/* Primary Actions */}
                <div className="space-y-6">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {isMobile && navigator.share ? (
                      <Button
                        onClick={handleNativeShare}
                        size="lg"
                        className="gradient-primary text-primary-foreground hover:opacity-90 shadow-lg text-base py-6 rounded-2xl"
                      >
                        <Share2 className="h-5 w-5 mr-3" />
                        📱 Compartir imagen
                      </Button>
                    ) : (
                      <Button
                        onClick={downloadImage}
                        size="lg"
                        className="gradient-primary text-primary-foreground hover:opacity-90 shadow-lg text-base py-6 rounded-2xl"
                      >
                        <Download className="h-5 w-5 mr-3" />
                        📱 Descargar imagen
                      </Button>
                    )}
                    <Button
                      onClick={() => copyToClipboard(bookingUrl)}
                      variant="outline"
                      size="lg"
                      className="border-2 border-primary/30 text-foreground hover:bg-primary/10 hover:border-primary/50 text-base py-6 rounded-2xl"
                    >
                      <Copy className="h-5 w-5 mr-3" />
                      🔗 Copiar mi link
                    </Button>
                  </div>

                  {/* Social Media Sharing - Priority on WhatsApp and Instagram */}
                  <div className="space-y-4">
                    <h4 className="text-center font-semibold text-foreground">Comparte directamente:</h4>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <Button
                        onClick={() => shareToSocial('whatsapp')}
                        variant="outline"
                        size="lg"
                        className="bg-green-50 border-2 border-green-200 text-green-700 hover:bg-green-100 hover:border-green-300 text-base py-6 rounded-2xl"
                      >
                        <MessageCircle className="h-5 w-5 mr-3" />
                        💬 Enviar por WhatsApp
                      </Button>
                      <Button
                        onClick={() => shareToSocial('instagram')}
                        variant="outline"
                        size="lg"
                        className="bg-gradient-to-r from-pink-500 to-purple-600 text-white border-0 hover:from-pink-600 hover:to-purple-700 text-base py-6 rounded-2xl shadow-lg"
                      >
                        <Instagram className="h-5 w-5 mr-3" />
                        {isMobile ? '📸 Crear Instagram Story' : '📸 Compartir en Stories'}
                      </Button>
                    </div>
                    
                    {/* Secondary Social Options */}
                    <details className="group">
                      <summary className="cursor-pointer text-center text-sm text-muted-foreground hover:text-foreground transition-colors">
                        Más opciones de compartir ↓
                      </summary>
                      <div className="mt-4 grid grid-cols-2 gap-3">
                        <Button
                          onClick={() => shareToSocial('facebook')}
                          variant="outline"
                          size="sm"
                          className="bg-blue-50 border border-blue-200 text-blue-700 hover:bg-blue-100"
                        >
                          <Facebook className="h-4 w-4 mr-2" />
                          Facebook
                        </Button>
                        <Button
                          onClick={() => shareToSocial('twitter')}
                          variant="outline"
                          size="sm"
                          className="bg-sky-50 border border-sky-200 text-sky-700 hover:bg-sky-100"
                        >
                          <Twitter className="h-4 w-4 mr-2" />
                          Twitter
                        </Button>
                      </div>
                    </details>
                  </div>
                </div>
              </div>
            </div>
          )}

        </CardContent>
      </Card>

      {/* Tips and Link Section */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Sharing Tips */}
        <Card className="glassmorphism">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-lg">
              💡 Tips de promoción
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              <div className="flex items-start gap-3 p-3 bg-primary/5 rounded-xl border border-primary/10">
                <span className="text-2xl">📱</span>
                <div>
                  <p className="font-medium text-foreground text-sm">Instagram Stories</p>
                  <p className="text-xs text-muted-foreground">Comparte y fíjalo como destacado permanente</p>
                </div>
              </div>
              <div className="flex items-start gap-3 p-3 bg-accent/5 rounded-xl border border-accent/10">
                <span className="text-2xl">💬</span>
                <div>
                  <p className="font-medium text-foreground text-sm">Grupos de WhatsApp</p>
                  <p className="text-xs text-muted-foreground">Comparte en grupos locales de tu colonia</p>
                </div>
              </div>
              <div className="flex items-start gap-3 p-3 bg-secondary/20 rounded-xl border border-secondary/30">
                <span className="text-2xl">#️⃣</span>
                <div>
                  <p className="font-medium text-foreground text-sm">Usa hashtags locales</p>
                  <p className="text-xs text-muted-foreground">Incluye tu colonia y tipo de negocio</p>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Your Booking Link */}
        <Card className="glassmorphism">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-lg">
              🔗 Tu link personal
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div className="p-4 bg-primary/10 rounded-xl border border-primary/20 backdrop-blur-sm">
                <p className="text-sm font-medium text-foreground mb-2">Link de reservas:</p>
                <p className="text-sm font-mono text-primary font-semibold break-all">
                  {bookingUrl}
                </p>
              </div>
              <Button
                onClick={() => copyToClipboard(bookingUrl)}
                variant="outline"
                size="sm"
                className="w-full border-primary/30 text-foreground hover:bg-primary/10 hover:border-primary/50"
              >
                <Copy className="h-4 w-4 mr-2" />
                Copiar link
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default ShareCard;