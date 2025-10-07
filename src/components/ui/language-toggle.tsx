import { useLanguage } from "@/contexts/LanguageContext";
import { ToggleGroup, ToggleGroupItem } from "@/components/ui/toggle-group";

export const LanguageToggle = () => {
  const { language, setLanguage } = useLanguage();

  return (
    <ToggleGroup 
      type="single" 
      value={language} 
      onValueChange={(value) => value && setLanguage(value as 'es' | 'en')}
      className="inline-flex bg-secondary/50 rounded-lg p-1 gap-0"
    >
      <ToggleGroupItem 
        value="es" 
        aria-label="Español"
        onClick={() => setLanguage('es')}
        className="data-[state=on]:bg-gradient-to-r data-[state=on]:from-bookeasy-mint data-[state=on]:to-bookeasy-teal data-[state=on]:text-white data-[state=on]:shadow-md data-[state=on]:scale-105 transition-all duration-200 px-2.5 py-1.5 rounded-md text-xl"
      >
        🇲🇽
      </ToggleGroupItem>
      <ToggleGroupItem 
        value="en" 
        aria-label="English"
        onClick={() => setLanguage('en')}
        className="data-[state=on]:bg-gradient-to-r data-[state=on]:from-bookeasy-mint data-[state=on]:to-bookeasy-teal data-[state=on]:text-white data-[state=on]:shadow-md data-[state=on]:scale-105 transition-all duration-200 px-2.5 py-1.5 rounded-md text-xl"
      >
        🇺🇸
      </ToggleGroupItem>
    </ToggleGroup>
  );
};

export const LanguageToggleOnboarding = () => {
  const { language, setLanguage } = useLanguage();

  return (
    <ToggleGroup 
      type="single" 
      value={language} 
      onValueChange={(value) => value && setLanguage(value as 'es' | 'en')}
      className="inline-flex bg-white/10 backdrop-blur-sm rounded-lg p-1 gap-0 border border-white/20"
    >
      <ToggleGroupItem 
        value="es" 
        aria-label="Español"
        onClick={() => setLanguage('es')}
        className="data-[state=on]:bg-white/90 data-[state=on]:text-bookeasy-teal data-[state=on]:shadow-lg data-[state=on]:scale-105 text-white/80 hover:text-white hover:bg-white/20 transition-all duration-200 px-2.5 py-1.5 rounded-md text-xl"
      >
        🇲🇽
      </ToggleGroupItem>
      <ToggleGroupItem 
        value="en" 
        aria-label="English"
        onClick={() => setLanguage('en')}
        className="data-[state=on]:bg-white/90 data-[state=on]:text-bookeasy-teal data-[state=on]:shadow-lg data-[state=on]:scale-105 text-white/80 hover:text-white hover:bg-white/20 transition-all duration-200 px-2.5 py-1.5 rounded-md text-xl"
      >
        🇺🇸
      </ToggleGroupItem>
    </ToggleGroup>
  );
};