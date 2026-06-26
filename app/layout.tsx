import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "DestinyPixel | Multidimensional Birth Map",
  description:
    "Turn your birth moment into a soft psychological mirror of energy, timing, relationships, and inner guidance.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" data-scroll-behavior="smooth">
      <body>{children}</body>
    </html>
  );
}
