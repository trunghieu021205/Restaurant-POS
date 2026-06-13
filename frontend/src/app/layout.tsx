import "./fonts.css";
import "./globals.css";

import Header from "@/components/Header";
import Footer from "@/components/Footer";

import Providers from "./providers";

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="vi">
      <body className="min-h-screen flex flex-col">
        <Header />
        <main className="flex-1 container mx-auto px-4 py-6">
          <Providers>{children}</Providers>
        </main>
        <Footer />
      </body>
    </html>
  );
}
