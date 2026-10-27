import type { Metadata } from "next";
import { Cairo, Amiri } from "next/font/google";
import "./globals.css";

const cairo = Cairo({ subsets: ["arabic", "latin"], variable: "--font-cairo", display: "swap" });
const amiri = Amiri({ subsets: ["arabic", "latin"], weight: ["400", "700"], variable: "--font-amiri", display: "swap" });

export const metadata: Metadata = {
  title: { default: "الشيخ محمود فتحي | الموقع الرسمي", template: "%s | الشيخ محمود فتحي" },
  description: "الموقع الرسمي للشيخ محمود فتحي — الدروس والمحاضرات الصوتية والمرئية ومواعيد اللقاءات.",
  metadataBase: new URL(process.env.NEXT_PUBLIC_SITE_URL || "http://localhost:3000"),
  applicationName: "الشيخ محمود فتحي",
  robots: { index: true, follow: true }
};

export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return <html lang="ar" dir="rtl" suppressHydrationWarning><body className={`${cairo.variable} ${amiri.variable}`}>{children}</body></html>;
}