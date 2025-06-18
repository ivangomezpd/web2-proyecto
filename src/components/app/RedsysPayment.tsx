'use client';

import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent } from '@/components/ui/card';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { CreditCard, Lock, AlertCircle } from 'lucide-react';

interface RedsysPaymentProps {
  orderId: string;
  amount: string;
  onSuccess: () => void;
  onError: () => void;
}

export default function RedsysPayment({ orderId, amount, onSuccess, onError }: RedsysPaymentProps) {
  const [isProcessing, setIsProcessing] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [formData, setFormData] = useState({
    cardNumber: '',
    expiryMonth: '',
    expiryYear: '',
    cvv: '',
    cardholderName: ''
  });

  const handleInputChange = (field: string, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  const formatCardNumber = (value: string) => {
    const v = value.replace(/\s+/g, '').replace(/[^0-9]/gi, '');
    const matches = v.match(/\d{4,16}/g);
    const match = matches && matches[0] || '';
    const parts = [];
    for (let i = 0, len = match.length; i < len; i += 4) {
      parts.push(match.substring(i, i + 4));
    }
    if (parts.length) {
      return parts.join(' ');
    } else {
      return v;
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setIsProcessing(true);

    try {
      // Simulate Redsys payment processing
      const response = await fetch('/api/payment/process', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          orderId,
          amount,
          cardData: {
            ...formData,
            cardNumber: formData.cardNumber.replace(/\s/g, '')
          }
        })
      });

      const result = await response.json();

      if (result.success) {
        onSuccess();
      } else {
        setError(result.error || 'Error al procesar el pago');
        onError();
      }
    } catch (error) {
      setError('Error de conexión. Por favor, inténtalo de nuevo.');
      onError();
    } finally {
      setIsProcessing(false);
    }
  };

  const isFormValid = () => {
    return (
      formData.cardNumber.replace(/\s/g, '').length >= 13 &&
      formData.expiryMonth &&
      formData.expiryYear &&
      formData.cvv.length >= 3 &&
      formData.cardholderName.trim().length > 0
    );
  };

  return (
    <div className="space-y-6">
      <form onSubmit={handleSubmit} className="space-y-4">
        {/* Card Number */}
        <div className="space-y-2">
          <Label htmlFor="cardNumber">Número de Tarjeta</Label>
          <div className="relative">
            <Input
              id="cardNumber"
              type="text"
              placeholder="1234 5678 9012 3456"
              value={formData.cardNumber}
              onChange={(e) => handleInputChange('cardNumber', formatCardNumber(e.target.value))}
              maxLength={19}
              className="pl-10"
              required
            />
            <CreditCard className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
          </div>
        </div>

        {/* Cardholder Name */}
        <div className="space-y-2">
          <Label htmlFor="cardholderName">Nombre del Titular</Label>
          <Input
            id="cardholderName"
            type="text"
            placeholder="NOMBRE APELLIDOS"
            value={formData.cardholderName}
            onChange={(e) => handleInputChange('cardholderName', e.target.value.toUpperCase())}
            required
          />
        </div>

        {/* Expiry and CVV */}
        <div className="grid grid-cols-3 gap-4">
          <div className="space-y-2">
            <Label htmlFor="expiryMonth">Mes</Label>
            <select
              id="expiryMonth"
              value={formData.expiryMonth}
              onChange={(e) => handleInputChange('expiryMonth', e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              required
            >
              <option value="">MM</option>
              {Array.from({ length: 12 }, (_, i) => i + 1).map(month => (
                <option key={month} value={month.toString().padStart(2, '0')}>
                  {month.toString().padStart(2, '0')}
                </option>
              ))}
            </select>
          </div>

          <div className="space-y-2">
            <Label htmlFor="expiryYear">Año</Label>
            <select
              id="expiryYear"
              value={formData.expiryYear}
              onChange={(e) => handleInputChange('expiryYear', e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              required
            >
              <option value="">YY</option>
              {Array.from({ length: 10 }, (_, i) => new Date().getFullYear() + i).map(year => (
                <option key={year} value={year.toString().slice(-2)}>
                  {year.toString().slice(-2)}
                </option>
              ))}
            </select>
          </div>

          <div className="space-y-2">
            <Label htmlFor="cvv">CVV</Label>
            <Input
              id="cvv"
              type="text"
              placeholder="123"
              value={formData.cvv}
              onChange={(e) => handleInputChange('cvv', e.target.value.replace(/\D/g, ''))}
              maxLength={4}
              required
            />
          </div>
        </div>

        {/* Error Message */}
        {error && (
          <Alert variant="destructive">
            <AlertCircle className="h-4 w-4" />
            <AlertDescription>{error}</AlertDescription>
          </Alert>
        )}

        {/* Submit Button */}
        <Button
          type="submit"
          className="w-full"
          disabled={!isFormValid() || isProcessing}
          size="lg"
        >
          {isProcessing ? (
            <div className="flex items-center space-x-2">
              <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
              <span>Procesando Pago...</span>
            </div>
          ) : (
            <div className="flex items-center space-x-2">
              <Lock className="w-4 h-4" />
              <span>Pagar ${amount}</span>
            </div>
          )}
        </Button>
      </form>

      {/* Security Notice */}
      <Card className="bg-gray-50">
        <CardContent className="p-4">
          <div className="flex items-start space-x-3">
            <Lock className="w-5 h-5 text-green-600 mt-0.5" />
            <div>
              <h3 className="font-medium text-gray-900">Pago Seguro</h3>
              <p className="text-sm text-gray-600 mt-1">
                Tus datos están protegidos con encriptación SSL. 
                Nunca almacenamos información de tu tarjeta de crédito.
              </p>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
} 