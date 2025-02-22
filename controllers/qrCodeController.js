import { PrismaClient } from '@prisma/client';
import QRCode from 'qrcode';
const prisma = new PrismaClient();

const generateQRCode = async (req, res) => {
  try {
    const { produceId } = req.body;
    const qrCodeData = `${process.env.BASE_URL}/qrcodes/trace/${produceId}`;
    const qrCodeImage = await QRCode.toDataURL(qrCodeData);
    res.json({ qrCodeImage });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

const traceProduct = async (req, res) => {
  try {
    const { id } = req.params;
    const produce = await prisma.produce.findUnique({
      where: { id },
      include: { farmer: true, transporter: true, facility: true, shipment: true },
    });
    if (!produce) {
      return res.status(404).json({ error: 'Produce not found' });
    }
    res.json(produce);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

export { generateQRCode, traceProduct };