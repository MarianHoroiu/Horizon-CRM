import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";
import { AuthProvider } from "./components/auth/AuthProvider";
import Navigation from "./components/layout/Navigation";

const inter = Inter({ subsets: ["latin"] });

export const metadata: Metadata = {
  title: "Horizon CRM",
  description: "A customer relationship management system",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body className={inter.className}>
        <AuthProvider>
          <div className="min-h-screen flex flex-col bg-gray-50">
            <Navigation />
            <main className="flex-1 pt-16">{children}</main>
          </div>
        </AuthProvider>
      </body>
    </html>
  );
}
