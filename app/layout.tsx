import type { Metadata } from "next";
<<<<<<< HEAD
import { Geist, Geist_Mono } from "next/font/google";
=======
import { Inter } from "next/font/google";
>>>>>>> 93c556d6c13c2a80d55b288315725df1c7a18707
import "./globals.css";

import { Providers } from "@/components/Providers";
import LayoutShell from "@/components/LayoutShell";

<<<<<<< HEAD
const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "QR MakeIt - Dashboard",
  description: "Manage your QR codes with ease.",
=======
const inter = Inter({
  subsets: ["latin"],
  variable: "--font-inter",
  display: "swap",
  weight: ["300", "400", "500", "600", "700", "800", "900"],
});

export const metadata: Metadata = {
  title: "QR MakeIt — Create Stunning QR Codes",
  description: "Generate beautiful, branded QR codes in seconds. Frame designs, image embedding, and more.",
>>>>>>> 93c556d6c13c2a80d55b288315725df1c7a18707
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
<<<<<<< HEAD
    <html lang="en">
      <body
        className={`${geistSans.variable} ${geistMono.variable} antialiased`}
      >
=======
    <html lang="en" className={inter.variable}>
      <body className="antialiased">
>>>>>>> 93c556d6c13c2a80d55b288315725df1c7a18707
        <Providers>
          <LayoutShell>
            {children}
          </LayoutShell>
        </Providers>
      </body>
    </html>
  );
}
