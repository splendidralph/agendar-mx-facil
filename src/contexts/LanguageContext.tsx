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
  'hero.badge': '🚀 OPEN FOR BETA TESTING NOW',
  'hero.title': 'Tu link de reservas',
  'hero.subtitle': 'profesional',
  'hero.description1': 'Crea tu perfil',
  'hero.description2': 'GRATIS',
  'hero.description3': 'en 2 minutos',
  'hero.description4': 'y empieza a recibir reservas al instante',
  'hero.linkPreview': 'Tu link será:',
  'hero.cta.create': 'Crear Mi Perfil - Gratis',
  'hero.cta.dashboard': 'Ir al Dashboard',
  
  // Final CTA
  'finalCta.title': '¿Listo para tu link profesional GRATIS?',
  'finalCta.description': 'Únete al beta testing y obtén acceso gratuito de por vida.',
  'finalCta.subtitle': '🚀 Sé parte de la próxima revolución en reservas',
  'finalCta.button': 'Crear Mi Perfil - Completamente Gratis',
  
  // Footer
  'footer.description': 'La plataforma de reservas #1 para profesionales de belleza en México',
  'footer.copyright': '© 2024 Bookeasy.mx. Todos los derechos reservados.',
  
  // Demo Section
  'demo.title': 'Experimenta la diferencia',
  'demo.subtitle': 'Ve cómo tus clientes interactúan con tu perfil profesional. Simple, rápido y efectivo.',
  'demo.profile.title': 'Perfil Profesional',
  'demo.profile.description': 'Así se ve tu perfil para tus clientes',
  'demo.booking.title': 'Sistema de Reservas',
  'demo.booking.description': 'Proceso simple para tus clientes',
  'demo.schedule.title': 'Calendario Inteligente',
  'demo.schedule.description': 'Horarios disponibles en tiempo real',
  'demo.confirmation.title': '¡Reserva Confirmada!',
  'demo.confirmation.description': 'Tu cita ha sido agendada exitosamente',
  
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
  'hero.badge': '🚀 OPEN FOR BETA TESTING NOW',
  'hero.title': 'Your professional',
  'hero.subtitle': 'booking link',
  'hero.description1': 'Create your profile',
  'hero.description2': 'FREE',
  'hero.description3': 'in 2 minutes',
  'hero.description4': 'and start receiving bookings instantly',
  'hero.linkPreview': 'Your link will be:',
  'hero.cta.create': 'Create My Profile - Free',
  'hero.cta.dashboard': 'Go to Dashboard',
  
  // Final CTA
  'finalCta.title': 'Ready for your FREE professional link?',
  'finalCta.description': 'Join beta testing and get lifetime free access.',
  'finalCta.subtitle': '🚀 Be part of the next booking revolution',
  'finalCta.button': 'Create My Profile - Completely Free',
  
  // Footer
  'footer.description': 'The #1 booking platform for beauty professionals in Mexico',
  'footer.copyright': '© 2024 Bookeasy.mx. All rights reserved.',
  
  // Demo Section
  'demo.title': 'Experience the difference',
  'demo.subtitle': 'See how your clients interact with your professional profile. Simple, fast and effective.',
  'demo.profile.title': 'Professional Profile',
  'demo.profile.description': 'This is how your profile looks to your clients',
  'demo.booking.title': 'Booking System',
  'demo.booking.description': 'Simple process for your clients',
  'demo.schedule.title': 'Smart Calendar',
  'demo.schedule.description': 'Available slots in real time',
  'demo.confirmation.title': 'Booking Confirmed!',
  'demo.confirmation.description': 'Your appointment has been scheduled successfully',
  
  // Onboarding
  'onboarding.title': 'Setup Your Profile',
  'onboarding.step': 'Step {current} of {total}: {title}',
  'onboarding.steps.profile': 'Profile & Username',
  'onboarding.steps.services': 'Services',
  'onboarding.steps.contact': 'Contact',
  'onboarding.steps.preview': 'Preview',
};