import { Star } from "lucide-react";

const SocialProofSection = () => {
  return (
    <section className="py-16 px-4">
      <div className="container mx-auto">
        {/* Trust indicators */}
        <div className="text-center">
          <div className="flex justify-center items-center gap-2 mb-4">
            <div className="flex">
              {[...Array(5)].map((_, i) => (
                <Star key={i} className="h-5 w-5 fill-yellow-400 text-yellow-400" />
              ))}
            </div>
            <span className="text-lg font-semibold text-foreground">4.9/5</span>
            <span className="text-muted-foreground">de beta feedback</span>
          </div>
          
          <p className="text-muted-foreground">
            Únete a <span className="font-semibold text-primary">150+ beta testers</span> que 
            ya están probando la próxima revolución en reservas
          </p>
        </div>
      </div>
    </section>
  );
};

export default SocialProofSection;