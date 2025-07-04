import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { ChartContainer, ChartTooltip, ChartTooltipContent } from "@/components/ui/chart";
import { BarChart, Bar, XAxis, YAxis, ResponsiveContainer, LineChart, Line, PieChart, Pie, Cell } from "recharts";
import { Users, Calendar, DollarSign, MapPin, TrendingUp, RefreshCw } from "lucide-react";
import { toast } from "sonner";

interface DashboardMetrics {
  total_providers: number;
  active_providers: number;
  total_bookings: number;
  total_revenue: number;
  activated_colonias: number;
  avg_bookings_per_provider: number;
  calculated_at: string;
}

const AdminOverview = () => {
  const [metrics, setMetrics] = useState<DashboardMetrics | null>(null);
  const [dateRange, setDateRange] = useState("30d");
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  useEffect(() => {
    loadDashboardMetrics();
  }, [dateRange]);

  const loadDashboardMetrics = async () => {
    try {
      setLoading(true);
      
      // Call the database function to get calculated metrics
      const { data, error } = await supabase.rpc('calculate_dashboard_metrics', {
        date_range: dateRange
      });

      if (error) throw error;

      setMetrics(data as unknown as DashboardMetrics);
    } catch (error) {
      console.error('Error loading dashboard metrics:', error);
      toast.error("Error cargando métricas del dashboard");
    } finally {
      setLoading(false);
    }
  };

  const refreshViews = async () => {
    try {
      setRefreshing(true);
      
      // Refresh materialized views
      const { error } = await supabase.rpc('refresh_analytics_views');
      
      if (error) throw error;
      
      // Reload metrics
      await loadDashboardMetrics();
      
      toast.success("Vistas analíticas actualizadas");
    } catch (error) {
      console.error('Error refreshing views:', error);
      toast.error("Error actualizando vistas analíticas");
    } finally {
      setRefreshing(false);
    }
  };

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('es-MX', {
      style: 'currency',
      currency: 'MXN'
    }).format(amount);
  };

  const getDateRangeLabel = () => {
    switch (dateRange) {
      case '7d': return 'Últimos 7 días';
      case '30d': return 'Últimos 30 días';
      case '90d': return 'Últimos 90 días';
      default: return 'Últimos 30 días';
    }
  };

  if (loading) {
    return (
      <div className="space-y-6">
        <div className="flex justify-between items-center">
          <h2 className="text-2xl font-bold">Resumen Ejecutivo</h2>
          <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-primary"></div>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {[...Array(6)].map((_, i) => (
            <Card key={i} className="animate-pulse">
              <CardHeader className="space-y-2">
                <div className="h-4 bg-muted rounded w-1/2"></div>
                <div className="h-8 bg-muted rounded w-3/4"></div>
              </CardHeader>
            </Card>
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header with Controls */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h2 className="text-2xl font-bold text-foreground">Resumen Ejecutivo</h2>
          <p className="text-muted-foreground">{getDateRangeLabel()}</p>
        </div>
        <div className="flex items-center gap-3">
          <Select value={dateRange} onValueChange={setDateRange}>
            <SelectTrigger className="w-40">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="7d">Últimos 7 días</SelectItem>
              <SelectItem value="30d">Últimos 30 días</SelectItem>
              <SelectItem value="90d">Últimos 90 días</SelectItem>
            </SelectContent>
          </Select>
          <Button 
            variant="outline" 
            size="sm" 
            onClick={refreshViews}
            disabled={refreshing}
          >
            <RefreshCw className={`h-4 w-4 mr-2 ${refreshing ? 'animate-spin' : ''}`} />
            Actualizar
          </Button>
        </div>
      </div>

      {/* Key Metrics Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        <Card className="border-border/50 shadow-lg">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Proveedores</CardTitle>
            <Users className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{metrics?.total_providers || 0}</div>
            <p className="text-xs text-muted-foreground mt-1">
              {metrics?.active_providers || 0} activos
            </p>
          </CardContent>
        </Card>

        <Card className="border-border/50 shadow-lg">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Reservas</CardTitle>
            <Calendar className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{metrics?.total_bookings || 0}</div>
            <p className="text-xs text-muted-foreground mt-1">
              {getDateRangeLabel().toLowerCase()}
            </p>
          </CardContent>
        </Card>

        <Card className="border-border/50 shadow-lg">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Ingresos Totales</CardTitle>
            <DollarSign className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {formatCurrency(metrics?.total_revenue || 0)}
            </div>
            <p className="text-xs text-muted-foreground mt-1">
              {getDateRangeLabel().toLowerCase()}
            </p>
          </CardContent>
        </Card>

        <Card className="border-border/50 shadow-lg">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Colonias Activadas</CardTitle>
            <MapPin className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{metrics?.activated_colonias || 0}</div>
            <p className="text-xs text-muted-foreground mt-1">
              ≥5 proveedores y ≥10 reservas
            </p>
          </CardContent>
        </Card>

        <Card className="border-border/50 shadow-lg">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Promedio Reservas</CardTitle>
            <TrendingUp className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{metrics?.avg_bookings_per_provider || 0}</div>
            <p className="text-xs text-muted-foreground mt-1">
              por proveedor activo
            </p>
          </CardContent>
        </Card>

        <Card className="border-border/50 shadow-lg">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Estado del Marketplace</CardTitle>
            <Badge variant="secondary" className="h-4">
              {(metrics?.active_providers || 0) > 10 ? 'Saludable' : 'Creciendo'}
            </Badge>
          </CardHeader>
          <CardContent>
            <div className="text-sm text-muted-foreground">
              Tasa de activación: {metrics?.total_providers ? 
                Math.round(((metrics.active_providers || 0) / metrics.total_providers) * 100) : 0}%
            </div>
            <p className="text-xs text-muted-foreground mt-1">
              Última actualización: {metrics?.calculated_at ? 
                new Date(metrics.calculated_at).toLocaleString('es-MX') : 'N/A'}
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Growth Insights */}
      <Card className="border-border/50 shadow-lg">
        <CardHeader>
          <CardTitle>Insights de Crecimiento</CardTitle>
          <CardDescription>
            Análisis clave para el crecimiento del marketplace
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="p-4 bg-secondary/20 rounded-lg">
              <h4 className="font-semibold text-sm mb-2">Efectos de Red</h4>
              <p className="text-sm text-muted-foreground">
                {(metrics?.activated_colonias || 0) > 5 
                  ? "Excelente penetración geográfica. El marketplace está desarrollando efectos de red locales."
                  : "Enfócate en activar más colonias para desarrollar efectos de red locales."}
              </p>
            </div>
            <div className="p-4 bg-secondary/20 rounded-lg">
              <h4 className="font-semibold text-sm mb-2">Engagement de Proveedores</h4>
              <p className="text-sm text-muted-foreground">
                {(metrics?.avg_bookings_per_provider || 0) > 2 
                  ? "Alta retención de proveedores. Los profesionales están generando ingresos consistentes."
                  : "Mejora la retención ofreciendo más herramientas y marketing para proveedores."}
              </p>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default AdminOverview;