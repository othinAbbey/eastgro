import { PrismaClient } from '@prisma/client';
import QRCode from 'qrcode';

const prisma = new PrismaClient();

// Generate QR Code with biofortification check
const generateQRCode = async (req, res) => {
  try {
    const { produceId } = req.body;

    // Check if the produce exists and fetch biofortification status
    const produce = await prisma.produce.findUnique({
      where: { id: produceId },
    });

    if (!produce) {
      return res.status(404).json({ error: 'Produce not found' });
    }

    // Include biofortification status in QR code data
    const qrCodeData = JSON.stringify({
      traceUrl: `${process.env.BASE_URL}/qrcodes/trace/${produceId}`,
      isBiofortified: produce.isBiofortified,
    });

    // Generate QR Code image
    const qrCodeImage = await QRCode.toDataURL(qrCodeData);
    res.json({ qrCodeImage });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

// Trace product and include biofortification status
const traceProduct = async (req, res) => {
  try {
    const { id } = req.params;

    // Fetch product details with related entities
    const produce = await prisma.produce.findUnique({
      where: { id },
      include: {
        farmer: true,
        shipments: {
          include: {
            transporter: true,
            facility: true,
          },
        },
      },
    });

    if (!produce) {
      return res.status(404).json({ error: 'Produce not found' });
    }

    // Return detailed produce data including biofortification status
    res.json({
      id: produce.id,
      type: produce.type,
      quantity: produce.quantity,
      status: produce.status,
      isBiofortified: produce.isBiofortified,
      harvestDate: produce.harvestDate,
      farmer: produce.farmer,
      shipments: produce.shipments,
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

export { generateQRCode, traceProduct };
