import type { NextApiRequest, NextApiResponse } from 'next';
import { generateToken, verifyPassword, hashPassword } from '@/lib/auth';
import { validateEmail, validateString } from '@/lib/validation';
import { withMethod, withRateLimit, withErrorHandler } from '@/lib/security-middleware';

interface LoginRequest {
  username: string;
  password: string;
}

interface LoginResponse {
  token?: string;
  message: string;
  error?: string;
}

/**
 * @swagger
 * /api/auth/login:
 *   post:
 *     summary: User login
 *     description: Authenticate user and receive JWT token
 *     tags:
 *       - Authentication
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               username:
 *                 type: string
 *                 description: Username or email
 *               password:
 *                 type: string
 *                 description: User password
 *             required:
 *               - username
 *               - password
 *     responses:
 *       200:
 *         description: Login successful, token returned
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 token:
 *                   type: string
 *                 message:
 *                   type: string
 *       400:
 *         description: Invalid input
 *       401:
 *         description: Invalid credentials
 *       429:
 *         description: Too many login attempts
 */
async function handler(req: NextApiRequest, res: NextApiResponse<LoginResponse>) {
  if (req.method !== 'POST') {
    return res.status(405).json({ message: 'Method not allowed' });
  }

  // Rate limit login attempts (5 per 5 minutes)
  const ip = (req.headers['x-forwarded-for'] as string)?.split(',')[0] || req.socket.remoteAddress || 'unknown';
  // In production, implement proper rate limiting

  try {
    const { username, password } = req.body as LoginRequest;

    // Input validation
    const usernameValidation = validateString(username, {
      fieldName: 'username',
      minLength: 3,
      maxLength: 50,
    });

    if (!usernameValidation.valid) {
      return res.status(400).json({
        message: usernameValidation.error?.message || 'Invalid username',
      });
    }

    const passwordValidation = validateString(password, {
      fieldName: 'password',
      minLength: 6,
      maxLength: 128,
    });

    if (!passwordValidation.valid) {
      return res.status(400).json({
        message: passwordValidation.error?.message || 'Invalid password',
      });
    }

    // TODO: In production, fetch user from database
    // For demo purposes, using mock user
    const mockUser = {
      id: '1',
      username: 'admin',
      passwordHash: hashPassword('password123').hash,
      passwordSalt: hashPassword('password123').salt,
      role: 'admin' as const,
    };

    // Verify password (in production, get hash/salt from database)
    const isPasswordValid = verifyPassword(password, mockUser.passwordHash, mockUser.passwordSalt);

    if (username !== mockUser.username || !isPasswordValid) {
      return res.status(401).json({
        message: 'Invalid username or password',
        error: 'Authentication failed',
      });
    }

    // Generate JWT token
    const token = generateToken(
      {
        userId: mockUser.id,
        username: mockUser.username,
        role: mockUser.role,
      },
      3600 // 1 hour expiration
    );

    res.setHeader('Set-Cookie', [`authToken=${token}; HttpOnly; Secure; SameSite=Strict; Path=/`]);

    return res.status(200).json({
      token,
      message: 'Login successful',
    });
  } catch (error) {
    console.error('Login error:', error);
    return res.status(500).json({
      message: 'Internal server error',
      error: process.env.NODE_ENV === 'development' ? String(error) : undefined,
    });
  }
}

export default withRateLimit(5, 300000)(withMethod('POST')(withErrorHandler(handler)));
