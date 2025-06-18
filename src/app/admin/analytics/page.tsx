"use client";

import { useEffect, useState } from "react";
import { useAuth } from "@/components/app/AuthContext";
import { useRouter } from "next/navigation";
import { isAdmin, getSalesAnalytics, getAllCategories } from "@/lib/db/db";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { 
  BarChart3, 
  TrendingUp, 
  DollarSign, 
  ShoppingCart,
  Calendar,
  ArrowLeft,
  Download,
  Filter
} from "lucide-react";
import Link from "next/link";

interface SalesData {
  time_period: string;
  total_orders: number;
  total_revenue: number;
  unique_customers: number;
  CategoryName?: string;
}

interface Category {
  CategoryID: number;
  CategoryName: string;
  Description: string;
}

export default function AdminAnalytics() {
  const { username } = useAuth();
  const router = useRouter();
  const [salesData, setSalesData] = useState<SalesData[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [timeFrame, setTimeFrame] = useState("month");
  const [selectedCategory, setSelectedCategory] = useState<string>("all");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    checkAdminAccess();
  }, [username]);

  useEffect(() => {
    if (username) {
      loadAnalytics();
    }
  }, [timeFrame, selectedCategory]);

  const checkAdminAccess = async () => {
    if (!username) {
      router.push('/login');
      return;
    }

    try {
      const adminStatus = await isAdmin(username);
      if (!adminStatus) {
        setError("Acceso denegado. Solo los administradores pueden acceder a esta página.");
        return;
      }

      await loadInitialData();
    } catch (err) {
      setError("Error verificando permisos de administrador");
      console.error(err);
    }
  };

  const loadInitialData = async () => {
    try {
      setLoading(true);
      const [categoriesData] = await Promise.all([
        getAllCategories()
      ]);
      setCategories(categoriesData);
    } catch (err) {
      setError("Error cargando datos iniciales");
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const loadAnalytics = async () => {
    try {
      setLoading(true);
      const categoryId = selectedCategory === "all" ? undefined : selectedCategory;
      const analytics = await getSalesAnalytics(timeFrame, categoryId);
      setSalesData(analytics);
    } catch (err) {
      setError("Error cargando análisis de ventas");
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const getTimeFrameLabel = (timeFrame: string) => {
    switch (timeFrame) {
      case 'hour': return 'Por Hora';
      case 'day': return 'Por Día';
      case 'month': return 'Por Mes';
      case 'quarter': return 'Por Trimestre';
      case 'semester': return 'Por Semestre';
      case 'year': return 'Por Año';
      default: return 'Por Mes';
    }
  };

  const formatTimePeriod = (period: string, timeFrame: string) => {
    switch (timeFrame) {
      case 'hour':
        return new Date(period).toLocaleString('es-ES', { 
          year: 'numeric', 
          month: 'short', 
          day: 'numeric',
          hour: '2-digit'
        });
      case 'day':
        return new Date(period).toLocaleDateString('es-ES', { 
          year: 'numeric', 
          month: 'short', 
          day: 'numeric'
        });
      case 'month':
        return new Date(period + '-01').toLocaleDateString('es-ES', { 
          year: 'numeric', 
          month: 'long'
        });
      case 'quarter':
        return `Q${period.split('-')[1]} ${period.split('-')[0]}`;
      case 'semester':
        return `S${period.split('-')[1]} ${period.split('-')[0]}`;
      case 'year':
        return period;
      default:
        return period;
    }
  };

  const calculateTotals = () => {
    return salesData.reduce((totals, item) => ({
      orders: totals.orders + (item.total_orders || 0),
      revenue: totals.revenue + (item.total_revenue || 0),
      customers: totals.customers + (item.unique_customers || 0)
    }), { orders: 0, revenue: 0, customers: 0 });
  };

  const totals = calculateTotals();

  if (loading) {
    return (
      <div className="container mx-auto p-6">
        <div className="text-center py-12">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">Cargando análisis de ventas...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="container mx-auto p-6">
        <Alert variant="destructive">
          <AlertTitle>Error</AlertTitle>
          <AlertDescription>{error}</AlertDescription>
        </Alert>
      </div>
    );
  }

  return (
    <div className="container mx-auto p-6">
      {/* Header */}
      <div className="mb-8">
        <div className="flex items-center justify-between mb-4">
          <h1 className="text-3xl font-bold text-gray-900">Análisis de Ventas</h1>
          <Link href="/admin">
            <Button variant="outline">
              <ArrowLeft className="w-4 h-4 mr-2" />
              Volver al Panel
            </Button>
          </Link>
        </div>
        <p className="text-gray-600">Analiza las ventas por tiempo y categoría para tomar decisiones informadas.</p>
      </div>

      {/* Filters */}
      <Card className="mb-6">
        <CardContent className="pt-6">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div>
              <label className="text-sm font-medium text-gray-600 mb-2 block">Período de Tiempo</label>
              <Select value={timeFrame} onValueChange={setTimeFrame}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="hour">Por Hora</SelectItem>
                  <SelectItem value="day">Por Día</SelectItem>
                  <SelectItem value="month">Por Mes</SelectItem>
                  <SelectItem value="quarter">Por Trimestre</SelectItem>
                  <SelectItem value="semester">Por Semestre</SelectItem>
                  <SelectItem value="year">Por Año</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div>
              <label className="text-sm font-medium text-gray-600 mb-2 block">Categoría</label>
              <Select value={selectedCategory} onValueChange={setSelectedCategory}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">Todas las Categorías</SelectItem>
                  {categories.map((category) => (
                    <SelectItem key={category.CategoryID} value={category.CategoryID.toString()}>
                      {category.CategoryName}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="flex items-end">
              <Button onClick={loadAnalytics} className="w-full">
                <Filter className="w-4 h-4 mr-2" />
                Aplicar Filtros
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Pedidos</CardTitle>
            <ShoppingCart className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{totals.orders}</div>
            <p className="text-xs text-muted-foreground">
              {getTimeFrameLabel(timeFrame)}
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Ingresos Totales</CardTitle>
            <DollarSign className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">${totals.revenue.toFixed(2)}</div>
            <p className="text-xs text-muted-foreground">
              {getTimeFrameLabel(timeFrame)}
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Clientes Únicos</CardTitle>
            <TrendingUp className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{totals.customers}</div>
            <p className="text-xs text-muted-foreground">
              {getTimeFrameLabel(timeFrame)}
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Sales Data Table */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <BarChart3 className="w-5 h-5" />
              Datos de Ventas
            </div>
            <Button variant="outline" size="sm">
              <Download className="w-4 h-4 mr-2" />
              Exportar
            </Button>
          </CardTitle>
        </CardHeader>
        <CardContent>
          {salesData.length > 0 ? (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Período</TableHead>
                  {selectedCategory === "all" && <TableHead>Categoría</TableHead>}
                  <TableHead>Pedidos</TableHead>
                  <TableHead>Ingresos</TableHead>
                  <TableHead>Clientes Únicos</TableHead>
                  <TableHead>Promedio por Pedido</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {salesData.map((item, index) => (
                  <TableRow key={index}>
                    <TableCell className="font-medium">
                      {formatTimePeriod(item.time_period, timeFrame)}
                    </TableCell>
                    {selectedCategory === "all" && (
                      <TableCell>
                        {item.CategoryName || 'Todas'}
                      </TableCell>
                    )}
                    <TableCell>
                      <Badge variant="outline">{item.total_orders}</Badge>
                    </TableCell>
                    <TableCell className="font-semibold">
                      ${(item.total_revenue || 0).toFixed(2)}
                    </TableCell>
                    <TableCell>
                      {item.unique_customers}
                    </TableCell>
                    <TableCell>
                      ${item.total_orders > 0 ? ((item.total_revenue || 0) / item.total_orders).toFixed(2) : '0.00'}
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          ) : (
            <div className="text-center py-8">
              <BarChart3 className="w-12 h-12 text-gray-400 mx-auto mb-4" />
              <p className="text-gray-600">No hay datos de ventas para los filtros seleccionados.</p>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Insights */}
      {salesData.length > 0 && (
        <Card className="mt-6">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <TrendingUp className="w-5 h-5" />
              Insights
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <h4 className="font-semibold mb-2">Período con Más Ventas</h4>
                {(() => {
                  const maxRevenue = Math.max(...salesData.map(item => item.total_revenue || 0));
                  const bestPeriod = salesData.find(item => (item.total_revenue || 0) === maxRevenue);
                  return (
                    <p className="text-sm text-gray-600">
                      {bestPeriod ? formatTimePeriod(bestPeriod.time_period, timeFrame) : 'N/A'} 
                      con ${maxRevenue.toFixed(2)}
                    </p>
                  );
                })()}
              </div>
              
              <div>
                <h4 className="font-semibold mb-2">Promedio de Pedidos</h4>
                <p className="text-sm text-gray-600">
                  {totals.orders > 0 ? (totals.orders / salesData.length).toFixed(1) : 0} pedidos por período
                </p>
              </div>

              <div>
                <h4 className="font-semibold mb-2">Ticket Promedio</h4>
                <p className="text-sm text-gray-600">
                  ${totals.orders > 0 ? (totals.revenue / totals.orders).toFixed(2) : '0.00'} por pedido
                </p>
              </div>

              <div>
                <h4 className="font-semibold mb-2">Tasa de Conversión</h4>
                <p className="text-sm text-gray-600">
                  {totals.customers > 0 ? ((totals.orders / totals.customers) * 100).toFixed(1) : 0}% 
                  (pedidos por cliente)
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
} 