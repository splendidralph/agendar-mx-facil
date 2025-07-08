
import { useState } from 'react';
import { useAuth } from '@/hooks/useAuth';
import { supabase } from '@/integrations/supabase/client';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Settings, User } from 'lucide-react';
import { toast } from 'sonner';
import { checkUsernameAvailability } from '@/utils/usernameUtils';
import ProfilePictureUpload from './ProfilePictureUpload';
import { CustomPhoneInput } from '@/components/ui/phone-input';

interface ProfileSettingsProps {
  provider: any;
  onUpdate: () => void;
}

const ProfileSettings = ({ provider, onUpdate }: ProfileSettingsProps) => {
  const [open, setOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    business_name: provider.business_name || '',
    bio: provider.bio || '',
    category: provider.category || '',
    address: provider.address || '',
    instagram_handle: provider.instagram_handle || '',
    username: provider.username || ''
  });

  const categories = [
    { value: 'corte_barberia', label: 'Corte y Barbería' },
    { value: 'unas', label: 'Uñas y Manicure' },
    { value: 'maquillaje_cejas', label: 'Maquillaje y Cejas' },
    { value: 'cuidado_facial', label: 'Cuidado Facial' },
    { value: 'masajes_relajacion', label: 'Masajes y Relajación' },
    { value: 'color_alisado', label: 'Color y Alisado' }
  ];

  const handleSave = async () => {
    setLoading(true);
    try {
      // Check username availability if it changed
      if (formData.username !== provider.username && formData.username) {
        const isAvailable = await checkUsernameAvailability(formData.username, provider.user_id);
        if (!isAvailable) {
          toast.error('El username ya está en uso');
          setLoading(false);
          return;
        }
      }

      const { error } = await supabase
        .from('providers')
        .update({
          business_name: formData.business_name,
          bio: formData.bio,
          category: formData.category,
          address: formData.address,
          instagram_handle: formData.instagram_handle,
          username: formData.username
        })
        .eq('id', provider.id);

      if (error) throw error;

      toast.success('Perfil actualizado exitosamente');
      setOpen(false);
      onUpdate();
    } catch (error) {
      console.error('Error updating profile:', error);
      toast.error('Error actualizando el perfil');
    } finally {
      setLoading(false);
    }
  };

  return (
    <Card className="border-border/50 shadow-lg">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <User className="h-5 w-5" />
          Configuración del Perfil
        </CardTitle>
        <CardDescription>
          Administra la información de tu negocio
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-6">
        <div className="flex items-center space-x-4">
          <ProfilePictureUpload
            providerId={provider.id}
            currentImageUrl={provider.profile_image_url}
            businessName={provider.business_name || 'Usuario'}
            onImageUpdate={onUpdate}
            size="md"
          />
          <div className="flex-1">
            <h3 className="font-semibold">{provider.business_name || 'Sin nombre'}</h3>
            <p className="text-sm text-muted-foreground">@{provider.username || 'sin-username'}</p>
          </div>
        </div>
        
        <Dialog open={open} onOpenChange={setOpen}>
          <DialogTrigger asChild>
            <Button className="w-full">
              <Settings className="h-4 w-4 mr-2" />
              Editar Perfil
            </Button>
          </DialogTrigger>
          <DialogContent className="max-w-2xl max-h-[80vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle>Editar Perfil</DialogTitle>
            </DialogHeader>
            <div className="space-y-6">
              <div className="flex justify-center">
                <ProfilePictureUpload
                  providerId={provider.id}
                  currentImageUrl={provider.profile_image_url}
                  businessName={provider.business_name || 'Usuario'}
                  onImageUpdate={onUpdate}
                  size="lg"
                  showUploadButton
                />
              </div>
              
              <div className="space-y-4">
              <div>
                <Label htmlFor="business_name">Nombre del Negocio</Label>
                <Input
                  id="business_name"
                  value={formData.business_name}
                  onChange={(e) => setFormData(prev => ({ ...prev, business_name: e.target.value }))}
                />
              </div>
              
              <div>
                <Label htmlFor="username">Username</Label>
                <Input
                  id="username"
                  value={formData.username}
                  onChange={(e) => setFormData(prev => ({ ...prev, username: e.target.value }))}
                  placeholder="mi-negocio"
                />
              </div>

              <div>
                <Label htmlFor="category">Categoría</Label>
                <Select value={formData.category} onValueChange={(value) => setFormData(prev => ({ ...prev, category: value }))}>
                  <SelectTrigger>
                    <SelectValue placeholder="Selecciona una categoría" />
                  </SelectTrigger>
                  <SelectContent>
                    {categories.map((cat) => (
                      <SelectItem key={cat.value} value={cat.value}>
                        {cat.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div>
                <Label htmlFor="bio">Descripción</Label>
                <Textarea
                  id="bio"
                  value={formData.bio}
                  onChange={(e) => setFormData(prev => ({ ...prev, bio: e.target.value }))}
                  placeholder="Describe tu negocio..."
                />
              </div>

              <div>
                <Label htmlFor="address">Dirección</Label>
                <Input
                  id="address"
                  value={formData.address}
                  onChange={(e) => setFormData(prev => ({ ...prev, address: e.target.value }))}
                />
              </div>

              <div>
                <Label htmlFor="email">Email</Label>
                <Input
                  id="email"
                  value={provider.users?.email || 'No disponible'}
                  disabled
                  className="bg-muted"
                />
              </div>


              <div>
                <Label htmlFor="instagram_handle">Instagram (sin @)</Label>
                <Input
                  id="instagram_handle"
                  value={formData.instagram_handle}
                  onChange={(e) => setFormData(prev => ({ ...prev, instagram_handle: e.target.value }))}
                  placeholder="mi_negocio_oficial"
                />
              </div>

              <div className="flex gap-2 pt-4">
                <Button onClick={handleSave} disabled={loading} className="flex-1">
                  {loading ? 'Guardando...' : 'Guardar Cambios'}
                </Button>
                <Button variant="outline" onClick={() => setOpen(false)} disabled={loading}>
                  Cancelar
                </Button>
              </div>
              </div>
            </div>
          </DialogContent>
        </Dialog>
      </CardContent>
    </Card>
  );
};

export default ProfileSettings;
