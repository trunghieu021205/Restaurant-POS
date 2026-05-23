import Skeleton from '@/components/ui/Skeleton';

export default function MenuSkeleton({ itemCount = 6 }: { itemCount?: number }) {
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 p-4">
      {Array.from({ length: itemCount }).map((_, i) => (
        <div key={i} className="bg-white rounded-xl shadow p-4 space-y-3">
          {/* Ảnh món ăn */}
          <Skeleton variant="rounded" width="100%" height={160} />
          {/* Tên món */}
          <Skeleton variant="text" width="70%" />
          {/* Mô tả ngắn */}
          <Skeleton variant="text" width="50%" />
          {/* Giá + nút thêm */}
          <div className="flex justify-between items-center">
            <Skeleton variant="text" width="30%" />
            <Skeleton variant="rounded" width={100} height={36} />
          </div>
        </div>
      ))}
    </div>
  );
}