# 🍔 Restaurant POS - Hệ thống Quản lý Nhà hàng & Gọi món qua mã QR

![Next.js](https://img.shields.io/badge/Next.js-14-black?style=for-the-badge&logo=next.js)
![React](https://img.shields.io/badge/React-20232A?style=for-the-badge&logo=react&logoColor=61DAFB)
![Tailwind CSS](https://img.shields.io/badge/Tailwind_CSS-38B2AC?style=for-the-badge&logo=tailwind-css&logoColor=white)
![Node.js](https://img.shields.io/badge/Node.js-43853D?style=for-the-badge&logo=node.js&logoColor=white)
![Express.js](https://img.shields.io/badge/Express.js-404D59?style=for-the-badge)
![MongoDB](https://img.shields.io/badge/MongoDB-4EA94B?style=for-the-badge&logo=mongodb&logoColor=white)
![Socket.io](https://img.shields.io/badge/Socket.io-black?style=for-the-badge&logo=socket.io&badgeColor=010101)

## 📖 Giới thiệu
**Restaurant POS** là một ứng dụng Web Fullstack hiện đại giúp số hóa và tự động hóa quy trình vận hành của nhà hàng. Hệ thống mang đến trải nghiệm đột phá với tính năng **gọi món bằng mã QR** tại bàn, giúp khách hàng chủ động order mà không cần chờ đợi nhân viên.

Điểm nổi bật của hệ thống là khả năng đồng bộ **Real-time** (thời gian thực) giữa khách hàng, nhà bếp và nhân viên phục vụ, giúp tối ưu hóa thời gian chuẩn bị món và nâng cao chất lượng dịch vụ. Bên cạnh đó, hệ thống cung cấp các công cụ quản trị mạnh mẽ cho Admin để kiểm soát toàn diện hoạt động kinh doanh.

## ✨ Các tính năng nổi bật

### 🧑‍💼 Dành cho Khách hàng (Customer)
*   **Quét mã QR Check-in:** Quét mã QR duy nhất tại mỗi bàn để bắt đầu (Mã QR chứa JWT Token bảo mật).
*   **Menu & Order Trực tuyến:** Xem thực đơn sinh động, thêm món vào giỏ hàng và đặt món (Order) dễ dàng bằng điện thoại cá nhân.
*   **Theo dõi Trạng thái:** Xem trực tiếp trạng thái món ăn đang được chuẩn bị hay đã hoàn thành.

### 👨‍🍳 Dành cho Nhà bếp (Kitchen)
*   **Nhận Đơn Real-time:** Nhận thông báo đơn hàng mới ngay lập tức qua **Socket.IO** (không cần tải lại trang).
*   **Quản lý Chế biến:** Cập nhật trạng thái từng món ăn theo quy trình (Đang nấu ➡️ Đã xong) giúp điều phối bếp nhịp nhàng.

### 🤵 Dành cho Nhân viên (Staff)
*   **Quản lý Sơ đồ Bàn:** Theo dõi trực quan trạng thái các bàn (Bàn trống, đang dùng, bảo trì).
*   **Thanh toán & Hóa đơn:** Xác nhận đơn hàng, xử lý thanh toán và in hóa đơn cho khách.

### 👑 Dành cho Quản trị viên (Admin)
*   **Dashboard Thống kê:** Bảng điều khiển trực quan thống kê doanh thu, món bán chạy, và biểu đồ giao dịch theo thời gian.
*   **Quản lý Thực đơn:** Thêm/Sửa/Xóa món ăn, danh mục. Lọc nhanh trạng thái Còn/Hết món. Hỗ trợ upload ảnh món ăn.
*   **Quản lý Bàn:** Thêm/Sửa/Xóa bàn. **Tự động sinh mã QR** cho bàn mới và tải về máy tính để in ấn.
*   **Quản lý Nhân sự:** Quản lý tài khoản Staff (Tạo mới, Khóa/Mở khóa, Reset mật khẩu mặc định).

## 🛠️ Kiến trúc & Công nghệ

Dự án được xây dựng dựa trên kiến trúc hệ thống hiện đại, phân tách rõ ràng giữa Frontend và Backend.

*   **Frontend:** 
    *   **Next.js 14** (App Router) - Framework React mạnh mẽ.
    *   **React** - Thư viện xây dựng UI.
    *   **Tailwind CSS** - Utility-first CSS framework cho giao diện responsive & đẹp mắt.
    *   **Zustand** - State management nhẹ và linh hoạt.
    *   **React Hook Form** - Quản lý form hiệu quả.
*   **Backend:** 
    *   **Node.js** & **Express.js** - Xây dựng RESTful API tốc độ cao.
    *   Tự động sinh mã QR (sử dụng JWT) và lưu trữ cục bộ.
*   **Cơ sở dữ liệu:** 
    *   **MongoDB** (với **Mongoose** ORM) - Cơ sở dữ liệu NoSQL linh hoạt, mở rộng tốt.
*   **Real-time Communication:** 
    *   **Socket.IO** - Đảm bảo kết nối hai chiều theo thời gian thực giữa server và client.

## ⚙️ Yêu cầu hệ thống (Prerequisites)

Trước khi cài đặt, đảm bảo máy tính của bạn đã cài đặt sẵn:
*   **Node.js**: Phiên bản `v18.x` trở lên.
*   **MongoDB**: Đang chạy local hoặc có chuỗi kết nối MongoDB Atlas.
*   **Git**: Để clone dự án.

## 🚀 Cài đặt & Chạy dự án (Installation & Setup)

Làm theo các bước sau để chạy dự án trên môi trường local của bạn.

### Bước 1: Clone dự án
```bash
git clone <URL_REPO_CUA_BAN>
cd Restaurant-POS
```

### Bước 2: Setup Backend
```bash
# Di chuyển vào thư mục backend
cd backend

# Cài đặt các thư viện (dependencies)
npm install

# (Tuỳ chọn) Copy file .env.example sang .env và cấu hình (Xem phần bên dưới)

# Khởi chạy server backend
npm run dev
```

### Bước 3: Setup Frontend
Mở một terminal mới và chạy:
```bash
# Di chuyển vào thư mục frontend
cd frontend

# Cài đặt các thư viện (dependencies)
npm install

# (Tuỳ chọn) Copy file .env.local.example sang .env.local và cấu hình (Xem phần bên dưới)

# Khởi chạy ứng dụng frontend
npm run dev
```

## 🔐 Cấu hình biến môi trường (Environment Variables)

Hệ thống yêu cầu các biến môi trường để hoạt động chính xác. Bạn cần tạo các file `.env` tương ứng ở mỗi thư mục.

### Backend (`backend/.env`)
Tạo file `.env` ở thư mục `backend/` với nội dung sau:
```env
# Cổng chạy server
PORT=5000

# Chuỗi kết nối MongoDB
MONGO_URI=mongodb://localhost:27017/restaurant-pos

# Secret Key dùng để mã hóa JWT (Thay đổi thành chuỗi bảo mật của bạn)
JWT_SECRET=your_super_secret_key_here
```

### Frontend (`frontend/.env.local`)
Tạo file `.env.local` ở thư mục `frontend/` với nội dung sau:
```env
# Đường dẫn gọi API tới Backend
NEXT_PUBLIC_API_URL=http://localhost:5000
```

## 🔑 Tài khoản mặc định (Default Accounts)

Sau khi khởi chạy thành công, bạn có thể sử dụng tài khoản Admin mặc định sau để trải nghiệm hệ thống:

*   **Email:** `admin@gmail.com`
*   **Mật khẩu:** `123456`

> ⚠️ **Lưu ý:** Hãy đổi mật khẩu ngay sau khi deploy lên môi trường production.

## 👥 Tác giả (Author / Contributors)

*   **[Tên của bạn]** - *Fullstack Developer*

---
*Nếu bạn thấy dự án này hữu ích, đừng quên cho 1 ⭐️ nhé!*