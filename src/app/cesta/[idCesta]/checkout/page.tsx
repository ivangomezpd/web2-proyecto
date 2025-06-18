"use client";

import { useEffect, useState } from "react";
import { useAuth } from "@/components/app/AuthContext";
import { getCesta, getCustomer } from "@/lib/db/db";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { ArrowLeft, CreditCard, Shield, Truck } from "lucide-react";
import { useParams, useRouter } from "next/navigation";

interface CestaItem {
  productId: number;
  ProductName: string;
  cantidad: number;
  UnitPrice: number;
  UnitsInStock: number;
  Discontinued: number;
}

interface Customer {
  CustomerID: string;
  CompanyName: string;
  ContactName: string;
  ContactTitle: string;
  Address: string;
  City: string;
  Region: string | null;
  PostalCode: string;
  Country: string;
  Phone: string;
  Fax: string | null;
}

export default function CheckoutPage() {
  const params = useParams();
  const router = useRouter();
  const { username, idCesta } = useAuth();
  const [cestaItems, setCestaItems] = useState<CestaItem[]>([]);
  const [customer, setCustomer] = useState<Customer | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isProcessing, setIsProcessing] = useState(false);

  useEffect(() => {
    if (!username) {
      router.push('/login');
      return;
    }
    loadCheckoutData();
  }, [username, params.idCesta]);

  const loadCheckoutData = async () => {
    try {
      setIsLoading(true);
      const [items, customerData] = await Promise.all([
        getCesta(params.idCesta as string),
        getCustomer(username)
      ]);
      setCestaItems(items);
      setCustomer(customerData);
    } catch (error) {
      console.error("Error loading checkout data:", error);
    } finally {
      setIsLoading(false);
    }
  };

  const totalItems = cestaItems.reduce((sum, item) => sum + item.cantidad, 0);
  const subtotal = cestaItems.reduce((sum, item) => sum + (item.UnitPrice * item.cantidad), 0);
  const shipping = subtotal > 50 ? 0 : 5.99; // Envío gratis para pedidos > $50
  const total = subtotal + shipping;

  const handleProceedToPayment = async () => {
    if (!username || cestaItems.length === 0) return;

    try {
      setIsProcessing(true);
      
      // Create order first
      const response = await fetch('/api/orders/create', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          username,
          cestaId: idCesta.toString()
        })
      });

      if (!response.ok) {
        throw new Error('Failed to create order');
      }

      const { orderId } = await response.json();
      
      // Redirect to payment page
      router.push(`/payment/${orderId}`);
    } catch (error) {
      console.error("Error creating order:", error);
      alert("Error al procesar el pedido. Por favor, inténtalo de nuevo.");
    } finally {
      setIsProcessing(false);
    }
  };

  if (isLoading) {
    return (
      <div className="container mx-auto p-4">
        <div className="text-center py-12">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">Preparando checkout...</p>
        </div>
      </div>
    );
  }

  if (!username) {
    return (
      <div className="container mx-auto p-4">
        <div className="text-center py-12">
          <h2 className="text-2xl font-bold text-gray-700 mb-4">Acceso Requerido</h2>
          <p className="text-gray-500 mb-6">Necesitas iniciar sesión para proceder al pago</p>
          <Link href="/login">
            <Button>Iniciar Sesión</Button>
          </Link>
        </div>
      </div>
    );
  }

  if (cestaItems.length === 0) {
    return (
      <div className="container mx-auto p-4">
        <div className="text-center py-12">
          <h2 className="text-2xl font-bold text-gray-700 mb-4">Carrito Vacío</h2>
          <p className="text-gray-500 mb-6">No hay productos en tu carrito</p>
          <Link href="/products">
            <Button>Explorar Productos</Button>
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto p-4">
      {/* Header */}
      <div className="mb-6">
        <Link href={`/cesta/${idCesta}`}>
          <Button variant="ghost" className="mb-4">
            <ArrowLeft className="w-4 h-4 mr-2" />
            Volver al Carrito
          </Button>
        </Link>
        
        <div className="text-center">
          <h1 className="text-3xl font-bold text-gray-900">Checkout</h1>
          <p className="text-gray-600 mt-1">Completa tu compra de forma segura</p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Order Summary */}
        <div className="lg:col-span-2 space-y-6">
          {/* Customer Information */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center">
                <Shield className="w-5 h-5 mr-2" />
                Información del Cliente
              </CardTitle>
            </CardHeader>
            <CardContent>
              {customer && (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <p className="text-sm text-gray-600">Empresa</p>
                    <p className="font-medium">{customer.CompanyName}</p>
                  </div>
                  <div>
                    <p className="text-sm text-gray-600">Contacto</p>
                    <p className="font-medium">{customer.ContactName}</p>
                  </div>
                  <div>
                    <p className="text-sm text-gray-600">Dirección</p>
                    <p className="font-medium">{customer.Address}</p>
                    <p className="text-sm">{customer.City}, {customer.PostalCode}</p>
                  </div>
                  <div>
                    <p className="text-sm text-gray-600">Teléfono</p>
                    <p className="font-medium">{customer.Phone}</p>
                  </div>
                </div>
              )}
            </CardContent>
          </Card>

          {/* Order Items */}
          <Card>
            <CardHeader>
              <CardTitle>Productos del Pedido</CardTitle>
            </CardHeader>
            <CardContent>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Producto</TableHead>
                    <TableHead>Precio</TableHead>
                    <TableHead>Cantidad</TableHead>
                    <TableHead>Total</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {cestaItems.map((item) => (
                    <TableRow key={item.productId}>
                      <TableCell>
                        <div>
                          <p className="font-medium">{item.ProductName}</p>
                          {item.Discontinued === 1 && (
                            <Badge variant="destructive" className="text-xs">
                              Descontinuado
                            </Badge>
                          )}
                        </div>
                      </TableCell>
                      <TableCell>${item.UnitPrice.toFixed(2)}</TableCell>
                      <TableCell>{item.cantidad}</TableCell>
                      <TableCell className="font-medium">
                        ${(item.UnitPrice * item.cantidad).toFixed(2)}
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </CardContent>
          </Card>

          {/* Shipping Information */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center">
                <Truck className="w-5 h-5 mr-2" />
                Información de Envío
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <span>Envío estándar</span>
                  <span className={shipping === 0 ? "text-green-600 font-medium" : ""}>
                    {shipping === 0 ? "GRATIS" : `$${shipping.toFixed(2)}`}
                  </span>
                </div>
                {shipping === 0 && (
                  <p className="text-sm text-green-600">
                    ¡Envío gratis en pedidos superiores a $50!
                  </p>
                )}
                <p className="text-sm text-gray-600">
                  Tiempo estimado de entrega: 3-5 días hábiles
                </p>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Payment Summary */}
        <div className="lg:col-span-1">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center">
                <CreditCard className="w-5 h-5 mr-2" />
                Resumen del Pago
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <div className="flex justify-between">
                  <span>Subtotal ({totalItems} productos)</span>
                  <span>${subtotal.toFixed(2)}</span>
                </div>
                <div className="flex justify-between">
                  <span>Envío</span>
                  <span className={shipping === 0 ? "text-green-600" : ""}>
                    {shipping === 0 ? "GRATIS" : `$${shipping.toFixed(2)}`}
                  </span>
                </div>
              </div>
              
              <div className="border-t pt-4">
                <div className="flex justify-between font-bold text-lg">
                  <span>Total</span>
                  <span className="text-green-600">${total.toFixed(2)}</span>
                </div>
              </div>

              <div className="space-y-3 pt-4">
                <Button 
                  className="w-full" 
                  onClick={handleProceedToPayment}
                  disabled={isProcessing}
                  size="lg"
                >
                  {isProcessing ? 'Procesando...' : 'Proceder al Pago'}
                </Button>
                
                <div className="text-center">
                  <p className="text-xs text-gray-500">
                    Pago seguro procesado por Redsys
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
} 