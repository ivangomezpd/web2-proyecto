import { NextRequest, NextResponse } from 'next/server';
import { updateOrderStatus, isAdmin } from '@/lib/db/db';

export async function PUT(
  request: NextRequest,
  { params }: { params: { orderId: string } }
) {
  try {
    const { orderId } = params;
    const { status, username, notes } = await request.json();

    if (!username || !status) {
      return NextResponse.json(
        { error: 'Username and status are required' },
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

    await updateOrderStatus(parseInt(orderId), status, username, notes);

    return NextResponse.json({ 
      success: true, 
      message: 'Order status updated successfully' 
    });
  } catch (error) {
    console.error('Error updating order status:', error);
    return NextResponse.json(
      { error: 'Failed to update order status' },
      { status: 500 }
    );
  }
} 