import Link from "next/link";
import { BookOpen, CalendarDays, Headphones, MoveUpLeft } from "lucide-react";

const items = [
  { href: "/lectures", icon: Headphones, title: "مكتبة المحاضرات", desc: "الدروس الصوتية والمرئية في مكان واحد." },
  { href: "/schedule", icon: CalendarDays, title: "جدول الدروس", desc: "تابع المواعيد القادمة واللقاءات المباشرة." },
  { href: "/about", icon: BookOpen, title: "عن الشيخ", desc: "نبذة تعريفية ومعلومات عن الدروس." }
];

export default function HomePage() {
  return <main className="min-h-screen overflow-hidden">
    <header className="mx-auto flex max-w-7xl items-center justify-between px-5 py-6 md:px-10">
      <Link href="/" className="flex items-center gap-3" aria-label="الصفحة الرئيسية">
        <span className="grid size-12 place-items-center rounded-2xl border border-[var(--brand-accent)]/50 bg-[var(--brand-primary)] text-xl text-white">م</span>
        <span><strong className="block text-sm md:text-base">الشيخ محمود فتحي</strong><span className="text-xs text-[var(--brand-muted)]">الموقع الرسمي</span></span>
      </Link>
      <nav className="flex items-center gap-4 text-sm md:gap-7"><Link href="/lectures">المحاضرات</Link><Link href="/schedule">جدول الدروس</Link><Link href="/about">عن الشيخ</Link></nav>
    </header>
    <section className="pattern-bg relative mx-3 overflow-hidden rounded-[2rem] bg-[var(--brand-primary)] px-6 py-20 text-center text-white md:mx-8 md:px-16 md:py-32">
      <div className="pointer-events-none absolute inset-0 bg-gradient-to-b from-transparent to-black/15"/>
      <div className="relative mx-auto max-w-4xl">
        <span className="mb-6 inline-flex rounded-full border border-[var(--brand-accent)]/50 bg-white/5 px-4 py-2 text-xs tracking-wide text-[#e7d6a5]">علمٌ يُتعلَّم، وأثرٌ يبقى</span>
        <h1 className="text-4xl font-bold leading-tight md:text-7xl">مجلس علمٍ يقرّبك <span className="text-[#D9BE7B]">من المعنى</span></h1>
        <p className="mx-auto mt-6 max-w-2xl text-base leading-8 text-white/75 md:text-xl">تابع دروس الشيخ محمود فتحي، واستمع إلى المحاضرات، وتعرّف على مواعيد اللقاءات القادمة.</p>
        <div className="mt-9 flex flex-wrap justify-center gap-3"><Link className="inline-flex min-h-12 items-center gap-2 rounded-xl bg-[#C9A961] px-6 font-bold text-[#12201A] transition hover:-translate-y-0.5" href="/lectures">استكشف المحاضرات <MoveUpLeft size={18}/></Link><Link className="inline-flex min-h-12 items-center rounded-xl border border-white/25 px-6 font-semibold transition hover:bg-white/10" href="/schedule">مواعيد الدروس</Link></div>
      </div>
    </section>
    <section className="mx-auto max-w-7xl px-5 py-16 md:px-10 md:py-24">
      <div className="mb-8"><p className="text-sm font-bold text-[var(--brand-accent)]">ابدأ من هنا</p><h2 className="mt-2 text-3xl font-bold md:text-4xl">كل ما تحتاجه لمتابعة الدروس</h2></div>
      <div className="grid gap-4 md:grid-cols-3">{items.map(({href,icon:Icon,title,desc})=><Link key={href} href={href} className="group rounded-3xl border border-[var(--brand-border)] bg-[var(--brand-card)] p-6 shadow-luxury transition hover:-translate-y-1 hover:border-[var(--brand-accent)]"><span className="mb-5 grid size-12 place-items-center rounded-2xl bg-[var(--brand-primary)]/10 text-[var(--brand-primary)]"><Icon size={23}/></span><h3 className="text-xl font-bold">{title}</h3><p className="mt-3 leading-7 text-[var(--brand-muted)]">{desc}</p></Link>)}</div>
    </section>
    <footer className="border-t border-[var(--brand-border)] px-5 py-8 text-center text-sm text-[var(--brand-muted)]">© {new Date().getFullYear()} الشيخ محمود فتحي — جميع الحقوق محفوظة</footer>
  </main>;
}