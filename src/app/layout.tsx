import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "Lumina Dubai | Exquisite Hotel Stays",
  description:
    "Experience the pinnacle of Middle Eastern opulence with Lumina Dubai's curated selection of ultra-luxury hotel retreats across the United Arab Emirates.",
};

export const viewport = {
  width: "device-width",
  initialScale: 1,
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className="dark">
      <head>
        <link
          href="https://fonts.googleapis.com/css2?family=DM+Sans:ital,wght@0,400;0,500;0,700;1,400&family=DM+Serif+Display&display=swap"
          rel="stylesheet"
        />
        <link
          href="https://fonts.googleapis.com/css2?family=Material+Symbols+Outlined:wght,FILL@100..700,0..1&display=swap"
          rel="stylesheet"
        />
      </head>
      <body className="bg-background text-on-surface font-body-md selection:bg-secondary selection:text-on-secondary">
        {children}
      </body>
    </html>
  );
}
