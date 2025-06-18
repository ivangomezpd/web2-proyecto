import { clsx, type ClassValue } from "clsx"
import { twMerge } from "tailwind-merge"
import crypto from 'crypto';

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

// Función mejorada para hash de contraseñas usando SHA-256 con salt
export async function hashPassword(password: string): Promise<string> {
  // Generar un salt único
  const salt = crypto.randomBytes(16).toString('hex');
  const encoder = new TextEncoder();
  const data = encoder.encode(password + salt);
  const hash = await crypto.createHash('sha256').update(data).digest();
  const hashHex = Array.from(new Uint8Array(hash))
    .map(b => b.toString(16).padStart(2, '0'))
    .join('');
  
  // Retornar hash + salt para almacenamiento
  return `${salt}:${hashHex}`;
}

// Función para verificar contraseña
export async function verifyPassword(password: string, hashedPassword: string): Promise<boolean> {
  const [salt, hash] = hashedPassword.split(':');
  const encoder = new TextEncoder();
  const data = encoder.encode(password + salt);
  const computedHash = await crypto.createHash('sha256').update(data).digest();
  const computedHashHex = Array.from(new Uint8Array(computedHash))
    .map(b => b.toString(16).padStart(2, '0'))
    .join('');
  
  return hash === computedHashHex;
}