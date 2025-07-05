
import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Label } from '@/components/ui/label';
import { Bell, Settings } from 'lucide-react';
import { toast } from 'sonner';
import { CustomPhoneInput } from '@/components/ui/phone-input';

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
    whatsapp_phone: ''
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
          whatsapp_phone: data.whatsapp_phone || ''
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
          whatsapp_enabled: false,
          preferred_method: 'email_only',
          whatsapp_phone: ''
        })
        .select()
        .single();

      if (error) throw error;

      setPreferences(data);
      setFormData({
        email_enabled: data.email_enabled,
        whatsapp_enabled: data.whatsapp_enabled,
        preferred_method: data.preferred_method,
        whatsapp_phone: data.whatsapp_phone || ''
      });
    } catch (error) {
      console.error('Error creating default preferences:', error);
      toast.error('Error creando preferencias de notificación');
    }
  };

  const handleSave = async () => {
    setLoading(true);
    try {
      // Smart defaults: automatically enable WhatsApp if phone is provided
      const hasWhatsApp = formData.whatsapp_phone && formData.whatsapp_phone.trim() !== '';
      const whatsappEnabled = hasWhatsApp;
      const preferredMethod = hasWhatsApp ? 'both' : 'email_only';

      // Update notification preferences (store WhatsApp phone here)
      const { error: preferencesError } = await supabase
        .from('notification_preferences')
        .update({
          email_enabled: true, // Always enable email
          whatsapp_enabled: whatsappEnabled,
          preferred_method: preferredMethod,
          whatsapp_phone: formData.whatsapp_phone,
          updated_at: new Date().toISOString()
        })
        .eq('provider_id', provider.id);

      if (preferencesError) throw preferencesError;

      toast.success('Preferencias de notificación actualizadas');
      setOpen(false);
      onUpdate();
      // Refresh preferences to update UI
      loadNotificationPreferences();
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

  const handleWhatsAppChange = (value?: string) => {
    setFormData(prev => ({ ...prev, whatsapp_phone: value || '' }));
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
          {(!formData.whatsapp_phone || !preferences?.whatsapp_enabled) && (
            <div className="p-3 bg-blue-50 border border-blue-200 rounded-lg">
              <p className="text-sm text-blue-800">
                Recibirás notificaciones por email. Agrega tu WhatsApp para también recibirlas por mensaje.
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
                <Label htmlFor="whatsapp_phone">Número de WhatsApp (opcional)</Label>
                <CustomPhoneInput
                  value={formData.whatsapp_phone}
                  onChange={handleWhatsAppChange}
                  placeholder="(55) 1234-5678"
                  defaultCountry="MX"
                />
                <p className="text-xs text-muted-foreground mt-1">
                  Si proporcionas tu WhatsApp, recibirás notificaciones por email y WhatsApp
                </p>
              </div>

              <div className="p-4 bg-blue-50 border border-blue-200 rounded-lg">
                <div className="space-y-2">
                  <h4 className="text-sm font-medium text-blue-900">¿Cómo funciona?</h4>
                  <ul className="text-sm text-blue-800 space-y-1">
                    <li>• Siempre recibirás notificaciones por email</li>
                    <li>• Si agregas WhatsApp, también recibirás mensajes</li>
                    <li>• Puedes cambiar tu número cuando quieras</li>
                  </ul>
                </div>
              </div>

              <div className="flex gap-2 pt-4">
                <Button onClick={handleSave} disabled={loading} className="flex-1">
                  {loading ? 'Guardando...' : 'Guardar Configuración'}
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
