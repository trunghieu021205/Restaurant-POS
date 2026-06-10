const path = require('path');
require('dotenv').config({ path: path.resolve(__dirname, '../.env') });

const connectDB = require('./utils/db');

const Table = require('./models/Table');
const MenuItem = require('./models/MenuItem');
const Categories = require('./models/Categories');
const User = require('./models/User');
const Bill = require('./models/Bill');
const Order = require('./models/Order');
const bcrypt = require('bcryptjs');

async function seed() {
  await connectDB();

  // ---------- Xóa dữ liệu cũ (CHỈ tables & menu_items & categories, KHÔNG đụng users) ----------
  await Table.deleteMany({});
  await MenuItem.deleteMany({});
  await Categories.deleteMany({});
  await Bill.deleteMany({});
  await Order.deleteMany({});
  console.log('🗑️  Đã xóa dữ liệu cũ (tables + menu_items + categories)');

  // ---------- Tạo 4 Bàn ----------
  await Table.insertMany([
    { number: 1, capacity: 2, status: 'available' },
    { number: 2, capacity: 4, status: 'available' },
    { number: 3, capacity: 6, status: 'available' },
    { number: 4, capacity: 8, status: 'available' },
  ]);
  console.log('🪑 Đã tạo 4 bàn');

  // ---------- Tạo Danh mục ----------
  const categories = await Categories.insertMany([
    { name: 'Món chính', description: 'Các món ăn chính', isActive: true, orderIndex: 1 },
    { name: 'Khai vị', description: 'Các món khai vị', isActive: true, orderIndex: 2 },
    { name: 'Tráng miệng', description: 'Các món tráng miệng', isActive: true, orderIndex: 3 },
    { name: 'Đồ uống', description: 'Các loại đồ uống', isActive: true, orderIndex: 4 },
  ]);
  console.log('📂 Đã tạo 4 danh mục');

  const mainCategoryId = categories[0]._id.toString();

  // ---------- Tạo 6 Món ----------
  await MenuItem.insertMany([
    {
      name: 'Phở bò',
      price: 50000,
      description: 'Phở bò tái chín đậm đà',
      categoryId: mainCategoryId,
      imageUrl: 'https://res.cloudinary.com/dwdpfc9rq/image/upload/v1780979491/pho_wwtiyi.jpg',
      isAvailable: true,
      isVisibleToday: true,
    },
    {
      name: 'Bún chả',
      price: 45000,
      description: 'Bún chả Hà Nội chính gốc',
      categoryId: mainCategoryId,
      imageUrl: 'https://res.cloudinary.com/dwdpfc9rq/image/upload/v1780979490/buncha_egivnw.jpg',
      isAvailable: true,
      isVisibleToday: true,
    },
    {
      name: 'Cơm tấm',
      price: 40000,
      description: 'Cơm tấm sườn bì chả',
      categoryId: mainCategoryId,
      imageUrl: 'https://res.cloudinary.com/dwdpfc9rq/image/upload/v1780979491/comtam_npbodk.jpg',
      isAvailable: true,
      isVisibleToday: true,
    },
    {
      name: 'Gỏi cuốn',
      price: 35000,
      description: 'Gỏi cuốn tôm thịt tươi',
      categoryId: mainCategoryId,
      imageUrl: 'https://res.cloudinary.com/dwdpfc9rq/image/upload/v1780979491/goicuon_bi8lob.jpg',
      isAvailable: true,
      isVisibleToday: false,
    },
    {
      name: 'Chả giò',
      price: 30000,
      description: 'Chả giò rế giòn tan',
      categoryId: mainCategoryId,
      imageUrl: 'https://res.cloudinary.com/dwdpfc9rq/image/upload/v1780979490/chagio_qatong.jpg',
      isAvailable: true,
      isVisibleToday: true,
    },
    {
      name: 'Bánh mì',
      price: 20000,
      description: 'Bánh mì thịt nướng đặc biệt',
      categoryId: mainCategoryId,
      imageUrl: 'https://res.cloudinary.com/dwdpfc9rq/image/upload/v1780979491/banhmi_yjurbv.jpg',
      isAvailable: true,
      isVisibleToday: true,
    },
  ]);
  console.log('🍜 Đã tạo 6 món ăn');

  // ---------- Seed thêm tài khoản staff để test ----------
  const STAFF_EMAIL = process.env.SEED_STAFF_EMAIL || 'staff@pos.com';
  const STAFF_PASSWORD = process.env.SEED_STAFF_PASSWORD || '123456';
  const STAFF_NAME = process.env.SEED_STAFF_NAME || 'Staff User';

  const staffHash = await bcrypt.hash(STAFF_PASSWORD, 10);
  const existingStaff = await User.findOne({ email: STAFF_EMAIL });

  if (existingStaff) {
    existingStaff.role = 'staff';
    existingStaff.name = STAFF_NAME;
    existingStaff.password = staffHash;
    await existingStaff.save();
    console.log(`🧑‍🍳 Updated staff user: ${STAFF_EMAIL}`);
  } else {
    await User.create({ name: STAFF_NAME, email: STAFF_EMAIL, password: staffHash, role: 'staff' });
    console.log(`🧑‍🍳 Created staff user: ${STAFF_EMAIL}`);
  }

  // ---------- Xong ----------
  console.log('\n✅ Seed hoàn tất!');
  console.log('   Đăng nhập thử:');
  console.log('   - Admin: email=admin@gmail.com / password=Secret123');
  console.log(`   - Staff: email=${STAFF_EMAIL} / password=${STAFF_PASSWORD}`);
  process.exit(0);
}

seed().catch((err) => {
  console.error('❌ Seed thất bại:', err);
  process.exit(1);
});

