import { NextResponse } from 'next/server';
import fs from 'fs';
import path from 'path';

export async function POST(req: Request) {
  try {
    const { qrCode, number } = await req.json();

    if (!qrCode || !number) {
      return NextResponse.json({ message: 'Thiếu dữ liệu QR hoặc Số bàn' }, { status: 400 });
    }

    // Tách bỏ phần tiền tố "data:image/png;base64," để lấy dữ liệu ảnh thuần
    const base64Data = qrCode.replace(/^data:image\/png;base64,/, "");

    // process.cwd() tự động trỏ đến gốc của folder "frontend"
    const targetDir = path.join(process.cwd(), 'public', 'table-qr');

    // Tự động tạo folder nếu nó chưa tồn tại
    if (!fs.existsSync(targetDir)) {
      fs.mkdirSync(targetDir, { recursive: true });
    }

    // Tạo tên file: "bàn-1-qr.png"
    const filePath = path.join(targetDir, `bàn-${number}-qr.png`);

    // Tiến hành ghi đè file ảnh vào thư mục
    fs.writeFileSync(filePath, base64Data, 'base64');

    return NextResponse.json({ success: true, message: 'Lưu thành công' });
  } catch (error) {
    console.error('Lưu QR lỗi:', error);
    return NextResponse.json({ message: 'Lỗi khi ghi file vào hệ thống' }, { status: 500 });
  }
}