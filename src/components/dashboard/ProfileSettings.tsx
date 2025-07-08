
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
import { useCategories } from '@/hooks/useCategories';
import { Loader2, Check, X } from 'lucide-react';

interface ProfileSettingsProps {
  provider: any;
  onUpdate: () => void;
}

const ProfileSettings = ({ provider, onUpdate }: ProfileSettingsProps) => {
  const { mainCategories, subcategories, getSubcategoriesByMainCategory } = useCategories();
  const [open, setOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const [isCheckingUsername, setIsCheckingUsername] = useState(false);
  const [isUsernameAvailable, setIsUsernameAvailable] = useState<boolean | null>(null);
  const [checkTimeout, setCheckTimeout] = useState<NodeJS.Timeout | null>(null);
  
  const [formData, setFormData] = useState({
    business_name: provider.business_name || '',
    bio: provider.bio || '',
    main_category_id: provider.main_category_id || '',
    subcategory_id: provider.subcategory_id || '',
    address: provider.address || '',
    instagram_handle: provider.instagram_handle || '',
    username: provider.username || ''
  });

  const checkUsernameAvailabilityDebounced = async (username: string) => {
    if (!username || username.length < 3 || username === provider.username) {
      setIsUsernameAvailable(null);
      return;
    }

    setIsCheckingUsername(true);
    try {
      const available = await checkUsernameAvailability(username, provider.user_id);
      setIsUsernameAvailable(available);
    } catch (error) {
      console.error('Error checking username:', error);
      setIsUsernameAvailable(null);
    } finally {
      setIsCheckingUsername(false);
    }
  };

  const handleUsernameChange = (value: string) => {
    const cleanUsername = value
      .toLowerCase()
      .replace(/[^a-z0-9-]/g, '')
      .slice(0, 30);
    
    setFormData(prev => ({ ...prev, username: cleanUsername }));
    setIsUsernameAvailable(null);

    if (checkTimeout) {
      clearTimeout(checkTimeout);
    }

    if (cleanUsername.length >= 3 && cleanUsername !== provider.username) {
      const timeout = setTimeout(() => {
        checkUsernameAvailabilityDebounced(cleanUsername);
      }, 500);
      setCheckTimeout(timeout);
    }
  };

  const handleSave = async () => {
    setLoading(true);
    try {
      // Validate required fields
      if (!formData.business_name.trim()) {
        toast.error('El nombre del negocio es requerido');
        setLoading(false);
        return;
      }

      if (!formData.username.trim()) {
        toast.error('El username es requerido');
        setLoading(false);
        return;
      }

      // Check username availability if it changed
      if (formData.username !== provider.username && formData.username) {
        if (isUsernameAvailable === false) {
          toast.error('El username ya está en uso');
          setLoading(false);
          return;
        }
        if (isUsernameAvailable === null && formData.username.length >= 3) {
          const isAvailable = await checkUsernameAvailability(formData.username, provider.user_id);
          if (!isAvailable) {
            toast.error('El username ya está en uso');
            setLoading(false);
            return;
          }
        }
      }

      const { error } = await supabase
        .from('providers')
        .update({
          business_name: formData.business_name,
          bio: formData.bio,
          main_category_id: formData.main_category_id || null,
          subcategory_id: formData.subcategory_id || null,
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
                <div className="relative">
                  <span className="absolute left-3 top-1/2 transform -translate-y-1/2 text-sm font-medium text-foreground z-10">
                    bookeasy.mx/
                  </span>
                  <Input
                    id="username"
                    value={formData.username}
                    onChange={(e) => handleUsernameChange(e.target.value)}
                    placeholder="mi-negocio"
                    className="pl-28"
                  />
                  <div className="absolute right-3 top-1/2 transform -translate-y-1/2">
                    {isCheckingUsername && <Loader2 className="h-4 w-4 animate-spin text-muted-foreground" />}
                    {!isCheckingUsername && isUsernameAvailable === true && <Check className="h-4 w-4 text-green-500" />}
                    {!isCheckingUsername && isUsernameAvailable === false && <X className="h-4 w-4 text-red-500" />}
                  </div>
                </div>
                {isUsernameAvailable === false && (
                  <p className="text-sm text-red-500 mt-1">Este username no está disponible</p>
                )}
                {isUsernameAvailable === true && (
                  <p className="text-sm text-green-500 mt-1">¡Username disponible!</p>
                )}
              </div>

              <div>
                <Label htmlFor="main_category">Categoría Principal</Label>
                <Select value={formData.main_category_id} onValueChange={(value) => {
                  setFormData(prev => ({ ...prev, main_category_id: value, subcategory_id: '' }));
                }}>
                  <SelectTrigger>
                    <SelectValue placeholder="Selecciona una categoría principal" />
                  </SelectTrigger>
                  <SelectContent>
                    {mainCategories.map((category) => (
                      <SelectItem key={category.id} value={category.id}>
                        <span className="flex items-center gap-2">
                          {category.icon && <span>{category.icon}</span>}
                          {category.display_name}
                        </span>
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              {formData.main_category_id && (
                <div>
                  <Label htmlFor="subcategory">Especialidad</Label>
                  <Select value={formData.subcategory_id} onValueChange={(value) => {
                    setFormData(prev => ({ ...prev, subcategory_id: value }));
                  }}>
                    <SelectTrigger>
                      <SelectValue placeholder="Selecciona tu especialidad" />
                    </SelectTrigger>
                    <SelectContent>
                      {getSubcategoriesByMainCategory(formData.main_category_id).map((subcategory) => (
                        <SelectItem key={subcategory.id} value={subcategory.id}>
                          {subcategory.display_name}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              )}

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
