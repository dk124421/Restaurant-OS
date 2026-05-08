import express from 'express';
import Table from '../models/Table.js';
const router = express.Router();

router.get('/', async (req, res) => {
  try {
    const tables = await Table.find().sort({ number: 1 });
    res.json(tables);
  } catch (err) { res.status(500).json({ error: err.message }); }
});

router.get('/:number', async (req, res) => {
  try {
    const table = await Table.findOne({ number: parseInt(req.params.number) });
    if (!table) return res.status(404).json({ error: 'Not found' });
    res.json(table);
  } catch (err) { res.status(500).json({ error: err.message }); }
});

router.patch('/:number/status', async (req, res) => {
  try {
    const { status } = req.body;
    const table = await Table.findOneAndUpdate({ number: parseInt(req.params.number) }, { status }, { new: true });
    if (!table) return res.status(404).json({ error: 'Not found' });
    req.app.get('io').emit('tableUpdated');
    res.json(table);
  } catch (err) { res.status(400).json({ error: err.message }); }
});

router.patch('/:number/help', async (req, res) => {
  try {
    const table = await Table.findOneAndUpdate({ number: parseInt(req.params.number) }, { status: 'help' }, { new: true });
    const io = req.app.get('io');
    io.emit('tableUpdated');
    io.emit('helpRequested', { tableNumber: table.number });
    res.json(table);
  } catch (err) { res.status(400).json({ error: err.message }); }
});

export default router;
