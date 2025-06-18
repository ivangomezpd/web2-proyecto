"use client";

import { useEffect, useState } from "react";
import { useAuth } from "@/components/app/AuthContext";
import { getCesta } from "@/lib/db/db";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { createOrder } from "@/lib/db/db";
import { useParams, useRouter } from "next/navigation";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { ShoppingCart, Trash2, Plus, Minus, ArrowLeft } from "lucide-react";

interface CestaItem {
  productId: number;
  ProductName: string;
  cantidad: number;
  UnitPrice: number;
  UnitsInStock: number;
  Discontinued: number;
}

export default function Cesta() {
  const params = useParams();
  const router = useRouter();
  const { username, idCesta } = useAuth();
  const [cestaItems, setCestaItems] = useState<CestaItem[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isCreatingOrder, setIsCreatingOrder] = useState(false);

  useEffect(() => {
    loadCestaItems();
  }, [params.idCesta]);

  const loadCestaItems = async () => {
    try {
      setIsLoading(true);
      const items = await getCesta(params.idCesta as string);
      setCestaItems(items);
    } catch (error) {
      console.error("Error loading cart items:", error);
    } finally {
      setIsLoading(false);
    }
  };

  const updateQuantity = async (productId: number, newQuantity: number) => {
    try {
      await fetch('/api/cart/update', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          productId: productId.toString(),
          cestaId: idCesta.toString(),
          cantidad: newQuantity,
          username: username
        })
      });
      
      await loadCestaItems();
    } catch (error) {
      console.error('Error updating quantity:', error);
    }
  };

  const removeItem = async (productId: number) => {
    await updateQuantity(productId, 0);
  };

  const handleCreateOrder = async () => {
    if (!username) {
      router.push('/login');
      return;
    }

    // Redirect to checkout page
    router.push(`/cesta/${idCesta}/checkout`);
  };

  const totalItems = cestaItems.reduce((sum, item) => sum + item.cantidad, 0);
  const totalPrice = cestaItems.reduce((sum, item) => sum + (item.UnitPrice * item.cantidad), 0);

  if (isLoading) {
    return (
      <div className="container mx-auto p-4">
        <div className="text-center py-12">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">Cargando carrito...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto p-4">
      {/* Header */}
      <div className="mb-6">
        <Link href="/products">
          <Button variant="ghost" className="mb-4">
            <ArrowLeft className="w-4 h-4 mr-2" />
            Seguir Comprando
          </Button>
        </Link>
        
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">Tu Carrito</h1>
            <p className="text-gray-600 mt-1">
              {totalItems} producto{totalItems !== 1 ? 's' : ''} en tu carrito
            </p>
          </div>
          {totalItems > 0 && (
            <div className="text-right">
              <p className="text-sm text-gray-600">Total del carrito</p>
              <p className="text-2xl font-bold text-green-600">
                ${totalPrice.toFixed(2)}
              </p>
            </div>
          )}
        </div>
      </div>

      {/* Cart Content */}
      {cestaItems.length === 0 ? (
        <Card className="text-center py-12">
          <CardContent>
            <ShoppingCart className="w-16 h-16 text-gray-300 mx-auto mb-4" />
            <h2 className="text-xl font-semibold text-gray-700 mb-2">
              Tu carrito está vacío
            </h2>
            <p className="text-gray-500 mb-6">
              Añade algunos productos para empezar a comprar
            </p>
            <Link href="/products">
              <Button>
                Explorar Productos
              </Button>
            </Link>
          </CardContent>
        </Card>
      ) : (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Cart Items */}
          <div className="lg:col-span-2">
            <Card>
              <CardHeader>
                <CardTitle>Productos en el Carrito</CardTitle>
              </CardHeader>
              <CardContent>
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Producto</TableHead>
                      <TableHead>Precio</TableHead>
                      <TableHead>Cantidad</TableHead>
                      <TableHead>Total</TableHead>
                      <TableHead></TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {cestaItems.map((item) => (
                      <TableRow key={item.productId}>
                        <TableCell>
                          <div>
                            <Link 
                              href={`/product/${item.productId}`}
                              className="font-medium text-blue-600 hover:text-blue-800"
                            >
                              {item.ProductName}
                            </Link>
                            {item.Discontinued === 1 && (
                              <Badge variant="destructive" className="ml-2">
                                Descontinuado
                              </Badge>
                            )}
                          </div>
                        </TableCell>
                        <TableCell>${item.UnitPrice.toFixed(2)}</TableCell>
                        <TableCell>
                          <div className="flex items-center space-x-2">
                            <Button
                              variant="outline"
                              size="sm"
                              onClick={() => updateQuantity(item.productId, Math.max(0, item.cantidad - 1))}
                              disabled={item.cantidad <= 1}
                            >
                              <Minus className="w-3 h-3" />
                            </Button>
                            <span className="w-12 text-center">{item.cantidad}</span>
                            <Button
                              variant="outline"
                              size="sm"
                              onClick={() => updateQuantity(item.productId, item.cantidad + 1)}
                              disabled={item.cantidad >= item.UnitsInStock}
                            >
                              <Plus className="w-3 h-3" />
                            </Button>
                          </div>
                          {item.cantidad >= item.UnitsInStock && (
                            <p className="text-xs text-red-600 mt-1">
                              Stock máximo alcanzado
                            </p>
                          )}
                        </TableCell>
                        <TableCell className="font-medium">
                          ${(item.UnitPrice * item.cantidad).toFixed(2)}
                        </TableCell>
                        <TableCell>
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => removeItem(item.productId)}
                            className="text-red-500 hover:text-red-700"
                          >
                            <Trash2 className="w-4 h-4" />
                          </Button>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </CardContent>
            </Card>
          </div>

          {/* Order Summary */}
          <div className="lg:col-span-1">
            <Card>
              <CardHeader>
                <CardTitle>Resumen del Pedido</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-2">
                  {cestaItems.map((item) => (
                    <div key={item.productId} className="flex justify-between text-sm">
                      <span className="truncate">{item.ProductName}</span>
                      <span>${(item.UnitPrice * item.cantidad).toFixed(2)}</span>
                    </div>
                  ))}
                </div>
                
                <div className="border-t pt-4">
                  <div className="flex justify-between font-semibold text-lg">
                    <span>Total</span>
                    <span className="text-green-600">${totalPrice.toFixed(2)}</span>
                  </div>
                </div>

                <div className="space-y-2 pt-4">
                  <Button 
                    className="w-full" 
                    onClick={handleCreateOrder}
                    disabled={!username}
                  >
                    Proceder al Checkout
                  </Button>
                  
                  {!username && (
                    <p className="text-sm text-gray-500 text-center">
                      <Link href="/login" className="text-blue-600 hover:underline">
                        Inicia sesión
                      </Link> para proceder al pago
                    </p>
                  )}
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      )}
    </div>
  );
}
