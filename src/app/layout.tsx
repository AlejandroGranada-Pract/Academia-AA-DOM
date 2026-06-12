import type { Metadata } from "next";
import { Inter, Bebas_Neue } from "next/font/google";
import "./globals.css";
import { cn } from "@/lib/utils";
import { Toaster } from "@/components/ui/sonner";

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
  icons: {
    icon: [
      { url: "/Icon/favicon-32.png", sizes: "32x32", type: "image/png" },
      { url: "/Icon/favicon-16.png", sizes: "16x16", type: "image/png" },
      { url: "/Icon/favicon-512.png", sizes: "512x512", type: "image/png" },
    ],
    shortcut: "/Icon/favicon-32.png",
    apple: "/Icon/apple-touch-icon.png",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="es" className={cn(inter.variable, bebas.variable)}>
      <body className="antialiased font-sans">
        {children}
        <Toaster richColors position="top-right" />
      </body>
    </html>
  );
}
