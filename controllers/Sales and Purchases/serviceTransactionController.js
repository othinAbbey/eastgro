import { query, getClient } from '../../config/database.js';

// Book a service
const bookService = async (req, res) => {
  const client = await getClient();
  
  try {
    await client.query('BEGIN');

    const { buyerId, serviceOfferingId, quantity, paymentMethod } = req.body;

    // Validate required fields
    if (!buyerId || !serviceOfferingId || !quantity || !paymentMethod) {
      await client.query('ROLLBACK');
      return res.status(400).json({ 
        success: false,
        error: 'Missing required fields: buyerId, serviceOfferingId, quantity, paymentMethod' 
      });
    }

    // Get service offering details
    const offeringResult = await client.query(
      `SELECT so.id, so.rate, so.min_quantity as "minQuantity", so.is_active as "isActive",
              s.id as "serviceId", s.name as "serviceName", s.description as "serviceDescription",
              sp.id as "providerId", sp.name as "providerName", sp.contact as "providerContact"
       FROM service_offerings so
       JOIN services s ON so.service_id = s.id
       JOIN service_providers sp ON so.service_provider_id = sp.id
       WHERE so.id = $1`,
      [serviceOfferingId]
    );

    if (offeringResult.rows.length === 0) {
      await client.query('ROLLBACK');
      return res.status(400).json({ 
        success: false,
        error: 'Service offering not available' 
      });
    }

    const offering = offeringResult.rows[0];

    // Check if offering is active
    if (!offering.isActive) {
      await client.query('ROLLBACK');
      return res.status(400).json({ 
        success: false,
        error: 'Service offering not available' 
      });
    }

    // Validate quantity
    const minQuantity = offering.minQuantity || 1;
    if (quantity < minQuantity) {
      await client.query('ROLLBACK');
      return res.status(400).json({ 
        success: false,
        error: `Minimum quantity is ${minQuantity}` 
      });
    }

    // Check if buyer exists
    const buyerResult = await client.query(
      'SELECT id FROM customers WHERE id = $1',
      [buyerId]
    );

    if (buyerResult.rows.length === 0) {
      await client.query('ROLLBACK');
      return res.status(404).json({ 
        success: false,
        error: 'Buyer not found' 
      });
    }

    // Calculate total amount
    const totalAmount = offering.rate * quantity;

    // Create transaction
    const transactionResult = await client.query(
      `INSERT INTO transactions (buyer_id, service_provider_id, total_amount, payment_method, status, created_at) 
       VALUES ($1, $2, $3, $4, $5, NOW()) 
       RETURNING id, buyer_id as "buyerId", service_provider_id as "serviceProviderId", 
                total_amount as "totalAmount", payment_method as "paymentMethod", status, created_at`,
      [buyerId, offering.providerId, totalAmount, paymentMethod, 'PENDING']
    );

    const transaction = transactionResult.rows[0];
    const transactionId = transaction.id;

    // Link service to transaction
    await client.query(
      `INSERT INTO transaction_services (transaction_id, service_id, service_offering_id, quantity, rate, created_at) 
       VALUES ($1, $2, $3, $4, $5, NOW())`,
      [transactionId, offering.serviceId, serviceOfferingId, quantity, offering.rate]
    );

    await client.query('COMMIT');

    // Fetch complete transaction details
    const completeTransaction = await getServiceTransactionById(transactionId);

    res.status(201).json({
      success: true,
      message: 'Service booked successfully',
      transaction: completeTransaction
    });

  } catch (error) {
    await client.query('ROLLBACK');
    console.error('Error booking service:', error);
    res.status(400).json({ 
      success: false,
      error: 'Failed to book service',
      details: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  } finally {
    client.release();
  }
};

// Helper function to get complete service transaction details
const getServiceTransactionById = async (transactionId) => {
  const transactionResult = await query(
    `SELECT t.id, t.total_amount as "totalAmount", t.payment_method as "paymentMethod", t.status, t.created_at,
            c.name as "buyerName", c.contact as "buyerContact",
            sp.name as "providerName", sp.contact as "providerContact", sp.business_name as "businessName"
     FROM transactions t
     LEFT JOIN customers c ON t.buyer_id = c.id
     LEFT JOIN service_providers sp ON t.service_provider_id = sp.id
     WHERE t.id = $1`,
    [transactionId]
  );

  if (transactionResult.rows.length === 0) return null;

  const transaction = transactionResult.rows[0];

  // Get service details
  const serviceResult = await query(
    `SELECT ts.quantity, ts.rate, ts.created_at,
            s.name as "serviceName", s.description as "serviceDescription", s.category,
            so.id as "offeringId", so.notes as "offeringNotes"
     FROM transaction_services ts
     LEFT JOIN services s ON ts.service_id = s.id
     LEFT JOIN service_offerings so ON ts.service_offering_id = so.id
     WHERE ts.transaction_id = $1`,
    [transactionId]
  );

  transaction.services = serviceResult.rows;

  return transaction;
};

// Get provider's bookings
const getProviderBookings = async (req, res) => {
  try {
    const { providerId } = req.params;

    // Check if provider exists
    const providerResult = await query(
      'SELECT id, name FROM service_providers WHERE id = $1',
      [providerId]
    );

    if (providerResult.rows.length === 0) {
      return res.status(404).json({ 
        success: false,
        error: 'Service provider not found' 
      });
    }

    const bookingsResult = await query(
      `SELECT t.id, t.total_amount as "totalAmount", t.payment_method as "paymentMethod", t.status, t.created_at,
              c.name as "buyerName", c.contact as "buyerContact", c.email as "buyerEmail",
              s.name as "serviceName", s.category as "serviceCategory",
              ts.quantity, ts.rate
       FROM transactions t
       LEFT JOIN customers c ON t.buyer_id = c.id
       LEFT JOIN transaction_services ts ON t.id = ts.transaction_id
       LEFT JOIN services s ON ts.service_id = s.id
       WHERE t.service_provider_id = $1
       ORDER BY t.created_at DESC`,
      [providerId]
    );

    res.json({
      success: true,
      bookings: bookingsResult.rows,
      count: bookingsResult.rows.length,
      provider: providerResult.rows[0]
    });
  } catch (error) {
    console.error('Error fetching provider bookings:', error);
    res.status(500).json({ 
      success: false,
      error: 'Failed to fetch provider bookings',
      details: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
};

// Additional useful functions

const getCustomerServiceBookings = async (req, res) => {
  try {
    const { customerId } = req.params;

    // Check if customer exists
    const customerResult = await query(
      'SELECT id, name FROM customers WHERE id = $1',
      [customerId]
    );

    if (customerResult.rows.length === 0) {
      return res.status(404).json({ 
        success: false,
        error: 'Customer not found' 
      });
    }

    const bookingsResult = await query(
      `SELECT t.id, t.total_amount as "totalAmount", t.payment_method as "paymentMethod", t.status, t.created_at,
              sp.name as "providerName", sp.business_name as "businessName", sp.contact as "providerContact",
              s.name as "serviceName", s.category as "serviceCategory",
              ts.quantity, ts.rate
       FROM transactions t
       LEFT JOIN service_providers sp ON t.service_provider_id = sp.id
       LEFT JOIN transaction_services ts ON t.id = ts.transaction_id
       LEFT JOIN services s ON ts.service_id = s.id
       WHERE t.buyer_id = $1
       ORDER BY t.created_at DESC`,
      [customerId]
    );

    res.json({
      success: true,
      bookings: bookingsResult.rows,
      count: bookingsResult.rows.length,
      customer: customerResult.rows[0]
    });
  } catch (error) {
    console.error('Error fetching customer service bookings:', error);
    res.status(500).json({ 
      success: false,
      error: 'Failed to fetch customer service bookings',
      details: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
};

const updateBookingStatus = async (req, res) => {
  const client = await getClient();
  
  try {
    await client.query('BEGIN');

    const { bookingId } = req.params;
    const { status } = req.body;

    // Validate status
    const validStatuses = ['PENDING', 'CONFIRMED', 'IN_PROGRESS', 'COMPLETED', 'CANCELLED'];
    if (!validStatuses.includes(status)) {
      await client.query('ROLLBACK');
      return res.status(400).json({ 
        success: false,
        error: `Invalid status. Must be one of: ${validStatuses.join(', ')}` 
      });
    }

    // Check if booking exists
    const bookingCheck = await client.query(
      'SELECT id FROM transactions WHERE id = $1 AND service_provider_id IS NOT NULL',
      [bookingId]
    );

    if (bookingCheck.rows.length === 0) {
      await client.query('ROLLBACK');
      return res.status(404).json({ 
        success: false,
        error: 'Service booking not found' 
      });
    }

    // Update booking status
    const updateResult = await client.query(
      `UPDATE transactions 
       SET status = $1, updated_at = NOW() 
       WHERE id = $2 
       RETURNING id, status, updated_at`,
      [status, bookingId]
    );

    await client.query('COMMIT');

    const updatedBooking = updateResult.rows[0];

    res.json({
      success: true,
      message: 'Booking status updated successfully',
      booking: updatedBooking
    });
  } catch (error) {
    await client.query('ROLLBACK');
    console.error('Error updating booking status:', error);
    res.status(500).json({ 
      success: false,
      error: 'Failed to update booking status',
      details: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  } finally {
    client.release();
  }
};

const getAvailableServiceOfferings = async (req, res) => {
  try {
    const { serviceType, location, minRate, maxRate } = req.query;

    let whereConditions = ['so.is_active = true'];
    let queryParams = [];
    let paramCount = 0;

    if (serviceType) {
      paramCount++;
      whereConditions.push(`s.category = $${paramCount}`);
      queryParams.push(serviceType);
    }

    if (location) {
      paramCount++;
      whereConditions.push(`sp.location ILIKE $${paramCount}`);
      queryParams.push(`%${location}%`);
    }

    if (minRate) {
      paramCount++;
      whereConditions.push(`so.rate >= $${paramCount}`);
      queryParams.push(parseFloat(minRate));
    }

    if (maxRate) {
      paramCount++;
      whereConditions.push(`so.rate <= $${paramCount}`);
      queryParams.push(parseFloat(maxRate));
    }

    const whereClause = whereConditions.length > 0 ? `WHERE ${whereConditions.join(' AND ')}` : '';

    const offeringsResult = await query(
      `SELECT so.id, so.rate, so.min_quantity as "minQuantity", so.notes, so.is_active as "isActive",
              s.id as "serviceId", s.name as "serviceName", s.description as "serviceDescription", s.category,
              sp.id as "providerId", sp.name as "providerName", sp.business_name as "businessName",
              sp.location, sp.contact, sp.rating, sp.is_verified as "isVerified"
       FROM service_offerings so
       JOIN services s ON so.service_id = s.id
       JOIN service_providers sp ON so.service_provider_id = sp.id
       ${whereClause}
       ORDER BY sp.rating DESC, so.rate ASC`,
      queryParams
    );

    res.json({
      success: true,
      offerings: offeringsResult.rows,
      count: offeringsResult.rows.length
    });
  } catch (error) {
    console.error('Error fetching service offerings:', error);
    res.status(500).json({ 
      success: false,
      error: 'Failed to fetch service offerings',
      details: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
};

const cancelServiceBooking = async (req, res) => {
  const client = await getClient();
  
  try {
    await client.query('BEGIN');

    const { bookingId } = req.params;
    const { reason } = req.body;

    // Check if booking exists and is cancellable
    const bookingCheck = await client.query(
      `SELECT id, status FROM transactions 
       WHERE id = $1 AND service_provider_id IS NOT NULL`,
      [bookingId]
    );

    if (bookingCheck.rows.length === 0) {
      await client.query('ROLLBACK');
      return res.status(404).json({ 
        success: false,
        error: 'Service booking not found' 
      });
    }

    const booking = bookingCheck.rows[0];

    // Check if booking can be cancelled
    const cancellableStatuses = ['PENDING', 'CONFIRMED'];
    if (!cancellableStatuses.includes(booking.status)) {
      await client.query('ROLLBACK');
      return res.status(400).json({ 
        success: false,
        error: `Booking cannot be cancelled in current status: ${booking.status}` 
      });
    }

    // Update booking status to CANCELLED
    const updateResult = await client.query(
      `UPDATE transactions 
       SET status = 'CANCELLED', updated_at = NOW() 
       WHERE id = $1 
       RETURNING id, status, updated_at`,
      [bookingId]
    );

    // Log cancellation reason if provided
    if (reason) {
      await client.query(
        `INSERT INTO booking_cancellations (transaction_id, reason, created_at) 
         VALUES ($1, $2, NOW())`,
        [bookingId, reason]
      );
    }

    await client.query('COMMIT');

    const cancelledBooking = updateResult.rows[0];

    res.json({
      success: true,
      message: 'Service booking cancelled successfully',
      booking: cancelledBooking
    });
  } catch (error) {
    await client.query('ROLLBACK');
    console.error('Error cancelling service booking:', error);
    res.status(500).json({ 
      success: false,
      error: 'Failed to cancel service booking',
      details: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  } finally {
    client.release();
  }
};

export default {
  bookService,
  getProviderBookings,
  getCustomerServiceBookings,
  updateBookingStatus,
  getAvailableServiceOfferings,
  cancelServiceBooking
};