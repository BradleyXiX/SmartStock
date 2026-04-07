import type { NextApiRequest, NextApiResponse } from 'next';
import prisma from '@/lib/prisma';

type Product = {
  id: number;
  name: string;
  sku: string;
  price: number;
  stockQuantity: number;
};

type ErrorResponse = {
  message: string;
  error?: string;
};

/**
 * @swagger
 * /api/products:
 *   get:
 *     summary: Get all products
 *     description: Retrieve a list of all products in inventory
 *     tags:
 *       - Products
 *     responses:
 *       200:
 *         description: Successful response with products list
 *         content:
 *           application/json:
 *             schema:
 *               type: array
 *               items:
 *                 $ref: '#/components/schemas/Product'
 *       500:
 *         description: Server error
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 */
export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse<Product[] | ErrorResponse>
) {
  if (req.method === 'GET') {
    try {
      // Fetch products from database using Prisma
      const products = await prisma.product.findMany();
      res.status(200).json(products);
    } catch (error) {
      console.error('Error fetching products:', error);
      res.status(500).json({
        message: 'Failed to fetch products',
        error: error instanceof Error ? error.message : String(error),
      });
    }
  } else {
    res.status(405).json({ message: 'Method not allowed' });
  }
}
