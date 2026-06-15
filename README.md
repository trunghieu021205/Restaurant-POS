
# Restaurant POS - Hệ thống Quản lý Nhà hàng & Gọi món qua mã QR

![Next.js](https://img.shields.io/badge/Next.js-14-black?style=for-the-badge&logo=next.js)
![React](https://img.shields.io/badge/React-20232A?style=for-the-badge&logo=react&logoColor=61DAFB)
![Tailwind CSS](https://img.shields.io/badge/Tailwind_CSS-38B2AC?style=for-the-badge&logo=tailwind-css&logoColor=white)
![Node.js](https://img.shields.io/badge/Node.js-43853D?style=for-the-badge&logo=node.js&logoColor=white)
![Express.js](https://img.shields.io/badge/Express.js-404D59?style=for-the-badge)
![MongoDB](https://img.shields.io/badge/MongoDB-4EA94B?style=for-the-badge&logo=mongodb&logoColor=white)
![Socket.io](https://img.shields.io/badge/Socket.io-black?style=for-the-badge&logo=socket.io&badgeColor=010101)

🌐 **Live Demo:** [restaurant-pos-xi-nine.vercel.app](https://restaurant-pos-xi-nine.vercel.app)

## 📋 Mục lục
- [Giới thiệu](#giới-thiệu)
- [Tính năng](#các-tính-năng-nổi-bật)
- [Kiến trúc & Công nghệ](#kiến-trúc--công-nghệ)
- [Yêu cầu hệ thống](#yêu-cầu-hệ-thống-prerequisites)
- [Cài đặt Local](#cài-đặt--chạy-dự-án-installation--setup)
- [Cấu hình Environment](#cấu-hình-biến-môi-trường-environment-variables)
- [Tài khoản mặc định](#tài-khoản-mặc-định-default-accounts)
- [Deploy Production](#-deploy-production)
- [Hướng dẫn sử dụng](#-hướng-dẫn-sử-dụng)
- [Lấy API Keys](#-lấy-api-keys)

---

## Giới thiệu
**Restaurant POS** là một ứng dụng Web Fullstack hiện đại giúp số hóa và tự động hóa quy trình vận hành của nhà hàng. Hệ thống mang đến trải nghiệm đột phá với tính năng **gọi món bằng mã QR** tại bàn, giúp khách hàng chủ động order mà không cần chờ đợi nhân viên.

Điểm nổi bật của hệ thống là khả năng đồng bộ **Real-time** (thời gian thực) giữa khách hàng, nhà bếp và nhân viên phục vụ, giúp tối ưu hóa thời gian chuẩn bị món và nâng cao chất lượng dịch vụ. Bên cạnh đó, hệ thống cung cấp các công cụ quản trị mạnh mẽ cho Admin để kiểm soát toàn diện hoạt động kinh doanh.

---

## Các tính năng nổi bật

### 🍽️ Dành cho Khách hàng (Customer)
- **Quét mã QR Check-in:** Quét mã QR duy nhất tại mỗi bàn để bắt đầu phiên gọi món
- **Menu & Order Trực tuyến:** Xem thực đơn sinh động, thêm món vào giỏ hàng và đặt món dễ dàng bằng điện thoại cá nhân
- **Theo dõi Trạng thái:** Xem trực tiếp trạng thái món ăn (Đang chuẩn bị → Đã hoàn thành)
- **Thanh toán Online:** Tích hợp cổng thanh toán VNPay

### 👨‍🍳 Dành cho Nhà bếp (Kitchen)
- **Nhận Đơn Real-time:** Nhận thông báo đơn hàng mới ngay lập tức qua **Socket.IO**
- **Quản lý Chế biến:** Cập nhật trạng thái từng món (Đang nấu → Đã xong)
- **Âm thanh thông báo:** Có âm thanh khi có đơn hàng mới

### 💁 Dành cho Nhân viên (Staff)
- **Quản lý Sơ đồ Bàn:** Theo dõi trực quan trạng thái các bàn (Trống, Đang dùng, Bảo trì)
- **Thanh toán & Hóa đơn:** Xác nhận đơn hàng, xử lý thanh toán và in hóa đơn
- **Xem lịch sử:** Tra cứu hóa đơn đã thanh toán trong ngày

### 🔧 Dành cho Quản trị viên (Admin)
- **Dashboard Thống kê:** Biểu đồ doanh thu, món bán chạy, giao dịch theo thời gian
- **Quản lý Thực đơn:** Thêm/Sửa/Xóa món ăn, danh mục. Upload ảnh món ăn qua Cloudinary
- **Quản lý Bàn:** Thêm/Sửa/Xóa bàn. **Tự động sinh mã QR** cho bàn mới
- **Quản lý Nhân sự:** Quản lý tài khoản Staff (Tạo mới, Khóa/Mở khóa, Reset mật khẩu)

---

## Kiến trúc & Công nghệ

| Layer | Công nghệ |
|-------|-----------|
| **Frontend** | Next.js 14 (App Router), React, Tailwind CSS, Zustand, React Hook Form |
| **Backend** | Node.js, Express.js, Socket.IO |
| **Database** | MongoDB (Mongoose ORM) |
| **Real-time** | Socket.IO (WebSocket) |
| **Payment** | VNPay Sandbox |
| **Upload** | Cloudinary |
| **Auth** | JWT (JSON Web Token) |

---

## Yêu cầu hệ thống (Prerequisites)

- **Node.js**: >= v18.x
- **MongoDB**: Local hoặc [MongoDB Atlas](https://www.mongodb.com/atlas)
- **Git**: Để clone dự án
- **npm** hoặc **yarn**

---

## Cài đặt & Chạy dự án (Installation & Setup)

### 📥 Bước 1: Clone dự án
```bash
git clone https://github.com/trunghieu021205/Restaurant-POS.git
cd restaurant-pos
```

### 🔧 Bước 2: Setup Backend

```bash
# Di chuyển vào thư mục backend
cd backend

# Cài đặt dependencies
npm install

# Tạo file .env từ template
cp .env.example .env

# Mở file .env và điền các giá trị (xem phần Cấu hình bên dưới)

# Khởi chạy server (development)
npm run dev
# Server chạy tại: http://localhost:5000
```

### 🎨 Bước 3: Setup Frontend

Mở terminal mới:

```bash
# Di chuyển vào thư mục frontend
cd frontend

# Cài đặt dependencies
npm install

# Tạo file .env.local
cp .env.local.example .env.local

# Mở file .env.local và điền giá trị

# Khởi chạy ứng dụng (development)
npm run dev
# App chạy tại: http://localhost:3000
```

---

## Cấu hình biến môi trường (Environment Variables)

### Backend (`backend/.env`)

Tạo file `.env` trong thư mục `backend/`:

```env
# ============================================
# Server Configuration
# ============================================
PORT=5000
NODE_ENV=development

# ============================================
# Database - MongoDB
# ============================================
# Format: mongodb+srv://<username>:<password>@<cluster>.mongodb.net/<database>
# Lấy từ: https://www.mongodb.com/atlas (Tạo cluster → Connect → Copy URI)
MONGO_URI=
PASSWORD=

# ============================================
# JWT Authentication
# ============================================
# Tạo secret key bằng lệnh:
# node -e "console.log(require('crypto').randomBytes(64).toString('hex'))"
JWT_SECRET=

# ============================================
# Frontend URL (CORS)
# ============================================
# Development: http://localhost:3000
# Production: https://your-app.vercel.app
FRONTEND_URL=http://localhost:3000

# ============================================
# VNPay Payment Gateway
# ============================================
# Lấy từ: https://sandbox.vnpayment.vn/apis/
# Đăng ký → Quản lý website → Lấy TMN Code & Hash Secret
VNPAY_TMN_CODE=
VNPAY_HASH_SECRET=
VNPAY_PAYMENT_URL=https://sandbox.vnpayment.vn/paymentv2/vpcpay.html
VNPAY_RETURN_URL=http://localhost:5000/api/payments/callback

# ============================================
# Cloudinary - Image Upload
# ============================================
# Lấy từ: https://console.cloudinary.com/
# Đăng ký → Dashboard → Lấy Cloud Name, API Key, API Secret
CLOUDINARY_CLOUD_NAME=
CLOUDINARY_API_KEY=
CLOUDINARY_API_SECRET=
```

### Frontend (`frontend/.env.local`)

Tạo file `.env.local` trong thư mục `frontend/`:

```env
# ============================================
# API Configuration
# ============================================
# Development: http://localhost:5000/api
# Production: https://restaurant-pos-lrvl.onrender.com/api
NEXT_PUBLIC_API_URL=http://localhost:5000/api
```

---

## Tài khoản mặc định (Default Accounts)

Sau khi khởi chạy thành công, sử dụng tài khoản sau để đăng nhập:

| Vai trò | Email | Mật khẩu |
|---------|-------|----------|
| **Admin** | `admin@gmail.com` | `Secret123` |
| **Staff User** | `user@pos.com` | `123456` |

---

## 🚀 Deploy Production

### Backend → Render.com

1. **Đẩy code lên GitHub:**
```bash
git add .
git commit -m "ready for deployment"
git push origin main
```

2. **Vào [render.com](https://render.com)** → **New Web Service**

3. **Connect GitHub repo** và cấu hình:
```
Name: restaurant-api
Region: Singapore
Branch: main
Root Directory: backend
Runtime: Node
Build Command: npm install
Start Command: node server.js
```

4. **Thêm Environment Variables:**
   - Copy tất cả biến từ `backend/.env`
   - Sửa các URL thành production:
```
NODE_ENV=production
FRONTEND_URL=https://restaurant-pos-xi-nine.vercel.app
VNPAY_RETURN_URL=https://restaurant-pos-lrvl.onrender.com/api/payments/callback
```

5. **Deploy** → Backend URL: `https://restaurant-pos-lrvl.onrender.com`

### Frontend → Vercel

1. **Vào [vercel.com](https://vercel.com)** → **New Project**

2. **Import GitHub repo** và cấu hình:
```
Root Directory: frontend
Framework: Next.js
```

3. **Thêm Environment Variable:**
```
NEXT_PUBLIC_API_URL = https://restaurant-api.onrender.com/api
```

4. **Deploy** → Frontend URL: `https://restaurant-pos-xi-nine.vercel.app`

> 📝 **Sau khi deploy, cập nhật `FRONTEND_URL` trên Render Dashboard và Redeploy backend.**

---

## 📖 Hướng dẫn sử dụng

### 🏠 Trang chủ (`/`)
- Landing page giới thiệu nhà hàng
- Điều hướng đến các khu vực chức năng

### 🔐 Đăng nhập (`/login`)
- Admin/Staff đăng nhập vào hệ thống quản lý
- Sử dụng tài khoản mặc định hoặc tài khoản được cấp

### 📋 Admin Dashboard (`/admin`)
- **Menu (`/admin/menu`):** Quản lý thực đơn, thêm/sửa/xóa món
- **Tables (`/admin/tables`):** Quản lý bàn, tạo QR code
- **QR Check-in (`/admin/qr-checkin`):** Quét QR check-in cho khách
- **Users (`/admin/users`):** Quản lý tài khoản nhân viên

### 💁 Staff (`/staff`)
- **Tables (`/staff/tables`):** Xem sơ đồ bàn, trạng thái
- **Paid Bills (`/staff/paid-bills-today`):** Xem hóa đơn đã thanh toán

### 🍳 Kitchen (`/kitchen`)
- Xem danh sách món cần chế biến
- Cập nhật trạng thái món (Đang nấu → Đã xong)
- Nhận thông báo real-time khi có đơn mới

### 📱 Khách hàng (QR Code)
1. Quét mã QR trên bàn
2. Nhập thông tin (tên, số điện thoại)
3. Xem menu và đặt món
4. Theo dõi trạng thái món
5. Yêu cầu thanh toán
6. Thanh toán qua VNPay hoặc tiền mặt

---

## 🔑 Lấy API Keys

| Dịch vụ | Mục đích | Link | Hướng dẫn |
|---------|----------|------|-----------|
| **MongoDB Atlas** | Database | [mongodb.com/atlas](https://www.mongodb.com/atlas) | Tạo cluster → Connect → Copy URI |
| **VNPay Sandbox** | Thanh toán | [sandbox.vnpayment.vn](https://sandbox.vnpayment.vn/apis/) | Đăng ký → Quản lý website → Lấy TMN Code & Hash Secret |
| **Cloudinary** | Upload ảnh | [cloudinary.com](https://cloudinary.com) | Đăng ký → Dashboard → Cloud Name, API Key, API Secret |
| **JWT Secret** | Xác thực | Dùng command line | `node -e "console.log(require('crypto').randomBytes(64).toString('hex'))"` |

---

## 📁 Cấu trúc dự án

```
restaurant-pos/
├── frontend/                    # Next.js App
│   ├── src/
│   │   ├── app/                 # App Router pages
│   │   ├── components/          # UI Components
│   │   ├── hooks/               # Custom hooks
│   │   ├── services/            # API services
│   │   ├── stores/              # Zustand stores
│   │   └── lib/                 # Utilities
│   ├── public/                  # Static files
│   └── package.json
├── backend/                     # Express.js API
│   ├── routes/                  # API routes
│   ├── models/                  # Mongoose models
│   ├── controllers/             # Route controllers
│   ├── middleware/              # Middleware
│   ├── utils/                   # Utilities
│   ├── socket.js                # Socket.IO setup
│   ├── server.js                # Entry point
│   └── package.json
└── README.md
```
**Made with ❤️ by Nhóm 4B**
