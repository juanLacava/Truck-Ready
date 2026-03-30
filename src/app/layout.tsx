import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "Flota al Dia",
  description: "Control de mantenimiento y vencimientos para flotillas pequenas.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="es">
      <body>{children}</body>
    </html>
  );
}
