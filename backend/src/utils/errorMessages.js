const ERROR_MESSAGES = {
  // Common
  'Failed to get table statuses': 'Không thể lấy danh sách trạng thái bàn',
  'Customer name and valid phone are required': 'Cần có tên khách hàng và số điện thoại hợp lệ',
  'Table not found': 'Không tìm thấy bàn',
  'Cannot reserve an occupied table': 'Không thể đặt bàn đang được sử dụng',
  'Failed to reserve table': 'Không thể đặt bàn',

  'Open bill exists. Staff confirmation is required.': 'Tồn tại hóa đơn chưa thanh toán. Cần xác nhận từ nhân viên.',
  'Failed to unlock table': 'Không thể mở khóa bàn',
  'Failed to get audit logs': 'Không thể lấy lịch sử thao tác',
  'Failed to create payment notification': 'Không thể tạo thông báo thanh toán',
  'Failed to get payment notifications': 'Không thể lấy danh sách thông báo thanh toán',
  'Failed to update payment notification': 'Không thể cập nhật thông báo thanh toán',
  'Notification not found': 'Không tìm thấy thông báo',
  'Invalid payment status': 'Trạng thái thanh toán không hợp lệ',
  'Only cash payment requests can be completed by staff': 'Chỉ yêu cầu thanh toán tiền mặt mới có thể được nhân viên hoàn tất',
  'The payment request is no longer payable': 'Yêu cầu thanh toán không còn khả dụng',
  'Failed to get table bill': 'Không thể lấy hóa đơn bàn',
  'Failed to check table': 'Không thể kiểm tra bàn',
  'Failed to checkout bill': 'Không thể thanh toán hóa đơn',

  // Cart
  'Khong co ban nay': 'Không có bàn này',
  'Loi khi lay gio hang': 'Lỗi khi lấy giỏ hàng',
  'Khong co ban nay (cart)': 'Không có bàn này',
  'Mon an khong ton tai': 'Món ăn không tồn tại',
  'Mon nay da het. Menu se duoc cap nhat lai.': 'Món này đã hết. Menu sẽ được cập nhật lại.',
  'Loi khi them vao gio hang': 'Lỗi khi thêm vào giỏ hàng',
  'Gio hang trong': 'Giỏ hàng trống',
  'Loi khi xoa mon khoi gio hang': 'Lỗi khi xóa món khỏi giỏ hàng',
  'Da don sach gio hang': 'Đã dọn sạch giỏ hàng',
  'Loi khi xoa toan bo gio hang': 'Lỗi khi xóa toàn bộ giỏ hàng',
  'Gio hang khong ton tai': 'Giỏ hàng không tồn tại',
  'Mon khong co trong gio hang': 'Món không có trong giỏ hàng',
  'Loi khi cap nhat ghi chu': 'Lỗi khi cập nhật ghi chú',

  // Menu
  'Failed to fetch menu': 'Không thể tải danh sách menu',
  'Failed to fetch today\u2019s menu': 'Không thể tải menu hôm nay',
  'Failed to fetch menu item': 'Không thể tải thông tin món ăn',
  'Menu item not found': 'Không tìm thấy món ăn',
  'Failed to create menu item': 'Không thể tạo món ăn',
  'Failed to update menu item': 'Không thể cập nhật món ăn',
  'Failed to delete menu item': 'Không thể xóa món ăn',
  'Deleted': 'Đã xóa',
  'isAvailable must be boolean': 'isAvailable phải là kiểu boolean (đúng/sai)',
  'Failed to update availability': 'Không thể cập nhật trạng thái sẵn sàng của món',
  'Today menu updated': 'Đã cập nhật menu hôm nay',
  'Failed to update today menu': 'Không thể cập nhật menu hôm nay',
  'Menu item not found': 'Không tìm thấy món ăn',

  // Orders
  'Missing tableId': 'Thiếu tableId',
  'Table session is not active. Please scan QR and check in again.': 'Phiên bàn chưa được kích hoạt. Vui lòng quét QR và check-in lại.',
  'Order items are required': 'Cần có danh sách món trong đơn',
  'Each item must include menuItemId': 'Mỗi món phải có menuItemId',
  'Each item must include a quantity of at least 1': 'Mỗi món phải có số lượng từ 1 trở lên',
  'Invalid status value': 'Trạng thái không hợp lệ',
  'Order not found': 'Không tìm thấy đơn',
  'Failed to create order': 'Không thể tạo đơn',
  'Invalid status transition from pending to ': 'Chuyển trạng thái không hợp lệ',
  'Failed to update order status': 'Không thể cập nhật trạng thái đơn',
  'Failed to fetch orders': 'Không thể lấy danh sách đơn',
  'Failed to get table orders': 'Không thể lấy danh sách đơn của bàn',
  'Table not found': 'Không tìm thấy bàn',
  'Failed to update today menu': 'Không thể cập nhật menu hôm nay',

  // Payments
  'Missing tableId': 'Thiếu tableId',
  'Table has no open bill to pay': 'Bàn không có hóa đơn mở để thanh toán',
  'Invalid payment method': 'Phương thức thanh toán không hợp lệ',
  'Payment request sent to staff': 'Đã gửi yêu cầu thanh toán tới nhân viên',
  'Payment successful': 'Thanh toán thành công',
  'Failed to process payment': 'Không thể xử lý thanh toán',
  'Failed to fetch payments': 'Không thể lấy danh sách thanh toán',
  'orderId là bắt buộc': 'orderId là bắt buộc',

  'orderId is required': 'Thiếu orderId',
  'Order not found': 'Không tìm thấy đơn',
  'Table not found': 'Không tìm thấy bàn',
  'Bill not found': 'Không tìm thấy hóa đơn',
  'Bill is not open': 'Hóa đơn không ở trạng thái mở',
  'Open bill has no orders to pay': 'Hóa đơn mở không có đơn hàng để thanh toán',
  'Order does not belong to the payable bill': 'Đơn hàng không thuộc hóa đơn có thể thanh toán',
  'Bill has already been paid': 'Hóa đơn đã được thanh toán',
  'Bill is no longer payable': 'Hóa đơn không còn khả dụng để thanh toán',

  'Invalid VNPay signature': 'Chữ ký VNPay không hợp lệ',
  'Payment transaction not found': 'Không tìm thấy giao dịch thanh toán',
  'Payment amount does not match bill total': 'Số tiền thanh toán không khớp tổng hóa đơn',
  'Bill is no longer payable': 'Hóa đơn không còn khả dụng để thanh toán',

  // Fallback
  'Failed to update payment notification': 'Không thể cập nhật thông báo thanh toán',
};

function translateMessage(message) {
  if (!message) return message;
  return ERROR_MESSAGES[message] || message;
}

module.exports = { translateMessage, ERROR_MESSAGES };

