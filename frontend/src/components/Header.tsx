"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { useRouter, usePathname } from "next/navigation";
import useAuthStore from "@/stores/auth";
import useCartStore from "@/stores/cart";
import useBillStore from "@/stores/bill";
import { ShoppingCart, Menu, X, ChevronDown, FileText } from "lucide-react";
import { normalizeRole } from "@/lib/roles";
import { authService } from "@/services/auth";
import { stopProactiveRefresh } from "@/services/apiClient";
import { toast } from "@/lib/toast";

export default function Header() {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const [hasActiveSession, setHasActiveSession] = useState(false);
  const { token, user, logout } = useAuthStore();
  const cartItems = useCartStore((state) => state.items);
  const { tableId, openBill } = useBillStore();
  const router = useRouter();
  const pathname = usePathname();

  useEffect(() => {
    const handleScroll = () => setScrolled(window.scrollY > 10);
    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  useEffect(() => {
    const checkSession = () => {
      setHasActiveSession(
        sessionStorage.getItem("activeTableSession") === "true",
      );
    };

    // Check on mount
    checkSession();

    // Listen for storage changes (for cross-tab sync)
    const handleStorageChange = (e: StorageEvent) => {
      if (e.key === "activeTableSession") {
        checkSession();
      }
    };

    window.addEventListener("storage", handleStorageChange);

    // Also check periodically for same-tab changes
    const interval = setInterval(checkSession, 500);

    return () => {
      window.removeEventListener("storage", handleStorageChange);
      clearInterval(interval);
    };
  }, []);

  useEffect(() => {
    document.body.style.overflow = mobileMenuOpen ? "hidden" : "";
    return () => {
      document.body.style.overflow = "";
    };
  }, [mobileMenuOpen]);

  const handleLogout = async () => {
    try {
      if (token) {
        await authService.logout(token);
      }
    } catch (error) {
      console.error("Logout error:", error);
    } finally {
      stopProactiveRefresh();
      logout();
      router.push("/login");
      setMobileMenuOpen(false);
    }
  };

  const handleLogoClick = () => {
    const isTablePage = pathname?.startsWith("/table/");
    const isNotLoggedIn = !token;
    const hasActiveBill = tableId !== null;

    if (hasActiveBill) {
      toast.warning(
        "Bạn đang có đơn hàng chưa thanh toán. Vui lòng thanh toán trước khi rời bàn.",
      );
    } else if (isTablePage) {
      toast.warning(
        "Bạn đã checkin vào bàn. Không thể quay về trang chủ. Nếu có nhu cầu đổi bàn hãy liên hệ nhân viên để được hỗ trợ",
      );
    } else if (isNotLoggedIn) {
      toast.warning("Vui lòng đăng nhập để tiếp tục.");
    }
  };

  const handleNavigationClick = (e: React.MouseEvent, href: string) => {
    if (hasActiveSession && href !== "/") {
      e.preventDefault();
      alert(
        "Bạn đang có đơn hàng chưa thanh toán. Vui lòng thanh toán trước khi rời bàn.",
      );
    }
  };

  const closeMobileMenu = () => setMobileMenuOpen(false);

  const role = normalizeRole(user?.role);
  const isStaffOrAdmin = role === "staff" || role === "admin";
  const menuHref = role === "staff" ? "/staff/menu" : "/admin/menu";
  const isTablePage = pathname?.startsWith("/table/");
  const isNotLoggedIn = !token;
  const shouldDisableLogo = hasActiveSession || isTablePage || isNotLoggedIn;

  // Đã gỡ bỏ phần check trùng lặp, chỉ giữ lại đường dẫn /admin chính xác
  const navLinks = [
    ...(role === "staff"
      ? [
          { href: "/staff/tables", label: "Sơ đồ bàn" },
          { href: "/staff/menu", label: "Thực đơn" },
          { href: "/kitchen", label: "Bếp" },
        ]
      : []),
    ...(role === "admin"
      ? [
          { href: "/admin", label: "Thống kê" },
          { href: "/admin/tables", label: "Quản lý bàn" }, // Bàn của Admin (CRUD)
          { href: "/admin/menu", label: "Thực đơn" },
          { href: "/admin/users", label: "Nhân sự" }, // Quản lý Staff
        ]
      : []),
  ];

  return (
    <>
      <header
        className={`sticky top-0 z-(--z-header) transition-all duration-300 ${
          scrolled
            ? "bg-white/85 backdrop-blur-md shadow-card"
            : "bg-white shadow-sm"
        }`}
      >
        <div className="container mx-auto px-4 py-3 flex items-center justify-between">
          {shouldDisableLogo ? (
            <button
              onClick={handleLogoClick}
              className="flex items-center space-x-2 text-2xl md:text-lg lg:text-2xl font-bold text-primary-600 hover:text-primary-700 transition-colors bg-transparent border-none cursor-pointer"
            >
              <span className="text-3xl md:text-2xl lg:text-3xl">🍕</span>
              <span className="hidden sm:inline">Restaurant</span>
            </button>
          ) : (
            <Link
              href="/"
              className="flex items-center space-x-2 text-2xl md:text-lg lg:text-2xl font-bold text-primary-600 hover:text-primary-700 transition-colors"
            >
              <span className="text-3xl md:text-2xl lg:text-3xl">🍕</span>
              <span className="hidden sm:inline">Restaurant</span>
            </Link>
          )}

          {/* Desktop nav — chỉ hiện với staff/admin */}
          <nav className="hidden md:flex items-center gap-4 lg:gap-8">
            {navLinks.map((link) => (
              <Link
                key={link.href}
                href={link.href}
                onClick={(e) => handleNavigationClick(e, link.href)}
                className="relative whitespace-nowrap text-sm lg:text-base text-neutral-600 hover:text-primary-600 transition-colors font-medium py-2 group"
              >
                {link.label}
                <span className="absolute bottom-0 left-0 w-full h-0.5 bg-primary-500 scale-x-0 group-hover:scale-x-100 transition-transform origin-left rounded-full" />
              </Link>
            ))}
          </nav>

          <div className="flex items-center space-x-4">
            {/* Bill button — thay thế cart icon, chỉ hiện khi đang ở trang bàn */}
            {tableId && (
              <button
                onClick={openBill}
                className="relative p-2 rounded-btn hover:bg-neutral-100 transition-colors"
                title={`Xem hoá đơn – Bàn ${tableId}`}
                aria-label="Xem hoá đơn"
              >
                <FileText className="h-6 w-6 text-neutral-700 hover:text-primary-600 transition-colors" />
              </button>
            )}

            {/* Auth — giữ nguyên */}
            {token ? (
              <div className="hidden md:flex items-center space-x-3 relative group">
                <button className="flex items-center space-x-2 focus:outline-none">
                  <div className="w-8 h-8 rounded-full bg-primary-100 flex items-center justify-center text-primary-600 font-semibold">
                    {user?.name?.charAt(0).toUpperCase() || "U"}
                  </div>
                  <span className="text-neutral-700 font-medium text-sm">
                    {user?.name}
                  </span>
                  <ChevronDown className="h-4 w-4 text-neutral-500" />
                </button>
                <div className="absolute right-0 top-full mt-2 w-48 bg-white rounded-card shadow-modal opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all duration-200 transform translate-y-1 group-hover:translate-y-0 z-50">
                  <div className="py-1">
                    <button
                      onClick={handleLogout}
                      className="block w-full text-left px-4 py-2 text-sm text-error-500 hover:bg-neutral-100"
                    >
                      Đăng xuất
                    </button>
                  </div>
                </div>
              </div>
            ) : (
              <div className="hidden md:flex space-x-3">
                <Link
                  href="/login"
                  onClick={(e) => handleNavigationClick(e, "/login")}
                  className="px-4 py-2 text-sm font-medium text-neutral-700 border border-neutral-300 rounded-btn hover:border-primary-500 hover:text-primary-600 transition-colors"
                >
                  Đăng nhập
                </Link>
                <Link
                  href="/register"
                  onClick={(e) => handleNavigationClick(e, "/register")}
                  className="px-4 py-2 text-sm font-medium text-white bg-primary-500 rounded-btn hover:bg-primary-600 transition-colors shadow-sm"
                >
                  Đăng ký
                </Link>
              </div>
            )}

            <button
              onClick={() => setMobileMenuOpen(true)}
              className="md:hidden p-2 rounded-btn text-neutral-700 hover:bg-neutral-100 transition-colors"
              aria-label="Mở menu"
            >
              <svg
                className="h-6 w-6"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M4 6h16M4 12h16M4 18h16"
                />
              </svg>
            </button>
          </div>
        </div>
      </header>

      {/* Mobile overlay + drawer — nav links cũng lọc theo role */}
      {mobileMenuOpen && (
        <div
          className="fixed inset-0 bg-black/50 z-(--z-overlay) transition-opacity"
          onClick={closeMobileMenu}
        />
      )}
      <div
        className={`fixed top-0 right-0 h-full w-80 max-w-[80vw] bg-white shadow-modal z-(--z-drawer) transform transition-transform duration-300 ease-in-out ${mobileMenuOpen ? "translate-x-0" : "translate-x-full"}`}
      >
        <div className="flex flex-col h-full p-6">
          <div className="flex justify-between items-center mb-6">
            <button
              onClick={closeMobileMenu}
              className="p-2 rounded-btn text-neutral-700 hover:bg-neutral-100 transition-colors"
              aria-label="Đóng menu"
            >
              <X className="h-6 w-6" />
            </button>
          </div>

          <nav className="flex flex-col space-y-2 mb-8">
            {navLinks.map((link) => (
              <Link
                key={link.href}
                href={link.href}
                onClick={(e) => {
                  handleNavigationClick(e, link.href);
                  closeMobileMenu();
                }}
                className="text-neutral-700 hover:text-primary-600 py-3 px-3 rounded-btn font-medium hover:bg-neutral-50 transition-colors"
              >
                {link.label}
              </Link>
            ))}
          </nav>

          <div className="border-t border-neutral-200 my-4" />
          {token ? (
            <div className="mt-auto">
              <div className="flex items-center space-x-3 px-3 py-2">
                <div className="w-10 h-10 rounded-full bg-primary-100 flex items-center justify-center text-primary-600 font-semibold">
                  {user?.name?.charAt(0).toUpperCase() || "U"}
                </div>
                <div>
                  <p className="text-neutral-800 font-medium text-sm">
                    {user?.name}
                  </p>
                  <p className="text-neutral-400 text-xs">{user?.email}</p>
                </div>
              </div>
              <button
                onClick={handleLogout}
                className="w-full mt-3 text-left text-error-500 py-3 px-3 font-medium hover:bg-neutral-50 rounded-btn transition-colors"
              >
                Đăng xuất
              </button>
            </div>
          ) : (
            <div className="mt-auto space-y-3">
              <Link
                href="/login"
                onClick={(e) => {
                  handleNavigationClick(e, "/login");
                  closeMobileMenu();
                }}
                className="block w-full text-center border border-neutral-300 py-3 rounded-btn font-medium text-neutral-700 hover:border-primary-500 hover:text-primary-600 transition-colors"
              >
                Đăng nhập
              </Link>
              <Link
                href="/register"
                onClick={(e) => {
                  handleNavigationClick(e, "/register");
                  closeMobileMenu();
                }}
                className="block w-full text-center bg-primary-500 text-white py-3 rounded-btn font-medium hover:bg-primary-600 transition-colors"
              >
                Đăng ký
              </Link>
            </div>
          )}
        </div>
      </div>
    </>
  );
}
