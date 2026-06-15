import type { Category, MenuItem } from "@/types/menu";
import { formatCurrency } from "@/lib/utils";

// ISR: trang được tái sinh (re-render ở server) tối đa mỗi 60 giây
export const revalidate = 60;

const API_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:5000/api";

async function getTodayMenu(): Promise<MenuItem[]> {
  const res = await fetch(`${API_URL}/menu/today`);
  if (!res.ok) throw new Error("today menu fetch failed");
  return res.json();
}

async function getCategories(): Promise<Category[]> {
  const res = await fetch(`${API_URL}/categories`);
  if (!res.ok) throw new Error("categories fetch failed");
  return res.json();
}

// Lấy tên danh mục cho 1 món, ưu tiên map theo categoryId (luôn đáng tin cậy),
// fallback sang field "category" nếu BE đã populate sẵn, cuối cùng mới "Khác"
function getCategoryName(
  item: MenuItem,
  categoryNameById: Map<string, string>,
): string {
  if (item.categoryId && categoryNameById.has(item.categoryId)) {
    return categoryNameById.get(item.categoryId)!;
  }
  if (typeof item.category === "string" && item.category.trim()) {
    return item.category;
  }
  if (
    item.category &&
    typeof item.category === "object" &&
    "name" in item.category
  ) {
    return item.category.name;
  }
  return "Khác";
}

export default async function PublicMenuPage() {
  let items: MenuItem[] = [];
  let categories: Category[] = [];
  let loadError = false;

  try {
    [items, categories] = await Promise.all([getTodayMenu(), getCategories()]);
  } catch {
    loadError = true;
  }

  if (loadError) {
    return (
      <div className="mx-auto max-w-5xl px-4 py-16 text-center">
        <p className="text-neutral-500">
          Không thể tải thực đơn lúc này. Vui lòng thử lại sau.
        </p>
      </div>
    );
  }

  const categoryNameById = new Map<string, string>(
    categories.map((c) => [c.id, c.name]),
  );

  const groups = new Map<string, MenuItem[]>();
  for (const item of items) {
    const name = getCategoryName(item, categoryNameById);
    const list = groups.get(name) ?? [];
    list.push(item);
    groups.set(name, list);
  }

  // Sắp xếp nhóm theo orderIndex của danh mục, "Khác" luôn ở cuối
  const orderedNames = [
    ...categories
      .slice()
      .sort((a, b) => a.orderIndex - b.orderIndex)
      .map((c) => c.name)
      .filter((name) => groups.has(name)),
    ...(groups.has("Khác") ? ["Khác"] : []),
  ];

  return (
    <div className="mx-auto max-w-5xl px-4 py-8">
      <div className="mb-6 text-center">
        <h1 className="text-2xl font-bold text-neutral-900 sm:text-3xl">
          Thực đơn hôm nay
        </h1>
        <p className="mt-1 text-sm text-neutral-500">
          Quét mã QR trên bàn để gọi món trực tiếp
        </p>
      </div>

      {items.length === 0 ? (
        <p className="text-center text-neutral-400">Chưa có món nào hôm nay</p>
      ) : (
        orderedNames.map((category) => {
          const catItems = groups.get(category)!;
          return (
            <section key={category} className="mb-8">
              <h2 className="mb-3 text-lg font-semibold text-neutral-800">
                {category}
              </h2>
              <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 md:grid-cols-4">
                {catItems.map((item) => (
                  <div
                    key={item.id}
                    className="rounded-card bg-white p-3 shadow-card"
                  >
                    <div className="mb-2 h-28 w-full overflow-hidden rounded-btn bg-neutral-100">
                      <img
                        src={item.imageUrl || "/menu/placeholder.jpg"}
                        alt={item.name}
                        className="h-full w-full object-cover"
                      />
                    </div>
                    <p className="line-clamp-1 font-medium text-neutral-800">
                      {item.name}
                    </p>
                    <p className="mt-1 font-bold text-primary-600">
                      {formatCurrency(item.price)}
                    </p>
                    {!item.isAvailable && (
                      <span className="mt-1 inline-block rounded-full bg-neutral-100 px-2 py-0.5 text-xs text-neutral-500">
                        Hết món
                      </span>
                    )}
                  </div>
                ))}
              </div>
            </section>
          );
        })
      )}
    </div>
  );
}
