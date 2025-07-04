import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { ChartContainer, ChartTooltip, ChartTooltipContent } from "@/components/ui/chart";
import { BarChart, Bar, XAxis, YAxis, ResponsiveContainer, LineChart, Line } from "recharts";
import { Users, Star, Calendar, DollarSign, TrendingUp } from "lucide-react";
import { toast } from "sonner";

interface ProviderData {
  id: string;
  business_name: string;
  category: string;
  colonia: string;
  onboarded_at: string;
  total_bookings: number;
  bookings_last_7_days: number;
  bookings_last_30_days: number;
  total_revenue: number;
  revenue_last_30_days: number;
  unique_clients: number;
  status: 'active' | 'inactive';
}

const ProviderAnalytics = () => {
  const [providerData, setProviderData] = useState<ProviderData[]>([]);
  const [filteredData, setFilteredData] = useState<ProviderData[]>([]);
  const [loading, setLoading] = useState(true);
  const [statusFilter, setStatusFilter] = useState<string>("all");
  const [categoryFilter, setCategoryFilter] = useState<string>("all");

  useEffect(() => {
    loadProviderAnalytics();
  }, []);

  useEffect(() => {
    applyFilters();
  }, [providerData, statusFilter, categoryFilter]);

  const loadProviderAnalytics = async () => {
    try {
      setLoading(true);
      
      const { data, error } = await supabase
        .from('provider_analytics')
        .select('*')
        .order('total_bookings', { ascending: false });

      if (error) throw error;

      setProviderData((data || []) as ProviderData[]);
    } catch (error) {
      console.error('Error loading provider analytics:', error);
      toast.error("Error cargando análisis de proveedores");
    } finally {
      setLoading(false);
    }
  };

  const applyFilters = () => {
    let filtered = [...providerData];

    if (statusFilter !== "all") {
      filtered = filtered.filter(p => p.status === statusFilter);
    }

    if (categoryFilter !== "all") {
      filtered = filtered.filter(p => p.category === categoryFilter);
    }

    setFilteredData(filtered);
  };

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('es-MX', {
      style: 'currency',
      currency: 'MXN'
    }).format(amount);
  };

  const getStatusBadge = (status: string) => {
    return status === 'active' ? (
      <Badge variant="default" className="bg-green-100 text-green-800">
        Activo
      </Badge>
    ) : (
      <Badge variant="secondary" className="bg-gray-100 text-gray-800">
        Inactivo
      </Badge>
    );
  };

  const getUniqueCategories = () => {
    const categories = [...new Set(providerData.map(p => p.category))];
    return categories.filter(Boolean);
  };

  const topPerformers = filteredData.slice(0, 10);

  const categoryData = getUniqueCategories().map(category => {
    const categoryProviders = filteredData.filter(p => p.category === category);
    return {
      category,
      count: categoryProviders.length,
      totalBookings: categoryProviders.reduce((sum, p) => sum + p.total_bookings, 0),
      totalRevenue: categoryProviders.reduce((sum, p) => sum + p.total_revenue, 0)
    };
  }).sort((a, b) => b.totalBookings - a.totalBookings);

  if (loading) {
    return (
      <div className="space-y-6">
        <div className="flex justify-between items-center">
          <h2 className="text-2xl font-bold">Análisis de Proveedores</h2>
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
      {/* Header with Filters */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h2 className="text-2xl font-bold text-foreground">Análisis de Proveedores</h2>
          <p className="text-muted-foreground">Performance y métricas de profesionales</p>
        </div>
        <div className="flex items-center gap-3">
          <Select value={statusFilter} onValueChange={setStatusFilter}>
            <SelectTrigger className="w-32">
              <SelectValue placeholder="Estado" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">Todos</SelectItem>
              <SelectItem value="active">Activos</SelectItem>
              <SelectItem value="inactive">Inactivos</SelectItem>
            </SelectContent>
          </Select>
          <Select value={categoryFilter} onValueChange={setCategoryFilter}>
            <SelectTrigger className="w-40">
              <SelectValue placeholder="Categoría" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">Todas</SelectItem>
              {getUniqueCategories().map(category => (
                <SelectItem key={category} value={category}>
                  {category}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <Card className="border-border/50 shadow-lg">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Proveedores</CardTitle>
            <Users className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{filteredData.length}</div>
            <p className="text-xs text-muted-foreground mt-1">
              {filteredData.filter(p => p.status === 'active').length} activos
            </p>
          </CardContent>
        </Card>

        <Card className="border-border/50 shadow-lg">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Reservas Totales</CardTitle>
            <Calendar className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {filteredData.reduce((sum, p) => sum + p.total_bookings, 0)}
            </div>
            <p className="text-xs text-muted-foreground mt-1">
              {filteredData.reduce((sum, p) => sum + p.bookings_last_30_days, 0)} últimos 30 días
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
              {formatCurrency(filteredData.reduce((sum, p) => sum + p.total_revenue, 0))}
            </div>
            <p className="text-xs text-muted-foreground mt-1">
              {formatCurrency(filteredData.reduce((sum, p) => sum + p.revenue_last_30_days, 0))} últimos 30 días
            </p>
          </CardContent>
        </Card>

        <Card className="border-border/50 shadow-lg">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Promedio Reservas</CardTitle>
            <TrendingUp className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {filteredData.length > 0 ? 
                Math.round(filteredData.reduce((sum, p) => sum + p.total_bookings, 0) / filteredData.length) : 0}
            </div>
            <p className="text-xs text-muted-foreground mt-1">
              por proveedor
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Charts Row */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Top Performers */}
        <Card className="border-border/50 shadow-lg">
          <CardHeader>
            <CardTitle>Top 10 Proveedores</CardTitle>
            <CardDescription>Por número total de reservas</CardDescription>
          </CardHeader>
          <CardContent>
            <ChartContainer
              config={{
                bookings: {
                  label: "Reservas",
                  color: "hsl(var(--primary))",
                },
              }}
              className="h-80"
            >
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={topPerformers} layout="horizontal">
                  <XAxis type="number" />
                  <YAxis 
                    dataKey="business_name" 
                    type="category" 
                    width={100}
                    tick={{ fontSize: 12 }}
                  />
                  <ChartTooltip content={<ChartTooltipContent />} />
                  <Bar dataKey="total_bookings" fill="hsl(var(--primary))" />
                </BarChart>
              </ResponsiveContainer>
            </ChartContainer>
          </CardContent>
        </Card>

        {/* Category Distribution */}
        <Card className="border-border/50 shadow-lg">
          <CardHeader>
            <CardTitle>Distribución por Categoría</CardTitle>
            <CardDescription>Reservas por categoría de servicio</CardDescription>
          </CardHeader>
          <CardContent>
            <ChartContainer
              config={{
                totalBookings: {
                  label: "Reservas",
                  color: "hsl(var(--primary))",
                },
              }}
              className="h-80"
            >
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={categoryData}>
                  <XAxis dataKey="category" />
                  <YAxis />
                  <ChartTooltip content={<ChartTooltipContent />} />
                  <Bar dataKey="totalBookings" fill="hsl(var(--primary))" />
                </BarChart>
              </ResponsiveContainer>
            </ChartContainer>
          </CardContent>
        </Card>
      </div>

      {/* Detailed Provider Table */}
      <Card className="border-border/50 shadow-lg">
        <CardHeader>
          <CardTitle>Detalles de Proveedores</CardTitle>
          <CardDescription>
            Análisis detallado de performance por proveedor
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Negocio</TableHead>
                <TableHead>Categoría</TableHead>
                <TableHead>Colonia</TableHead>
                <TableHead>Estado</TableHead>
                <TableHead className="text-right">Reservas</TableHead>
                <TableHead className="text-right">30 días</TableHead>
                <TableHead className="text-right">Clientes</TableHead>
                <TableHead className="text-right">Ingresos</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredData.slice(0, 50).map((provider) => (
                <TableRow key={provider.id}>
                  <TableCell className="font-medium">
                    {provider.business_name || 'Sin nombre'}
                  </TableCell>
                  <TableCell>{provider.category}</TableCell>
                  <TableCell>{provider.colonia}</TableCell>
                  <TableCell>
                    {getStatusBadge(provider.status)}
                  </TableCell>
                  <TableCell className="text-right">
                    {provider.total_bookings}
                  </TableCell>
                  <TableCell className="text-right">
                    {provider.bookings_last_30_days}
                  </TableCell>
                  <TableCell className="text-right">
                    {provider.unique_clients}
                  </TableCell>
                  <TableCell className="text-right">
                    {formatCurrency(provider.total_revenue)}
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </div>
  );
};

export default ProviderAnalytics;