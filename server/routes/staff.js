import express from 'express';
import Staff from '../models/Staff.js';
const router = express.Router();

// Get all staff (optionally filter by role)
router.get('/', async (req, res) => {
  try {
    const { role } = req.query;
    const filter = role ? { role } : {};
    const staff = await Staff.find(filter).sort({ createdAt: -1 });
    res.json(staff);
  } catch (err) { res.status(500).json({ error: err.message }); }
});

// Get single staff
router.get('/:id', async (req, res) => {
  try {
    const staff = await Staff.findById(req.params.id);
    if (!staff) return res.status(404).json({ error: 'Staff not found' });
    res.json(staff);
  } catch (err) { res.status(500).json({ error: err.message }); }
});

// Verify staff PIN (for login on Kitchen/Waiter/POS panels)
router.post('/verify', async (req, res) => {
  try {
    const { staffId, pin } = req.body;
    const staff = await Staff.findOne({ staffId, pin, isActive: true });
    if (!staff) return res.status(401).json({ error: 'Invalid credentials' });
    res.json(staff);
  } catch (err) { res.status(500).json({ error: err.message }); }
});

// Create staff
router.post('/', async (req, res) => {
  try {
    const staff = new Staff(req.body);
    await staff.save();
    res.status(201).json(staff);
  } catch (err) { res.status(400).json({ error: err.message }); }
});

// Update staff
router.put('/:id', async (req, res) => {
  try {
    const staff = await Staff.findByIdAndUpdate(req.params.id, req.body, { new: true });
    if (!staff) return res.status(404).json({ error: 'Staff not found' });
    res.json(staff);
  } catch (err) { res.status(400).json({ error: err.message }); }
});

// Toggle active status
router.patch('/:id/toggle', async (req, res) => {
  try {
    const staff = await Staff.findById(req.params.id);
    if (!staff) return res.status(404).json({ error: 'Staff not found' });
    staff.isActive = !staff.isActive;
    await staff.save();
    res.json(staff);
  } catch (err) { res.status(500).json({ error: err.message }); }
});

// Delete staff
router.delete('/:id', async (req, res) => {
  try {
    await Staff.findByIdAndDelete(req.params.id);
    res.json({ message: 'Deleted' });
  } catch (err) { res.status(500).json({ error: err.message }); }
});

export default router;
