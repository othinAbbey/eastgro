import pool from '../database.js';

// Get trader statistics for admin dashboard
const getTraderStats = async (req, res) => {
  if (req.method !== 'GET') {
    res.setHeader('Allow', ['GET']);
    return res.status(405).end(`Method ${req.method} Not Allowed`);
  }

  try {
    // Check if user is admin (you'll need to implement this check based on your auth system)
    // if (req.user.role !== 'ADMIN') {
    //   return res.status(403).json({ error: 'Unauthorized' });
    // }

    const [
      totalSoleTradersResult,
      totalPassiveTradersResult,
      activeOrdersResult,
      completedOrdersResult,
      pendingApprovalsResult,
      totalRevenueResult
    ] = await Promise.all([
      // Total sole traders (assuming farmers are sole traders)
      pool.query('SELECT COUNT(*) FROM farmers'),
      // Total passive traders (assuming users with role 'PASSIVE_TRADER')
      pool.query(`SELECT COUNT(*) FROM users WHERE role = 'PASSIVE_TRADER'`),
      // Active orders
      pool.query(`SELECT COUNT(*) FROM orders WHERE status IN ('PENDING', 'PROCESSING')`),
      // Completed orders
      pool.query(`SELECT COUNT(*) FROM orders WHERE status = 'COMPLETED'`),
      // Pending approvals (assuming farmers with pending status)
      pool.query(`SELECT COUNT(*) FROM farmers WHERE status = 'PENDING_APPROVAL'`),
      // Total revenue
      pool.query(`SELECT COALESCE(SUM(total_amount), 0) as total_revenue FROM orders WHERE status = 'COMPLETED'`)
    ]);

    const stats = {
      totalSoleTraders: parseInt(totalSoleTradersResult.rows[0].count),
      totalPassiveTraders: parseInt(totalPassiveTradersResult.rows[0].count),
      activeOrders: parseInt(activeOrdersResult.rows[0].count),
      completedOrders: parseInt(completedOrdersResult.rows[0].count),
      totalRevenue: parseFloat(totalRevenueResult.rows[0].total_revenue),
      pendingApprovals: parseInt(pendingApprovalsResult.rows[0].count)
    };

    res.status(200).json(stats);
  } catch (error) {
    console.error('Failed to fetch trader stats:', error);
    res.status(500).json({ error: 'Failed to fetch trader stats' });
  }
};

// Get recent activities for admin dashboard
const getRecentActivities = async (req, res) => {
  if (req.method !== 'GET') {
    res.setHeader('Allow', ['GET']);
    return res.status(405).end(`Method ${req.method} Not Allowed`);
  }

  try {
    // Check if user is admin
    // if (req.user.role !== 'ADMIN') {
    //   return res.status(403).json({ error: 'Unauthorized' });
    // }

    // Get recent orders
    const recentOrdersResult = await pool.query(
      `SELECT o.*, f.name as farmer_name
       FROM orders o
       LEFT JOIN farmers f ON o.farmer_id = f.id
       ORDER BY o.created_at DESC
       LIMIT 5`
    );

    const activities = recentOrdersResult.rows.map(order => ({
      type: 'order',
      description: `New order from ${order.farmer_name || 'Unknown Farmer'}`,
      time: new Date(order.created_at).toLocaleDateString(),
      status: order.status.toLowerCase()
    }));

    // Add sample investment activities
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
    console.error('Failed to fetch recent activities:', error);
    res.status(500).json({ error: 'Failed to fetch recent activities' });
  }
};

export {
  getTraderStats,
  getRecentActivities
};