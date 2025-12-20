import type { Metadata, Viewport } from "next";
// 1. Added Playfair_Display to imports
import { Poppins, Montserrat, Playfair_Display } from "next/font/google";
import "./globals.css";
import { CartProvider } from "./context/CartContext";
import { WishlistProvider } from "./context/WishlistContext";
import { ToastProvider } from "./context/ToastContext";
import { AuthProvider } from "./context/AuthContext";
import CartDrawer from "./components/CartDrawer";
import SEOHead from "./components/SEOHead";
import StructuredData from "./components/StructuredData";

import SmoothScroll from "./components/SmoothScroll";
import ScrollToTop from "./components/ScrollToTop";
import StoreProvider from "./StoreProvider";
import { Suspense } from "react";

const poppins = Poppins({
  variable: "--font-poppins",
  subsets: ["latin"],
  weight: ["400", "500", "600", "700"],
  display: "swap",
  preload: true,
});

const montserrat = Montserrat({
  variable: "--font-montserrat",
  subsets: ["latin"],
  weight: ["400", "500", "600", "700"],
  display: "swap",
  preload: true,
});

// 2. Configure the Luxury Serif Font
const playfair = Playfair_Display({
  variable: "--font-playfair", // This matches your globals.css
  subsets: ["latin"],
  display: "swap",
  // Playfair is a variable font, so specific weights aren't strictly required,
  // but it supports 400-900 automatically.
});

const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || "http://localhost:3000";

// Comprehensive SEO Metadata
export const metadata: Metadata = {
  metadataBase: new URL(siteUrl),
  title: {
    default:
      "Rootcraft - Premium Furniture Store | High Quality Home Furnishings",
    template: "%s | Rootcraft",
  },
  description:
    "Discover premium furniture crafted from top materials at Rootcraft. Shop high-quality sofas, chairs, tables, and home furnishings. Free shipping on orders over ₹5,00,000. 2+ years warranty protection.",
  keywords: [
    "premium furniture",
    "high quality furniture",
    "home furnishings",
    "sofas",
    "chairs",
    "tables",
    "wooden furniture",
    "modern furniture",
    "luxury furniture",
    "interior design",
    "furniture store",
    "home decor",
  ],
  authors: [{ name: "Rootcraft" }],
  creator: "Rootcraft",
  publisher: "Rootcraft",
  formatDetection: {
    email: false,
    address: false,
    telephone: false,
  },
  openGraph: {
    type: "website",
    locale: "en_US",
    url: siteUrl,
    siteName: "Rootcraft",
    title:
      "Rootcraft - Premium Furniture Store | High Quality Home Furnishings",
    description:
      "High quality furniture crafted from top materials. Discover premium sofas, chairs, and home furnishings with free shipping and warranty protection.",
    images: [
      {
        url: "/logo.png",
        width: 1200,
        height: 630,
        alt: "Rootcraft Premium Furniture - High Quality Home Furnishings",
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: "Rootcraft - Premium Furniture Store",
    description:
      "High quality furniture crafted from top materials. Discover premium sofas, chairs, and home furnishings.",
    images: ["/logo.png"],
    creator: "@rootcraft",
  },
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      "max-video-preview": -1,
      "max-image-preview": "large",
      "max-snippet": -1,
    },
  },
  icons: {
    icon: [
      { url: "/favicons/favicon.svg", type: "image/svg+xml" },
      { url: "/favicons/favicon-16.png", sizes: "16x16", type: "image/png" },
      { url: "/favicons/favicon-32.png", sizes: "32x32", type: "image/png" },
      { url: "/favicons/favicon-48.png", sizes: "48x48", type: "image/png" },
      { url: "/favicons/favicon-64.png", sizes: "64x64", type: "image/png" },
      { url: "/favicons/favicon-128.png", sizes: "128x128", type: "image/png" },
      { url: "/favicons/favicon-180.png", sizes: "180x180", type: "image/png" },
      { url: "/favicons/favicon-192.png", sizes: "192x192", type: "image/png" },
      { url: "/favicons/favicon-512.png", sizes: "512x512", type: "image/png" },
    ],
    apple: [
      { url: "/favicons/favicon-180.png", sizes: "180x180", type: "image/png" },
    ],
    shortcut: "/favicons/favicon.ico",
  },
  manifest: "/favicons/manifest.json",
  appleWebApp: {
    capable: true,
    statusBarStyle: "default",
    title: "Rootcraft",
  },
  alternates: {
    canonical: "/",
  },
  category: "Furniture",
};

// Viewport configuration for responsive design
export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  maximumScale: 5,
  userScalable: true,
  themeColor: [
    { media: "(prefers-color-scheme: light)", color: "#B88E2F" },
    { media: "(prefers-color-scheme: dark)", color: "#B88E2F" },
  ],
  colorScheme: "light",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body
        // 3. Added playfair.variable to the class list
        className={`${poppins.variable} ${montserrat.variable} ${playfair.variable} antialiased`}
        suppressHydrationWarning
      >
        <SmoothScroll />
        <Suspense fallback={null}>
          <ScrollToTop />
        </Suspense>
        <SEOHead />
        <StructuredData />
        <StoreProvider>
          <ToastProvider>
            <AuthProvider>
              <CartProvider>
                <WishlistProvider>
                  {children}
                  <CartDrawer />
                </WishlistProvider>
              </CartProvider>
            </AuthProvider>
          </ToastProvider>
        </StoreProvider>
      </body>
    </html>
  );
}
