import type { Metadata } from "next";
import Link from "next/link";
import { BookOpen } from "lucide-react";
export const metadata: Metadata = { title: "عن الشيخ" };
export default function AboutPage() {
  return <main className="mx-auto min-h-screen max-w-5xl px-5 py-10 md:px-10"><Link href="/" className="text-sm text-[var(--brand-muted)] hover:underline">الرئيسية</Link><div className="mt-12 rounded-3xl border border-[var(--brand-border)] bg-[var(--brand-card)] px-6 py-16 text-center shadow-luxury"><span className="mx-auto grid size-14 place-items-center rounded-2xl bg-[var(--brand-primary)]/10 text-[var(--brand-primary)]"><BookOpen size={26}/></span><h1 className="mt-5 text-3xl font-bold">عن الشيخ محمود فتحي</h1><p className="mx-auto mt-3 max-w-xl leading-8 text-[var(--brand-muted)]">سيُدار المحتوى التعريفي من لوحة الإدارة في المرحلة الثانية. لم يُضف المحتوى التعريفي بعد.</p></div></main>;
}