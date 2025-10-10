// pages/api/admin/trader-stats.ts
import { NextApiRequest, NextApiResponse } from 'next';
import { prisma } from '../../../lib/prisma';

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method === 'GET') {
    try {
      const [totalSoleTraders, totalPassiveTraders, activeOrders, completedOrders, pendingApprovals] = await Promise.all([
        prisma.soleTrader.count(),
        prisma.user.count({ where: { role: 'PASSIVE_TRADER' } }),
        prisma.order.count({ where: { status: { in: ['PENDING', 'PROCESSING'] } } }),
        prisma.order.count({ where: { status: 'COMPLETED' } }),
        prisma.soleTrader.count({ where: { status: 'PENDING_APPROVAL' } })
      ]);

      const totalRevenue = await prisma.order.aggregate({
        where: { status: 'COMPLETED' },
        _sum: { totalAmount: true }
      });

      res.status(200).json({
        totalSoleTraders,
        totalPassiveTraders,
        activeOrders,
        completedOrders,
        totalRevenue: totalRevenue._sum.totalAmount || 0,
        pendingApprovals
      });
    } catch (error) {
      res.status(500).json({ error: 'Failed to fetch trader stats' });
    }
  } else {
    res.setHeader('Allow', ['GET']);
    res.status(405).end(`Method ${req.method} Not Allowed`);
  }
}

// pages/api/admin/recent-activities.ts
import { NextApiRequest, NextApiResponse } from 'next';
import { prisma } from '../../../lib/prisma';

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method === 'GET') {
    try {
      const recentOrders = await prisma.order.findMany({
        take: 5,
        orderBy: { createdAt: 'desc' },
        include: {
          soleTrader: {
            select: { name: true }
          }
        }
      });

      const activities = recentOrders.map(order => ({
        type: 'order',
        description: `New order from ${order.soleTrader.name}`,
        time: new Date(order.createdAt).toLocaleDateString(),
        status: order.status.toLowerCase()
      }));

      // Add sample investment activities (you'll need to create an Investment model)
      activities.push(
        {
          type: 'investment',
          description: 'New investment in maize farming',
          time: new Date().toLocaleDateString(),
          status: 'completed'
        },
        {
          type: 'registration',
          description: 'New passive trader registered',
          time: new Date().toLocaleDateString(),
          status: 'pending'
        }
      );

      res.status(200).json(activities);
    } catch (error) {
      res.status(500).json({ error: 'Failed to fetch recent activities' });
    }
  } else {
    res.setHeader('Allow', ['GET']);
    res.status(405).end(`Method ${req.method} Not Allowed`);
  }
}