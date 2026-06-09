const path = require('path');
require('dotenv').config({ path: path.resolve(__dirname, '../.env') });

const connectDB = require('./utils/db');

const Table = require('./models/Table');
const MenuItem = require('./models/MenuItem');
const Categories = require('./models/Categories');

async function seed() {
  await connectDB();

  // ---------- Xóa dữ liệu cũ (CHỈ tables & menu_items, KHÔNG đụng users) ----------
  await Table.deleteMany({});
  await MenuItem.deleteMany({});
  await Categories.deleteMany({});
  console.log('🗑️  Đã xóa dữ liệu cũ (tables + menu_items + categories)');

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
    { name: 'Phở bò',  price: 50000, description: 'Phở bò tái chín đậm đà', categoryId: '6a2824e3744ad675659cdd8a', imageUrl: 'https://res.cloudinary.com/dwdpfc9rq/image/upload/v1780979491/pho_wwtiyi.jpg', isAvailable: true, isToday: true },
    { name: 'Bún chả', price: 45000, description: 'Bún chả Hà Nội chính gốc', categoryId: '6a2824e3744ad675659cdd8a', imageUrl: 'https://res.cloudinary.com/dwdpfc9rq/image/upload/v1780979490/buncha_egivnw.jpg', isAvailable: true, isToday: true },
    { name: 'Cơm tấm', price: 40000, description: 'Cơm tấm sườn bì chả', categoryId: '6a2824e3744ad675659cdd8a', imageUrl: 'https://res.cloudinary.com/dwdpfc9rq/image/upload/v1780979491/comtam_npbodk.jpg', isAvailable: true, isToday: true },
    { name: 'Gỏi cuốn', price: 35000, description: 'Gỏi cuốn tôm thịt tươi', categoryId: '6a2824e3744ad675659cdd8a', imageUrl: 'https://res.cloudinary.com/dwdpfc9rq/image/upload/v1780979491/goicuon_bi8lob.jpg', isAvailable: true, isToday: false },
    { name: 'Chả giò', price: 30000, description: 'Chả giò rế giòn tan', categoryId: '6a2824e3744ad675659cdd8a', imageUrl: 'https://res.cloudinary.com/dwdpfc9rq/image/upload/v1780979490/chagio_qatong.jpg', isAvailable: true, isToday: true },
    { name: 'Bánh mì', price: 20000, description: 'Bánh mì thịt nướng đặc biệt', categoryId: '6a2824e3744ad675659cdd8a', imageUrl: 'https://res.cloudinary.com/dwdpfc9rq/image/upload/v1780979491/banhmi_yjurbv.jpg', isAvailable: true, isToday: true },
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
