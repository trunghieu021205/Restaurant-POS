import { NextResponse } from 'next/server';
import fs from 'fs';
import path from 'path';

export const dynamic = 'force-dynamic'; // Chặn cache để dữ liệu luôn mới nhất

// 1. Lấy danh sách các số bàn ĐÃ CÓ ảnh QR
export async function GET() {
  try {
    const targetDir = path.join(process.cwd(), 'public', 'table-qr');
    if (!fs.existsSync(targetDir)) {
      return NextResponse.json({ generatedTables: [] });
    }

    const files = fs.readdirSync(targetDir);
    // Lọc ra các số bàn từ tên file "bàn-X-qr.png"
    const generatedTables = files
      .filter(file => file.startsWith('bàn-') && file.endsWith('-qr.png'))
      .map(file => {
        const match = file.match(/bàn-(\d+)-qr\.png/);
        return match ? Number(match[1]) : null;
      })
      .filter(Boolean);

    return NextResponse.json({ generatedTables });
  } catch (error) {
    return NextResponse.json({ generatedTables: [] });
  }
}

// 2. Xóa ảnh QR khỏi thư mục khi Bàn bị xóa
export async function DELETE(req: Request) {
  try {
    const { number } = await req.json();
    const filePath = path.join(process.cwd(), 'public', 'table-qr', `bàn-${number}-qr.png`);
    
    if (fs.existsSync(filePath)) {
      fs.unlinkSync(filePath);
    }
    return NextResponse.json({ success: true });
  } catch (error) {
    return NextResponse.json({ success: false });
  }
}