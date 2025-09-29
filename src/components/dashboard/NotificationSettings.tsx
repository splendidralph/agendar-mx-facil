
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
      const phoneToSave = formData.whatsapp_phone.trim() || null;
      
      // 1. Validate the phone number format
      if (phoneToSave && !/^\+[1-9]\d{1,14}$/.test(phoneToSave)) {
        toast.error('El formato del número de WhatsApp no es válido. Debe incluir código de país (ej: +52).');
        setLoading(false);
        return;
      }

      // 2. Update the main PROVIDERS profile table with the new phone number
      const { error: providerUpdateError } = await supabase
        .from('providers')
        .update({
          whatsapp_phone: phoneToSave, // Use the number the user typed in the dialog
          updated_at: new Date().toISOString()
        })
        .eq('user_id', provider.user_id); // Use user_id for RLS/security

      if (providerUpdateError) throw providerUpdateError;

      // 3. Update notification preferences to sync with the new state
      const hasWhatsApp = !!phoneToSave;
      const whatsappEnabled = hasWhatsApp;
      const preferredMethod = hasWhatsApp ? 'both' : 'email_only';

      const { error: preferencesError } = await supabase
        .from('notification_preferences')
        .update({
          email_enabled: true,
          whatsapp_enabled: whatsappEnabled,
          preferred_method: preferredMethod,
          whatsapp_phone: phoneToSave, // Use the new phone number for preferences
          updated_at: new Date().toISOString()
        })
        .eq('provider_id', provider.id);

      if (preferencesError) throw preferencesError;
      
      toast.success('Preferencias y número de WhatsApp actualizados');
      setOpen(false);
      
      // CRITICAL: Call parent update to refresh the dashboard component's provider prop
      onUpdate(); 
      loadNotificationPreferences(); // Reload preferences for dialog state
    } catch (error) {
      console.error('Error updating notification preferences:', error);
      // Display a specific error if it's a known DB error
      const userError = error.message?.includes('providers_whatsapp_phone_key') 
        ? 'El número de WhatsApp ya está en uso.' 
        : 'Error actualizando las preferencias. Inténtalo de nuevo.';
        
      toast.error(userError);
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
          {provider.whatsapp_phone && (
            <div className="p-3 bg-green-50 border border-green-200 rounded-lg">
              <p className="text-sm text-green-800">
                <strong>Teléfono configurado:</strong> {provider.whatsapp_phone}
              </p>
              <p className="text-xs text-green-700 mt-1">
                Recibirás notificaciones por email y WhatsApp
              </p>
            </div>
          )}
          {!provider.whatsapp_phone && (
            <div className="p-3 bg-blue-50 border border-blue-200 rounded-lg">
              <p className="text-sm text-blue-800">
                Sin teléfono configurado. Solo recibirás notificaciones por email.
              </p>
              <p className="text-xs text-blue-700 mt-1">
                Actualiza tu perfil en el onboarding para recibir notificaciones por WhatsApp
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
              <div className="p-4 bg-blue-50 border border-blue-200 rounded-lg">
                <div className="space-y-2">
                  <h4 className="text-sm font-medium text-blue-900">Configuración de Notificaciones</h4>
                   <div className="space-y-3">
                    <Label htmlFor="whatsapp_phone">Número de WhatsApp</Label>
                    <CustomPhoneInput
                      value={formData.whatsapp_phone}
                      onChange={handleWhatsAppChange}
                      placeholder="+52 123 456 7890"
                      required={false}
                      defaultCountry="MX"
                    />
                    <p className="text-xs text-blue-700">
                      Ingresa tu número con código de país (ej: +52 para México, +1 para EUA/Canadá)
                    </p>
                  </div>
                </div>
              </div>

              <div className="flex gap-2 pt-4">
                <Button onClick={handleSave} disabled={loading} className="flex-1">
                  {loading ? 'Sincronizando...' : 'Sincronizar Configuración'}
                </Button>
                <Button variant="outline" onClick={() => setOpen(false)} disabled={loading}>
                  Cerrar
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
