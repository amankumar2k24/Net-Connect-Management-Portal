import type { Metadata, Viewport } from "next"
import { Inter, Poppins } from "next/font/google"
import "./globals.css"
import { ThemeProvider } from "@/contexts/theme-context"
import { Toaster } from "react-hot-toast"

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
    title: "FlowLink - Premium WiFi Solutions",
    description: "Experience seamless connectivity with FlowLink's premium WiFi solutions. Fast, reliable, and affordable internet services for homes and businesses.",
    keywords: "wifi, internet, connectivity, broadband, network, premium, fast, reliable, affordable",
    authors: [{ name: "FlowLink" }],
    openGraph: {
        title: "FlowLink - Premium WiFi Solutions",
        description: "Experience seamless connectivity with FlowLink's premium WiFi solutions.",
        type: "website",
        locale: "en_US",
    },
    twitter: {
        card: "summary_large_image",
        title: "FlowLink - Premium WiFi Solutions",
        description: "Experience seamless connectivity with FlowLink's premium WiFi solutions.",
    },
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
                    {children}
                    <Toaster
                        position="top-right"
                        toastOptions={{
                            duration: 4000,
                            style: {
                                background: 'hsl(var(--color-card))',
                                color: 'hsl(var(--color-card-foreground))',
                                border: '1px solid hsl(var(--color-border))',
                            },
                        }}
                    />
                </ThemeProvider>
            </body>
        </html>
    )
}