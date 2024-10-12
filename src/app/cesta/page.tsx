"use client";

import { useEffect, useState } from "react";
import { useAuth } from "@/components/app/AuthContext";
import { getCesta } from "@/lib/db/db";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { createOrder } from "@/lib/db/db";
import { Redsys } from "@/components/app/Redsys";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

interface CestaItem {
  productId: number;
  ProductName: string;
  cantidad: number;
}

export default function Cesta() {
  const { idCesta } = useAuth();
  const { isLoggedIn, username } = useAuth();
  const [cestaItems, setCestaItems] = useState<CestaItem[]>([]);
  const [error, setError] = useState<string | null>(null);
  const [order, setOrder] = useState<{
    orderId: string;
    totalAmount: number;
  } | null>(null);

  useEffect(() => {
    async function fetchCesta() {
      try {
        const items = await getCesta(idCesta.toString());
        setCestaItems(items);
      } catch (err) {
        setError("Error al cargar la cesta");
        console.error(err);
      }
    }

    fetchCesta();
  }, [idCesta]);

  if (error) {
    return <div className="text-red-500">{error}</div>;
  }

  const handleConfirmOrder = async () => {
    const { orderId, totalAmount } = await createOrder(
      username,
      idCesta.toString()
    );
    setOrder({ orderId, totalAmount });
  };

  return (
    <div className="container mx-auto p-4">
      <h1 className="text-2xl font-bold mb-4">Tu Cesta

    

      </h1>
      {cestaItems.length === 0 ? (
        <p>Tu cesta está vacía</p>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {cestaItems.map((item) => (
            <Card key={item.productId}>
              <CardHeader>
                <CardTitle>
                  <Link
                    href={`/product/${item.productId}?cantidad=${item.cantidad}`}
                  >
                    {item.ProductName}
                  </Link>
                </CardTitle>
              </CardHeader>
              <CardContent>
                <p>ID del Producto: {item.productId}</p>
                <p>Cantidad: {item.cantidad}</p>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
      <div className="mt-4">
        <Link href="/products" className="text-blue-500 hover:underline">
          Seguir comprando
        </Link>
      </div>
      {cestaItems.length > 0 && (
        <div className="mt-6">
          {!isLoggedIn ? (
            <div
              className="bg-yellow-100 border-l-4 border-yellow-500 text-yellow-700 p-4"
              role="alert"
            >
              <p className="font-bold">Atención</p>
              <p>
                Para confirmar pedido y pagar, es necesario autenticarse
                primero.
              </p>
            </div>  
          ) : (
            <>
              <Button onClick={handleConfirmOrder} className="mt-4">
                Confirmar Pedido
              </Button>
             
               {order && <div className="mt-6">
                  <Link href={`/dashboard/${username}/orders/${order?.orderId}`}>Ver mi pedido</Link>
                  {/* {order && <Redsys amount={order.totalAmount} orderId={order.orderId} />} */}
                </div>}
             
            </>
          )}
        </div>
      )}
    </div>
  );
}
