import { NextRequest, NextResponse } from 'next/server';
import { getRecentOrders, isAdmin } from '@/lib/db/db';

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const limit = parseInt(searchParams.get('limit') || '100');
    const username = searchParams.get('username');

    if (!username) {
      return NextResponse.json(
        { error: 'Username is required' },
        { status: 400 }
      );
    }

    // Verificar si el usuario es admin
    const adminStatus = await isAdmin(username);
    if (!adminStatus) {
      return NextResponse.json(
        { error: 'Access denied. Admin privileges required.' },
        { status: 403 }
      );
    }

    const orders = await getRecentOrders(limit);

    return NextResponse.json({ 
      success: true, 
      orders 
    });
  } catch (error) {
    console.error('Error fetching orders:', error);
    return NextResponse.json(
      { error: 'Failed to fetch orders' },
      { status: 500 }
    );
  }
} 