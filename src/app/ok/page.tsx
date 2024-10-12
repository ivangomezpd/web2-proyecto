'use client';

import { useSearchParams } from 'next/navigation';
import Link from 'next/link';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { useEffect, useState } from 'react';
import { saveCobro } from '@/lib/db/db';

export default function PaymentSuccess() {
  const searchParams = useSearchParams();
  const amount = searchParams.get('amount');
  const orderId = searchParams.get('orderId');
  const customerId = searchParams.get('customerId');
  
  const dsMerchantParameters = JSON.parse(atob(decodeURIComponent(searchParams.get('Ds_MerchantParameters') || '')));

  const [message, setMessage] = useState<{ type: 'success' | 'error', text: string } | null>(null);

  useEffect(() => {
    if (amount && orderId && customerId) {
      saveCobro(customerId, parseInt(orderId), parseFloat(amount) / 100, dsMerchantParameters.Ds_AuthorisationCode)
        .then(() => {
          setMessage({ type: 'success', text: 'Cobro guardado exitosamente' });
        })
        .catch((error: unknown) => {
          setMessage({ type: 'error', text: `Error al guardar el cobro: ${error instanceof Error ? error.message : 'Desconocido'}` });
        });
    }
  }, [amount, orderId, customerId, dsMerchantParameters.Ds_AuthorisationCode]);

  return (
    <div className="container mx-auto p-4">
      <Card className="w-full max-w-md mx-auto">
        <CardHeader>
          <CardTitle className="text-2xl font-bold text-green-600">¡Pago Exitoso!.

            Autorizaacion: {dsMerchantParameters.Ds_AuthorisationCode}
          </CardTitle>
        </CardHeader>
        <CardContent>
          <p className="mb-4">Tu pago se ha procesado correctamente.</p>
          {message && <p className={`mb-4 ${message.type === 'success' ? 'text-green-600' : 'text-red-600'}`}>{message.text}</p>}
          {amount && (
            <p className="mb-2">
              <span className="font-semibold">Cantidad pagada:</span> {parseFloat(amount) / 100} €
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
            Gracias por tu compra. Recibirás un correo electrónico con los detalles de tu pedido.
          </p>
        </CardContent>
      </Card>
    </div>
  );
}
