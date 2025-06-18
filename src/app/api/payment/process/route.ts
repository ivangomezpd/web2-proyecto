import { NextRequest, NextResponse } from 'next/server';
import { getOrder, saveCobro } from '@/lib/db/db';

export async function POST(request: NextRequest) {
  try {
    const { orderId, amount, cardData } = await request.json();

    if (!orderId || !amount || !cardData) {
      return NextResponse.json(
        { error: 'Missing required fields' },
        { status: 400 }
      );
    }

    // Get order details
    const order = await getOrder(orderId);
    if (!order) {
      return NextResponse.json(
        { error: 'Order not found' },
        { status: 404 }
      );
    }

    // Validate amount
    if (parseFloat(amount) !== order.TotalAmount) {
      return NextResponse.json(
        { error: 'Amount mismatch' },
        { status: 400 }
      );
    }

    // Simulate Redsys payment processing
    // In a real implementation, this would call the Redsys API
    const paymentResult = await simulateRedsysPayment(cardData, amount);

    if (paymentResult.success) {
      // Save payment information
      const cobroId = await saveCobro(
        order.CustomerID,
        parseInt(orderId),
        parseFloat(amount),
        paymentResult.authorizationCode
      );

      return NextResponse.json({
        success: true,
        authorizationCode: paymentResult.authorizationCode,
        cobroId
      });
    } else {
      return NextResponse.json(
        { error: paymentResult.error },
        { status: 400 }
      );
    }
  } catch (error) {
    console.error('Error processing payment:', error);
    return NextResponse.json(
      { error: 'Failed to process payment' },
      { status: 500 }
    );
  }
}

async function simulateRedsysPayment(cardData: any, amount: string) {
  // Simulate network delay
  await new Promise(resolve => setTimeout(resolve, 2000));

  // Test card validation
  const testCardNumber = '4548810000000003';
  
  if (cardData.cardNumber === testCardNumber) {
    // Simulate successful payment
    const authorizationCode = generateAuthorizationCode();
    
    return {
      success: true,
      authorizationCode,
      message: 'Payment processed successfully'
    };
  } else {
    // Simulate failed payment
    return {
      success: false,
      error: 'Tarjeta rechazada. Por favor, verifica los datos e inténtalo de nuevo.'
    };
  }
}

function generateAuthorizationCode(): string {
  // Generate a random 6-digit authorization code
  return Math.floor(100000 + Math.random() * 900000).toString();
} 