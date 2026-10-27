import type { Metadata } from "next";
import Link from "next/link";
import { CalendarDays } from "lucide-react";
export const metadata: Metadata = { title: "جدول الدروس" };
export default function SchedulePage() {
  return <main className="mx-auto min-h-screen max-w-5xl px-5 py-10 md:px-10"><Link href="/" className="text-sm text-[var(--brand-muted)] hover:underline">الرئيسية</Link><div className="mt-12 rounded-3xl border border-[var(--brand-border)] bg-[var(--brand-card)] px-6 py-16 text-center shadow-luxury"><span className="mx-auto grid size-14 place-items-center rounded-2xl bg-[var(--brand-primary)]/10 text-[var(--brand-primary)]"><CalendarDays size={26}/></span><h1 className="mt-5 text-3xl font-bold">جدول الدروس</h1><p className="mx-auto mt-3 max-w-xl leading-8 text-[var(--brand-muted)]">ستظهر هنا مواعيد الدروس المنشورة من لوحة الإدارة. لا توجد مواعيد منشورة حاليًا.</p></div></main>;
}