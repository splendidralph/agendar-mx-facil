import { Card, CardContent } from "@/components/ui/card";
import { Calendar, TrendingUp, Users, DollarSign } from "lucide-react";
import { useIsMobile } from "@/hooks/use-mobile";

interface StatsData {
  todayCount: number;
  weekCount: number;
  clientCount: number;
  weekRevenue: number;
}

interface MobileStatsProps {
  stats: StatsData;
  loading: boolean;
}

const MobileStats = ({ stats, loading }: MobileStatsProps) => {
  const isMobile = useIsMobile();

  const statsCards = [
    {
      title: "Citas Hoy",
      value: loading ? '...' : stats.todayCount,
      subtitle: stats.todayCount === 0 ? 'Sin citas programadas' : 'citas programadas',
      icon: Calendar,
      gradient: "gradient-primary",
      delay: "0s"
    },
    {
      title: "Esta Semana",
      value: loading ? '...' : stats.weekCount,
      subtitle: stats.weekCount === 0 ? 'Sin citas' : 'citas esta semana',
      icon: TrendingUp,
      gradient: "gradient-accent",
      delay: "0.1s"
    },
    {
      title: "Clientes",
      value: loading ? '...' : stats.clientCount,
      subtitle: stats.clientCount === 0 ? 'Sin clientes' : 'clientes únicos',
      icon: Users,
      gradient: "bg-primary/10",
      delay: "0.2s"
    },
    {
      title: "Ingresos",
      value: loading ? '...' : `$${stats.weekRevenue.toLocaleString()}`,
      subtitle: "Esta semana",
      icon: DollarSign,
      gradient: "bg-accent/10",
      delay: "0.3s"
    }
  ];

  if (isMobile) {
    return (
      <div className="mb-6">
        <div className="flex gap-4 overflow-x-auto pb-4 -mx-4 px-4 snap-x snap-mandatory">
          {statsCards.map((stat, index) => {
            const Icon = stat.icon;
            return (
              <Card 
                key={stat.title}
                className="min-w-[280px] snap-center animate-slide-up border-border/50 shadow-lg card-hover touch-manipulation"
                style={{ animationDelay: stat.delay }}
              >
                <CardContent className="p-4">
                  <div className="flex items-center justify-between">
                    <div className="flex-1">
                      <p className="text-sm text-muted-foreground font-semibold">{stat.title}</p>
                      <p className="text-2xl font-bold text-foreground mt-1">
                        {stat.value}
                      </p>
                      <p className="text-xs text-muted-foreground font-medium mt-1">
                        {stat.subtitle}
                      </p>
                    </div>
                    <div className={`${stat.gradient} p-3 rounded-xl ml-3`}>
                      <Icon className={`h-6 w-6 ${
                        stat.gradient.includes('gradient') 
                          ? 'text-primary-foreground' 
                          : stat.gradient.includes('primary')
                            ? 'text-primary'
                            : 'text-accent'
                      }`} />
                    </div>
                  </div>
                </CardContent>
              </Card>
            );
          })}
        </div>
        
        {/* Scroll indicator */}
        <div className="flex justify-center mt-2 space-x-1">
          {statsCards.map((_, index) => (
            <div 
              key={index}
              className="w-2 h-2 rounded-full bg-border"
            />
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="grid md:grid-cols-4 gap-6 mb-8">
      {statsCards.map((stat) => {
        const Icon = stat.icon;
        return (
          <Card 
            key={stat.title}
            className="animate-slide-up border-border/50 shadow-lg card-hover"
            style={{ animationDelay: stat.delay }}
          >
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-muted-foreground font-semibold">{stat.title}</p>
                  <p className="text-3xl font-bold text-foreground">
                    {stat.value}
                  </p>
                  <p className="text-xs text-muted-foreground font-medium">
                    {stat.subtitle}
                  </p>
                </div>
                <div className={`${stat.gradient} p-3 rounded-xl`}>
                  <Icon className={`h-6 w-6 ${
                    stat.gradient.includes('gradient') 
                      ? 'text-primary-foreground' 
                      : stat.gradient.includes('primary')
                        ? 'text-primary'
                        : 'text-accent'
                  }`} />
                </div>
              </div>
            </CardContent>
          </Card>
        );
      })}
    </div>
  );
};

export default MobileStats;