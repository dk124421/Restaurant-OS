import express from 'express';
import Order from '../models/Order.js';
const router = express.Router();

router.get('/dashboard', async (req, res) => {
  try {
    const today = new Date(); today.setHours(0, 0, 0, 0);
    const allOrders = await Order.find({ createdAt: { $gte: today } });
    const totalOrders = allOrders.length;
    const revenue = allOrders.reduce((s, o) => s + o.totalAmount, 0);
    const avgOrderValue = totalOrders > 0 ? Math.round(revenue / totalOrders) : 0;

    const itemCounts = {};
    allOrders.forEach(o => o.items.forEach(i => {
      if (!itemCounts[i.name]) itemCounts[i.name] = { name: i.name, quantity: 0, revenue: 0 };
      itemCounts[i.name].quantity += i.quantity;
      itemCounts[i.name].revenue += i.price * i.quantity;
    }));
    const popularItems = Object.values(itemCounts).sort((a, b) => b.quantity - a.quantity).slice(0, 5);

    const statusCounts = { new: 0, preparing: 0, ready: 0, delivered: 0, paid: 0 };
    allOrders.forEach(o => { statusCounts[o.status] = (statusCounts[o.status] || 0) + 1; });

    const revenueTrend = [];
    for (let i = 6; i >= 0; i--) {
      const day = new Date(); day.setDate(day.getDate() - i); day.setHours(0, 0, 0, 0);
      const nextDay = new Date(day); nextDay.setDate(nextDay.getDate() + 1);
      const dayOrders = await Order.find({ createdAt: { $gte: day, $lt: nextDay } });
      revenueTrend.push({ date: day.toLocaleDateString('en-IN', { weekday: 'short' }), revenue: dayOrders.reduce((s, o) => s + o.totalAmount, 0), orders: dayOrders.length });
    }

    res.json({ totalOrders, revenue, avgOrderValue, popularItems, statusCounts, revenueTrend });
  } catch (err) { res.status(500).json({ error: err.message }); }
});

export default router;
