import type { NextApiResponse } from 'next';
import prisma from '@/lib/prisma';
import { validateString, validateNumber, validateSKU } from '@/lib/validation';
import { withAuth, withMethod, withErrorHandler, SecureApiRequest } from '@/lib/security-middleware';

interface CreateProductRequest {
  name: string;
  sku: string;
  price: number;
  stockQuantity: number;
}

/**
 * @swagger
 * /api/products:
 *   post:
 *     summary: Create a new product
 *     description: Create a new product in inventory (Admin only)
 *     tags:
 *       - Products
 *     security:
 *       - BearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               name:
 *                 type: string
 *                 description: Product name
 *               sku:
 *                 type: string
 *                 description: Stock Keeping Unit (unique)
 *               price:
 *                 type: number
 *                 description: Product price
 *               stockQuantity:
 *                 type: integer
 *                 description: Initial stock quantity
 *             required:
 *               - name
 *               - sku
 *               - price
 *               - stockQuantity
 *     responses:
 *       201:
 *         description: Product created successfully
 *       400:
 *         description: Invalid input
 *       401:
 *         description: Unauthorized
 *       403:
 *         description: Insufficient permissions
 */
async function createProduct(req: SecureApiRequest, res: NextApiResponse) {
  if (req.method !== 'POST') {
    return res.status(405).json({ message: 'Method not allowed' });
  }

  // Check authorization - only admins can create products
  if (req.user?.role !== 'admin') {
    return res.status(403).json({ message: 'Only administrators can create products' });
  }

  try {
    const { name, sku, price, stockQuantity } = req.body as CreateProductRequest;

    // Validate inputs
    const nameValidation = validateString(name, {
      fieldName: 'name',
      minLength: 3,
      maxLength: 255,
    });
    if (!nameValidation.valid) {
      return res.status(400).json({ message: nameValidation.error?.message });
    }

    const skuValidation = validateSKU(sku);
    if (!skuValidation.valid) {
      return res.status(400).json({ message: skuValidation.error?.message });
    }

    const priceValidation = validateNumber(price, {
      fieldName: 'price',
      min: 0.01,
      max: 999999.99,
    });
    if (!priceValidation.valid) {
      return res.status(400).json({ message: priceValidation.error?.message });
    }

    const quantityValidation = validateNumber(stockQuantity, {
      fieldName: 'stockQuantity',
      min: 0,
      max: 1000000,
      isInteger: true,
    });
    if (!quantityValidation.valid) {
      return res.status(400).json({ message: quantityValidation.error?.message });
    }

    // Create product (Prisma prevents SQL injection automatically)
    const product = await prisma.product.create({
      data: {
        name,
        sku,
        price: parseFloat(price as unknown as string),
        stockQuantity: parseInt(stockQuantity as unknown as string),
      },
    });

    // Log audit trail (in production)
    console.log(`[AUDIT] User ${req.user.username} created product ${product.id}`);

    return res.status(201).json({
      message: 'Product created successfully',
      product,
    });
  } catch (error) {
    // Check for duplicate SKU
    if (error instanceof Error && error.message.includes('Unique constraint failed')) {
      return res.status(400).json({ message: 'SKU must be unique' });
    }

    console.error('Create product error:', error);
    return res.status(500).json({
      message: 'Failed to create product',
      error: process.env.NODE_ENV === 'development' ? String(error) : undefined,
    });
  }
}

export default withAuth(withMethod('POST')(withErrorHandler(createProduct)));
