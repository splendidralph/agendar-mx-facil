
import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { Bell, Settings } from 'lucide-react';
import { toast } from 'sonner';

interface NotificationSettingsProps {
  provider: any;
  onUpdate: () => void;
}

const NotificationSettings = ({ provider, onUpdate }: NotificationSettingsProps) => {
  const [open, setOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const [preferences, setPreferences] = useState<any>(null);
  const [formData, setFormData] = useState({
    email_enabled: true,
    whatsapp_enabled: true,
    preferred_method: 'both',
    whatsapp_phone: provider.whatsapp_phone || ''
  });

  useEffect(() => {
    loadNotificationPreferences();
  }, [provider.id]);

  const loadNotificationPreferences = async () => {
    try {
      const { data, error } = await supabase
        .from('notification_preferences')
        .select('*')
        .eq('provider_id', provider.id)
        .maybeSingle();

      if (error && error.code !== 'PGRST116') {
        console.error('Error loading notification preferences:', error);
        return;
      }

      if (data) {
        setPreferences(data);
        setFormData({
          email_enabled: data.email_enabled,
          whatsapp_enabled: data.whatsapp_enabled,
          preferred_method: data.preferred_method,
          whatsapp_phone: provider.whatsapp_phone || ''
        });
      } else {
        // Create default preferences if none exist
        await createDefaultPreferences();
      }
    } catch (error) {
      console.error('Error loading notification preferences:', error);
    }
  };

  const createDefaultPreferences = async () => {
    try {
      const { data, error } = await supabase
        .from('notification_preferences')
        .insert({
          provider_id: provider.id,
          email_enabled: true,
          whatsapp_enabled: true,
          preferred_method: 'both'
        })
        .select()
        .single();

      if (error) throw error;

      setPreferences(data);
      setFormData({
        email_enabled: data.email_enabled,
        whatsapp_enabled: data.whatsapp_enabled,
        preferred_method: data.preferred_method,
        whatsapp_phone: provider.whatsapp_phone || ''
      });
    } catch (error) {
      console.error('Error creating default preferences:', error);
      toast.error('Error creando preferencias de notificación');
    }
  };

  const handleSave = async () => {
    setLoading(true);
    try {
      // Update notification preferences
      const { error: preferencesError } = await supabase
        .from('notification_preferences')
        .update({
          email_enabled: formData.email_enabled,
          whatsapp_enabled: formData.whatsapp_enabled,
          preferred_method: formData.preferred_method,
          updated_at: new Date().toISOString()
        })
        .eq('provider_id', provider.id);

      if (preferencesError) throw preferencesError;

      // Update WhatsApp phone number in provider profile if changed
      if (formData.whatsapp_phone !== provider.whatsapp_phone) {
        const { error: providerError } = await supabase
          .from('providers')
          .update({
            whatsapp_phone: formData.whatsapp_phone
          })
          .eq('id', provider.id);

        if (providerError) throw providerError;
      }

      toast.success('Preferencias de notificación actualizadas');
      setOpen(false);
      onUpdate();
    } catch (error) {
      console.error('Error updating notification preferences:', error);
      toast.error('Error actualizando las preferencias');
    } finally {
      setLoading(false);
    }
  };

  const getStatusText = () => {
    if (!preferences) return 'No configurado';
    
    if (preferences.email_enabled && preferences.whatsapp_enabled) {
      return 'Email y WhatsApp habilitados';
    } else if (preferences.email_enabled) {
      return 'Solo email habilitado';
    } else if (preferences.whatsapp_enabled) {
      return 'Solo WhatsApp habilitado';
    } else {
      return 'Notificaciones deshabilitadas';
    }
  };

  return (
    <Card className="border-border/50 shadow-lg">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Bell className="h-5 w-5" />
          Notificaciones
        </CardTitle>
        <CardDescription>
          Configura cómo recibir notificaciones de nuevas citas
        </CardDescription>
      </CardHeader>
      <CardContent>
        <div className="space-y-3 mb-4">
          <div>
            <p className="text-sm font-medium">Estado actual:</p>
            <p className="text-sm text-muted-foreground">{getStatusText()}</p>
          </div>
          {(!provider.whatsapp_phone || !preferences?.whatsapp_enabled) && (
            <div className="p-3 bg-yellow-50 border border-yellow-200 rounded-lg">
              <p className="text-sm text-yellow-800">
                {!provider.whatsapp_phone 
                  ? 'Agrega tu número de WhatsApp para recibir notificaciones' 
                  : 'WhatsApp deshabilitado'}
              </p>
            </div>
          )}
        </div>

        <Dialog open={open} onOpenChange={setOpen}>
          <DialogTrigger asChild>
            <Button className="w-full">
              <Settings className="h-4 w-4 mr-2" />
              Configurar Notificaciones
            </Button>
          </DialogTrigger>
          <DialogContent className="max-w-md">
            <DialogHeader>
              <DialogTitle>Configurar Notificaciones</DialogTitle>
            </DialogHeader>
            <div className="space-y-6">
              <div>
                <Label htmlFor="whatsapp_phone">Número de WhatsApp</Label>
                <Input
                  id="whatsapp_phone"
                  value={formData.whatsapp_phone}
                  onChange={(e) => setFormData(prev => ({ ...prev, whatsapp_phone: e.target.value }))}
                  placeholder="+52 123 456 7890"
                />
                <p className="text-xs text-muted-foreground mt-1">
                  Incluye el código de país (ej. +52 para México)
                </p>
              </div>

              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <div>
                    <Label htmlFor="email-notifications">Email</Label>
                    <p className="text-sm text-muted-foreground">Recibir notificaciones por email</p>
                  </div>
                  <Switch
                    id="email-notifications"
                    checked={formData.email_enabled}
                    onCheckedChange={(checked) => setFormData(prev => ({ ...prev, email_enabled: checked }))}
                  />
                </div>

                <div className="flex items-center justify-between">
                  <div>
                    <Label htmlFor="whatsapp-notifications">WhatsApp</Label>
                    <p className="text-sm text-muted-foreground">Recibir notificaciones por WhatsApp</p>
                  </div>
                  <Switch
                    id="whatsapp-notifications"
                    checked={formData.whatsapp_enabled}
                    onCheckedChange={(checked) => setFormData(prev => ({ ...prev, whatsapp_enabled: checked }))}
                    disabled={!formData.whatsapp_phone}
                  />
                </div>
              </div>

              <div>
                <Label>Método preferido</Label>
                <RadioGroup
                  value={formData.preferred_method}
                  onValueChange={(value) => setFormData(prev => ({ ...prev, preferred_method: value }))}
                  className="mt-2"
                >
                  <div className="flex items-center space-x-2">
                    <RadioGroupItem value="email_only" id="email_only" />
                    <Label htmlFor="email_only">Solo email</Label>
                  </div>
                  <div className="flex items-center space-x-2">
                    <RadioGroupItem value="whatsapp_only" id="whatsapp_only" disabled={!formData.whatsapp_phone} />
                    <Label htmlFor="whatsapp_only">Solo WhatsApp</Label>
                  </div>
                  <div className="flex items-center space-x-2">
                    <RadioGroupItem value="both" id="both" />
                    <Label htmlFor="both">Ambos</Label>
                  </div>
                </RadioGroup>
              </div>

              <div className="flex gap-2 pt-4">
                <Button onClick={handleSave} disabled={loading} className="flex-1">
                  {loading ? 'Guardando...' : 'Guardar'}
                </Button>
                <Button variant="outline" onClick={() => setOpen(false)} disabled={loading}>
                  Cancelar
                </Button>
              </div>
            </div>
          </DialogContent>
        </Dialog>
      </CardContent>
    </Card>
  );
};

export default NotificationSettings;
