import React, { createContext, useContext, useState, useEffect } from 'react';

export type Language = 'es' | 'en';

interface LanguageContextType {
  language: Language;
  setLanguage: (lang: Language) => void;
  t: (key: string, params?: Record<string, string>) => string;
}

const LanguageContext = createContext<LanguageContextType | undefined>(undefined);

export const useLanguage = () => {
  const context = useContext(LanguageContext);
  if (!context) {
    throw new Error('useLanguage must be used within a LanguageProvider');
  }
  return context;
};

export const LanguageProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [language, setLanguage] = useState<Language>(() => {
    const saved = localStorage.getItem('bookeasy-language');
    return (saved as Language) || 'es';
  });

  useEffect(() => {
    localStorage.setItem('bookeasy-language', language);
  }, [language]);

  const t = (key: string, params?: Record<string, string>): string => {
    const translations = language === 'en' ? enTranslations : esTranslations;
    let text = translations[key] || key;
    
    if (params) {
      Object.entries(params).forEach(([param, value]) => {
        text = text.replace(`{${param}}`, value);
      });
    }
    
    return text;
  };

  return (
    <LanguageContext.Provider value={{ language, setLanguage, t }}>
      {children}
    </LanguageContext.Provider>
  );
};

// Translations
const esTranslations: Record<string, string> = {
  // Header
  'header.login': 'Iniciar Sesión',
  'header.dashboard': 'Dashboard',
  'header.logout': 'Cerrar Sesión',
  'header.hello': 'Hola, {name}',
  
  // Hero Section
  'hero.badge': 'Bookeasy.mx – Fase 1 Beta Ya Disponible',
  'hero.title': 'Recibe reservas profesionales con tu propio',
  'hero.subtitle': 'link personalizado',
  'hero.subtitle2': 'Gratis.',
  'hero.locationBadge': 'Activando solo en:',
  'hero.location': 'Tijuana, Rosarito, and Tecate',
  'hero.linkPreview': 'Tu link personalizado:',
  'hero.cta.create': 'Crear Mi Perfil – Totalmente Gratis',
  'hero.limitedSpots': 'Cupos limitados en esta primera etapa',
  
  // Final CTA
  'finalCta.title': '¿Listo para comenzar?',
  'finalCta.description': 'Crea tu perfil profesional y empieza a recibir reservas automáticamente',
  'finalCta.button': 'Crear mi perfil ahora',
  
  // Footer
  'footer.description': 'Una nueva forma de reservar servicios locales',
  'footer.follow': 'Síguenos',
  'footer.contact': 'Contacto',
  'footer.copyright': '© 2025 Bookeasy.mx - Digitalizando servicios profesionales en México',
  
  // Auth Page
  'auth.loading': 'Cargando...',
  'auth.redirecting': 'Redirigiendo...',
  'auth.verifying': 'Verificando...',
  'auth.navigationError': 'Error de Navegación',
  'auth.navigationErrorMsg': 'Hubo un problema al redirigirte. Puedes continuar manualmente.',
  'auth.continueToDashboard': 'Continuar al Dashboard',
  'auth.back': 'Volver',
  'auth.signin': 'Iniciar Sesión',
  'auth.signup': 'Crear Cuenta',
  'auth.welcomeBack': 'Bienvenido de vuelta',
  'auth.signInDescription': 'Ingresa con tu cuenta existente',
  'auth.email': 'Email',
  'auth.password': 'Contraseña',
  'auth.emailPlaceholder': 'tu@email.com',
  'auth.passwordPlaceholder': 'Tu contraseña',
  'auth.signInButton': 'Iniciar Sesión',
  'auth.signingIn': 'Iniciando sesión...',
  'auth.forgotPassword': '¿Olvidaste tu contraseña?',
  'auth.resetPassword': 'Recuperar Contraseña',
  'auth.resetDescription': 'Ingresa tu email para recibir instrucciones',
  'auth.sendInstructions': 'Enviar Instrucciones',
  'auth.sending': 'Enviando...',
  'auth.backToSignIn': 'Volver al inicio de sesión',
  'auth.createAccount': 'Crear tu cuenta profesional',
  'auth.signUpDescription': 'Comienza a gestionar tus citas profesionalmente',
  'auth.emailRequired': 'Email *',
  'auth.passwordRequired': 'Contraseña *',
  'auth.passwordMinLength': '6 caracteres mínimo',
  'auth.createAccountButton': 'Crear Cuenta Profesional',
  'auth.creatingAccount': 'Creando cuenta...',
  'auth.alreadyHaveAccount': '¿Ya tienes cuenta?',
  'auth.switchToSignIn': 'Inicia sesión aquí',
  'auth.termsOfService': 'Al crear una cuenta, aceptas nuestros términos de servicio y política de privacidad',
  
  // Onboarding
  'onboarding.title': 'Configura tu Perfil',
  'onboarding.step': 'Paso {current} de {total}: {title}',
  'onboarding.steps.profile': 'Perfil & Username',
  'onboarding.steps.services': 'Servicios',
  'onboarding.steps.contact': 'Contacto',
  'onboarding.steps.preview': 'Vista Previa',
};

