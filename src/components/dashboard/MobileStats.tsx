import { Card, CardContent } from "@/components/ui/card";
import { Calendar, TrendingUp, Users, DollarSign } from "lucide-react";
interface StatsData {
  todayCount: number;
  weekCount: number;
  clientCount: number;
  weekRevenue: number;
}

interface MobileStatsProps {
  stats: StatsData;
  loading: boolean;
  isMobile: boolean;
}

const MobileStats = ({ stats, loading, isMobile }: MobileStatsProps) => {

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
        <div className="grid grid-cols-2 gap-3 px-1">
          {statsCards.map((stat, index) => {
            const Icon = stat.icon;
            return (
              <Card 
                key={stat.title}
                className="animate-slide-up border-border/50 shadow-lg card-hover touch-manipulation"
                style={{ animationDelay: stat.delay }}
              >
                <CardContent className="p-3">
                  <div className="flex flex-col space-y-2">
                    <div className="flex items-center justify-between">
                      <p className="text-xs text-muted-foreground font-semibold truncate">{stat.title}</p>
                      <div className={`${stat.gradient} p-2 rounded-lg`}>
                        <Icon className={`h-4 w-4 ${
                          stat.gradient.includes('gradient') 
                            ? 'text-primary-foreground' 
                            : stat.gradient.includes('primary')
                              ? 'text-primary'
                              : 'text-accent'
                        }`} />
                      </div>
                    </div>
                    <div>
                      <p className="text-xl font-bold text-foreground">
                        {stat.value}
                      </p>
                      <p className="text-xs text-muted-foreground font-medium truncate">
                        {stat.subtitle}
                      </p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            );
          })}
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