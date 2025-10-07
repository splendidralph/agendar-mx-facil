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
        className="data-[state=on]:bg-gradient-to-r data-[state=on]:from-bookeasy-mint data-[state=on]:to-bookeasy-teal data-[state=on]:text-white data-[state=on]:shadow-md data-[state=on]:scale-105 transition-all duration-200 px-3 py-1.5 rounded-md flex items-center gap-1.5 text-sm font-medium"
      >
        <span className="text-base">🇲🇽</span>
        <span>ES</span>
      </ToggleGroupItem>
      <ToggleGroupItem 
        value="en" 
        aria-label="English"
        className="data-[state=on]:bg-gradient-to-r data-[state=on]:from-bookeasy-mint data-[state=on]:to-bookeasy-teal data-[state=on]:text-white data-[state=on]:shadow-md data-[state=on]:scale-105 transition-all duration-200 px-3 py-1.5 rounded-md flex items-center gap-1.5 text-sm font-medium"
      >
        <span className="text-base">🇺🇸</span>
        <span>EN</span>
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
        className="data-[state=on]:bg-white/90 data-[state=on]:text-bookeasy-teal data-[state=on]:shadow-lg data-[state=on]:scale-105 text-white/80 hover:text-white hover:bg-white/20 transition-all duration-200 px-3 py-1.5 rounded-md flex items-center gap-1.5 text-sm font-medium"
      >
        <span className="text-base">🇲🇽</span>
        <span>ES</span>
      </ToggleGroupItem>
      <ToggleGroupItem 
        value="en" 
        aria-label="English"
        className="data-[state=on]:bg-white/90 data-[state=on]:text-bookeasy-teal data-[state=on]:shadow-lg data-[state=on]:scale-105 text-white/80 hover:text-white hover:bg-white/20 transition-all duration-200 px-3 py-1.5 rounded-md flex items-center gap-1.5 text-sm font-medium"
      >
        <span className="text-base">🇺🇸</span>
        <span>EN</span>
      </ToggleGroupItem>
    </ToggleGroup>
  );
};