const enTranslations: Record<string, string> = {
  // Header
  'header.login': 'Sign In',
  'header.dashboard': 'Dashboard',
  'header.logout': 'Sign Out',
  'header.hello': 'Hello, {name}',
  
  // Hero Section
  'hero.badge': 'Bookeasy.mx – Phase 1 Beta Now Available',
  'hero.title': 'Get professional bookings with your own',
  'hero.subtitle': 'personalized link',
  'hero.subtitle2': 'Free.',
  'hero.locationBadge': 'Activating only in:',
  'hero.location': 'Tijuana, Rosarito, and Tecate',
  'hero.linkPreview': 'Your personalized link:',
  'hero.cta.create': 'Create My Profile – Completely Free',
  'hero.limitedSpots': 'Limited spots in this first phase',
  
  // Final CTA
  'finalCta.title': 'Ready to get started?',
  'finalCta.description': 'Create your professional profile and start receiving bookings automatically',
  'finalCta.button': 'Create my profile now',
  
  // Footer
  'footer.description': 'A new way to book local services',
  'footer.follow': 'Follow Us',
  'footer.contact': 'Contact',
  'footer.copyright': '© 2025 Bookeasy.mx - Digitalizing professional services in Mexico',
  
  // Auth Page
  'auth.loading': 'Loading...',
  'auth.redirecting': 'Redirecting...',
  'auth.verifying': 'Verifying...',
  'auth.navigationError': 'Navigation Error',
  'auth.navigationErrorMsg': 'There was a problem redirecting you. You can continue manually.',
  'auth.continueToDashboard': 'Continue to Dashboard',
  'auth.back': 'Back',
  'auth.signin': 'Sign In',
  'auth.signup': 'Create Account',
  'auth.welcomeBack': 'Welcome back',
  'auth.signInDescription': 'Sign in with your existing account',
  'auth.email': 'Email',
  'auth.password': 'Password',
  'auth.emailPlaceholder': 'your@email.com',
  'auth.passwordPlaceholder': 'Your password',
  'auth.signInButton': 'Sign In',
  'auth.signingIn': 'Signing in...',
  'auth.forgotPassword': 'Forgot your password?',
  'auth.resetPassword': 'Reset Password',
  'auth.resetDescription': 'Enter your email to receive instructions',
  'auth.sendInstructions': 'Send Instructions',
  'auth.sending': 'Sending...',
  'auth.backToSignIn': 'Back to sign in',
  'auth.createAccount': 'Create your professional account',
  'auth.signUpDescription': 'Start managing your appointments professionally',
  'auth.emailRequired': 'Email *',
  'auth.passwordRequired': 'Password *',
  'auth.passwordMinLength': '6 characters minimum',
  'auth.createAccountButton': 'Create Professional Account',
  'auth.creatingAccount': 'Creating account...',
  'auth.alreadyHaveAccount': 'Already have an account?',
  'auth.switchToSignIn': 'Sign in here',
  'auth.termsOfService': 'By creating an account, you accept our terms of service and privacy policy',
  
  // Onboarding
  'onboarding.title': 'Setup Your Profile',
  'onboarding.step': 'Step {current} of {total}: {title}',
  'onboarding.steps.profile': 'Profile & Username',
  'onboarding.steps.services': 'Services',
  'onboarding.steps.contact': 'Contact',
  'onboarding.steps.preview': 'Preview',
};