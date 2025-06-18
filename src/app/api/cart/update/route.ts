import { NextRequest, NextResponse } from 'next/server';
import { cesta } from '@/lib/db/db';

export async function POST(request: NextRequest) {
  try {
    const { productId, cestaId, cantidad, username } = await request.json();

    if (!productId || !cestaId || cantidad === undefined) {
      return NextResponse.json(
        { error: 'Missing required fields' },
        { status: 400 }
      );
    }

    await cesta(productId, cestaId, username || '', cantidad);

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Error updating cart:', error);
    return NextResponse.json(
      { error: 'Failed to update cart' },
      { status: 500 }
    );
  }
} 