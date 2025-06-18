import { NextRequest, NextResponse } from 'next/server';
import { getSalesAnalytics, isAdmin } from '@/lib/db/db';

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const timeFrame = searchParams.get('timeFrame') || 'month';
    const categoryId = searchParams.get('categoryId');
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

    const analytics = await getSalesAnalytics(timeFrame, categoryId);

    return NextResponse.json({ 
      success: true, 
      analytics 
    });
  } catch (error) {
    console.error('Error fetching analytics:', error);
    return NextResponse.json(
      { error: 'Failed to fetch analytics' },
      { status: 500 }
    );
  }
} 