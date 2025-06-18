"use client";

import { useEffect, useState } from "react";
import { useAuth } from "@/components/app/AuthContext";
import { getOrder } from "@/lib/db/db";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { CreditCard, Lock, Shield, ArrowLeft } from "lucide-react";
import { useParams, useRouter } from "next/navigation";
import RedsysPayment from "@/components/app/RedsysPayment";

interface OrderDetail {
  ProductID: number;
  ProductName: string;
  UnitPrice: number;
  Quantity: number;
  Discount: number;
}

interface Order {
  OrderID: number;
  OrderDate: string;
  RequiredDate: string;
  ShippedDate: string | null;
  ShipVia: number;
  Freight: number;
  ShipName: string;
  ShipAddress: string;
  ShipCity: string;
  ShipRegion: string | null;
  ShipPostalCode: string;
  ShipCountry: string;
  Details: OrderDetail[];
  TotalAmount: number;
}

export default function PaymentPage() {
  const params = useParams();
  const router = useRouter();
  const { username } = useAuth();
  const [order, setOrder] = useState<Order | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [paymentStatus, setPaymentStatus] = useState<'pending' | 'success' | 'error'>('pending');

  useEffect(() => {
    if (!username) {
      router.push('/login');
      return;
    }
    loadOrder();
  }, [username, params.orderId]);

  const loadOrder = async () => {
    try {
      setIsLoading(true);
      const orderData = await getOrder(params.orderId as string);
      setOrder(orderData);
    } catch (error) {
      console.error("Error loading order:", error);
      setPaymentStatus('error');
    } finally {
      setIsLoading(false);
    }
  };

  if (isLoading) {
    return (
      <div className="container mx-auto p-4">
        <div className="text-center py-12">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">Cargando información del pedido...</p>
        </div>
      </div>
    );
  }

  if (!username) {
    return (
      <div className="container mx-auto p-4">
        <div className="text-center py-12">
          <h2 className="text-2xl font-bold text-gray-700 mb-4">Acceso Requerido</h2>
          <p className="text-gray-500 mb-6">Necesitas iniciar sesión para acceder al pago</p>
          <Link href="/login">
            <Button>Iniciar Sesión</Button>
          </Link>
        </div>
      </div>
    );
  }

  if (!order) {
    return (
      <div className="container mx-auto p-4">
        <div className="text-center py-12">
          <h2 className="text-2xl font-bold text-gray-700 mb-4">Pedido No Encontrado</h2>
          <p className="text-gray-500 mb-6">El pedido solicitado no existe o no tienes permisos para acceder</p>
          <Link href="/products">
            <Button>Volver a Productos</Button>
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto p-4">
      {/* Header */}
      <div className="mb-6">
        <Link href={`/dashboard/${username}/orders/${order.OrderID}`}>
          <Button variant="ghost" className="mb-4">
            <ArrowLeft className="w-4 h-4 mr-2" />
            Volver al Pedido
          </Button>
        </Link>
        
        <div className="text-center">
          <h1 className="text-3xl font-bold text-gray-900">Pago Seguro</h1>
          <p className="text-gray-600 mt-1">Pedido #{order.OrderID} - ${order.TotalAmount.toFixed(2)}</p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Payment Form */}
        <div className="lg:col-span-2">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center">
                <CreditCard className="w-5 h-5 mr-2" />
                Información de Pago
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-6">
                {/* Security Notice */}
                <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                  <div className="flex items-start space-x-3">
                    <Lock className="w-5 h-5 text-blue-600 mt-0.5" />
                    <div>
                      <h3 className="font-medium text-blue-900">Pago Seguro</h3>
                      <p className="text-sm text-blue-700 mt-1">
                        Tu información de pago está protegida con encriptación SSL de 256 bits. 
                        Utilizamos Redsys, una de las pasarelas de pago más seguras de España.
                      </p>
                    </div>
                  </div>
                </div>

                {/* Redsys Payment Component */}
                <RedsysPayment 
                  orderId={order.OrderID.toString()}
                  amount={order.TotalAmount.toFixed(2)}
                  onSuccess={() => {
                    setPaymentStatus('success');
                    router.push(`/dashboard/${username}/orders/${order.OrderID}`);
                  }}
                  onError={() => setPaymentStatus('error')}
                />

                {/* Test Card Information */}
                <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
                  <h3 className="font-medium text-yellow-900 mb-2">Tarjeta de Prueba</h3>
                  <p className="text-sm text-yellow-700 mb-2">
                    Para probar el sistema de pago, usa estos datos:
                  </p>
                  <div className="text-sm text-yellow-800 space-y-1">
                    <p><strong>Número:</strong> 4548810000000003</p>
                    <p><strong>Caducidad:</strong> 12/29</p>
                    <p><strong>CVV:</strong> 123</p>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Order Summary */}
        <div className="lg:col-span-1">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center">
                <Shield className="w-5 h-5 mr-2" />
                Resumen del Pedido
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <p className="text-sm text-gray-600">Número de Pedido</p>
                <p className="font-medium">#{order.OrderID}</p>
              </div>
              
              <div>
                <p className="text-sm text-gray-600">Fecha</p>
                <p className="font-medium">
                  {new Date(order.OrderDate).toLocaleDateString('es-ES')}
                </p>
              </div>

              <div className="space-y-2">
                <p className="text-sm text-gray-600">Productos:</p>
                {order.Details.map((detail) => (
                  <div key={detail.ProductID} className="flex justify-between text-sm">
                    <span className="truncate">{detail.ProductName}</span>
                    <span>${(detail.UnitPrice * detail.Quantity * (1 - detail.Discount)).toFixed(2)}</span>
                  </div>
                ))}
              </div>
              
              <div className="border-t pt-4">
                <div className="flex justify-between font-bold text-lg">
                  <span>Total</span>
                  <span className="text-green-600">${order.TotalAmount.toFixed(2)}</span>
                </div>
              </div>

              <div className="text-center pt-4">
                <div className="flex items-center justify-center space-x-2 text-sm text-gray-500">
                  <Lock className="w-4 h-4" />
                  <span>Pago seguro con Redsys</span>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
} 