import mongoose from 'mongoose';

const staffSchema = new mongoose.Schema({
  name: { type: String, required: true },
  role: { type: String, required: true, enum: ['waiter', 'chef', 'pos', 'admin'] },
  pin: { type: String, required: true },
  phone: { type: String, default: '' },
  isActive: { type: Boolean, default: true },
  staffId: { type: String, unique: true }
}, { timestamps: true });

// Auto-generate staffId like W001, C001, P001, A001
staffSchema.pre('save', async function(next) {
  if (!this.staffId) {
    const prefix = { waiter: 'W', chef: 'C', pos: 'P', admin: 'A' }[this.role] || 'S';
    const count = await mongoose.model('Staff').countDocuments({ role: this.role });
    this.staffId = `${prefix}${String(count + 1).padStart(3, '0')}`;
  }
  next();
});

export default mongoose.model('Staff', staffSchema);
