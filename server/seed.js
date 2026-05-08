import MenuItem from './models/MenuItem.js';
import Table from './models/Table.js';
import Order from './models/Order.js';
import Staff from './models/Staff.js';

export async function seedDatabase() {
  const existingItems = await MenuItem.countDocuments();
  if (existingItems > 0) return;

  // --- STAFF ---
  await Staff.create([
    { name: 'Rahul Singh', role: 'chef', pin: '1234', phone: '9876543210' },
    { name: 'Amit Verma', role: 'chef', pin: '1234', phone: '9876543211' },
    { name: 'Priya Sharma', role: 'waiter', pin: '1234', phone: '9876543212' },
    { name: 'Alex Kumar', role: 'waiter', pin: '1234', phone: '9876543213' },
    { name: 'Neha Patel', role: 'waiter', pin: '1234', phone: '9876543214' },
    { name: 'Rohan Gupta', role: 'pos', pin: '1234', phone: '9876543215' },
    { name: 'Admin', role: 'admin', pin: '0000', phone: '9876543200' },
  ]);

  // --- MENU ITEMS ---
  const extras = await MenuItem.insertMany([
    { name: 'Masala Chhach', price: 40, category: 'Extras', description: 'Traditional spiced buttermilk', image: '🥛', isVeg: true },
    { name: 'Green Salad', price: 60, category: 'Extras', description: 'Fresh garden salad with lemon dressing', image: '🥗', isVeg: true },
    { name: 'Spoon & Napkin Set', price: 10, category: 'Extras', description: 'Premium spoon and napkin set', image: '🥄', isVeg: true },
    { name: 'Raita', price: 50, category: 'Extras', description: 'Cool yogurt with cucumber and spices', image: '🫙', isVeg: true },
    { name: 'Papad', price: 30, category: 'Extras', description: 'Crispy roasted papad', image: '🫓', isVeg: true },
    { name: 'Pickle Plate', price: 25, category: 'Extras', description: 'Assorted Indian pickles', image: '🫒', isVeg: true }
  ]);

  await MenuItem.insertMany([
    { name: 'Paneer Tikka', price: 220, category: 'Starters', description: 'Marinated cottage cheese grilled in tandoor', image: '🧀', isVeg: true, pairings: [extras[0]._id, extras[1]._id, extras[4]._id] },
    { name: 'Chicken Tikka', price: 280, category: 'Starters', description: 'Spiced chicken pieces grilled to perfection', image: '🍗', isVeg: false, pairings: [extras[0]._id, extras[1]._id] },
    { name: 'Veg Spring Roll', price: 180, category: 'Starters', description: 'Crispy rolls stuffed with vegetables', image: '🌯', isVeg: true, pairings: [extras[1]._id] },
    { name: 'Tandoori Chicken', price: 320, category: 'Starters', description: 'Half chicken marinated in yogurt and spices', image: '🍖', isVeg: false, pairings: [extras[0]._id, extras[1]._id, extras[5]._id] },
    { name: 'Hara Bhara Kebab', price: 190, category: 'Starters', description: 'Green pea and spinach kebabs', image: '🥬', isVeg: true, pairings: [extras[0]._id, extras[3]._id] }
  ]);

  const mainCourse = await MenuItem.insertMany([
    { name: 'Butter Chicken', price: 340, category: 'Main Course', description: 'Creamy tomato-based chicken curry', image: '🍛', isVeg: false, pairings: [extras[0]._id, extras[1]._id, extras[3]._id, extras[2]._id] },
    { name: 'Paneer Butter Masala', price: 280, category: 'Main Course', description: 'Rich and creamy paneer curry', image: '🧈', isVeg: true, pairings: [extras[0]._id, extras[1]._id, extras[3]._id] },
    { name: 'Dal Makhani', price: 220, category: 'Main Course', description: 'Slow-cooked black lentils in butter', image: '🫘', isVeg: true, pairings: [extras[0]._id, extras[4]._id] },
    { name: 'Chicken Biryani', price: 320, category: 'Rice', description: 'Fragrant basmati rice with spiced chicken', image: '🍚', isVeg: false, pairings: [extras[0]._id, extras[3]._id, extras[1]._id] },
    { name: 'Veg Biryani', price: 250, category: 'Rice', description: 'Aromatic rice with mixed vegetables', image: '🍱', isVeg: true, pairings: [extras[0]._id, extras[3]._id] },
    { name: 'Malai Kofta', price: 260, category: 'Main Course', description: 'Paneer and potato dumplings in creamy gravy', image: '🥘', isVeg: true, pairings: [extras[0]._id, extras[1]._id] },
    { name: 'Chole Bhature', price: 180, category: 'Main Course', description: 'Spicy chickpeas with fried bread', image: '🫛', isVeg: true, pairings: [extras[0]._id, extras[5]._id] }
  ]);

  const breads = await MenuItem.insertMany([
    { name: 'Butter Naan', price: 50, category: 'Breads', description: 'Soft naan brushed with butter', image: '🫓', isVeg: true },
    { name: 'Garlic Naan', price: 60, category: 'Breads', description: 'Naan with fresh garlic and herbs', image: '🧄', isVeg: true },
    { name: 'Tandoori Roti', price: 30, category: 'Breads', description: 'Whole wheat bread from tandoor', image: '🍞', isVeg: true },
    { name: 'Laccha Paratha', price: 50, category: 'Breads', description: 'Layered flaky bread', image: '🥞', isVeg: true }
  ]);

  const drinks = await MenuItem.insertMany([
    { name: 'Mango Lassi', price: 90, category: 'Drinks', description: 'Sweet mango yogurt drink', image: '🥭', isVeg: true },
    { name: 'Masala Chai', price: 40, category: 'Drinks', description: 'Traditional Indian spiced tea', image: '🍵', isVeg: true },
    { name: 'Fresh Lime Soda', price: 60, category: 'Drinks', description: 'Refreshing lime with soda', image: '🍋', isVeg: true },
    { name: 'Coca Cola', price: 50, category: 'Drinks', description: 'Chilled cola 300ml', image: '🥤', isVeg: true },
    { name: 'Mineral Water', price: 30, category: 'Drinks', description: 'Packaged drinking water 1L', image: '💧', isVeg: true }
  ]);

  await MenuItem.insertMany([
    { name: 'Gulab Jamun', price: 80, category: 'Desserts', description: 'Soft milk dumplings in sugar syrup', image: '🍩', isVeg: true },
    { name: 'Rasmalai', price: 100, category: 'Desserts', description: 'Soft paneer balls in sweet milk', image: '🍮', isVeg: true },
    { name: 'Kulfi', price: 70, category: 'Desserts', description: 'Traditional Indian ice cream', image: '🍦', isVeg: true }
  ]);

  const tables = [];
  for (let i = 1; i <= 18; i++) tables.push({ number: i, status: 'free', capacity: i <= 6 ? 2 : i <= 14 ? 4 : 6 });
  await Table.insertMany(tables);

  // Sample orders with status history
  const sampleOrders = [
    { tableNumber: 5, customerName: 'Rahul Sharma', customerPhone: '9876543210',
      items: [
        { menuItemId: mainCourse[0]._id, name: 'Butter Chicken', price: 340, quantity: 1, isVeg: false },
        { menuItemId: mainCourse[2]._id, name: 'Dal Makhani', price: 220, quantity: 1, isVeg: true },
        { menuItemId: breads[1]._id, name: 'Garlic Naan', price: 60, quantity: 2, isVeg: true }
      ],
      status: 'preparing', preparedBy: 'Rahul Singh (C001)',
      statusHistory: [
        { status: 'new', changedBy: 'Rahul Sharma', changedByRole: 'customer', timestamp: new Date(Date.now() - 20 * 60000) },
        { status: 'preparing', changedBy: 'Rahul Singh (C001)', changedByRole: 'chef', timestamp: new Date(Date.now() - 15 * 60000) }
      ]
    },
    { tableNumber: 7, customerName: 'Priya Patel', customerPhone: '9123456780',
      items: [
        { menuItemId: mainCourse[1]._id, name: 'Paneer Butter Masala', price: 280, quantity: 1, isVeg: true },
        { menuItemId: breads[0]._id, name: 'Butter Naan', price: 50, quantity: 3, isVeg: true },
        { menuItemId: drinks[0]._id, name: 'Mango Lassi', price: 90, quantity: 2, isVeg: true }
      ],
      status: 'new',
      statusHistory: [{ status: 'new', changedBy: 'Priya Patel', changedByRole: 'customer', timestamp: new Date(Date.now() - 5 * 60000) }]
    },
    { tableNumber: 3, customerName: 'Amit Kumar', customerPhone: '9988776655',
      items: [
        { menuItemId: mainCourse[3]._id, name: 'Chicken Biryani', price: 320, quantity: 2, isVeg: false },
        { menuItemId: drinks[0]._id, name: 'Mango Lassi', price: 90, quantity: 2, isVeg: true }
      ],
      status: 'ready', preparedBy: 'Amit Verma (C002)',
      statusHistory: [
        { status: 'new', changedBy: 'Amit Kumar', changedByRole: 'customer', timestamp: new Date(Date.now() - 30 * 60000) },
        { status: 'preparing', changedBy: 'Amit Verma (C002)', changedByRole: 'chef', timestamp: new Date(Date.now() - 25 * 60000) },
        { status: 'ready', changedBy: 'Amit Verma (C002)', changedByRole: 'chef', timestamp: new Date(Date.now() - 5 * 60000) }
      ]
    }
  ];

  for (const od of sampleOrders) {
    const order = new Order(od);
    order.statusHistory = od.statusHistory;
    await order.save();
    await Table.findOneAndUpdate({ number: od.tableNumber }, { status: od.status === 'ready' ? 'ready' : 'occupied', customerName: od.customerName, currentOrderId: order._id });
  }

  console.log(`✅ Seeded: ${await MenuItem.countDocuments()} items, ${await Table.countDocuments()} tables, ${await Order.countDocuments()} orders, ${await Staff.countDocuments()} staff`);
}
