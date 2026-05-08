import mongoose from 'mongoose';

const menuItemSchema = new mongoose.Schema({
  name: { type: String, required: true },
  price: { type: Number, required: true },
  category: { type: String, required: true, enum: ['Starters', 'Main Course', 'Breads', 'Rice', 'Drinks', 'Desserts', 'Extras'] },
  description: { type: String, default: '' },
  image: { type: String, default: '' },
  isAvailable: { type: Boolean, default: true },
  isVeg: { type: Boolean, default: true },
  pairings: [{ type: mongoose.Schema.Types.ObjectId, ref: 'MenuItem' }]
}, { timestamps: true });

export default mongoose.model('MenuItem', menuItemSchema);
