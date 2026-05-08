import mongoose from 'mongoose';

const tableSchema = new mongoose.Schema({
  number: { type: Number, required: true, unique: true },
  status: { type: String, enum: ['free', 'occupied', 'ready', 'help'], default: 'free' },
  capacity: { type: Number, default: 4 },
  customerName: { type: String, default: '' },
  customerPhone: { type: String, default: '' },
  currentOrderId: { type: mongoose.Schema.Types.ObjectId, ref: 'Order', default: null }
}, { timestamps: true });

export default mongoose.model('Table', tableSchema);
