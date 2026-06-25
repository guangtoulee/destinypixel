import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "DestinyPixel | Eastern Archetypes, Western Sky",
  description:
    "Discover your elemental Day Pillar archetype, then see it in conversation with your natal astrology.",
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
