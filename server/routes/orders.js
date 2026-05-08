import express from 'express';
import Order from '../models/Order.js';
import Table from '../models/Table.js';
const router = express.Router();

router.get('/', async (req, res) => {
  try {
    const { status } = req.query;
    const filter = status ? { status } : {};
    const orders = await Order.find(filter).sort({ createdAt: -1 });
    res.json(orders);
  } catch (err) { res.status(500).json({ error: err.message }); }
});

// Get all orders history (with pagination)
router.get('/history', async (req, res) => {
  try {
    const { page = 1, limit = 50, status, date } = req.query;
    const filter = {};
    if (status && status !== 'all') filter.status = status;
    if (date) {
      const day = new Date(date);
      day.setHours(0, 0, 0, 0);
      const next = new Date(day);
      next.setDate(next.getDate() + 1);
      filter.createdAt = { $gte: day, $lt: next };
    }
    const total = await Order.countDocuments(filter);
    const orders = await Order.find(filter)
      .sort({ createdAt: -1 })
      .skip((page - 1) * limit)
      .limit(parseInt(limit));
    res.json({ orders, total, page: parseInt(page), pages: Math.ceil(total / limit) });
  } catch (err) { res.status(500).json({ error: err.message }); }
});

router.get('/active', async (req, res) => {
  try {
    const orders = await Order.find({ status: { $in: ['new', 'preparing', 'ready'] } }).sort({ createdAt: 1 });
    res.json(orders);
  } catch (err) { res.status(500).json({ error: err.message }); }
});

router.get('/table/:tableNumber', async (req, res) => {
  try {
    const orders = await Order.find({ tableNumber: parseInt(req.params.tableNumber), status: { $nin: ['paid', 'cancelled'] } }).sort({ createdAt: -1 });
    res.json(orders);
  } catch (err) { res.status(500).json({ error: err.message }); }
});

// Get single order with full details
router.get('/:id', async (req, res) => {
  try {
    const order = await Order.findById(req.params.id);
    if (!order) return res.status(404).json({ error: 'Not found' });
    res.json(order);
  } catch (err) { res.status(500).json({ error: err.message }); }
});

router.post('/', async (req, res) => {
  try {
    const { tableNumber, items, customerName, customerPhone, notes } = req.body;
    
    const existingOrder = await Order.findOne({ tableNumber, status: { $nin: ['paid', 'cancelled'] } });
    const io = req.app.get('io');
    
    if (existingOrder) {
      existingOrder.items.push(...items);
      if (notes) existingOrder.notes = existingOrder.notes ? `${existingOrder.notes} | ${notes}` : notes;
      existingOrder.status = 'new'; // Reset to new so kitchen sees the added items
      existingOrder.statusHistory.push({
        status: 'items_added',
        changedBy: customerName || 'System',
        changedByRole: 'customer/waiter',
        timestamp: new Date()
      });
      await existingOrder.save();
      
      io.emit('orderUpdated', existingOrder);
      io.emit('newOrder', existingOrder); // Trigger new order sound
      return res.status(200).json(existingOrder);
    }

    const order = new Order(req.body);
    await order.save();
    await Table.findOneAndUpdate({ number: order.tableNumber }, { status: 'occupied', customerName: order.customerName, customerPhone: order.customerPhone, currentOrderId: order._id });
    
    io.emit('newOrder', order);
    io.emit('tableUpdated');
    res.status(201).json(order);
  } catch (err) { res.status(400).json({ error: err.message }); }
});

// Update order status with staff tracking
router.patch('/:id/status', async (req, res) => {
  try {
    const { status, staffName, staffRole } = req.body;
    const order = await Order.findById(req.params.id);
    if (!order) return res.status(404).json({ error: 'Not found' });

    order.status = status;
    order.statusHistory.push({
      status,
      changedBy: staffName || 'System',
      changedByRole: staffRole || 'system',
      timestamp: new Date()
    });

    // Track who prepared/served
    if (status === 'preparing' && staffName) order.preparedBy = staffName;
    if (status === 'delivered' && staffName) order.servedBy = staffName;

    await order.save();

    // Update table
    if (status === 'ready') await Table.findOneAndUpdate({ number: order.tableNumber }, { status: 'ready' });
    else if (status === 'delivered') await Table.findOneAndUpdate({ number: order.tableNumber }, { status: 'occupied' });
    else if (status === 'paid') await Table.findOneAndUpdate({ number: order.tableNumber }, { status: 'free', customerName: '', customerPhone: '', currentOrderId: null });

    const io = req.app.get('io');
    io.emit('orderUpdated', order);
    io.emit('tableUpdated');
    res.json(order);
  } catch (err) { res.status(400).json({ error: err.message }); }
});

router.put('/:id', async (req, res) => {
  try {
    const order = await Order.findById(req.params.id);
    if (!order) return res.status(404).json({ error: 'Not found' });
    Object.assign(order, req.body);
    await order.save();
    req.app.get('io').emit('orderUpdated', order);
    res.json(order);
  } catch (err) { res.status(400).json({ error: err.message }); }
});

router.patch('/:id/pay', async (req, res) => {
  try {
    const { paymentMethod, staffName } = req.body;
    const order = await Order.findById(req.params.id);
    if (!order) return res.status(404).json({ error: 'Not found' });

    order.paymentMethod = paymentMethod;
    order.status = 'paid';
    if (staffName) order.billedBy = staffName;
    order.statusHistory.push({ status: 'paid', changedBy: staffName || 'POS', changedByRole: 'pos', timestamp: new Date() });
    await order.save();

    await Table.findOneAndUpdate({ number: order.tableNumber }, { status: 'free', customerName: '', customerPhone: '', currentOrderId: null });
    const io = req.app.get('io');
    io.emit('orderUpdated', order);
    io.emit('tableUpdated');
    res.json(order);
  } catch (err) { res.status(400).json({ error: err.message }); }
});

export default router;
