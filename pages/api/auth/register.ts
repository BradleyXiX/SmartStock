import type { NextApiRequest, NextApiResponse } from 'next';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth-config';
import prisma from '@/lib/prisma';
import { hashPassword } from '@/lib/auth-nextauth';
import { validateEmail, validateString } from '@/lib/validation';

interface RegisterRequest {
  name: string;
  email: string;
  password: string;
  confirmPassword: string;
}

interface RegisterResponse {
  message: string;
  userId?: string;
  error?: string;
}

/**
 * @swagger
 * /api/auth/register:
 *   post:
 *     summary: Register a new user
 *     description: Create a new user account
 *     tags:
 *       - Authentication
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               name:
 *                 type: string
 *               email:
 *                 type: string
 *                 format: email
 *               password:
 *                 type: string
 *                 minLength: 8
 *               confirmPassword:
 *                 type: string
 *             required:
 *               - name
 *               - email
 *               - password
 *               - confirmPassword
 *     responses:
 *       201:
 *         description: User registered successfully
 *       400:
 *         description: Invalid input or user already exists
 */
export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse<RegisterResponse>
) {
  if (req.method !== 'POST') {
    return res.status(405).json({ message: 'Method not allowed' });
  }

  try {
    const { name, email, password, confirmPassword } = req.body as RegisterRequest;

    // Validate inputs
    const nameValidation = validateString(name, {
      fieldName: 'name',
      minLength: 2,
      maxLength: 100,
    });
    if (!nameValidation.valid) {
      return res.status(400).json({ message: nameValidation.error?.message || 'Invalid name' });
    }

    const emailValidation = validateEmail(email);
    if (!emailValidation.valid) {
      return res.status(400).json({ message: emailValidation.error?.message || 'Invalid email' });
    }

    const passwordValidation = validateString(password, {
      fieldName: 'password',
      minLength: 8,
      maxLength: 128,
    });
    if (!passwordValidation.valid) {
      return res.status(400).json({
        message: 'Password must be at least 8 characters',
      });
    }

    // Check password confirmation
    if (password !== confirmPassword) {
      return res.status(400).json({ message: 'Passwords do not match' });
    }

    // Check if user already exists
    const existingUser = await prisma.user.findUnique({
      where: { email },
    });

    if (existingUser) {
      return res.status(400).json({ message: 'User with this email already exists' });
    }

    // Hash password
    const hashedPassword = await hashPassword(password);

    // Create user
    const user = await prisma.user.create({
      data: {
        name,
        email,
        password: hashedPassword,
        role: 'user',
      },
      select: {
        id: true,
        email: true,
        name: true,
      },
    });

    console.log(`[AUTH] New user registered: ${email}`);

    return res.status(201).json({
      message: 'User registered successfully',
      userId: user.id,
    });
  } catch (error) {
    console.error('Registration error:', error);
    return res.status(500).json({
      message: 'Failed to register user',
      error: process.env.NODE_ENV === 'development' ? String(error) : undefined,
    });
  }
}
