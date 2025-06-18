"use client";

import { useEffect, useState } from "react";
import { useAuth } from "@/components/app/AuthContext";
import { useRouter } from "next/navigation";
import { isAdmin, getRecentOrders, updateOrderStatus } from "@/lib/db/db";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { 
  Package, 
  Search, 
  Eye, 
  Truck,
  DollarSign,
  Calendar,
  ArrowLeft,
  Filter,
  RefreshCw
} from "lucide-react";
import Link from "next/link";

interface Order {
  OrderID: number;
  OrderDate: string;
  CompanyName: string;
  ContactName: string;
  totalAmount: number;
  orderStatus: string;
  paymentStatus: string;
}

export default function AdminOrders() {
  const { username } = useAuth();
  const router = useRouter();
  const [orders, setOrders] = useState<Order[]>([]);
  const [filteredOrders, setFilteredOrders] = useState<Order[]>([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [paymentFilter, setPaymentFilter] = useState("all");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [updatingOrder, setUpdatingOrder] = useState<number | null>(null);

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

      await loadOrders();
    } catch (err) {
      setError("Error verificando permisos de administrador");
      console.error(err);
    }
  };

  const loadOrders = async () => {
    try {
      setLoading(true);
      const ordersData = await getRecentOrders(100); // Cargar más órdenes
      setOrders(ordersData);
      setFilteredOrders(ordersData);
    } catch (err) {
      setError("Error cargando pedidos");
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handleSearch = (term: string) => {
    setSearchTerm(term);
    applyFilters(term, statusFilter, paymentFilter);
  };

  const handleStatusFilter = (status: string) => {
    setStatusFilter(status);
    applyFilters(searchTerm, status, paymentFilter);
  };

  const handlePaymentFilter = (payment: string) => {
    setPaymentFilter(payment);
    applyFilters(searchTerm, statusFilter, payment);
  };

  const applyFilters = (search: string, status: string, payment: string) => {
    let filtered = orders;

    // Aplicar filtro de búsqueda
    if (search) {
      filtered = filtered.filter(order =>
        order.OrderID.toString().includes(search) ||
        order.CompanyName.toLowerCase().includes(search.toLowerCase()) ||
        order.ContactName.toLowerCase().includes(search.toLowerCase())
      );
    }

    // Aplicar filtro de estado
    if (status !== 'all') {
      filtered = filtered.filter(order => order.orderStatus === status);
    }

    // Aplicar filtro de pago
    if (payment !== 'all') {
      filtered = filtered.filter(order => order.paymentStatus === payment);
    }

    setFilteredOrders(filtered);
  };

  const handleUpdateStatus = async (orderId: number, newStatus: string) => {
    try {
      setUpdatingOrder(orderId);
      await updateOrderStatus(orderId, newStatus, username, `Estado actualizado a ${newStatus}`);
      
      // Actualizar la lista local
      setOrders(prevOrders => 
        prevOrders.map(order => 
          order.OrderID === orderId 
            ? { ...order, orderStatus: newStatus }
            : order
        )
      );
      
      // Reaplicar filtros
      applyFilters(searchTerm, statusFilter, paymentFilter);
      
    } catch (err) {
      console.error("Error actualizando estado del pedido:", err);
      alert("Error al actualizar el estado del pedido");
    } finally {
      setUpdatingOrder(null);
    }
  };

  const getStatusBadgeVariant = (status: string) => {
    switch (status) {
      case 'shipped': return 'default';
      case 'processing': return 'secondary';
      case 'cancelled': return 'destructive';
      default: return 'outline';
    }
  };

  const getStatusLabel = (status: string) => {
    switch (status) {
      case 'shipped': return 'Enviado';
      case 'processing': return 'Procesando';
      case 'cancelled': return 'Cancelado';
      case 'pending': return 'Pendiente';
      default: return status;
    }
  };

  if (loading) {
    return (
      <div className="container mx-auto p-6">
        <div className="text-center py-12">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">Cargando pedidos...</p>
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
          <h1 className="text-3xl font-bold text-gray-900">Gestión de Pedidos</h1>
          <div className="flex gap-2">
            <Button onClick={loadOrders} variant="outline" size="sm">
              <RefreshCw className="w-4 h-4 mr-2" />
              Actualizar
            </Button>
            <Link href="/admin">
              <Button variant="outline">
                <ArrowLeft className="w-4 h-4 mr-2" />
                Volver al Panel
              </Button>
            </Link>
          </div>
        </div>
        <p className="text-gray-600">Gestiona todos los pedidos del sistema, cambia estados y gestiona envíos.</p>
      </div>

      {/* Filters */}
      <Card className="mb-6">
        <CardContent className="pt-6">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <div className="relative">
              <Search className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
              <Input
                placeholder="Buscar por ID, empresa o contacto..."
                value={searchTerm}
                onChange={(e) => handleSearch(e.target.value)}
                className="pl-10"
              />
            </div>
            
            <Select value={statusFilter} onValueChange={handleStatusFilter}>
              <SelectTrigger>
                <SelectValue placeholder="Filtrar por estado" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Todos los estados</SelectItem>
                <SelectItem value="pending">Pendiente</SelectItem>
                <SelectItem value="processing">Procesando</SelectItem>
                <SelectItem value="shipped">Enviado</SelectItem>
                <SelectItem value="cancelled">Cancelado</SelectItem>
              </SelectContent>
            </Select>

            <Select value={paymentFilter} onValueChange={handlePaymentFilter}>
              <SelectTrigger>
                <SelectValue placeholder="Filtrar por pago" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Todos los pagos</SelectItem>
                <SelectItem value="paid">Pagado</SelectItem>
                <SelectItem value="pending">Pendiente</SelectItem>
              </SelectContent>
            </Select>

            <div className="text-sm text-gray-600 flex items-center">
              <Filter className="w-4 h-4 mr-2" />
              {filteredOrders.length} de {orders.length} pedidos
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Orders Table */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Package className="w-5 h-5" />
            Lista de Pedidos
          </CardTitle>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Pedido ID</TableHead>
                <TableHead>Fecha</TableHead>
                <TableHead>Cliente</TableHead>
                <TableHead>Total</TableHead>
                <TableHead>Estado</TableHead>
                <TableHead>Pago</TableHead>
                <TableHead>Acciones</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredOrders.map((order) => (
                <TableRow key={order.OrderID}>
                  <TableCell className="font-medium">
                    <Link href={`/admin/orders/${order.OrderID}`} className="text-blue-600 hover:underline">
                      #{order.OrderID}
                    </Link>
                  </TableCell>
                  <TableCell>
                    {new Date(order.OrderDate).toLocaleDateString('es-ES')}
                  </TableCell>
                  <TableCell>
                    <div>
                      <p className="font-medium">{order.CompanyName}</p>
                      <p className="text-sm text-gray-600">{order.ContactName}</p>
                    </div>
                  </TableCell>
                  <TableCell className="font-semibold">
                    ${(order.totalAmount || 0).toFixed(2)}
                  </TableCell>
                  <TableCell>
                    <Select 
                      value={order.orderStatus || 'pending'} 
                      onValueChange={(value) => handleUpdateStatus(order.OrderID, value)}
                      disabled={updatingOrder === order.OrderID}
                    >
                      <SelectTrigger className="w-32">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="pending">Pendiente</SelectItem>
                        <SelectItem value="processing">Procesando</SelectItem>
                        <SelectItem value="shipped">Enviado</SelectItem>
                        <SelectItem value="cancelled">Cancelado</SelectItem>
                      </SelectContent>
                    </Select>
                  </TableCell>
                  <TableCell>
                    <Badge variant={order.paymentStatus === 'paid' ? 'default' : 'destructive'}>
                      {order.paymentStatus === 'paid' ? 'Pagado' : 'Pendiente'}
                    </Badge>
                  </TableCell>
                  <TableCell>
                    <div className="flex gap-2">
                      <Link href={`/admin/orders/${order.OrderID}`}>
                        <Button size="sm" variant="outline">
                          <Eye className="w-4 h-4" />
                        </Button>
                      </Link>
                      {order.paymentStatus === 'paid' && order.orderStatus !== 'shipped' && (
                        <Button 
                          size="sm" 
                          onClick={() => handleUpdateStatus(order.OrderID, 'shipped')}
                          disabled={updatingOrder === order.OrderID}
                        >
                          <Truck className="w-4 h-4" />
                        </Button>
                      )}
                    </div>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
          
          {filteredOrders.length === 0 && (
            <div className="text-center py-8">
              <Package className="w-12 h-12 text-gray-400 mx-auto mb-4" />
              <p className="text-gray-600">No se encontraron pedidos con los filtros aplicados.</p>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
} 