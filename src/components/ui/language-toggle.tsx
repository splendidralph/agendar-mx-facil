import { Button } from "@/components/ui/button";
import { useLanguage } from "@/contexts/LanguageContext";

export const LanguageToggle = () => {
  const { language, setLanguage } = useLanguage();

  return (
    <Button
      onClick={() => setLanguage(language === 'es' ? 'en' : 'es')}
      variant="ghost"
      size="sm"
      className="text-foreground hover:bg-secondary/80 transition-colors flex items-center gap-2"
    >
      <span className="text-lg">{language === 'es' ? '🇺🇸' : '🇲🇽'}</span>
      <span className="font-medium">{language === 'es' ? 'EN' : 'ES'}</span>
    </Button>
  );
};

export const LanguageToggleOnboarding = () => {
  const { language, setLanguage } = useLanguage();

  return (
    <Button
      onClick={() => setLanguage(language === 'es' ? 'en' : 'es')}
      variant="ghost"
      size="sm"
      className="text-white hover:bg-white/20 transition-colors flex items-center gap-2"
    >
      <span className="text-lg">{language === 'es' ? '🇺🇸' : '🇲🇽'}</span>
      <span className="font-medium">{language === 'es' ? 'EN' : 'ES'}</span>
    </Button>
  );
};