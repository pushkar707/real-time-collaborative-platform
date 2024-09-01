'use client'
import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";
import { RecoilRoot } from "recoil";

const inter = Inter({ subsets: ["latin"] });

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body className={inter.className}>
        <RecoilRoot>
          {children}
        </RecoilRoot>
      </body>
    </html>
  );
}
