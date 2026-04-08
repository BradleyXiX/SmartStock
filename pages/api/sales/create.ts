import type { NextApiResponse } from 'next';
import prisma from '@/lib/prisma';
import { validateNumber } from '@/lib/validation';
import { withAuth, withMethod, withErrorHandler, SecureApiRequest } from '@/lib/security-middleware';

interface CreateSaleRequest {
  productId: number;
  quantitySold: number;
}

/**
 * @swagger
 * /api/sales:
 *   post:
 *     summary: Record a sale
 *     description: Record a new sales transaction
 *     tags:
 *       - Sales
 *     security:
 *       - BearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               productId:
 *                 type: integer
 *                 description: Product ID
 *               quantitySold:
 *                 type: integer
 *                 description: Quantity sold
 *             required:
 *               - productId
 *               - quantitySold
 *     responses:
 *       201:
 *         description: Sale recorded successfully
 *       400:
 *         description: Invalid input
 *       401:
 *         description: Unauthorized
 *       422:
 *         description: Insufficient stock
 */
async function recordSale(req: SecureApiRequest, res: NextApiResponse) {
  if (req.method !== 'POST') {
    return res.status(405).json({ message: 'Method not allowed' });
  }

  try {
    const { productId, quantitySold } = req.body as CreateSaleRequest;

    // Validate inputs
    const productIdValidation = validateNumber(productId, {
      fieldName: 'productId',
      min: 1,
      isInteger: true,
    });
    if (!productIdValidation.valid) {
      return res.status(400).json({ message: productIdValidation.error?.message });
    }

    const quantityValidation = validateNumber(quantitySold, {
      fieldName: 'quantitySold',
      min: 1,
      max: 10000,
      isInteger: true,
    });
    if (!quantityValidation.valid) {
      return res.status(400).json({ message: quantityValidation.error?.message });
    }

    // Check if product exists and has sufficient stock
    const product = await prisma.product.findUnique({
      where: { id: productId },
    });

    if (!product) {
      return res.status(404).json({ message: 'Product not found' });
    }

    if (product.stockQuantity < quantitySold) {
      return res.status(422).json({
        message: 'Insufficient stock',
        available: product.stockQuantity,
        requested: quantitySold,
      });
    }

    // Create sale and update stock (transaction)
    const result = await prisma.$transaction([
      prisma.sale.create({
        data: {
          productId,
          quantitySold,
        },
        include: {
          product: true,
        },
      }),
      prisma.product.update({
        where: { id: productId },
        data: {
          stockQuantity: {
            decrement: quantitySold,
          },
        },
      }),
    ]);

    const sale = result[0];

    // Log audit trail
    console.log(`[AUDIT] User ${req.user?.username} recorded sale: Product ${productId}, Qty ${quantitySold}`);

    return res.status(201).json({
      message: 'Sale recorded successfully',
      sale,
    });
  } catch (error) {
    console.error('Record sale error:', error);
    return res.status(500).json({
      message: 'Failed to record sale',
      error: process.env.NODE_ENV === 'development' ? String(error) : undefined,
    });
  }
}

export default withAuth(withMethod('POST')(withErrorHandler(recordSale)));
