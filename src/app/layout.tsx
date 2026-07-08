import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "WedBar",
  description: "Dark cocktail ordering experience for a wedding bar.",
  manifest: "/manifest.webmanifest",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="ru" className="h-full antialiased">
      <body className="min-h-full bg-black">
        <div className="mx-auto min-h-dvh w-full max-w-[var(--content-max-width)] overflow-hidden bg-black">
          {children}
        </div>
      </body>
    </html>
  );
}
