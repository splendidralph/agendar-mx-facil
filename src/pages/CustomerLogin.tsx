import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { CustomPhoneInput } from "@/components/ui/phone-input";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Phone, ArrowLeft } from "lucide-react";
import { toast } from "sonner";

const CustomerLogin = () => {
  const [phone, setPhone] = useState("");
  const [otp, setOtp] = useState("");
  const [step, setStep] = useState<'phone' | 'otp'>('phone');
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const handleSendOTP = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!phone.trim()) {
      toast.error("Por favor ingresa tu número de teléfono");
      return;
    }

    setLoading(true);
    try {
      const { error } = await supabase.auth.signInWithOtp({
        phone: phone.trim(),
        options: {
          channel: 'sms'
        }
      });

      if (error) {
        console.error('OTP send error:', error);
        toast.error("Error enviando código. Verifica tu número.");
        return;
      }

      toast.success("Código enviado a tu teléfono");
      setStep('otp');
    } catch (error) {
      console.error('Unexpected error:', error);
      toast.error("Error inesperado. Inténtalo de nuevo.");
    } finally {
      setLoading(false);
    }
  };

  const handleVerifyOTP = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!otp.trim()) {
      toast.error("Por favor ingresa el código");
      return;
    }

    setLoading(true);
    try {
      const { error } = await supabase.auth.verifyOtp({
        phone: phone.trim(),
        token: otp.trim(),
        type: 'sms'
      });

      if (error) {
        console.error('OTP verify error:', error);
        toast.error("Código incorrecto. Inténtalo de nuevo.");
        return;
      }

      toast.success("¡Bienvenido!");
      navigate('/mi-cuenta');
    } catch (error) {
      console.error('Unexpected error:', error);
      toast.error("Error inesperado. Inténtalo de nuevo.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-secondary to-background flex items-center justify-center px-4">
      <Card className="w-full max-w-md border-border/50 shadow-2xl">
        <CardHeader className="text-center">
          <div className="flex items-center justify-center mb-4">
            <Button
              variant="ghost"
              size="sm"
              onClick={() => navigate('/')}
              className="mr-auto"
            >
              <ArrowLeft className="h-4 w-4 mr-2" />
              Volver
            </Button>
          </div>
          <div className="gradient-primary text-primary-foreground p-3 rounded-full w-fit mx-auto mb-4">
            <Phone className="h-6 w-6" />
          </div>
          <CardTitle className="text-2xl font-bold">
            {step === 'phone' ? 'Acceder a Mi Cuenta' : 'Verificar Código'}
          </CardTitle>
          <p className="text-muted-foreground">
            {step === 'phone' 
              ? 'Ingresa tu número de teléfono para acceder'
              : 'Ingresa el código enviado a tu teléfono'
            }
          </p>
        </CardHeader>
        <CardContent>
          {step === 'phone' ? (
            <form onSubmit={handleSendOTP} className="space-y-4">
              <div>
                <label className="text-sm font-medium text-foreground mb-2 block">
                  Número de Teléfono
                </label>
                <CustomPhoneInput
                  value={phone}
                  onChange={(value) => setPhone(value || "")}
                  placeholder="(664) 123-4567"
                  defaultCountry="MX"
                  className="w-full"
                  disabled={loading}
                />
                <p className="text-xs text-muted-foreground mt-1">
                  Usa el número con el que hiciste tu reserva
                </p>
              </div>
              <Button 
                type="submit" 
                className="w-full" 
                disabled={loading}
              >
                {loading ? 'Enviando...' : 'Enviar Código'}
              </Button>
            </form>
          ) : (
            <form onSubmit={handleVerifyOTP} className="space-y-4">
              <div>
                <label className="text-sm font-medium text-foreground mb-2 block">
                  Código de Verificación
                </label>
                <Input
                  type="text"
                  placeholder="123456"
                  value={otp}
                  onChange={(e) => setOtp(e.target.value)}
                  className="w-full text-center text-lg tracking-widest"
                  maxLength={6}
                  disabled={loading}
                />
                <p className="text-xs text-muted-foreground mt-1">
                  Enviado a {phone}
                </p>
              </div>
              <Button 
                type="submit" 
                className="w-full" 
                disabled={loading}
              >
                {loading ? 'Verificando...' : 'Verificar'}
              </Button>
              <Button
                type="button"
                variant="ghost"
                className="w-full"
                onClick={() => setStep('phone')}
                disabled={loading}
              >
                Cambiar número
              </Button>
            </form>
          )}
        </CardContent>
      </Card>
    </div>
  );
};

export default CustomerLogin;