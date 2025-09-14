import type { Metadata, Viewport } from "next";
import { Inter, Poppins } from "next/font/google";
import "./globals.css";
import ReactQueryProvider from '@/providers/react-query-provider';
import { AuthProvider } from '@/contexts/auth-context';
import ToastProvider from '@/providers/toast-provider';

const inter = Inter({
  subsets: ["latin"],
  variable: "--font-inter",
});

const poppins = Poppins({
  subsets: ["latin"],
  weight: ["300", "400", "500", "600", "700"],
  variable: "--font-poppins",
});

export const metadata: Metadata = {
  title: "NetConnect - Network Management Portal",
  description: "Professional network management and monitoring solution",
  keywords: "network, management, monitoring, connectivity, portal",
  authors: [{ name: "NetConnect" }],
};

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className="dark">
      <body className={`${inter.variable} ${poppins.variable} font-poppins antialiased bg-background text-foreground`}>
        <ReactQueryProvider>
          <AuthProvider>
            {children}
            <ToastProvider />
          </AuthProvider>
        </ReactQueryProvider>
      </body>
    </html>
  );
}
