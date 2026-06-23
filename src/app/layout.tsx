import type { Metadata, Viewport } from "next";
import { Inter, Bebas_Neue } from "next/font/google";
import "./globals.css";
import { cn } from "@/lib/utils";
import { Toaster } from "@/components/ui/sonner";
import { ThemeScript } from "@/components/theme/ThemeScript";
import { ServiceWorkerRegister } from "@/components/pwa/ServiceWorkerRegister";

const inter = Inter({
  subsets: ["latin"],
  variable: "--font-inter",
});

const bebas = Bebas_Neue({
  subsets: ["latin"],
  weight: "400",
  variable: "--font-bebas",
});

export const metadata: Metadata = {
  title: "Academia AA | DOM",
  description: "Plataforma de formación corporativa — Ambiente Azul + DOM Design",
  applicationName: "Academia",
  appleWebApp: {
    capable: true,
    title: "Academia",
    statusBarStyle: "black-translucent",
  },
  // Equivalente estándar del apple-mobile-web-app-capable (que está deprecado).
  other: { "mobile-web-app-capable": "yes" },
  icons: {
    icon: [
      { url: "/Icon/favicon.ico", sizes: "any" },
      { url: "/Icon/favicon-32.png", sizes: "32x32", type: "image/png" },
      { url: "/Icon/favicon-16.png", sizes: "16x16", type: "image/png" },
      { url: "/Icon/favicon-512.png", sizes: "512x512", type: "image/png" },
    ],
    shortcut: "/Icon/favicon.ico",
    apple: "/Icon/apple-touch-icon.png",
  },
};

export const viewport: Viewport = {
  themeColor: "#1f1f1f",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="es"
      suppressHydrationWarning
      className={cn(inter.variable, bebas.variable)}
    >
      <body className="antialiased font-sans">
        <ThemeScript />
        {children}
        <Toaster richColors position="top-right" />
        <ServiceWorkerRegister />
      </body>
    </html>
  );
}
