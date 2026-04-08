/**
 * Security middleware for API routes
 * Handles authentication, authorization, and rate limiting
 */

import type { NextApiRequest, NextApiResponse } from 'next';
import { verifyToken, RateLimiter } from './auth';

export interface SecureApiRequest extends NextApiRequest {
  user?: {
    userId: string;
    username: string;
    role: 'user' | 'admin' | 'manager';
  };
}

// Rate limiters
const globalLimiter = new RateLimiter(1000, 60000); // 1000 requests per minute
const authLimiter = new RateLimiter(5, 300000); // 5 attempts per 5 minutes

/**
 * Extracts bearer token from request headers
 */
export function extractToken(req: NextApiRequest): string | null {
  const authHeader = req.headers.authorization;
  if (!authHeader) return null;

  const parts = authHeader.split(' ');
  if (parts.length !== 2 || parts[0].toLowerCase() !== 'bearer') {
    return null;
  }

  return parts[1];
}

/**
 * Middleware to authenticate requests
 */
export function withAuth(handler: (req: SecureApiRequest, res: NextApiResponse) => Promise<void> | void) {
  return async (req: SecureApiRequest, res: NextApiResponse) => {
    // Check rate limit
    const ip = (req.headers['x-forwarded-for'] as string)?.split(',')[0] || req.socket.remoteAddress || 'unknown';
    if (!globalLimiter.isAllowed(ip)) {
      return res.status(429).json({ message: 'Too many requests, please try again later' });
    }

    // Extract token
    const token = extractToken(req);
    if (!token) {
      return res.status(401).json({ message: 'Missing or invalid authorization token' });
    }

    // Verify token
    const verification = verifyToken(token);
    if (!verification.valid) {
      return res.status(401).json({ message: verification.error || 'Invalid token' });
    }

    // Attach user to request
    req.user = {
      userId: verification.payload!.userId,
      username: verification.payload!.username,
      role: verification.payload!.role,
    };

    return handler(req, res);
  };
}

/**
 * Middleware to require specific roles
 */
export function withRoleCheck(roles: string[]) {
  return (handler: (req: SecureApiRequest, res: NextApiResponse) => Promise<void> | void) => {
    return withAuth(async (req: SecureApiRequest, res: NextApiResponse) => {
      if (!req.user || !roles.includes(req.user.role)) {
        return res.status(403).json({ message: 'Insufficient permissions to access this resource' });
      }

      return handler(req, res);
    });
  };
}

/**
 * Middleware to check HTTP method
 */
export function withMethod(...methods: string[]) {
  return (handler: (req: SecureApiRequest, res: NextApiResponse) => Promise<void> | void) => {
    return (req: SecureApiRequest, res: NextApiResponse) => {
      if (!methods.includes(req.method || '')) {
        return res.status(405).json({ message: `Method ${req.method} not allowed` });
      }

      return handler(req, res);
    };
  };
}

/**
 * Middleware to add rate limiting
 */
export function withRateLimit(maxRequests: number = 100, windowMs: number = 60000) {
  const limiter = new RateLimiter(maxRequests, windowMs);

  return (handler: (req: SecureApiRequest, res: NextApiResponse) => Promise<void> | void) => {
    return (req: SecureApiRequest, res: NextApiResponse) => {
      const ip = (req.headers['x-forwarded-for'] as string)?.split(',')[0] || req.socket.remoteAddress || 'unknown';

      if (!limiter.isAllowed(ip)) {
        const remaining = limiter.getRemainingRequests(ip);
        res.setHeader('X-RateLimit-Remaining', remaining);
        res.setHeader('X-RateLimit-Reset', new Date(Date.now() + windowMs).toISOString());
        return res.status(429).json({ message: 'Too many requests, please try again later' });
      }

      const remaining = limiter.getRemainingRequests(ip);
      res.setHeader('X-RateLimit-Remaining', remaining);

      return handler(req, res);
    };
  };
}

/**
 * Middleware to catch and handle errors
 */
export function withErrorHandler(handler: (req: SecureApiRequest, res: NextApiResponse) => Promise<void> | void) {
  return async (req: SecureApiRequest, res: NextApiResponse) => {
    try {
      return await handler(req, res);
    } catch (error) {
      console.error('API Error:', error);

      if (error instanceof SyntaxError) {
        return res.status(400).json({ message: 'Invalid request body' });
      }

      return res.status(500).json({
        message: 'Internal server error',
        error: process.env.NODE_ENV === 'development' ? (error instanceof Error ? error.message : String(error)) : undefined,
      });
    }
  };
}
