
import { useState, useEffect, useRef } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { useAuth } from '@/hooks/useAuth';
import { supabase } from '@/integrations/supabase/client';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Calendar, ArrowLeft, AlertCircle, Users, Star } from 'lucide-react';
import { useLanguage } from '@/contexts/LanguageContext';
import { LanguageToggle } from '@/components/ui/language-toggle';

const Auth = () => {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const { signUp, signIn, resetPassword, loading, user } = useAuth();
  const { t } = useLanguage();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [showForgotPassword, setShowForgotPassword] = useState(false);
  const [resetEmail, setResetEmail] = useState('');
  const [isNavigating, setIsNavigating] = useState(false);
  const [navigationError, setNavigationError] = useState<string | null>(null);
  const navigationAttempted = useRef(false);

  // Sign up form state
  const [signUpData, setSignUpData] = useState({
    email: '',
    password: ''
  });

  // Sign in form state
  const [signInData, setSignInData] = useState({
    email: '',
    password: ''
  });

  // Enhanced user validation with proper error handling
  const validateAndNavigate = async (userId: string) => {
    console.log('Auth: Starting navigation for user:', userId);
    setIsNavigating(true);
    setNavigationError(null);
    
    try {
      // Set a timeout to prevent infinite waiting
      const timeoutPromise = new Promise((_, reject) => {
        setTimeout(() => reject(new Error('Navigation timeout')), 10000);
      });

      const validationPromise = (async () => {
        // First check if user is an admin - admins should not be auto-redirected
        const { data: adminData, error: adminError } = await supabase
          .from('admin_users')
          .select('role')
          .eq('user_id', userId)
          .maybeSingle();

        if (adminError && adminError.code !== 'PGRST116') {
          console.error('Auth: Error checking admin status:', adminError);
        }

        // If user is admin and currently trying to access admin route, don't redirect
        if (adminData && window.location.pathname.startsWith('/admin')) {
          console.log('Auth: Admin user accessing admin dashboard, no redirect needed');
          return;
        }

        // Check if user exists in our users table
        const { data: userData, error: userError } = await supabase
          .from('users')
          .select('id')
          .eq('id', userId)
          .maybeSingle();

        if (userError) {
          console.error('Auth: Error checking user existence:', userError);
          throw new Error('Failed to verify user');
        }

        if (!userData) {
          console.log('Auth: User not found in database, navigating to onboarding');
          navigate('/onboarding');
          return;
        }

        // If user is admin, redirect to admin dashboard
        if (adminData) {
          console.log('Auth: Admin user detected, redirecting to admin dashboard');
          navigate('/admin');
          return;
        }

        // Check provider onboarding status for non-admin users
        const { data: provider, error: providerError } = await supabase
          .from('providers')
          .select('profile_completed')
          .eq('user_id', userId)
          .maybeSingle();

        if (providerError && providerError.code !== 'PGRST116') {
          console.error('Auth: Error checking provider status:', providerError);
          throw new Error('Failed to check provider status');
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
      })();

      await Promise.race([validationPromise, timeoutPromise]);
      
    } catch (error) {
      console.error('Auth: Navigation error:', error);
      setNavigationError(error instanceof Error ? error.message : 'Navigation failed');
      // Fallback navigation - assume new user needs onboarding
      console.log('Auth: Falling back to onboarding due to error');
      navigate('/onboarding');
    } finally {
      setIsNavigating(false);
    }
  };

  // Handle authenticated user redirect with proper state management
  useEffect(() => {
    if (user && !loading && !navigationAttempted.current) {
      console.log('Auth: User authenticated, starting navigation process');
      navigationAttempted.current = true;
      validateAndNavigate(user.id);
    }
    
    // Reset navigation flag if user changes
    if (!user) {
      navigationAttempted.current = false;
      setIsNavigating(false);
      setNavigationError(null);
    }
  }, [user, loading]);

  const handleSignUp = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!signUpData.email || !signUpData.password) {
      console.error('Email and password are required');
      return;
    }

    setIsSubmitting(true);
    console.log('Starting signup process...');
    
    try {
      const { error } = await signUp(
        signUpData.email.trim(), 
        signUpData.password
      );
      
      console.log('Signup completed, error:', error);
      
      if (!error) {
        setSignUpData({
          email: '',
          password: ''
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

  const handleManualNavigation = () => {
    console.log('Auth: Manual navigation triggered');
    setNavigationError(null);
    navigate('/onboarding');
  };

  // Show loading only while auth is loading
  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto mb-4"></div>
          <p>{t('auth.loading')}</p>
        </div>
      </div>
    );
  }

  // If user is authenticated and we're navigating, show navigation screen
  if (user && isNavigating) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto mb-4"></div>
          <p>{t('auth.redirecting')}</p>
        </div>
      </div>
    );
  }

  // If user is authenticated but navigation failed, show error with manual option
  if (user && navigationError) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center max-w-md mx-auto p-6">
          <AlertCircle className="h-12 w-12 text-yellow-500 mx-auto mb-4" />
          <h2 className="text-xl font-semibold mb-2">{t('auth.navigationError')}</h2>
          <p className="text-muted-foreground mb-4">
            {t('auth.navigationErrorMsg')}
          </p>
          <Button onClick={handleManualNavigation} className="btn-primary">
            {t('auth.continueToDashboard')}
          </Button>
        </div>
      </div>
    );
  }

  // If user is authenticated but we haven't started navigation yet, show brief loading
  if (user && !navigationAttempted.current) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto mb-4"></div>
          <p>{t('auth.verifying')}</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen relative overflow-hidden">
      {/* Modern gradient background */}
      <div className="absolute inset-0 gradient-hero"></div>
      <div className="absolute inset-0 gradient-hero-overlay"></div>
      
      <div className="relative z-10 flex items-center justify-center min-h-screen p-4">
        <div className="w-full max-w-lg">
          {/* Header with back button and language toggle */}
          <div className="text-center mb-8 relative">
            <Button
              variant="ghost"
              onClick={() => navigate('/')}
              className="absolute -top-2 left-0 text-white/80 hover:text-white hover:bg-white/10 border-0"
            >
              <ArrowLeft className="h-4 w-4 mr-2" />
              {t('auth.back')}
            </Button>
            
            <div className="absolute -top-2 right-0">
              <div className="bg-white/10 backdrop-blur-sm rounded-lg p-1">
                <LanguageToggle />
              </div>
            </div>
            
            {/* Brand logo */}
            <div 
              className="flex justify-center items-center space-x-3 mb-6 pt-8 cursor-pointer group"
              onClick={() => navigate('/')}
            >
              <div className="bg-white/20 backdrop-blur-sm text-white p-3 rounded-2xl shadow-xl group-hover:bg-white/30 smooth-transition">
                <Calendar className="h-7 w-7" />
              </div>
              <span className="text-3xl font-bold text-white font-poppins">Bookeasy.mx</span>
            </div>

          </div>

          {/* Main auth card */}
          <div className="glassmorphism rounded-3xl p-8 shadow-2xl border border-white/20">
            <Tabs defaultValue={searchParams.get('tab') === 'signup' ? 'signup' : 'signin'} className="w-full">
              <TabsList className="grid w-full grid-cols-2 bg-white/10 backdrop-blur-sm border border-white/20 rounded-2xl p-1">
                <TabsTrigger 
                  value="signin" 
                  className="text-white data-[state=active]:bg-white data-[state=active]:text-primary rounded-xl smooth-transition"
                >
                  {t('auth.signin')}
                </TabsTrigger>
                <TabsTrigger 
                  value="signup"
                  className="text-white data-[state=active]:bg-white data-[state=active]:text-primary rounded-xl smooth-transition"
                >
                  {t('auth.signup')}
                </TabsTrigger>
              </TabsList>

              <TabsContent value="signin" className="mt-8">
                {showForgotPassword ? (
                  <div className="space-y-6">
                    <div className="text-center">
                      <h2 className="text-xl font-semibold text-white mb-2">{t('auth.resetPassword')}</h2>
                      <p className="text-white/70">{t('auth.resetDescription')}</p>
                    </div>
                    
                    <form onSubmit={handleForgotPassword} className="space-y-6">
                      <div>
                        <Label htmlFor="reset-email" className="text-white font-medium">{t('auth.email')}</Label>
                        <Input
                          id="reset-email"
                          type="email"
                          value={resetEmail}
                          onChange={(e) => setResetEmail(e.target.value)}
                          required
                          disabled={isSubmitting}
                          placeholder={t('auth.emailPlaceholder')}
                          className="mt-2 bg-white border-gray-300 text-gray-900 placeholder:text-gray-500 focus:border-primary focus:ring-primary"
                        />
                      </div>
                      <div className="space-y-3">
                        <Button
                          type="submit"
                          className="w-full gradient-accent text-white hover:opacity-90 shadow-xl font-semibold py-3 h-auto rounded-2xl smooth-transition hover:scale-[1.02]"
                          disabled={isSubmitting}
                        >
                          {isSubmitting ? t('auth.sending') : t('auth.sendInstructions')}
                        </Button>
                        <Button
                          type="button"
                          variant="ghost"
                          className="w-full text-white/80 hover:text-white hover:bg-white/10"
                          onClick={() => setShowForgotPassword(false)}
                          disabled={isSubmitting}
                        >
                          {t('auth.backToSignIn')}
                        </Button>
                      </div>
                    </form>
                  </div>
                ) : (
                  <div className="space-y-6">
                    <div className="text-center">
                      <h2 className="text-xl font-semibold text-white mb-2">{t('auth.welcomeBack')}</h2>
                      <p className="text-white/70">{t('auth.signInDescription')}</p>
                    </div>
                    
                    <form onSubmit={handleSignIn} className="space-y-6">
                      <div>
                        <Label htmlFor="signin-email" className="text-white font-medium">{t('auth.email')}</Label>
                        <Input
                          id="signin-email"
                          type="email"
                          value={signInData.email}
                          onChange={(e) => setSignInData({ ...signInData, email: e.target.value })}
                          required
                          disabled={isSubmitting}
                          placeholder={t('auth.emailPlaceholder')}
                          className="mt-2 bg-white border-gray-300 text-gray-900 placeholder:text-gray-500 focus:border-primary focus:ring-primary"
                        />
                      </div>
                      <div>
                        <Label htmlFor="signin-password" className="text-white font-medium">{t('auth.password')}</Label>
                        <Input
                          id="signin-password"
                          type="password"
                          value={signInData.password}
                          onChange={(e) => setSignInData({ ...signInData, password: e.target.value })}
                          required
                          disabled={isSubmitting}
                          minLength={6}
                          placeholder={t('auth.passwordPlaceholder')}
                          className="mt-2 bg-white border-gray-300 text-gray-900 placeholder:text-gray-500 focus:border-primary focus:ring-primary"
                        />
                      </div>
                      <div className="space-y-3">
                        <Button
                          type="submit"
                          className="w-full gradient-accent text-white hover:opacity-90 shadow-xl font-semibold py-3 h-auto rounded-2xl smooth-transition hover:scale-[1.02]"
                          disabled={isSubmitting}
                        >
                          {isSubmitting ? t('auth.signingIn') : t('auth.signInButton')}
                        </Button>
                        <Button
                          type="button"
                          variant="ghost"
                          className="w-full text-white/80 hover:text-white hover:bg-white/10"
                          onClick={() => setShowForgotPassword(true)}
                          disabled={isSubmitting}
                        >
                          {t('auth.forgotPassword')}
                        </Button>
                      </div>
                    </form>
                  </div>
                )}
              </TabsContent>

              <TabsContent value="signup" className="mt-8">
                <div className="space-y-6">
                  <div className="text-center">
                    <h2 className="text-xl font-semibold text-white mb-2">{t('auth.createAccount')}</h2>
                    <p className="text-white/70">{t('auth.signUpDescription')}</p>
                  </div>
                  
                  <form onSubmit={handleSignUp} className="space-y-5">
                    <div>
                      <Label htmlFor="signup-email" className="text-white font-medium">{t('auth.emailRequired')}</Label>
                      <Input
                        id="signup-email"
                        type="email"
                        value={signUpData.email}
                        onChange={(e) => setSignUpData({ ...signUpData, email: e.target.value })}
                        required
                        disabled={isSubmitting}
                          placeholder={t('auth.emailPlaceholder')}
                          className="mt-2 bg-white border-gray-300 text-gray-900 placeholder:text-gray-500 focus:border-primary focus:ring-primary"
                      />
                    </div>
                    <div>
                      <Label htmlFor="signup-password" className="text-white font-medium">{t('auth.passwordRequired')}</Label>
                      <Input
                        id="signup-password"
                        type="password"
                        value={signUpData.password}
                        onChange={(e) => setSignUpData({ ...signUpData, password: e.target.value })}
                        required
                        disabled={isSubmitting}
                        minLength={6}
                          placeholder={t('auth.passwordMinLength')}
                          className="mt-2 bg-white border-gray-300 text-gray-900 placeholder:text-gray-500 focus:border-primary focus:ring-primary"
                      />
                    </div>
                    <Button
                      type="submit"
                      className="w-full gradient-accent text-white hover:opacity-90 shadow-xl font-semibold py-3 h-auto rounded-2xl smooth-transition hover:scale-[1.02] mt-6"
                      disabled={isSubmitting}
                    >
                      {isSubmitting ? t('auth.creatingAccount') : t('auth.createAccountButton')}
                    </Button>
                  </form>
                </div>
              </TabsContent>
            </Tabs>

          </div>
          
          {/* Additional info */}
          <div className="text-center mt-6">
            <p className="text-white/60 text-sm">
              {t('auth.termsOfService')}
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Auth;
