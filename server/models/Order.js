import mongoose from 'mongoose';

const orderItemSchema = new mongoose.Schema({
  menuItemId: { type: mongoose.Schema.Types.ObjectId, ref: 'MenuItem' },
  name: { type: String, required: true },
  price: { type: Number, required: true },
  quantity: { type: Number, required: true, min: 1 },
  isVeg: { type: Boolean, default: true }
}, { _id: false });

const statusHistorySchema = new mongoose.Schema({
  status: { type: String, required: true },
  changedBy: { type: String, default: '' },
  changedByRole: { type: String, default: '' },
  timestamp: { type: Date, default: Date.now }
}, { _id: false });

const orderSchema = new mongoose.Schema({
  tableNumber: { type: Number, required: true },
  customerName: { type: String, default: 'Guest' },
  customerPhone: { type: String, default: '' },
  items: [orderItemSchema],
  status: { type: String, enum: ['new', 'preparing', 'ready', 'delivered', 'paid', 'cancelled'], default: 'new' },
  totalAmount: { type: Number, default: 0 },
  paymentMethod: { type: String, enum: ['cash', 'upi', 'card', 'pending'], default: 'pending' },
  notes: { type: String, default: '' },
  // Staff tracking
  preparedBy: { type: String, default: '' },
  servedBy: { type: String, default: '' },
  billedBy: { type: String, default: '' },
  // Full status history
  statusHistory: [statusHistorySchema]
}, { timestamps: true });

orderSchema.pre('save', function(next) {
  this.totalAmount = this.items.reduce((sum, item) => sum + (item.price * item.quantity), 0);
  // Add initial status history entry if new
  if (this.isNew && this.statusHistory.length === 0) {
    this.statusHistory.push({ status: 'new', changedBy: this.customerName, changedByRole: 'customer' });
  }
  next();
});

export default mongoose.model('Order', orderSchema);
