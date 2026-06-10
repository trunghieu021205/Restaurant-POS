const jwt = require('jsonwebtoken');
require('dotenv').config();

const PORT = process.env.PORT || 5000;
const BASE_URL = `http://localhost:${PORT}/api/admin`; // Trỏ tới route admin mới

// Tạo token admin giả lập để test
const JWT_SECRET = process.env.JWT_SECRET || 'secret_key'; // Thay bằng secret thật nếu cần
const adminToken = jwt.sign({ id: 'admin123', role: 'admin' }, JWT_SECRET, { expiresIn: '1h' });

const headers = {
    'Content-Type': 'application/json',
    'Authorization': `Bearer ${adminToken}`
};

async function runTests() {
    console.log('--- BẮT ĐẦU TEST PHẦN 1: ADMIN CATEGORY & MENU ITEM CRUD ---');
    let categoryId = null;
    let menuItemId = null;

    try {
        // 1. Tạo Category
        console.log('\n[1] Đang tạo Category mới (Admin Route)...');
        const catRes = await fetch(`${BASE_URL}/categories`, {
            method: 'POST',
            headers,
            body: JSON.stringify({
                name: 'Món Test Admin ' + Date.now(),
                description: 'Danh mục dùng để test độc lập'
            })
        });
        const catData = await catRes.json();
        if (catRes.status === 201) {
            console.log('✅ Verify tạo Category: Thành công (201)');
            categoryId = catData.id; // Sử dụng .id thay vì ._id
            console.log('=> Category ID:', categoryId);
        } else {
            console.log('❌ Lỗi tạo Category:', catRes.status, catData);
            return;
        }

        // 2. Tạo MenuItem gắn với Category
        console.log('\n[2] Đang tạo MenuItem mới gắn với Category (Admin Route)...');
        const menuRes = await fetch(`${BASE_URL}/menu`, {
            method: 'POST',
            headers,
            body: JSON.stringify({
                name: 'Đồ ăn Test Admin',
                price: 50000,
                categoryId: categoryId,
                description: 'Món ăn test qua route admin mới'
            })
        });
        const menuData = await menuRes.json();
        if (menuRes.status === 201) {
            console.log('✅ Verify tạo MenuItem: Thành công (201)');
            menuItemId = menuData.id; // Sử dụng .id theo đúng yêu cầu
            console.log('=> MenuItem ID:', menuItemId);
        } else {
            console.log('❌ Lỗi tạo MenuItem:', menuRes.status, menuData);
            return;
        }

        // 3. Edit MenuItem
        console.log('\n[3] Đang cập nhật (Edit) MenuItem...');
        const editRes = await fetch(`${BASE_URL}/menu/${menuItemId}`, {
            method: 'PUT',
            headers,
            body: JSON.stringify({
                price: 65000,
                description: 'Đã update giá món test admin'
            })
        });
        const editData = await editRes.json();
        if (editRes.status === 200) {
            console.log('✅ Verify Edit MenuItem: Thành công (200)');
            console.log('=> Giá mới:', editData.price);
        } else {
            console.log('❌ Lỗi Edit MenuItem:', editRes.status, editData);
            return;
        }

        // 4. Xóa MenuItem và Category
        console.log('\n[4] Đang xóa MenuItem...');
        const delMenuRes = await fetch(`${BASE_URL}/menu/${menuItemId}`, {
            method: 'DELETE',
            headers
        });
        if (delMenuRes.status === 200) {
            console.log('✅ Verify Xóa MenuItem: Thành công (200)');
        } else {
            console.log('❌ Lỗi Xóa MenuItem:', delMenuRes.status);
        }

        console.log('\n[5] Đang xóa Category...');
        const delCatRes = await fetch(`${BASE_URL}/categories/${categoryId}`, {
            method: 'DELETE',
            headers
        });
        if (delCatRes.status === 200) {
            console.log('✅ Verify Xóa Category: Thành công (200)');
        } else {
            console.log('❌ Lỗi Xóa Category:', delCatRes.status);
        }

        console.log('\n--- KẾT THÚC TEST: HOÀN TẤT ---');

    } catch (error) {
        console.error('❌ Có lỗi xảy ra trong quá trình test:', error);
    }
}

runTests();
