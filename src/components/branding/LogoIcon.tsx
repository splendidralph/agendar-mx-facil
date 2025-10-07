import logoIcon from "@/assets/logo-icon.png";

export const LogoIcon = ({ className = "h-8 w-8" }: { className?: string }) => {
  return (
    <img 
      src={logoIcon} 
      alt="Bookeasy Calendar Icon" 
      className={`${className} rounded-lg`}
    />
  );
};
