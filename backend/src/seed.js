const path = require('path');
require('dotenv').config({ path: path.resolve(__dirname, '../.env') });

const connectDB = require('./utils/db');

const Table = require('./models/Table');
const MenuItem = require('./models/MenuItem');

async function seed() {
  await connectDB();

  // ---------- Xóa dữ liệu cũ (CHỈ tables & menu_items, KHÔNG đụng users) ----------
  await Table.deleteMany({});
  await MenuItem.deleteMany({});
  console.log('🗑️  Đã xóa dữ liệu cũ (tables + menu_items)');

  // ---------- Tạo 4 Bàn ----------
  await Table.insertMany([
    { number: 1, capacity: 2, status: 'available' },
    { number: 2, capacity: 4, status: 'available' },
    { number: 3, capacity: 6, status: 'available' },
    { number: 4, capacity: 8, status: 'available' },
  ]);
  console.log('🪑 Đã tạo 4 bàn');

  // ---------- Tạo 6 Món ----------
  await MenuItem.insertMany([
    { name: 'Phở Bò',          price: 55000,  description: 'Phở bò truyền thống',     isAvailable: true, isToday: true },
    { name: 'Bún Bò Huế',      price: 60000,  description: 'Bún bò cay đặc trưng Huế', isAvailable: true, isToday: true },
    { name: 'Cơm Sườn Nướng',  price: 65000,  description: 'Cơm tấm sườn nướng',      isAvailable: true, isToday: true },
    { name: 'Gỏi Cuốn',        price: 45000,  description: 'Gỏi cuốn tôm thịt',       isAvailable: true, isToday: false },
    { name: 'Trà Đào Cam Sả',  price: 35000,  description: 'Trà đào cam sả mát lạnh', isAvailable: true, isToday: true },
    { name: 'Cà Phê Sữa Đá',  price: 25000,  description: 'Cà phê sữa đá Việt Nam',  isAvailable: true, isToday: true },
  ]);
  console.log('🍜 Đã tạo 6 món ăn');

  // ---------- Xong ----------
  console.log('\n✅ Seed hoàn tất!');
  console.log('   Đăng nhập thử: email=admin@pos.com / password=123456');
  process.exit(0);
}

seed().catch((err) => {
  console.error('❌ Seed thất bại:', err);
  process.exit(1);
});
