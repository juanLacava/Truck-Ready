import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "Truck Ready",
  description: "Control de mantenimiento y vencimientos para transportistas y pequenas flotas.",
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
