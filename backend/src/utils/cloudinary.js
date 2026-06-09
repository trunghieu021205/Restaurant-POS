const cloudinary = require('cloudinary').v2;
const { CloudinaryStorage } = require('multer-storage-cloudinary');
const multer = require('multer');

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
    folder: 'restaurant-pos-menu', // Tên thư mục chứa ảnh trên Cloudinary của bạn
    allowed_formats: ['jpg', 'jpeg', 'png', 'webp'], // Các định dạng file được chấp nhận
    transformation: [{ width: 600, height: 600, crop: 'limit' }] // Tự động nén/resize ảnh về kích thước hợp lý cho món ăn
  },
});

// 3. Khởi tạo middleware upload
const upload = multer({ 
  storage: storage,
  limits: { fileSize: 5 * 1024 * 1024 } // Giới hạn kích thước file tối đa 50MB
 });

module.exports = { cloudinary, upload };