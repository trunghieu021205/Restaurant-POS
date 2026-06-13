# Admin CRUD & Analytics Dashboard Integration

## 📌 Title: `feat: Admin CRUD for Categories/Menu and Analytics Dashboard Integration`

---

## 📖 Description
Hoàn thiện toàn bộ **Phần 1 (Admin CRUD Danh mục & Món ăn)** cùng tính năng **Dashboard Thống kê hệ thống**. 

Quá trình triển khai tuân thủ nghiêm ngặt chỉ thị của Tech Lead: **Tách biệt hoàn toàn logic Backend sang các file phụ trợ mới**, bảo vệ nguyên trạng 100% codebase cũ của nhóm, triệt tiêu tối đa rủi ro gây conflict khi merge.

---

## 🛠️ Detailed Changes (Chi tiết các thay đổi)

### 🮰 Backend (Cấu trúc độc lập - File-isolated)
* **Controllers:**
    * `src/controllers/categoriesAdminController.js`: Xử lý CRUD danh mục, cấu hình dữ liệu trả về chuẩn thuộc tính `id` thay vì `_id`.
    * `src/controllers/menuAdminController.js`: Xử lý CRUD món ăn cho Admin.
    * `src/controllers/statsAdminController.js`: Sử dụng MongoDB Aggregation kết hợp `$match`, `$unwind`, `$group` và `$lookup` để tính toán thời gian thực tổng doanh thu từ các đơn hàng có trạng thái `'paid'`, đếm tổng số đơn và lọc Top 5 món ăn bán chạy nhất.
* **Routes:**
    * Tạo mới `categoriesAdminRoutes.js`, `menuAdminRoutes.js`, `statsAdminRoutes.js` bọc qua 2 tầng bảo mật `authMiddleware` và `roleMiddleware('admin')`.
* **Entry Point (`src/index.js`):**
    * Đăng ký an toàn các tuyến đường mới dưới endpoint `/api/admin/...` mà không can thiệp vào các router dùng chung hiện tại.

### 🮰 Frontend (Ráp nối giao diện & Sửa lỗi lõi)
* **Services Layer:**
    * `adminCategories.ts` & `adminMenu.ts`: Xây dựng các hàm fetch dữ liệu tích hợp tự động gắn Token xác thực quyền Admin lấy từ Zustand Store.
    * Tích hợp bộ **Data Mapper trung gian** tại file service để đồng bộ bất nhất đặt tên biến giữa Mock UI và MongoDB Schema (`image` $\leftrightarrow$ `imageUrl`, `status` $\leftrightarrow$ `isAvailable`), loại bỏ lỗi hiển thị ảnh và trạng thái "Hết món".
    * `adminStats.ts`: Cấu hình hàm `getApiUrl` thông minh để tự động nhận diện và làm sạch chuỗi cấu hình biến môi trường, triệt tiêu hoàn toàn lỗi lặp đường dẫn `/api/api`.
* **Pages & Components Optimization:**
    * `src/app/admin/menu/page.tsx` & `src/app/admin/page.tsx`: Triển khai kỹ thuật **Mount Guard (`mounted` state)** kết hợp điều phối side-effect trong `useEffect` để sửa dứt điểm lỗi gián đoạn render Router và lỗi Hydration Mismatch đặc trưng của Next.js 16 (Turbopack).
    * **Navbar Link Fix:** Sửa đường dẫn điều hướng của nút "Thống kê" từ `/admin/stats` về đúng `/admin` để khớp với File-based Routing của App Router, xử lý triệt để lỗi giao diện 404.

---

## 🧪 Testing & Verification (Trạng thái kiểm thử)
* **Backend Tests:** Chạy script nội bộ `node tests/check_part1.js` đạt kết quả **100% Passed** cho toàn bộ luồng tạo, đọc, sửa, xóa dữ liệu trên database thật.
* **Frontend Integration:** Kết nối API thông suốt thành công. Giao diện Dashboard và Thực đơn Admin hiển thị chuẩn xác cấu trúc, nhận diện đúng token quyền hạn, sẵn sàng nhảy số liệu tự động khi cơ sở dữ liệu có biến động đơn hàng.