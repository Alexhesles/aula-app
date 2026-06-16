import type { Metadata, Viewport } from "next";
import { Sora, Inter } from "next/font/google";
import "./globals.css";

const sora = Sora({
  subsets: ["latin"],
  variable: "--font-sora",
  weight: ["400", "600", "700", "800"],
  display: "swap",
});

const inter = Inter({
  subsets: ["latin"],
  variable: "--font-inter",
  weight: ["400", "500", "600"],
  display: "swap",
});

export const metadata: Metadata = {
  title: {
    default: "Aula — El sistema operativo de tu escuela",
    template: "%s · Aula",
  },
  description:
    "Asistencia, bitácora y plan SEP en un solo lugar. La app que los maestros abren todos los días.",
  applicationName: "Aula",
  appleWebApp: { capable: true, statusBarStyle: "default", title: "Aula" },
  formatDetection: { telephone: false },
};

export const viewport: Viewport = {
  themeColor: "#4254e0",
  width: "device-width",
  initialScale: 1,
  maximumScale: 1,
  userScalable: false,
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="es" className={`${sora.variable} ${inter.variable}`}>
      <body>{children}</body>
    </html>
  );
}
