import type { Metadata, Viewport } from "next"
import { Inter, Poppins } from "next/font/google"
import "./globals.css"
import { ThemeProvider } from "@/contexts/theme-context"
import ReactQueryProvider from "@/providers/react-query-provider"
import { AuthProvider } from "@/contexts/auth-context"
import ToastProvider from "@/providers/toast-provider"

const inter = Inter({
  subsets: ["latin"],
  variable: "--font-inter",
})

const poppins = Poppins({
  subsets: ["latin"],
  weight: ["300", "400", "500", "600", "700"],
  variable: "--font-poppins",
})

export const metadata: Metadata = {
  title: "WaveNet - WiFi Dashboard",
  description: "Modern WiFi network management and user portal",
  keywords: "wifi, network, dashboard, management, connectivity, portal",
  authors: [{ name: "WaveNet" }],
}

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
}

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body className={`${inter.variable} ${poppins.variable} font-poppins antialiased bg-background text-foreground`}>
        <ThemeProvider>
          <ReactQueryProvider>
            <AuthProvider>
              {children}
              <ToastProvider />
            </AuthProvider>
          </ReactQueryProvider>
        </ThemeProvider>
      </body>
    </html>
  )
}
