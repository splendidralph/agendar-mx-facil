import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { useToast } from '@/hooks/use-toast';
import { Loader2 } from 'lucide-react';

interface BannerData {
  id: string;
  text_primary: string;
  text_secondary: string | null;
  is_active: boolean;
  animation_type: string;
  background_color: string | null;
  text_color: string | null;
  link_url: string | null;
  is_dismissible: boolean;
}

export const BannerManager = () => {
  const { toast } = useToast();
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [banner, setBanner] = useState<BannerData | null>(null);
  const [formData, setFormData] = useState({
    text_primary: '¡Ya puedes probar la beta!',
    text_secondary: '¡Estamos en beta!',
    is_active: true,
    animation_type: 'marquee',
    background_color: 'hsl(var(--primary))',
    text_color: 'hsl(var(--primary-foreground))',
    link_url: '',
    is_dismissible: true,
  });

  useEffect(() => {
    fetchBanner();
  }, []);

  const fetchBanner = async () => {
    setLoading(true);
    const { data, error } = await supabase
      .from('site_banners')
      .select('*')
      .order('created_at', { ascending: false })
      .limit(1)
      .single();

    if (error) {
      console.error('Error fetching banner:', error);
    } else if (data) {
      setBanner(data);
      setFormData({
        text_primary: data.text_primary,
        text_secondary: data.text_secondary || '',
        is_active: data.is_active,
        animation_type: data.animation_type,
        background_color: data.background_color || 'hsl(var(--primary))',
        text_color: data.text_color || 'hsl(var(--primary-foreground))',
        link_url: data.link_url || '',
        is_dismissible: data.is_dismissible,
      });
    }
    setLoading(false);
  };

  const handleSave = async () => {
    setSaving(true);
    try {
      const updateData = {
        ...formData,
        text_secondary: formData.text_secondary || null,
        link_url: formData.link_url || null,
      };

      if (banner) {
        const { error } = await supabase
          .from('site_banners')
          .update(updateData)
          .eq('id', banner.id);

        if (error) throw error;
      } else {
        const { error } = await supabase
          .from('site_banners')
          .insert(updateData);

        if (error) throw error;
      }

      toast({
        title: 'Banner actualizado',
        description: 'Los cambios se han guardado correctamente',
      });
      
      await fetchBanner();
    } catch (error) {
      console.error('Error saving banner:', error);
      toast({
        title: 'Error',
        description: 'No se pudo guardar el banner',
        variant: 'destructive',
      });
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center p-8">
        <Loader2 className="h-8 w-8 animate-spin" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle>Banner del Sitio</CardTitle>
          <CardDescription>
            Administra el banner que aparece en la parte superior de la página principal
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="text_primary">Texto Principal</Label>
              <Input
                id="text_primary"
                value={formData.text_primary}
                onChange={(e) => setFormData({ ...formData, text_primary: e.target.value })}
                placeholder="¡Ya puedes probar la beta!"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="text_secondary">Texto Secundario (Opcional)</Label>
              <Input
                id="text_secondary"
                value={formData.text_secondary}
                onChange={(e) => setFormData({ ...formData, text_secondary: e.target.value })}
                placeholder="¡Estamos en beta!"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="link_url">URL del Enlace (Opcional)</Label>
              <Input
                id="link_url"
                type="url"
                value={formData.link_url}
                onChange={(e) => setFormData({ ...formData, link_url: e.target.value })}
                placeholder="https://..."
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="animation_type">Tipo de Animación</Label>
                <Select
                  value={formData.animation_type}
                  onValueChange={(value) => setFormData({ ...formData, animation_type: value })}
                >
                  <SelectTrigger id="animation_type">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="marquee">Marquesina</SelectItem>
                    <SelectItem value="fade">Desvanecimiento</SelectItem>
                    <SelectItem value="pulse">Pulso</SelectItem>
                    <SelectItem value="none">Sin animación</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label htmlFor="background_color">Color de Fondo</Label>
                <Input
                  id="background_color"
                  value={formData.background_color}
                  onChange={(e) => setFormData({ ...formData, background_color: e.target.value })}
                  placeholder="hsl(var(--primary))"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="text_color">Color de Texto</Label>
                <Input
                  id="text_color"
                  value={formData.text_color}
                  onChange={(e) => setFormData({ ...formData, text_color: e.target.value })}
                  placeholder="hsl(var(--primary-foreground))"
                />
              </div>
            </div>

            <div className="flex items-center justify-between space-x-2">
              <Label htmlFor="is_active" className="cursor-pointer">Banner Activo</Label>
              <Switch
                id="is_active"
                checked={formData.is_active}
                onCheckedChange={(checked) => setFormData({ ...formData, is_active: checked })}
              />
            </div>

            <div className="flex items-center justify-between space-x-2">
              <Label htmlFor="is_dismissible" className="cursor-pointer">Permitir Cerrar</Label>
              <Switch
                id="is_dismissible"
                checked={formData.is_dismissible}
                onCheckedChange={(checked) => setFormData({ ...formData, is_dismissible: checked })}
              />
            </div>
          </div>

          <Button onClick={handleSave} disabled={saving} className="w-full">
            {saving ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Guardando...
              </>
            ) : (
              'Guardar Cambios'
            )}
          </Button>
        </CardContent>
      </Card>

      {/* Live Preview */}
      <Card>
        <CardHeader>
          <CardTitle>Vista Previa</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="border rounded-lg overflow-hidden">
            <div
              className="flex items-center justify-center gap-4 px-4 py-3"
              style={{
                backgroundColor: formData.background_color,
                color: formData.text_color,
              }}
            >
              <span className="font-semibold">{formData.text_primary}</span>
              {formData.text_secondary && (
                <span className="opacity-90">{formData.text_secondary}</span>
              )}
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};
