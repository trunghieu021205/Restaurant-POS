"use client";

import { useState, useEffect } from "react";
import { useAuth } from "@/hooks/useAuth";
import { useRouter } from "next/navigation";
import { adminUsersService } from "@/services/adminUsers";
import { toast } from "@/lib/toast";
import { Users, UserPlus, Lock, Unlock, KeyRound, Trash2, X } from "lucide-react";
import Skeleton from "@/components/ui/Skeleton";

interface UserData {
  _id: string;
  name: string;
  email: string;
  role: string;
  isActive: boolean;
}

export default function AdminUsersPage() {
  const router = useRouter();
  const { user, isLoading: authLoading } = useAuth();
  const [usersList, setUsersList] = useState<UserData[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  // Form State
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [formData, setFormData] = useState({ name: "", email: "", password: "" });

  useEffect(() => {
    if (!authLoading && (!user || user.role !== "admin")) {
      router.push("/");
    } else if (user?.role === "admin") {
      fetchUsers();
    }
  }, [authLoading, user, router]);

  const fetchUsers = async () => {
    setIsLoading(true);
    try {
      const data = await adminUsersService.getAll();
      setUsersList(data);
    } catch (error: any) {
      toast.error(error.message || "Lỗi tải danh sách nhân sự");
    } finally {
      setIsLoading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await adminUsersService.createStaff(formData);
      toast.success("Tạo tài khoản Staff thành công!");
      setIsModalOpen(false);
      setFormData({ name: "", email: "", password: "" });
      fetchUsers();
    } catch (error: any) {
      toast.error(error.message || "Đã xảy ra lỗi khi tạo tài khoản");
    }
  };

  const handleToggleStatus = async (id: string, currentStatus: boolean) => {
    const action = currentStatus ? "Khóa" : "Mở khóa";
    if (!window.confirm(`Bạn có chắc muốn ${action} tài khoản này?`)) return;
    try {
      const res = await adminUsersService.toggleStatus(id);
      toast.success(res.message);
      fetchUsers();
    } catch (error: any) {
      toast.error(error.message || "Lỗi cập nhật trạng thái");
    }
  };

  const handleResetPassword = async (id: string) => {
    if (!window.confirm("Đặt lại mật khẩu cho tài khoản này về mặc định?")) return;
    try {
      const res = await adminUsersService.resetPassword(id);
      alert(res.message); // Dùng alert để admin dễ copy mật khẩu mới
      toast.success("Đã reset mật khẩu");
    } catch (error: any) {
      toast.error(error.message || "Lỗi reset mật khẩu");
    }
  };

  const handleDelete = async (id: string) => {
    if (!window.confirm("Xóa VĨNH VIỄN tài khoản này? Hành động không thể hoàn tác!")) return;
    try {
      await adminUsersService.delete(id);
      toast.success("Đã xóa tài khoản");
      fetchUsers();
    } catch (error: any) {
      toast.error(error.message || "Lỗi khi xóa");
    }
  };

  if (authLoading || !user) return <div className="min-h-screen bg-neutral-50 flex items-center justify-center"><div className="animate-spin w-8 h-8 border-4 border-primary-500 border-t-transparent rounded-full" /></div>;

  return (
    <div className="min-h-screen bg-neutral-50 py-8">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        
        {/* Header */}
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-6">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-blue-100 flex items-center justify-center">
              <Users className="w-5 h-5 text-blue-600" />
            </div>
            <div>
              <h1 className="text-2xl font-bold text-neutral-800">Quản lý Nhân sự</h1>
              <p className="text-sm text-neutral-500">Tài khoản và quyền truy cập của Staff</p>
            </div>
          </div>
          <button onClick={() => setIsModalOpen(true)} className="flex items-center gap-2 bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg font-medium transition-colors">
            <UserPlus className="w-4 h-4" /> Tạo tài khoản Staff
          </button>
        </div>

        {/* Bảng Nhân sự */}
        <div className="bg-white rounded-2xl shadow-sm border border-neutral-200 overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="bg-neutral-50 border-b border-neutral-200 text-neutral-500 text-sm">
                  <th className="px-6 py-4 font-medium">Nhân viên</th>
                  <th className="px-6 py-4 font-medium">Vai trò</th>
                  <th className="px-6 py-4 font-medium">Trạng thái</th>
                  <th className="px-6 py-4 font-medium text-right">Thao tác</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-neutral-100">
                {isLoading ? (
                  <tr><td colSpan={4} className="p-6"><Skeleton className="h-40 w-full rounded-xl" /></td></tr>
                ) : usersList.length === 0 ? (
                  <tr><td colSpan={4} className="p-10 text-center text-neutral-500">Chưa có nhân viên nào.</td></tr>
                ) : (
                  usersList.map((u) => (
                    <tr key={u._id} className="hover:bg-neutral-50 transition-colors">
                      <td className="px-6 py-4">
                        <div className="font-semibold text-neutral-800">{u.name}</div>
                        <div className="text-sm text-neutral-500">{u.email}</div>
                      </td>
                      <td className="px-6 py-4">
                        <span className="px-2.5 py-1 text-xs font-medium rounded-full bg-blue-50 text-blue-700 capitalize">{u.role}</span>
                      </td>
                      <td className="px-6 py-4">
                        <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 text-xs font-medium rounded-full ${u.isActive ? 'bg-green-50 text-green-700' : 'bg-red-50 text-red-700'}`}>
                          {u.isActive ? <Unlock className="w-3 h-3"/> : <Lock className="w-3 h-3"/>}
                          {u.isActive ? 'Hoạt động' : 'Bị Khóa'}
                        </span>
                      </td>
                      <td className="px-6 py-4">
                        <div className="flex justify-end gap-2">
                          <button onClick={() => handleToggleStatus(u._id, u.isActive)} title={u.isActive ? "Khóa tài khoản" : "Mở khóa"} className={`p-2 rounded-lg transition-colors ${u.isActive ? 'text-orange-500 hover:bg-orange-50' : 'text-green-600 hover:bg-green-50'}`}>
                            {u.isActive ? <Lock className="w-4 h-4" /> : <Unlock className="w-4 h-4" />}
                          </button>
                          <button onClick={() => handleResetPassword(u._id)} title="Reset Mật khẩu" className="p-2 text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"><KeyRound className="w-4 h-4" /></button>
                          <button onClick={() => handleDelete(u._id)} title="Xóa tài khoản" className="p-2 text-red-600 hover:bg-red-50 rounded-lg transition-colors"><Trash2 className="w-4 h-4" /></button>
                        </div>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>

        {/* Modal Thêm Staff */}
        {isModalOpen && (
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
            <div className="bg-white rounded-2xl w-full max-w-md overflow-hidden shadow-xl">
              <div className="px-6 py-4 border-b border-neutral-200 flex justify-between items-center bg-neutral-50">
                <h3 className="font-bold text-lg text-neutral-800">Tạo tài khoản Staff</h3>
                <button onClick={() => setIsModalOpen(false)} className="text-neutral-500 hover:text-neutral-700"><X className="w-5 h-5" /></button>
              </div>
              <form onSubmit={handleSubmit} className="p-6 space-y-4">
                <div>
                  <label className="block text-sm font-medium text-neutral-700 mb-1">Tên nhân viên</label>
                  <input type="text" required value={formData.name} onChange={e => setFormData({...formData, name: e.target.value})} className="w-full px-4 py-2 rounded-lg border border-neutral-300 focus:ring-2 focus:ring-blue-500 outline-none" placeholder="VD: Nguyễn Văn A" />
                </div>
                <div>
                  <label className="block text-sm font-medium text-neutral-700 mb-1">Email đăng nhập</label>
                  <input type="email" required value={formData.email} onChange={e => setFormData({...formData, email: e.target.value})} className="w-full px-4 py-2 rounded-lg border border-neutral-300 focus:ring-2 focus:ring-blue-500 outline-none" placeholder="staff@restaurant.com" />
                </div>
                <div>
                  <label className="block text-sm font-medium text-neutral-700 mb-1">Mật khẩu khởi tạo</label>
                  <input type="text" required minLength={6} value={formData.password} onChange={e => setFormData({...formData, password: e.target.value})} className="w-full px-4 py-2 rounded-lg border border-neutral-300 focus:ring-2 focus:ring-blue-500 outline-none" placeholder="Ít nhất 6 ký tự" />
                </div>
                <div className="flex justify-end gap-3 mt-6">
                  <button type="button" onClick={() => setIsModalOpen(false)} className="px-4 py-2 text-neutral-700 bg-neutral-100 hover:bg-neutral-200 rounded-lg font-medium transition-colors">Hủy</button>
                  <button type="submit" className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg font-medium transition-colors">Tạo tài khoản</button>
                </div>
              </form>
            </div>
          </div>
        )}

      </div>
    </div>
  );
}