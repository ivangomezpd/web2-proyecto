"use client";

import { useEffect, useState } from "react";
import { useAuth } from "@/components/app/AuthContext";
import { useRouter } from "next/navigation";
import { isAdmin, getAllCustomers, getCustomerOrders } from "@/lib/db/db";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { 
  Users, 
  Search, 
  Eye, 
  ShoppingCart,
  DollarSign,
  Calendar,
  ArrowLeft
} from "lucide-react";
import Link from "next/link";

interface Customer {
  CustomerID: string;
  CompanyName: string;
  ContactName: string;
  ContactTitle: string;
  Address: string;
  City: string;
  Country: string;
  Phone: string;
  totalOrders: number;
  totalSpent: number;
}

interface CustomerOrder {
  OrderID: number;
  OrderDate: string;
  totalAmount: number;
  orderStatus: string;
  paymentStatus: string;
}

export default function AdminCustomers() {
  const { username } = useAuth();
  const router = useRouter();
  const [customers, setCustomers] = useState<Customer[]>([]);
  const [filteredCustomers, setFilteredCustomers] = useState<Customer[]>([]);
  const [selectedCustomer, setSelectedCustomer] = useState<Customer | null>(null);
  const [customerOrders, setCustomerOrders] = useState<CustomerOrder[]>([]);
  const [searchTerm, setSearchTerm] = useState("");
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

      await loadCustomers();
    } catch (err) {
      setError("Error verificando permisos de administrador");
      console.error(err);
    }
  };

  const loadCustomers = async () => {
    try {
      setLoading(true);
      const customersData = await getAllCustomers();
      setCustomers(customersData);
      setFilteredCustomers(customersData);
    } catch (err) {
      setError("Error cargando clientes");
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const loadCustomerOrders = async (customerId: string) => {
    try {
      const orders = await getCustomerOrders(customerId);
      setCustomerOrders(orders);
    } catch (err) {
      console.error("Error cargando órdenes del cliente:", err);
    }
  };

  const handleSearch = (term: string) => {
    setSearchTerm(term);
    const filtered = customers.filter(customer =>
      customer.CompanyName.toLowerCase().includes(term.toLowerCase()) ||
      customer.ContactName.toLowerCase().includes(term.toLowerCase()) ||
      customer.CustomerID.toLowerCase().includes(term.toLowerCase())
    );
    setFilteredCustomers(filtered);
  };

  const handleViewCustomer = async (customer: Customer) => {
    setSelectedCustomer(customer);
    await loadCustomerOrders(customer.CustomerID);
  };

  const handleBackToList = () => {
    setSelectedCustomer(null);
    setCustomerOrders([]);
  };

  if (loading) {
    return (
      <div className="container mx-auto p-6">
        <div className="text-center py-12">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">Cargando clientes...</p>
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

  if (selectedCustomer) {
    return (
      <div className="container mx-auto p-6">
        {/* Header */}
        <div className="mb-6">
          <Button onClick={handleBackToList} variant="outline" className="mb-4">
            <ArrowLeft className="w-4 h-4 mr-2" />
            Volver a la Lista
          </Button>
          <h1 className="text-3xl font-bold text-gray-900">Detalles del Cliente</h1>
        </div>

        {/* Customer Info */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Users className="w-5 h-5" />
                Información del Cliente
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <label className="text-sm font-medium text-gray-600">ID de Cliente</label>
                <p className="font-semibold">{selectedCustomer.CustomerID}</p>
              </div>
              <div>
                <label className="text-sm font-medium text-gray-600">Empresa</label>
                <p className="font-semibold">{selectedCustomer.CompanyName}</p>
              </div>
              <div>
                <label className="text-sm font-medium text-gray-600">Contacto</label>
                <p className="font-semibold">{selectedCustomer.ContactName}</p>
              </div>
              <div>
                <label className="text-sm font-medium text-gray-600">Cargo</label>
                <p className="font-semibold">{selectedCustomer.ContactTitle}</p>
              </div>
              <div>
                <label className="text-sm font-medium text-gray-600">Teléfono</label>
                <p className="font-semibold">{selectedCustomer.Phone}</p>
              </div>
              <div>
                <label className="text-sm font-medium text-gray-600">Dirección</label>
                <p className="font-semibold">{selectedCustomer.Address}</p>
                <p className="text-sm text-gray-600">{selectedCustomer.City}, {selectedCustomer.Country}</p>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <ShoppingCart className="w-5 h-5" />
                Estadísticas de Compras
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div className="text-center p-4 bg-blue-50 rounded-lg">
                  <div className="text-2xl font-bold text-blue-600">{selectedCustomer.totalOrders}</div>
                  <div className="text-sm text-gray-600">Total Pedidos</div>
                </div>
                <div className="text-center p-4 bg-green-50 rounded-lg">
                  <div className="text-2xl font-bold text-green-600">${(selectedCustomer.totalSpent || 0).toFixed(2)}</div>
                  <div className="text-sm text-gray-600">Total Gastado</div>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Customer Orders */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Calendar className="w-5 h-5" />
              Historial de Pedidos
            </CardTitle>
          </CardHeader>
          <CardContent>
            {customerOrders.length > 0 ? (
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Pedido ID</TableHead>
                    <TableHead>Fecha</TableHead>
                    <TableHead>Total</TableHead>
                    <TableHead>Estado</TableHead>
                    <TableHead>Pago</TableHead>
                    <TableHead>Acciones</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {customerOrders.map((order) => (
                    <TableRow key={order.OrderID}>
                      <TableCell>
                        <Link href={`/dashboard/${selectedCustomer.CustomerID}/orders/${order.OrderID}`} className="text-blue-600 hover:underline">
                          #{order.OrderID}
                        </Link>
                      </TableCell>
                      <TableCell>
                        {new Date(order.OrderDate).toLocaleDateString('es-ES')}
                      </TableCell>
                      <TableCell className="font-semibold">
                        ${(order.totalAmount || 0).toFixed(2)}
                      </TableCell>
                      <TableCell>
                        <Badge variant={order.orderStatus === 'shipped' ? 'default' : 'secondary'}>
                          {order.orderStatus === 'shipped' ? 'Enviado' : 'Pendiente'}
                        </Badge>
                      </TableCell>
                      <TableCell>
                        <Badge variant={order.paymentStatus === 'paid' ? 'default' : 'destructive'}>
                          {order.paymentStatus === 'paid' ? 'Pagado' : 'Pendiente'}
                        </Badge>
                      </TableCell>
                      <TableCell>
                        <Link href={`/admin/orders/${order.OrderID}`}>
                          <Button size="sm" variant="outline">
                            <Eye className="w-4 h-4" />
                          </Button>
                        </Link>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            ) : (
              <div className="text-center py-8">
                <ShoppingCart className="w-12 h-12 text-gray-400 mx-auto mb-4" />
                <p className="text-gray-600">Este cliente no tiene pedidos registrados.</p>
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="container mx-auto p-6">
      {/* Header */}
      <div className="mb-8">
        <div className="flex items-center justify-between mb-4">
          <h1 className="text-3xl font-bold text-gray-900">Gestión de Clientes</h1>
          <Link href="/admin">
            <Button variant="outline">
              <ArrowLeft className="w-4 h-4 mr-2" />
              Volver al Panel
            </Button>
          </Link>
        </div>
        <p className="text-gray-600">Gestiona y consulta información de todos los clientes del sistema.</p>
      </div>

      {/* Search */}
      <Card className="mb-6">
        <CardContent className="pt-6">
          <div className="relative">
            <Search className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
            <Input
              placeholder="Buscar por empresa, contacto o ID de cliente..."
              value={searchTerm}
              onChange={(e) => handleSearch(e.target.value)}
              className="pl-10"
            />
          </div>
        </CardContent>
      </Card>

      {/* Customers Table */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Users className="w-5 h-5" />
            Lista de Clientes ({filteredCustomers.length})
          </CardTitle>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>ID Cliente</TableHead>
                <TableHead>Empresa</TableHead>
                <TableHead>Contacto</TableHead>
                <TableHead>Pedidos</TableHead>
                <TableHead>Total Gastado</TableHead>
                <TableHead>Acciones</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredCustomers.map((customer) => (
                <TableRow key={customer.CustomerID}>
                  <TableCell className="font-medium">{customer.CustomerID}</TableCell>
                  <TableCell>{customer.CompanyName}</TableCell>
                  <TableCell>{customer.ContactName}</TableCell>
                  <TableCell>
                    <Badge variant="outline">{customer.totalOrders}</Badge>
                  </TableCell>
                  <TableCell className="font-semibold">
                    ${(customer.totalSpent || 0).toFixed(2)}
                  </TableCell>
                  <TableCell>
                    <Button 
                      size="sm" 
                      onClick={() => handleViewCustomer(customer)}
                    >
                      <Eye className="w-4 h-4 mr-2" />
                      Ver Detalles
                    </Button>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </div>
  );
} 