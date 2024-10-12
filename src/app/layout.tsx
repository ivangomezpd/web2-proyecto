import type { Metadata } from "next";
import localFont from "next/font/local";
import "./globals.css";
import { AuthProvider } from "@/components/app/AuthContext";
import Header from "@/components/app/Header";

const geistSans = localFont({
  src: "./fonts/GeistVF.woff",
  variable: "--font-geist-sans",
  weight: "100 900",
});
const geistMono = localFont({
  src: "./fonts/GeistMonoVF.woff",
  variable: "--font-geist-mono",
  weight: "100 900",
});

export const metadata: Metadata = {
  title: "aplicacion web2",
  description: "Ecommerce de productos",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <AuthProvider>
      <html lang="en">
        <body
          className={`container mx-auto space-y-4 p-4 ${geistSans.variable} ${geistMono.variable} antialiased`}
        >
          <Header />
          <main>{children}</main>
        </body>
      </html>
    </AuthProvider>
  );
}
