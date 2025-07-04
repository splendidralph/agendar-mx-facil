import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { ChartContainer, ChartTooltip, ChartTooltipContent } from "@/components/ui/chart";
import { LineChart, Line, XAxis, YAxis, ResponsiveContainer, BarChart, Bar, PieChart, Pie, Cell } from "recharts";
import { DollarSign, TrendingUp, Calendar, CreditCard } from "lucide-react";
import { toast } from "sonner";

interface RevenueData {
  date: string;
  total_revenue: number;
  bookings_count: number;
  avg_booking_value: number;
}

interface CategoryRevenue {
  category: string;
  revenue: number;
  bookings: number;
  avg_value: number;
}

const RevenueAnalytics = () => {
  const [revenueData, setRevenueData] = useState<RevenueData[]>([]);
  const [categoryRevenue, setCategoryRevenue] = useState<CategoryRevenue[]>([]);
  const [loading, setLoading] = useState(true);
  const [timeRange, setTimeRange] = useState("30d");

  useEffect(() => {
    loadRevenueAnalytics();
  }, [timeRange]);

  const loadRevenueAnalytics = async () => {
    try {
      setLoading(true);
      
      const daysBack = timeRange === "7d" ? 7 : timeRange === "30d" ? 30 : 90;
      
      // Get daily revenue data
      const { data: dailyData, error: dailyError } = await supabase
        .from('bookings')
        .select(`
          booking_date,
          total_price,
          status
        `)
        .gte('booking_date', new Date(Date.now() - daysBack * 24 * 60 * 60 * 1000).toISOString().split('T')[0])
        .in('status', ['confirmed', 'completed']);

      if (dailyError) throw dailyError;

      // Process daily revenue data
      const revenueByDate = (dailyData || []).reduce((acc: Record<string, RevenueData>, booking) => {
        const date = booking.booking_date;
        if (!acc[date]) {
          acc[date] = {
            date,
            total_revenue: 0,
            bookings_count: 0,
            avg_booking_value: 0
          };
        }
        acc[date].total_revenue += booking.total_price;
        acc[date].bookings_count += 1;
        return acc;
      }, {});

      const processedRevenueData = Object.values(revenueByDate).map(item => ({
        ...item,
        avg_booking_value: item.bookings_count > 0 ? item.total_revenue / item.bookings_count : 0
      })).sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime());

      // Get category revenue data
      const { data: categoryData, error: categoryError } = await supabase
        .from('bookings')
        .select(`
          total_price,
          services (
            category
          )
        `)
        .gte('booking_date', new Date(Date.now() - daysBack * 24 * 60 * 60 * 1000).toISOString().split('T')[0])
        .in('status', ['confirmed', 'completed']);

      if (categoryError) throw categoryError;

      // Process category revenue
      const categoryStats = (categoryData || []).reduce((acc: Record<string, CategoryRevenue>, booking) => {
        const category = booking.services?.category || 'Otros';
        if (!acc[category]) {
          acc[category] = {
            category,
            revenue: 0,
            bookings: 0,
            avg_value: 0
          };
        }
        acc[category].revenue += booking.total_price;
        acc[category].bookings += 1;
        return acc;
      }, {});

      const processedCategoryData = Object.values(categoryStats).map(item => ({
        ...item,
        avg_value: item.bookings > 0 ? item.revenue / item.bookings : 0
      })).sort((a, b) => b.revenue - a.revenue);

      setRevenueData(processedRevenueData);
      setCategoryRevenue(processedCategoryData);
    } catch (error) {
      console.error('Error loading revenue analytics:', error);
      toast.error("Error cargando análisis de ingresos");
    } finally {
      setLoading(false);
    }
  };

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('es-MX', {
      style: 'currency',
      currency: 'MXN'
    }).format(amount);
  };

  const getTimeRangeLabel = () => {
    switch (timeRange) {
      case '7d': return 'Últimos 7 días';
      case '30d': return 'Últimos 30 días';
      case '90d': return 'Últimos 90 días';
      default: return 'Últimos 30 días';
    }
  };

  const totalRevenue = revenueData.reduce((sum, item) => sum + item.total_revenue, 0);
  const totalBookings = revenueData.reduce((sum, item) => sum + item.bookings_count, 0);
  const avgBookingValue = totalBookings > 0 ? totalRevenue / totalBookings : 0;

  const chartColors = ['#0088FE', '#00C49F', '#FFBB28', '#FF8042', '#8884D8'];

  if (loading) {
    return (
      <div className="space-y-6">
        <div className="flex justify-between items-center">
          <h2 className="text-2xl font-bold">Análisis de Ingresos</h2>
          <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-primary"></div>
        </div>
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {[...Array(4)].map((_, i) => (
            <Card key={i} className="animate-pulse">
              <CardHeader className="space-y-2">
                <div className="h-4 bg-muted rounded w-1/2"></div>
                <div className="h-32 bg-muted rounded"></div>
              </CardHeader>
            </Card>
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header with Time Range Selector */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h2 className="text-2xl font-bold text-foreground">Análisis de Ingresos</h2>
          <p className="text-muted-foreground">{getTimeRangeLabel()}</p>
        </div>
        <Select value={timeRange} onValueChange={setTimeRange}>
          <SelectTrigger className="w-40">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="7d">Últimos 7 días</SelectItem>
            <SelectItem value="30d">Últimos 30 días</SelectItem>
            <SelectItem value="90d">Últimos 90 días</SelectItem>
          </SelectContent>
        </Select>
      </div>

      {/* Revenue Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <Card className="border-border/50 shadow-lg">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Ingresos Totales</CardTitle>
            <DollarSign className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{formatCurrency(totalRevenue)}</div>
            <p className="text-xs text-muted-foreground mt-1">
              {getTimeRangeLabel().toLowerCase()}
            </p>
          </CardContent>
        </Card>

        <Card className="border-border/50 shadow-lg">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Reservas</CardTitle>
            <Calendar className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{totalBookings}</div>
            <p className="text-xs text-muted-foreground mt-1">
              reservas procesadas
            </p>
          </CardContent>
        </Card>

        <Card className="border-border/50 shadow-lg">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Valor Promedio</CardTitle>
            <CreditCard className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{formatCurrency(avgBookingValue)}</div>
            <p className="text-xs text-muted-foreground mt-1">
              por reserva
            </p>
          </CardContent>
        </Card>

        <Card className="border-border/50 shadow-lg">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Ingresos Diarios</CardTitle>
            <TrendingUp className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {formatCurrency(revenueData.length > 0 ? totalRevenue / revenueData.length : 0)}
            </div>
            <p className="text-xs text-muted-foreground mt-1">
              promedio diario
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Charts Row */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Revenue Trend */}
        <Card className="border-border/50 shadow-lg">
          <CardHeader>
            <CardTitle>Tendencia de Ingresos</CardTitle>
            <CardDescription>Ingresos diarios en el período seleccionado</CardDescription>
          </CardHeader>
          <CardContent>
            <ChartContainer
              config={{
                total_revenue: {
                  label: "Ingresos",
                  color: "hsl(var(--primary))",
                },
              }}
              className="h-80"
            >
              <ResponsiveContainer width="100%" height="100%">
                <LineChart data={revenueData}>
                  <XAxis 
                    dataKey="date" 
                    tick={{ fontSize: 12 }}
                    tickFormatter={(date) => new Date(date).toLocaleDateString('es-MX', { month: 'short', day: 'numeric' })}
                  />
                  <YAxis tickFormatter={(value) => `$${value}`} />
                  <ChartTooltip 
                    content={<ChartTooltipContent />}
                    labelFormatter={(date) => new Date(date).toLocaleDateString('es-MX')}
                  />
                  <Line 
                    type="monotone" 
                    dataKey="total_revenue" 
                    stroke="hsl(var(--primary))" 
                    strokeWidth={2}
                    dot={{ r: 4 }}
                  />
                </LineChart>
              </ResponsiveContainer>
            </ChartContainer>
          </CardContent>
        </Card>

        {/* Category Revenue Distribution */}
        <Card className="border-border/50 shadow-lg">
          <CardHeader>
            <CardTitle>Ingresos por Categoría</CardTitle>
            <CardDescription>Distribución de ingresos por tipo de servicio</CardDescription>
          </CardHeader>
          <CardContent>
            <ChartContainer
              config={{
                revenue: {
                  label: "Ingresos",
                  color: "hsl(var(--primary))",
                },
              }}
              className="h-80"
            >
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={categoryRevenue}
                    cx="50%"
                    cy="50%"
                    outerRadius={80}
                    dataKey="revenue"
                    nameKey="category"
                    label={({ category, revenue }) => `${category}: ${formatCurrency(revenue)}`}
                  >
                    {categoryRevenue.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={chartColors[index % chartColors.length]} />
                    ))}
                  </Pie>
                  <ChartTooltip 
                    formatter={(value) => [formatCurrency(Number(value)), 'Ingresos']}
                  />
                </PieChart>
              </ResponsiveContainer>
            </ChartContainer>
          </CardContent>
        </Card>
      </div>

      {/* Category Performance Table */}
      <Card className="border-border/50 shadow-lg">
        <CardHeader>
          <CardTitle>Performance por Categoría</CardTitle>
          <CardDescription>
            Análisis detallado de ingresos y valor promedio por categoría
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {categoryRevenue.map((category, index) => (
              <div key={category.category} className="flex items-center justify-between p-4 bg-secondary/10 rounded-lg">
                <div className="flex items-center gap-3">
                  <div 
                    className="w-4 h-4 rounded-full" 
                    style={{ backgroundColor: chartColors[index % chartColors.length] }}
                  />
                  <div>
                    <h4 className="font-medium">{category.category}</h4>
                    <p className="text-sm text-muted-foreground">
                      {category.bookings} reservas
                    </p>
                  </div>
                </div>
                <div className="text-right">
                  <div className="font-semibold">{formatCurrency(category.revenue)}</div>
                  <div className="text-sm text-muted-foreground">
                    {formatCurrency(category.avg_value)} promedio
                  </div>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default RevenueAnalytics;