'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import useAuthStore from '@/stores/auth';
import useCartStore from '@/stores/cart';

export default function Header() {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const { token, user, logout } = useAuthStore();
  const cartItems = useCartStore((state) => state.items);
  const router = useRouter();

  useEffect(() => {
    const handleScroll = () => setScrolled(window.scrollY > 10);
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  useEffect(() => {
    document.body.style.overflow = mobileMenuOpen ? 'hidden' : '';
    return () => {
      document.body.style.overflow = '';
    };
  }, [mobileMenuOpen]);

  const handleLogout = () => {
    logout();
    router.push('/login');
    setMobileMenuOpen(false);
  };

  const closeMobileMenu = () => setMobileMenuOpen(false);

  const cartBadge =
    cartItems.length > 0 ? (
      <span className="absolute -top-2 -right-2 bg-error-500 text-white text-xs font-bold rounded-full h-5 w-5 flex items-center justify-center animate-pulse">
        {cartItems.length}
      </span>
    ) : null;

  return (
    <>
      <header
        className={`sticky top-0 z-(--z-header) transition-all duration-300 ${
          scrolled ? 'bg-white/85 backdrop-blur-md shadow-card' : 'bg-white shadow-sm'
        }`}
      >
        <div className="container mx-auto px-4 py-3 flex items-center justify-between">
          <Link
            href="/"
            className="flex items-center space-x-2 text-2xl font-bold text-primary-600 hover:text-primary-700 transition-colors"
          >
            <span className="text-3xl">🍕</span>
            <span className="hidden sm:inline">Restaurant</span>
          </Link>
          <nav className="hidden md:flex items-center space-x-8">
            {[
              { href: '/menu', label: 'Thực đơn' },
              { href: '/kitchen', label: 'Bếp' },
              ...(user?.role === 'admin' ? [{ href: '/admin/stats', label: 'Thống kê' }] : []),
            ].map((link) => (
              <Link
                key={link.href}
                href={link.href}
                className="relative text-neutral-600 hover:text-primary-600 transition-colors font-medium py-2 group"
              >
                {link.label}
                <span className="absolute bottom-0 left-0 w-full h-0.5 bg-primary-500 scale-x-0 group-hover:scale-x-100 transition-transform origin-left rounded-full" />
              </Link>
            ))}
          </nav>
          <div className="flex items-center space-x-4">
            <Link href="/cart" className="relative p-2 rounded-btn hover:bg-neutral-100 transition-colors">
              <svg
                xmlns="http://www.w3.org/2000/svg"
                className="h-6 w-6 text-neutral-700 hover:text-primary-600 transition-colors"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M3 3h2l.4 2M7 13h10l4-8H5.4M7 13L5.4 5M7 13l-2.293 2.293c-.63.63-.184 1.707.707 1.707H17m0 0a2 2 0 100 4 2 2 0 000-4zm-8 2a2 2 0 100 4 2 2 0 000-4z"
                />
              </svg>
              {cartBadge}
            </Link>
            {token ? (
              <div className="hidden md:flex items-center space-x-3 relative group">
                <button className="flex items-center space-x-2 focus:outline-none">
                  <div className="w-8 h-8 rounded-full bg-primary-100 flex items-center justify-center text-primary-600 font-semibold">
                    {user?.name?.charAt(0).toUpperCase() || 'U'}
                  </div>
                  <span className="text-neutral-700 font-medium text-sm">{user?.name}</span>
                  <svg className="w-4 h-4 text-neutral-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                  </svg>
                </button>
                <div className="absolute right-0 top-full mt-2 w-48 bg-white rounded-card shadow-modal opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all duration-200 transform translate-y-1 group-hover:translate-y-0 z-50">
                  <div className="py-1">
                    <Link
                      href="/profile"
                      className="block px-4 py-2 text-sm text-neutral-700 hover:bg-neutral-100 hover:text-primary-600"
                    >
                      Tài khoản
                    </Link>
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
                  className="px-4 py-2 text-sm font-medium text-neutral-700 border border-neutral-300 rounded-btn hover:border-primary-500 hover:text-primary-600 transition-colors"
                >
                  Đăng nhập
                </Link>
                <Link
                  href="/register"
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
              <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
              </svg>
            </button>
          </div>
        </div>
      </header>

      {mobileMenuOpen && (
        <div
          className="fixed inset-0 bg-black/50 z-(--z-overlay) transition-opacity"
          onClick={closeMobileMenu}
        />
      )}

      <div
        className={`fixed top-0 right-0 h-full w-80 max-w-[80vw] bg-white shadow-modal z-(--z-drawer) transform transition-transform duration-300 ease-in-out ${
          mobileMenuOpen ? 'translate-x-0' : 'translate-x-full'
        }`}
      >
        <div className="flex flex-col h-full p-6">
          <div className="flex justify-end mb-6">
            <button
              onClick={closeMobileMenu}
              className="p-2 rounded-btn text-neutral-700 hover:bg-neutral-100 transition-colors"
              aria-label="Đóng menu"
            >
              <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>
          <nav className="flex flex-col space-y-2 mb-8">
            {[
              { href: '/menu', label: 'Thực đơn' },
              { href: '/kitchen', label: 'Bếp' },
              ...(user?.role === 'admin' ? [{ href: '/admin/stats', label: 'Thống kê' }] : []),
            ].map((link) => (
              <Link
                key={link.href}
                href={link.href}
                className="text-neutral-700 hover:text-primary-600 py-3 px-3 rounded-btn font-medium hover:bg-neutral-50 transition-colors"
                onClick={closeMobileMenu}
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
                  {user?.name?.charAt(0).toUpperCase() || 'U'}
                </div>
                <div>
                  <p className="text-neutral-800 font-medium text-sm">{user?.name}</p>
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
                className="block w-full text-center border border-neutral-300 py-3 rounded-btn font-medium text-neutral-700 hover:border-primary-500 hover:text-primary-600 transition-colors"
                onClick={closeMobileMenu}
              >
                Đăng nhập
              </Link>
              <Link
                href="/register"
                className="block w-full text-center bg-primary-500 text-white py-3 rounded-btn font-medium hover:bg-primary-600 transition-colors"
                onClick={closeMobileMenu}
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