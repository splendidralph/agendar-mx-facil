import { Button } from "@/components/ui/button";
import { useLanguage } from "@/contexts/LanguageContext";
import { Globe } from "lucide-react";

export const LanguageToggle = () => {
  const { language, setLanguage } = useLanguage();

  return (
    <Button
      onClick={() => setLanguage(language === 'es' ? 'en' : 'es')}
      variant="ghost"
      size="sm"
      className="text-foreground hover:bg-secondary/80 transition-colors"
    >
      <Globe className="h-4 w-4 mr-2" />
      {language === 'es' ? 'EN' : 'ES'}
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
      className="text-white hover:bg-white/20 transition-colors"
    >
      <Globe className="h-4 w-4 mr-2" />
      {language === 'es' ? 'EN' : 'ES'}
    </Button>
  );
};