/**
 * Authentication and authorization utilities
 * Handles JWT tokens, user sessions, and permission checks
 */

import crypto from 'crypto';

export interface AuthToken {
  userId: string;
  username: string;
  role: 'user' | 'admin' | 'manager';
  issuedAt: number;
  expiresAt: number;
}

export interface AuthRequest {
  user?: AuthToken;
  token?: string;
}

/**
 * Generates a JWT token (simplified version)
 * In production, use professional JWT libraries like jsonwebtoken
 */
export function generateToken(payload: Omit<AuthToken, 'issuedAt' | 'expiresAt'>, expiresIn: number = 3600): string {
  const header = Buffer.from(JSON.stringify({ alg: 'HS256', typ: 'JWT' })).toString('base64url');

  const now = Math.floor(Date.now() / 1000);
  const tokenPayload: AuthToken = {
    ...payload,
    issuedAt: now,
    expiresAt: now + expiresIn,
  };

  const payload64 = Buffer.from(JSON.stringify(tokenPayload)).toString('base64url');

  const secret = process.env.JWT_SECRET || 'default-dev-secret-not-for-production';
  const signature = crypto
    .createHmac('sha256', secret)
    .update(`${header}.${payload64}`)
    .digest('base64url');

  return `${header}.${payload64}.${signature}`;
}

/**
 * Verifies a JWT token
 */
export function verifyToken(token: string): { valid: boolean; payload?: AuthToken; error?: string } {
  try {
    const parts = token.split('.');
    if (parts.length !== 3) {
      return { valid: false, error: 'Invalid token format' };
    }

    const [header64, payload64, signature] = parts;
    const secret = process.env.JWT_SECRET || 'default-dev-secret-not-for-production';

    // Verify signature
    const expectedSignature = crypto
      .createHmac('sha256', secret)
      .update(`${header64}.${payload64}`)
      .digest('base64url');

    if (signature !== expectedSignature) {
      return { valid: false, error: 'Invalid token signature' };
    }

    // Decode payload
    const payloadJson = Buffer.from(payload64, 'base64url').toString('utf-8');
    const payload: AuthToken = JSON.parse(payloadJson);

    // Check expiration
    const now = Math.floor(Date.now() / 1000);
    if (payload.expiresAt < now) {
      return { valid: false, error: 'Token has expired' };
    }

    return { valid: true, payload };
  } catch (error) {
    return { valid: false, error: error instanceof Error ? error.message : 'Token verification failed' };
  }
}

/**
 * Checks if user has required role
 */
export function hasRole(user: AuthToken | undefined, requiredRole: string): boolean {
  if (!user) return false;

  const roleHierarchy: Record<string, number> = {
    user: 1,
    manager: 2,
    admin: 3,
  };

  return roleHierarchy[user.role] >= roleHierarchy[requiredRole];
}

/**
 * Checks if user has any of the required roles
 */
export function hasAnyRole(user: AuthToken | undefined, requiredRoles: string[]): boolean {
  if (!user) return false;
  return requiredRoles.some((role) => hasRole(user, role));
}

/**
 * Generates a secure random token (for password reset, email verification, etc)
 */
export function generateSecureToken(length: number = 32): string {
  return crypto.randomBytes(length).toString('hex');
}

/**
 * Hashes a password using PBKDF2
 * Note: In production, use bcrypt or argon2
 */
export function hashPassword(password: string, salt: string = crypto.randomBytes(16).toString('hex')): { hash: string; salt: string } {
  const hash = crypto.pbkdf2Sync(password, salt, 100000, 64, 'sha512').toString('hex');
  return { hash, salt };
}

/**
 * Verifies a password against its hash
 */
export function verifyPassword(password: string, hash: string, salt: string): boolean {
  const { hash: computedHash } = hashPassword(password, salt);
  return computedHash === hash;
}

/**
 * Rate limiting helper - tracks request counts per IP
 */
export class RateLimiter {
  private requests: Map<string, { count: number; resetTime: number }> = new Map();
  private maxRequests: number;
  private windowMs: number;

  constructor(maxRequests: number = 100, windowMs: number = 60000) {
    this.maxRequests = maxRequests;
    this.windowMs = windowMs;
  }

  isAllowed(identifier: string): boolean {
    const now = Date.now();
    const record = this.requests.get(identifier);

    if (!record || now > record.resetTime) {
      // Reset window
      this.requests.set(identifier, {
        count: 1,
        resetTime: now + this.windowMs,
      });
      return true;
    }

    record.count++;
    return record.count <= this.maxRequests;
  }

  getRemainingRequests(identifier: string): number {
    const record = this.requests.get(identifier);
    if (!record || Date.now() > record.resetTime) {
      return this.maxRequests;
    }
    return Math.max(0, this.maxRequests - record.count);
  }
}
