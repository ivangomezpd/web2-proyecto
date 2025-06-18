"use client";

import { useEffect, useState } from "react";
import { useAuth } from "@/components/app/AuthContext";
import { useRouter } from "next/navigation";
import { isAdmin, getRecentOrders, getSalesAnalytics } from "@/lib/db/db";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { 
  Users, 
  ShoppingCart, 
  BarChart3, 
  Activity, 
  TrendingUp, 
  Package,
  DollarSign,
  Calendar
} from "lucide-react";
import Link from "next/link";

interface DashboardStats {
  totalOrders: number;
  totalRevenue: number;
  totalCustomers: number;
  recentOrders: any[];
  salesData: any[];
}

export default function AdminDashboard() {
  const { username } = useAuth();
  const router = useRouter();
  const [stats, setStats] = useState<DashboardStats | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    checkAdminAccess();
  }, [username]);

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

      await loadDashboardData();
    } catch (err) {
      setError("Error verificando permisos de administrador");
      console.error(err);
    }
  };

  const loadDashboardData = async () => {
    try {
      setLoading(true);
      
      // Cargar datos del dashboard
      const [recentOrders, salesData] = await Promise.all([
        getRecentOrders(5),
        getSalesAnalytics('month')
      ]);

      // Calcular estadísticas básicas
      const totalRevenue = salesData.reduce((sum: number, item: any) => sum + (item.total_revenue || 0), 0);
      const totalOrders = salesData.reduce((sum: number, item: any) => sum + (item.total_orders || 0), 0);

      setStats({
        totalOrders,
        totalRevenue,
        totalCustomers: salesData.reduce((sum: number, item: any) => sum + (item.unique_customers || 0), 0),
        recentOrders,
        salesData
      });
    } catch (err) {
      setError("Error cargando datos del dashboard");
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="container mx-auto p-6">
        <div className="text-center py-12">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">Cargando panel de administración...</p>
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
        <h1 className="text-3xl font-bold text-gray-900">Panel de Administración</h1>
        <p className="text-gray-600 mt-2">Bienvenido, {username}. Gestiona tu sistema de e-commerce.</p>
      </div>

      {/* Quick Stats */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Pedidos</CardTitle>
            <ShoppingCart className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats?.totalOrders || 0}</div>
            <p className="text-xs text-muted-foreground">Este mes</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Ingresos Totales</CardTitle>
            <DollarSign className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">${(stats?.totalRevenue || 0).toFixed(2)}</div>
            <p className="text-xs text-muted-foreground">Este mes</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Clientes Únicos</CardTitle>
            <Users className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats?.totalCustomers || 0}</div>
            <p className="text-xs text-muted-foreground">Este mes</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Tendencia</CardTitle>
            <TrendingUp className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-green-600">+12%</div>
            <p className="text-xs text-muted-foreground">vs mes anterior</p>
          </CardContent>
        </Card>
      </div>

      {/* Navigation Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-8">
        <Link href="/admin/customers">
          <Card className="hover:shadow-lg transition-shadow cursor-pointer">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Users className="w-5 h-5" />
                Gestión de Clientes
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-sm text-gray-600">
                Ver lista de clientes, consultar compras por cliente y gestionar información.
              </p>
            </CardContent>
          </Card>
        </Link>

        <Link href="/admin/orders">
          <Card className="hover:shadow-lg transition-shadow cursor-pointer">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Package className="w-5 h-5" />
                Gestión de Pedidos
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-sm text-gray-600">
                Ver últimas compras, cambiar estado de pedidos y gestionar envíos.
              </p>
            </CardContent>
          </Card>
        </Link>

        <Link href="/admin/analytics">
          <Card className="hover:shadow-lg transition-shadow cursor-pointer">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <BarChart3 className="w-5 h-5" />
                Análisis de Ventas
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-sm text-gray-600">
                Analizar ventas por tiempo, categoría y generar reportes detallados.
              </p>
            </CardContent>
          </Card>
        </Link>

        <Link href="/admin/activity">
          <Card className="hover:shadow-lg transition-shadow cursor-pointer">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Activity className="w-5 h-5" />
                Logs de Actividad
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-sm text-gray-600">
                Consultar logs de actividad de usuarios y acciones del sistema.
              </p>
            </CardContent>
          </Card>
        </Link>

        <Link href="/admin/users">
          <Card className="hover:shadow-lg transition-shadow cursor-pointer">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Users className="w-5 h-5" />
                Gestión de Usuarios
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-sm text-gray-600">
                Gestionar usuarios, roles y permisos del sistema.
              </p>
            </CardContent>
          </Card>
        </Link>

        <Link href="/admin/settings">
          <Card className="hover:shadow-lg transition-shadow cursor-pointer">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Calendar className="w-5 h-5" />
                Configuración
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-sm text-gray-600">
                Configurar parámetros del sistema y preferencias de administración.
              </p>
            </CardContent>
          </Card>
        </Link>
      </div>

      {/* Recent Orders */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <ShoppingCart className="w-5 h-5" />
            Pedidos Recientes
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {stats?.recentOrders.map((order) => (
              <div key={order.OrderID} className="flex items-center justify-between p-4 border rounded-lg">
                <div>
                  <p className="font-medium">Pedido #{order.OrderID}</p>
                  <p className="text-sm text-gray-600">{order.CompanyName} - {order.ContactName}</p>
                  <p className="text-xs text-gray-500">
                    {new Date(order.OrderDate).toLocaleDateString('es-ES')}
                  </p>
                </div>
                <div className="text-right">
                  <p className="font-bold">${(order.totalAmount || 0).toFixed(2)}</p>
                  <span className={`text-xs px-2 py-1 rounded-full ${
                    order.paymentStatus === 'paid' 
                      ? 'bg-green-100 text-green-800' 
                      : 'bg-yellow-100 text-yellow-800'
                  }`}>
                    {order.paymentStatus === 'paid' ? 'Pagado' : 'Pendiente'}
                  </span>
                </div>
              </div>
            ))}
          </div>
          <div className="mt-4">
            <Link href="/admin/orders">
              <Button variant="outline" className="w-full">
                Ver Todos los Pedidos
              </Button>
            </Link>
          </div>
        </CardContent>
      </Card>
    </div>
  );
} 