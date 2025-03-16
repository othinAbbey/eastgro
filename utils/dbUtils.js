// utils/dbUtils.js
import { PrismaClient } from '@prisma/client';
const prisma = new PrismaClient();

/**
 * Check if a record exists in the database
 * @param {string} model - Prisma model name (e.g., 'farmer', 'product')
 * @param {string} id - Record ID
 * @returns {Promise<boolean>} - True if the record exists, false otherwise
 */
const recordExists = async (model, id) => {
  const record = await prisma[model].findUnique({ where: { id } });
  return !!record;
};

/**
 * Update product quantities
 * @param {string} productId - Product ID
 * @param {number} quantityChange - Change in quantity (positive or negative)
 */
const updateProductQuantity = async (productId, quantityChange) => {
  await prisma.product.update({
    where: { id: productId },
    data: { quantity: { increment: quantityChange } },
  });
};

export { recordExists, updateProductQuantity };