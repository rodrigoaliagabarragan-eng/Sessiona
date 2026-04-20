import type { Metadata } from "next";
import { Manrope, Newsreader } from "next/font/google";
import "@/app/globals.css";

const manrope = Manrope({
  subsets: ["latin"],
  variable: "--font-manrope"
});

const newsreader = Newsreader({
  subsets: ["latin"],
  variable: "--font-newsreader"
});

export const metadata: Metadata = {
  title: "Sesiona",
  description:
    "SaaS privado para psicólogos y pacientes centrado en agenda, sesiones de audio y control de acceso."
};

export default function RootLayout({
  children
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="es">
      <body
        className={`${manrope.variable} ${newsreader.variable} font-sans antialiased`}
      >
        {children}
      </body>
    </html>
  );
}
