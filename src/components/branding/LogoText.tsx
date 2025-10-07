export const LogoText = ({ className = "" }: { className?: string }) => {
  return (
    <span className={`font-bold text-xl ${className}`}>
      <span className="bg-gradient-to-r from-bookeasy-mint-300 to-bookeasy-mint-400 bg-clip-text text-transparent">
        book
      </span>
      <span className="bg-gradient-to-r from-bookeasy-orange-300 to-bookeasy-orange-400 bg-clip-text text-transparent">
        easy
      </span>
      <span className="text-foreground">.mx</span>
    </span>
  );
};
