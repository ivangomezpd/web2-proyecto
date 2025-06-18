"use server";

import jwt from 'jsonwebtoken';
import { getDb } from './db/db';

export async function verifyToken(token: string): Promise<{ valid: boolean; payload?: any; error?: string }> {
  try {
    const secret = process.env.JWT_SECRET;
    if (!secret) {
      throw new Error('JWT_SECRET is not defined in environment variables');
    }

    const payload = jwt.verify(token, secret) as any;
    
    // Verificar que el usuario sigue existiendo en la base de datos
    const db = await getDb();
    const user = await db.get('SELECT id, username FROM users WHERE id = ? AND username = ?', 
      [payload.id, payload.username]);
    
    if (!user) {
      return { valid: false, error: 'User no longer exists' };
    }

    return { valid: true, payload };
  } catch (error) {
    console.error('Error verifying token:', error);
    
    if (error instanceof jwt.TokenExpiredError) {
      return { valid: false, error: 'Token expired' };
    } else if (error instanceof jwt.JsonWebTokenError) {
      return { valid: false, error: 'Invalid token' };
    }
    
    return { valid: false, error: 'Token verification failed' };
  }
}
