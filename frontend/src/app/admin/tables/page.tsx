"use client";

import { useState, useEffect } from "react";
import { useAuth } from "@/hooks/useAuth";
import { useRouter } from "next/navigation";
import { adminTablesService } from "@/services/adminTables";
import { toast } from "@/lib/toast";
import { LayoutGrid, Plus, Edit, Trash2, X } from "lucide-react";
import Skeleton from "@/components/ui/Skeleton";

interface Table {
  _id: string;
  number: number;
  capacity: number;
  status: string;
}

export default function AdminTablesPage() {
  const router = useRouter();
  const { user, isLoading: authLoading } = useAuth();
  const [tables, setTables] = useState<Table[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  // Modal State
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingTable, setEditingTable] = useState<Table | null>(null);
  
  // Form State
  const [formData, setFormData] = useState({ number: "", capacity: "", status: "available" });

  useEffect(() => {
    if (!authLoading && (!user || user.role !== "admin")) {
      router.push("/");
    } else if (user?.role === "admin") {
      fetchTables();
    }
  }, [authLoading, user, router]);

  const fetchTables = async () => {
    setIsLoading(true);
    try {
      const data = await adminTablesService.getAll();
      setTables(data);
    } catch (error: any) {
      toast.error(error.message || "Lỗi tải danh sách bàn");
    } finally {
      setIsLoading(false);
    }
  };

  const handleOpenModal = (table?: Table) => {
    if (table) {
      setEditingTable(table);
      setFormData({ number: table.number.toString(), capacity: table.capacity.toString(), status: table.status });
    } else {
      setEditingTable(null);
      setFormData({ number: "", capacity: "", status: "available" });
    }
    setIsModalOpen(true);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      if (editingTable) {
        await adminTablesService.update(editingTable._id, {
          capacity: Number(formData.capacity),
          status: formData.status
        });
        toast.success("Cập nhật bàn thành công!");
      } else {
        await adminTablesService.create({
          number: Number(formData.number),
          capacity: Number(formData.capacity)
        });
        toast.success("Thêm bàn mới thành công!");
      }
      setIsModalOpen(false);
      fetchTables();
    } catch (error: any) {
      toast.error(error.message || "Đã xảy ra lỗi khi lưu");
    }
  };

  const handleDelete = async (id: string, number: number) => {
    if (!window.confirm(`Bạn có chắc chắn muốn xóa Bàn ${number}?`)) return;
    try {
      await adminTablesService.delete(id);
      toast.success("Xóa bàn thành công!");
      fetchTables();
    } catch (error: any) {
      toast.error(error.message || "Lỗi khi xóa bàn");
    }
  };

  if (authLoading || !user) return <div className="min-h-screen bg-neutral-50 flex items-center justify-center"><div className="animate-spin w-8 h-8 border-4 border-primary-500 border-t-transparent rounded-full" /></div>;

  return (
    <div className="min-h-screen bg-neutral-50 py-8">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        
        {/* Header */}
        <div className="flex justify-between items-center mb-6">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-primary-100 flex items-center justify-center">
              <LayoutGrid className="w-5 h-5 text-primary-600" />
            </div>
            <div>
              <h1 className="text-2xl font-bold text-neutral-800">Quản lý Bàn</h1>
              <p className="text-sm text-neutral-500">Thiết lập sơ đồ và sức chứa bàn</p>
            </div>
          </div>
          <button onClick={() => handleOpenModal()} className="flex items-center gap-2 bg-primary-500 hover:bg-primary-600 text-white px-4 py-2 rounded-lg font-medium transition-colors">
            <Plus className="w-4 h-4" /> Thêm bàn mới
          </button>
        </div>

        {/* Bảng Dữ Liệu */}
        {isLoading ? (
           <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-5">
             {Array.from({ length: 8 }).map((_, i) => <Skeleton key={i} className="h-32 rounded-xl" />)}
           </div>
        ) : tables.length === 0 ? (
          <div className="bg-white rounded-2xl p-12 text-center border border-neutral-100 shadow-sm">
            <p className="text-neutral-500">Chưa có bàn nào được thiết lập.</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-5">
            {tables.map(table => (
              <div key={table._id} className="bg-white rounded-xl p-5 border border-neutral-200 shadow-sm hover:shadow-md transition-all flex flex-col justify-between">
                <div className="flex justify-between items-start mb-4">
                  <div>
                    <h3 className="text-xl font-bold text-neutral-800">Bàn {table.number}</h3>
                    <p className="text-sm text-neutral-500">Sức chứa: {table.capacity} người</p>
                  </div>
                  <span className={`px-2 py-1 text-xs font-medium rounded-full ${table.status === 'available' ? 'bg-green-100 text-green-700' : table.status === 'occupied' ? 'bg-red-100 text-red-700' : 'bg-yellow-100 text-yellow-700'}`}>
                    {table.status === 'available' ? 'Trống' : table.status === 'occupied' ? 'Đang dùng' : 'Khác'}
                  </span>
                </div>
                <div className="flex gap-2 justify-end mt-2 pt-4 border-t border-neutral-100">
                  <button onClick={() => handleOpenModal(table)} className="p-2 text-neutral-600 hover:text-primary-600 hover:bg-primary-50 rounded-lg transition-colors"><Edit className="w-4 h-4" /></button>
                  <button onClick={() => handleDelete(table._id, table.number)} className="p-2 text-neutral-600 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors"><Trash2 className="w-4 h-4" /></button>
                </div>
              </div>
            ))}
          </div>
        )}

        {/* Modal Inline */}
        {isModalOpen && (
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
            <div className="bg-white rounded-2xl w-full max-w-md overflow-hidden shadow-xl">
              <div className="px-6 py-4 border-b border-neutral-200 flex justify-between items-center bg-neutral-50">
                <h3 className="font-bold text-lg text-neutral-800">{editingTable ? "Cập nhật Bàn" : "Thêm Bàn Mới"}</h3>
                <button onClick={() => setIsModalOpen(false)} className="text-neutral-500 hover:text-neutral-700"><X className="w-5 h-5" /></button>
              </div>
              <form onSubmit={handleSubmit} className="p-6 space-y-4">
                <div>
                  <label className="block text-sm font-medium text-neutral-700 mb-1">Số Bàn</label>
                  <input type="number" required disabled={!!editingTable} value={formData.number} onChange={e => setFormData({...formData, number: e.target.value})} className="w-full px-4 py-2 rounded-lg border border-neutral-300 focus:ring-2 focus:ring-primary-500 outline-none disabled:bg-neutral-100" placeholder="VD: 1" />
                </div>
                <div>
                  <label className="block text-sm font-medium text-neutral-700 mb-1">Sức chứa (người)</label>
                  <input type="number" required min="1" value={formData.capacity} onChange={e => setFormData({...formData, capacity: e.target.value})} className="w-full px-4 py-2 rounded-lg border border-neutral-300 focus:ring-2 focus:ring-primary-500 outline-none" placeholder="VD: 4" />
                </div>
                {editingTable && (
                  <div>
                    <label className="block text-sm font-medium text-neutral-700 mb-1">Trạng thái</label>
                    <select value={formData.status} onChange={e => setFormData({...formData, status: e.target.value})} className="w-full px-4 py-2 rounded-lg border border-neutral-300 focus:ring-2 focus:ring-primary-500 outline-none">
                      <option value="available">Trống</option>
                      <option value="occupied">Đang sử dụng</option>
                      <option value="reserved">Đã đặt trước</option>
                      <option value="maintenance">Bảo trì</option>
                    </select>
                  </div>
                )}
                <div className="flex justify-end gap-3 mt-6">
                  <button type="button" onClick={() => setIsModalOpen(false)} className="px-4 py-2 text-neutral-700 bg-neutral-100 hover:bg-neutral-200 rounded-lg font-medium transition-colors">Hủy</button>
                  <button type="submit" className="px-4 py-2 bg-primary-500 hover:bg-primary-600 text-white rounded-lg font-medium transition-colors">Lưu lại</button>
                </div>
              </form>
            </div>
          </div>
        )}

      </div>
    </div>
  );
}