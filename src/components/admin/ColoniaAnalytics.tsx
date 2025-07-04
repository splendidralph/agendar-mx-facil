import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { ChartContainer, ChartTooltip, ChartTooltipContent } from "@/components/ui/chart";
import { BarChart, Bar, XAxis, YAxis, ResponsiveContainer, PieChart, Pie, Cell } from "recharts";
import { MapPin, Users, Calendar, DollarSign } from "lucide-react";
import { toast } from "sonner";

interface ColoniaData {
  colonia: string;
  provider_count: number;
  active_providers: number;
  total_bookings: number;
  bookings_last_30_days: number;
  total_revenue: number;
  activation_status: 'activated' | 'developing';
}

const ColoniaAnalytics = () => {
  const [coloniaData, setColoniaData] = useState<ColoniaData[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadColoniaAnalytics();
  }, []);

  const loadColoniaAnalytics = async () => {
    try {
      setLoading(true);
      
      const { data, error } = await supabase
        .from('colonia_analytics')
        .select('*')
        .order('total_bookings', { ascending: false });

      if (error) throw error;

      setColoniaData((data || []) as ColoniaData[]);
    } catch (error) {
      console.error('Error loading colonia analytics:', error);
      toast.error("Error cargando análisis de colonias");
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

  const getActivationBadge = (status: string) => {
    return status === 'activated' ? (
      <Badge variant="default" className="bg-green-100 text-green-800">
        Activada
      </Badge>
    ) : (
      <Badge variant="secondary" className="bg-yellow-100 text-yellow-800">
        En Desarrollo
      </Badge>
    );
  };

  const chartData = coloniaData.slice(0, 10).map(item => ({
    colonia: item.colonia.length > 15 ? item.colonia.slice(0, 15) + '...' : item.colonia,
    bookings: item.total_bookings,
    providers: item.provider_count,
    revenue: item.total_revenue
  }));

  const activationData = [
    { 
      name: 'Activadas', 
      value: coloniaData.filter(c => c.activation_status === 'activated').length,
      color: '#22c55e' 
    },
    { 
      name: 'En Desarrollo', 
      value: coloniaData.filter(c => c.activation_status === 'developing').length,
      color: '#f59e0b' 
    }
  ];

  if (loading) {
    return (
      <div className="space-y-6">
        <div className="flex justify-between items-center">
          <h2 className="text-2xl font-bold">Análisis de Colonias</h2>
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
      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-2xl font-bold text-foreground">Análisis por Colonias</h2>
          <p className="text-muted-foreground">Penetración geográfica y activación de mercados locales</p>
        </div>
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <Card className="border-border/50 shadow-lg">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Colonias</CardTitle>
            <MapPin className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{coloniaData.length}</div>
            <p className="text-xs text-muted-foreground mt-1">
              con presencia activa
            </p>
          </CardContent>
        </Card>

        <Card className="border-border/50 shadow-lg">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Colonias Activadas</CardTitle>
            <Users className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {coloniaData.filter(c => c.activation_status === 'activated').length}
            </div>
            <p className="text-xs text-muted-foreground mt-1">
              ≥5 proveedores y ≥10 reservas
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
              {coloniaData.reduce((sum, c) => sum + c.total_bookings, 0)}
            </div>
            <p className="text-xs text-muted-foreground mt-1">
              en todas las colonias
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
              {formatCurrency(coloniaData.reduce((sum, c) => sum + c.total_revenue, 0))}
            </div>
            <p className="text-xs text-muted-foreground mt-1">
              en todas las colonias
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Charts Row */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Top Colonias by Bookings */}
        <Card className="border-border/50 shadow-lg">
          <CardHeader>
            <CardTitle>Top 10 Colonias por Reservas</CardTitle>
            <CardDescription>Colonias con mayor actividad de reservas</CardDescription>
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
                <BarChart data={chartData} layout="horizontal">
                  <XAxis type="number" />
                  <YAxis dataKey="colonia" type="category" width={100} />
                  <ChartTooltip content={<ChartTooltipContent />} />
                  <Bar dataKey="bookings" fill="hsl(var(--primary))" />
                </BarChart>
              </ResponsiveContainer>
            </ChartContainer>
          </CardContent>
        </Card>

        {/* Activation Status Distribution */}
        <Card className="border-border/50 shadow-lg">
          <CardHeader>
            <CardTitle>Estado de Activación</CardTitle>
            <CardDescription>Distribución de colonias por estado de desarrollo</CardDescription>
          </CardHeader>
          <CardContent>
            <ChartContainer
              config={{
                activated: {
                  label: "Activadas",
                  color: "#22c55e",
                },
                developing: {
                  label: "En Desarrollo",
                  color: "#f59e0b",
                },
              }}
              className="h-80"
            >
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={activationData}
                    cx="50%"
                    cy="50%"
                    outerRadius={80}
                    fill="#8884d8"
                    dataKey="value"
                    label={({ name, value }) => `${name}: ${value}`}
                  >
                    {activationData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={entry.color} />
                    ))}
                  </Pie>
                  <ChartTooltip />
                </PieChart>
              </ResponsiveContainer>
            </ChartContainer>
          </CardContent>
        </Card>
      </div>

      {/* Detailed Table */}
      <Card className="border-border/50 shadow-lg">
        <CardHeader>
          <CardTitle>Detalles por Colonia</CardTitle>
          <CardDescription>
            Análisis detallado de penetración y actividad por colonia
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Colonia</TableHead>
                <TableHead>Estado</TableHead>
                <TableHead className="text-right">Proveedores</TableHead>
                <TableHead className="text-right">Activos</TableHead>
                <TableHead className="text-right">Reservas</TableHead>
                <TableHead className="text-right">Reservas (30d)</TableHead>
                <TableHead className="text-right">Ingresos</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {coloniaData.map((colonia) => (
                <TableRow key={colonia.colonia}>
                  <TableCell className="font-medium">
                    {colonia.colonia}
                  </TableCell>
                  <TableCell>
                    {getActivationBadge(colonia.activation_status)}
                  </TableCell>
                  <TableCell className="text-right">
                    {colonia.provider_count}
                  </TableCell>
                  <TableCell className="text-right">
                    {colonia.active_providers}
                  </TableCell>
                  <TableCell className="text-right">
                    {colonia.total_bookings}
                  </TableCell>
                  <TableCell className="text-right">
                    {colonia.bookings_last_30_days}
                  </TableCell>
                  <TableCell className="text-right">
                    {formatCurrency(colonia.total_revenue)}
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

export default ColoniaAnalytics;