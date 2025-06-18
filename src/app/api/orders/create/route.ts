import { NextRequest, NextResponse } from 'next/server';
import { createOrder } from '@/lib/db/db';

export async function POST(request: NextRequest) {
  try {
    const { username, cestaId } = await request.json();

    if (!username || !cestaId) {
      return NextResponse.json(
        { error: 'Missing required fields' },
        { status: 400 }
      );
    }

    const result = await createOrder(username, cestaId);

    return NextResponse.json({ 
      success: true, 
      orderId: result.orderId,
      totalAmount: result.totalAmount
    });
  } catch (error) {
    console.error('Error creating order:', error);
    return NextResponse.json(
      { error: 'Failed to create order' },
      { status: 500 }
    );
  }
} 