import type { Metadata } from "next";
import { Sora, Plus_Jakarta_Sans } from "next/font/google";
import "./globals.css";

const sora = Sora({
  subsets: ["latin"],
  weight: ["600", "700", "800"],
  variable: "--font-sora",
  display: "swap",
});

const jakarta = Plus_Jakarta_Sans({
  subsets: ["latin"],
  weight: ["400", "500", "600"],
  variable: "--font-jakarta",
  display: "swap",
});

export const metadata: Metadata = {
  title: "Postora — AI Social Media Automation",
  description:
    "Upload your product media. AI writes captions, plans content, and publishes to Instagram, TikTok & Facebook automatically.",
  openGraph: {
    title: "Postora — AI Social Media Automation",
    description: "Upload once. Post everywhere. Always.",
    type: "website",
  },
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" className={`${sora.variable} ${jakarta.variable}`}>
      <body className="bg-white text-gray-900 antialiased font-jakarta">
        {children}
      </body>
    </html>
  );
}