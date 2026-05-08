import express from 'express';
import MenuItem from '../models/MenuItem.js';
const router = express.Router();

router.get('/', async (req, res) => {
  try {
    const { category } = req.query;
    const filter = category ? { category } : {};
    const items = await MenuItem.find(filter).populate('pairings');
    res.json(items);
  } catch (err) { res.status(500).json({ error: err.message }); }
});

router.get('/:id', async (req, res) => {
  try {
    const item = await MenuItem.findById(req.params.id).populate('pairings');
    if (!item) return res.status(404).json({ error: 'Not found' });
    res.json(item);
  } catch (err) { res.status(500).json({ error: err.message }); }
});

router.post('/', async (req, res) => {
  try {
    const item = new MenuItem(req.body);
    await item.save();
    res.status(201).json(item);
  } catch (err) { res.status(400).json({ error: err.message }); }
});

router.put('/:id', async (req, res) => {
  try {
    const item = await MenuItem.findByIdAndUpdate(req.params.id, req.body, { new: true }).populate('pairings');
    if (!item) return res.status(404).json({ error: 'Not found' });
    res.json(item);
  } catch (err) { res.status(400).json({ error: err.message }); }
});

router.delete('/:id', async (req, res) => {
  try {
    await MenuItem.findByIdAndDelete(req.params.id);
    res.json({ message: 'Deleted' });
  } catch (err) { res.status(500).json({ error: err.message }); }
});

router.patch('/:id/toggle', async (req, res) => {
  try {
    const item = await MenuItem.findById(req.params.id);
    if (!item) return res.status(404).json({ error: 'Not found' });
    item.isAvailable = !item.isAvailable;
    await item.save();
    res.json(item);
  } catch (err) { res.status(500).json({ error: err.message }); }
});

router.put('/:id/pairings', async (req, res) => {
  try {
    const item = await MenuItem.findByIdAndUpdate(req.params.id, { pairings: req.body.pairings }, { new: true }).populate('pairings');
    res.json(item);
  } catch (err) { res.status(400).json({ error: err.message }); }
});

export default router;
