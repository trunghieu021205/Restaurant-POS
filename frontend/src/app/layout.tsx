import "./fonts.css";
import "./globals.css";

import LayoutChrome from "@/components/LayoutChrome";
import Providers from "./providers";

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="vi">
      <body className="min-h-screen flex flex-col">
        <Providers>
          <LayoutChrome>{children}</LayoutChrome>
        </Providers>
      </body>
    </html>
  );
}
