import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: { default: "الشيخ محمود فتحي | الموقع الرسمي", template: "%s | الشيخ محمود فتحي" },
  description: "الموقع الرسمي للشيخ محمود فتحي — الدروس والمحاضرات الصوتية والمرئية ومواعيد اللقاءات.",
  metadataBase: new URL(process.env.NEXT_PUBLIC_SITE_URL || "http://localhost:3000"),
  applicationName: "الشيخ محمود فتحي",
  robots: { index: true, follow: true }
};

export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return <html lang="ar" dir="rtl" suppressHydrationWarning><body>{children}</body></html>;
}