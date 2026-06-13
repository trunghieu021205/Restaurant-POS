const cloudinary = require('cloudinary').v2;
const { CloudinaryStorage } = require('multer-storage-cloudinary');
const multer = require('multer');

// 🌟 BỘ GIÁM SÁT AN TOÀN (GUARD): Kiểm tra nghiêm ngặt sự tồn tại của các khóa cấu hình
const requiredEnv = ['CLOUDINARY_CLOUD_NAME', 'CLOUDINARY_API_KEY', 'CLOUDINARY_API_SECRET'];
const missingEnv = requiredEnv.filter(key => !process.env[key]);

if (missingEnv.length > 0) {
  console.error('\n❌ [CRITICAL ERROR] THIẾU CẤU HÌNH TÀI KHOẢN CLOUDINARY TRONG FILE .ENV!');
  console.error(`⚠️  Vui lòng điền bổ sung các biến sau vào file .env của Backend: ${missingEnv.join(', ')}`);
  console.error(`👉 Tiến trình upload hình ảnh món ăn/danh mục sẽ bị lỗi nếu thiếu các khóa này.\n`);
}

// 1. Cấu hình thông tin kết nối Cloudinary từ env
cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
});

// 2. Định nghĩa nơi lưu trữ ảnh trên Cloudinary
const storage = new CloudinaryStorage({
  cloudinary: cloudinary,
  params: {
    folder: 'restaurant-pos-menu', // Tên thư mục chứa ảnh trên Cloudinary của dự án
    allowed_formats: ['jpg', 'jpeg', 'png', 'webp'], // Các định dạng file được chấp nhận
    transformation: [{ width: 600, height: 600, crop: 'limit' }] // Tự động nén và tối ưu dung lượng ảnh món ăn
  },
});

// 3. Khởi tạo middleware upload
const upload = multer({ 
  storage: storage,
  limits: { fileSize: 5 * 1024 * 1024 } // Giới hạn kích thước file tối đa 5MB để bảo vệ server
});

module.exports = { cloudinary, upload };