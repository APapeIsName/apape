import type { Metadata } from "next";
import { Header } from "@/components/Header";
import { Footer } from "@/components/Footer";
import { ThemeProvider } from "@/components/ThemeProvider";
import "./globals.css";

export const metadata: Metadata = {
  title: {
    default: "APAPE",
    template: "%s | APAPE",
  },
  description: "Blog & AI Encyclopedia Platform",
  icons: {
    icon: "/favicon.svg",
  },
  openGraph: {
    title: "APAPE",
    description: "Blog & AI Encyclopedia Platform",
    url: "https://apape.vercel.app",
    siteName: "APAPE",
    images: [{ url: "/og-image.svg", width: 1200, height: 630 }],
    type: "website",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="ko" suppressHydrationWarning>
      <body className="font-display">
        <ThemeProvider>
          <Header />
          <main className="flex-1">{children}</main>
          <Footer />
        </ThemeProvider>
      </body>
    </html>
  );
}
