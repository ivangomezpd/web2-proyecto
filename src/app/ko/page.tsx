"use client";
import Link from "next/link";
import { useSearchParams } from "next/navigation";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";

export default function PaymentFailed() {
  const searchParams = useSearchParams();
  const orderId = searchParams.get("orderId");
  const amount = searchParams.get("amount");
  const customerId = searchParams.get("customerId");

  return (
    <div className="container mx-auto p-4">
      <Card className="w-full max-w-md mx-auto">
        <CardHeader>
          <CardTitle className="text-2xl font-bold text-red-600">
            Pago Fallido
          </CardTitle>
        </CardHeader>
        <CardContent>
          <p className="mb-4">
            Lo sentimos, tu pago no se ha podido procesar correctamente.
          </p>
          {amount && (
            <p className="mb-2">
              <span className="font-semibold">
                Cantidad del intento de pago:
              </span>{" "}
              {parseFloat(amount) / 100} €
            </p>
          )}
          {orderId && (
            <p className="mb-2">
              <span className="font-semibold">ID de la cesta:</span>
              <Link href={`/dashboard/${customerId}/orders/${orderId}`}>
                {orderId}
              </Link>
            </p>
          )}
          <p className="mt-4 text-sm text-gray-600">
            Por favor, intenta realizar el pago nuevamente o contacta con
            nuestro servicio de atención al cliente si el problema persiste.
          </p>
        </CardContent>
      </Card>
    </div>
  );
}
