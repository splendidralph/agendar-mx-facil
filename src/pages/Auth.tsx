import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '@/hooks/useAuth';
import { supabase } from '@/integrations/supabase/client';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Calendar, ArrowLeft } from 'lucide-react';
import PhoneInput from 'react-phone-number-input';
import 'react-phone-number-input/style.css';

const Auth = () => {
  const navigate = useNavigate();
  const { signUp, signIn, resetPassword, loading, user } = useAuth();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [showForgotPassword, setShowForgotPassword] = useState(false);
  const [resetEmail, setResetEmail] = useState('');

  // Sign up form state
  const [signUpData, setSignUpData] = useState({
    email: '',
    password: '',
    fullName: '',
    phone: ''
  });

  // Sign in form state
  const [signInData, setSignInData] = useState({
    email: '',
    password: ''
  });

  // Single function to handle user validation and navigation
  const validateAndNavigate = async (userId: string) => {
    console.log('Auth: Validating user and navigating for:', userId);
    
    try {
      // Check if user exists in our users table
      const { data: userData, error: userError } = await supabase
        .from('users')
        .select('id')
        .eq('id', userId)
        .maybeSingle();

      if (userError) {
        console.error('Auth: Error checking user existence:', userError);
        navigate('/onboarding');
        return;
      }

      if (!userData) {
        console.log('Auth: User not found in database, signing out');
        await supabase.auth.signOut();
        return;
      }

      // Check provider onboarding status
      const { data: provider, error } = await supabase
        .from('providers')
        .select('profile_completed')
        .eq('user_id', userId)
        .maybeSingle();

      if (error && error.code !== 'PGRST116') {
        console.error('Auth: Error checking provider status:', error);
        navigate('/onboarding');
        return;
      }

      if (!provider) {
        console.log('Auth: No provider found, redirecting to onboarding');
        navigate('/onboarding');
      } else if (!provider.profile_completed) {
        console.log('Auth: Provider not completed, redirecting to onboarding');
        navigate('/onboarding');
      } else {
        console.log('Auth: Profile completed, redirecting to dashboard');
        navigate('/dashboard');
      }
    } catch (error) {
      console.error('Auth: Error in validateAndNavigate:', error);
      navigate('/onboarding');
    }
  };

  // Handle authenticated user redirect
  useEffect(() => {
    if (user && !loading) {
      console.log('Auth: User authenticated, validating and navigating');
      validateAndNavigate(user.id);
    }
  }, [user, loading]);

  const handleSignUp = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!signUpData.email || !signUpData.password || !signUpData.fullName || !signUpData.phone) {
      console.error('All fields are required');
      return;
    }

    setIsSubmitting(true);
    console.log('Starting signup process...');
    
    try {
      const { error } = await signUp(
        signUpData.email.trim(), 
        signUpData.password, 
        signUpData.fullName.trim(),
        signUpData.phone.trim()
      );
      
      console.log('Signup completed, error:', error);
      
      if (!error) {
        setSignUpData({
          email: '',
          password: '',
          fullName: '',
          phone: ''
        });
      }
    } catch (err) {
      console.error('Form submission error:', err);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleSignIn = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!signInData.email || !signInData.password) {
      console.error('Email and password are required');
      return;
    }

    setIsSubmitting(true);
    console.log('Starting signin process...');
    
    try {
      const { error } = await signIn(signInData.email.trim(), signInData.password);
      console.log('Signin completed, error:', error);
    } catch (err) {
      console.error('Form submission error:', err);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleForgotPassword = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!resetEmail) {
      console.error('Email is required');
      return;
    }

    setIsSubmitting(true);
    console.log('Starting password reset process...');
    
    try {
      const { error } = await resetPassword(resetEmail.trim());
      console.log('Password reset completed, error:', error);
      
      if (!error) {
        setResetEmail('');
        setShowForgotPassword(false);
      }
    } catch (err) {
      console.error('Password reset error:', err);
    } finally {
      setIsSubmitting(false);
    }
  };

  // Show loading only while auth is loading
  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto mb-4"></div>
          <p>Cargando...</p>
        </div>
      </div>
    );
  }

  // If user is authenticated, show redirecting message (they should be navigated away)
  if (user) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto mb-4"></div>
          <p>Redirigiendo...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-secondary to-background flex items-center justify-center p-4">
      <div className="w-full max-w-md">
        {/* Header */}
        <div className="text-center mb-6 sm:mb-8 relative">
          <Button
            variant="ghost"
            onClick={() => navigate('/')}
            className="absolute top-0 left-0 text-muted-foreground hover:text-foreground z-10"
          >
            <ArrowLeft className="h-4 w-4 mr-2" />
            Volver
          </Button>
          
          <div 
            className="flex justify-center items-center space-x-3 mb-4 pt-12 sm:pt-0 cursor-pointer"
            onClick={() => navigate('/')}
          >
            <div className="gradient-primary text-primary-foreground p-2.5 rounded-xl shadow-lg">
              <Calendar className="h-6 w-6" />
            </div>
            <span className="text-2xl font-bold text-foreground font-poppins">Bookeasy.mx</span>
          </div>
        </div>

        <Tabs defaultValue="signin" className="w-full">
          <TabsList className="grid w-full grid-cols-2">
            <TabsTrigger value="signin">Iniciar Sesión</TabsTrigger>
            <TabsTrigger value="signup">Crear Cuenta</TabsTrigger>
          </TabsList>

          <TabsContent value="signin">
            <Card>
              <CardHeader>
                <CardTitle>
                  {showForgotPassword ? 'Recuperar Contraseña' : 'Iniciar Sesión'}
                </CardTitle>
                <CardDescription>
                  {showForgotPassword 
                    ? 'Ingresa tu email para recibir instrucciones de recuperación'
                    : 'Ingresa con tu cuenta existente'
                  }
                </CardDescription>
              </CardHeader>
              <CardContent>
                {showForgotPassword ? (
                  <form onSubmit={handleForgotPassword} className="space-y-4">
                    <div>
                      <Label htmlFor="reset-email">Email</Label>
                      <Input
                        id="reset-email"
                        type="email"
                        value={resetEmail}
                        onChange={(e) => setResetEmail(e.target.value)}
                        required
                        disabled={isSubmitting}
                        placeholder="tu@email.com"
                      />
                    </div>
                    <div className="space-y-2">
                      <Button
                        type="submit"
                        className="w-full btn-accent"
                        disabled={isSubmitting}
                      >
                        {isSubmitting ? 'Enviando...' : 'Enviar Instrucciones'}
                      </Button>
                      <Button
                        type="button"
                        variant="ghost"
                        className="w-full"
                        onClick={() => setShowForgotPassword(false)}
                        disabled={isSubmitting}
                      >
                        Volver al inicio de sesión
                      </Button>
                    </div>
                  </form>
                ) : (
                  <form onSubmit={handleSignIn} className="space-y-4">
                    <div>
                      <Label htmlFor="signin-email">Email</Label>
                      <Input
                        id="signin-email"
                        type="email"
                        value={signInData.email}
                        onChange={(e) => setSignInData({ ...signInData, email: e.target.value })}
                        required
                        disabled={isSubmitting}
                      />
                    </div>
                    <div>
                      <Label htmlFor="signin-password">Contraseña</Label>
                      <Input
                        id="signin-password"
                        type="password"
                        value={signInData.password}
                        onChange={(e) => setSignInData({ ...signInData, password: e.target.value })}
                        required
                        disabled={isSubmitting}
                        minLength={6}
                      />
                    </div>
                    <div className="space-y-2">
                      <Button
                        type="submit"
                        className="w-full btn-accent"
                        disabled={isSubmitting}
                      >
                        {isSubmitting ? 'Iniciando sesión...' : 'Iniciar Sesión'}
                      </Button>
                      <Button
                        type="button"
                        variant="ghost"
                        className="w-full text-sm"
                        onClick={() => setShowForgotPassword(true)}
                        disabled={isSubmitting}
                      >
                        ¿Olvidaste tu contraseña?
                      </Button>
                    </div>
                  </form>
                )}
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="signup">
            <Card>
              <CardHeader>
                <CardTitle>Crear Cuenta</CardTitle>
                <CardDescription>
                  Únete como proveedor de servicios en BookEasy.mx
                </CardDescription>
              </CardHeader>
              <CardContent>
                <form onSubmit={handleSignUp} className="space-y-4">
                  <div>
                    <Label htmlFor="signup-name">Nombre Completo *</Label>
                    <Input
                      id="signup-name"
                      type="text"
                      value={signUpData.fullName}
                      onChange={(e) => setSignUpData({ ...signUpData, fullName: e.target.value })}
                      required
                      disabled={isSubmitting}
                      placeholder="Tu nombre completo"
                    />
                  </div>
                  <div>
                    <Label htmlFor="signup-email">Email *</Label>
                    <Input
                      id="signup-email"
                      type="email"
                      value={signUpData.email}
                      onChange={(e) => setSignUpData({ ...signUpData, email: e.target.value })}
                      required
                      disabled={isSubmitting}
                      placeholder="tu@email.com"
                    />
                  </div>
                  <div>
                    <Label htmlFor="signup-phone">Teléfono *</Label>
                    <PhoneInput
                      international
                      countryCallingCodeEditable={false}
                      defaultCountry="MX"
                      value={signUpData.phone}
                      onChange={(phone) => setSignUpData({ ...signUpData, phone: phone || '' })}
                      disabled={isSubmitting}
                      placeholder="Ingresa tu número de teléfono"
                      className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-base ring-offset-background placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50 md:text-sm"
                      style={{
                        '--PhoneInputCountryFlag-height': '1em',
                        '--PhoneInputCountrySelectArrow-color': 'var(--color-text-muted)',
                      } as React.CSSProperties}
                    />
                  </div>
                  <div>
                    <Label htmlFor="signup-password">Contraseña *</Label>
                    <Input
                      id="signup-password"
                      type="password"
                      value={signUpData.password}
                      onChange={(e) => setSignUpData({ ...signUpData, password: e.target.value })}
                      required
                      disabled={isSubmitting}
                      minLength={6}
                      placeholder="Mínimo 6 caracteres"
                    />
                  </div>
                  <Button
                    type="submit"
                    className="w-full btn-accent"
                    disabled={isSubmitting}
                  >
                    {isSubmitting ? 'Creando cuenta...' : 'Crear Cuenta de Proveedor'}
                  </Button>
                </form>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
};

export default Auth;
