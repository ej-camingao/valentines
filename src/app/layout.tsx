import type { Metadata } from "next";
import { Playfair_Display, Manrope } from "next/font/google";
import "./globals.css";

const titleFont = Playfair_Display({
  weight: ["600", "700"],
  subsets: ["latin"],
  variable: "--font-title"
});

const bodyFont = Manrope({
  weight: ["400", "500", "600", "700"],
  subsets: ["latin"],
  variable: "--font-body"
});

export const metadata: Metadata = {
  title: "Will you be my Valentine?",
  description:
    "A playful, romantic invitation with hearts, music, and a surprise reveal."
};

export default function RootLayout({
  children
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body className={`${titleFont.variable} ${bodyFont.variable}`}>
        {children}
      </body>
    </html>
  );
}
