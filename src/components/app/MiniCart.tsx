'use client';

import { useState, useEffect } from 'react';
import { useAuth } from '@/components/app/AuthContext';
import { getCesta } from '@/lib/db/db';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { ShoppingCart, X, Trash2 } from 'lucide-react';
import Link from 'next/link';

interface CartItem {
  productId: number;
  cantidad: number;
  ProductName: string;
  UnitPrice: number;
  UnitsInStock: number;
  Discontinued: number;
}

export default function MiniCart() {
  const { idCesta } = useAuth();
  const [cartItems, setCartItems] = useState<CartItem[]>([]);
  const [isOpen, setIsOpen] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    if (idCesta) {
      loadCartItems();
    }
  }, [idCesta]);

  const loadCartItems = async () => {
    try {
      setIsLoading(true);
      const items = await getCesta(idCesta.toString());
      setCartItems(items);
    } catch (error) {
      console.error('Error loading cart items:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const totalItems = cartItems.reduce((sum, item) => sum + item.cantidad, 0);
  const totalPrice = cartItems.reduce((sum, item) => sum + (item.UnitPrice * item.cantidad), 0);

  const handleRemoveItem = async (productId: number) => {
    try {
      // Update quantity to 0 to remove item
      await fetch('/api/cart/update', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          productId: productId.toString(),
          cestaId: idCesta.toString(),
          cantidad: 0
        })
      });
      
      // Reload cart items
      await loadCartItems();
    } catch (error) {
      console.error('Error removing item:', error);
    }
  };

  return (
    <div className="relative">
      {/* Cart Button */}
      <Button
        variant="ghost"
        size="sm"
        onClick={() => setIsOpen(!isOpen)}
        className="relative"
      >
        <ShoppingCart className="w-5 h-5" />
        {totalItems > 0 && (
          <Badge 
            variant="destructive" 
            className="absolute -top-2 -right-2 h-5 w-5 rounded-full p-0 flex items-center justify-center text-xs"
          >
            {totalItems > 99 ? '99+' : totalItems}
          </Badge>
        )}
      </Button>

      {/* Dropdown */}
      {isOpen && (
        <div className="absolute right-0 top-full mt-2 w-80 bg-white rounded-lg shadow-lg border z-50">
          <Card>
            <CardContent className="p-4">
              {/* Header */}
              <div className="flex items-center justify-between mb-4">
                <h3 className="font-semibold text-gray-900">Tu Carrito</h3>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => setIsOpen(false)}
                >
                  <X className="w-4 h-4" />
                </Button>
              </div>

              {/* Cart Items */}
              {isLoading ? (
                <div className="text-center py-4">
                  <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-blue-600 mx-auto"></div>
                </div>
              ) : cartItems.length === 0 ? (
                <div className="text-center py-6">
                  <ShoppingCart className="w-12 h-12 text-gray-300 mx-auto mb-2" />
                  <p className="text-gray-500">Tu carrito está vacío</p>
                </div>
              ) : (
                <div className="space-y-3 max-h-64 overflow-y-auto">
                  {cartItems.map((item) => (
                    <div key={item.productId} className="flex items-center space-x-3 p-2 rounded-lg hover:bg-gray-50">
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-medium text-gray-900 truncate">
                          {item.ProductName}
                        </p>
                        <p className="text-xs text-gray-500">
                          Cantidad: {item.cantidad} × ${item.UnitPrice.toFixed(2)}
                        </p>
                      </div>
                      <div className="text-right">
                        <p className="text-sm font-medium text-gray-900">
                          ${(item.UnitPrice * item.cantidad).toFixed(2)}
                        </p>
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => handleRemoveItem(item.productId)}
                          className="h-6 w-6 p-0 text-red-500 hover:text-red-700"
                        >
                          <Trash2 className="w-3 h-3" />
                        </Button>
                      </div>
                    </div>
                  ))}
                </div>
              )}

              {/* Footer */}
              {cartItems.length > 0 && (
                <div className="border-t pt-4 mt-4">
                  <div className="flex items-center justify-between mb-3">
                    <span className="font-semibold text-gray-900">Total:</span>
                    <span className="font-bold text-lg text-green-600">
                      ${totalPrice.toFixed(2)}
                    </span>
                  </div>
                  <div className="space-y-2">
                    <Link href={`/cesta/${idCesta}`}>
                      <Button className="w-full" onClick={() => setIsOpen(false)}>
                        Ver Carrito Completo
                      </Button>
                    </Link>
                    <Link href={`/cesta/${idCesta}/checkout`}>
                      <Button variant="outline" className="w-full" onClick={() => setIsOpen(false)}>
                        Proceder al Pago
                      </Button>
                    </Link>
                  </div>
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      )}

      {/* Backdrop */}
      {isOpen && (
        <div 
          className="fixed inset-0 z-40" 
          onClick={() => setIsOpen(false)}
        />
      )}
    </div>
  );
} 