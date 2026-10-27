import Link from "next/link";
import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { BookOpen, CalendarDays, Settings2, Images, LogOut } from "lucide-react";
import SignOutButton from "./sign-out-button";

export default async function AdminPage() {
  const supabase = createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) redirect("/admin/login");
  const { data: admin } = await supabase.from("admins").select("role").eq("user_id",user.id).maybeSingle();
  if (!admin) redirect("/admin/login?access=denied");
  const tiles = [
    {title:"إعدادات الموقع",desc:"الهوية البصرية ومحتوى الصفحات",icon:Settings2,href:"/admin/settings"},
    {title:"المحاضرات",desc:"إدارة الدروس الصوتية والمرئية",icon:BookOpen,href:"/admin/lectures"},
    {title:"جدول الدروس",desc:"المواعيد واللقاءات القادمة",icon:CalendarDays,href:"/admin/schedule"},
    {title:"مكتبة الوسائط",desc:"الصور والملفات المرفوعة",icon:Images,href:"/admin/media"}
  ];
  return <main className="min-h-screen px-4 py-8 md:px-10">
    <header className="mx-auto flex max-w-6xl items-center justify-between gap-4"><div><p className="text-sm font-bold text-[var(--brand-accent)]">لوحة التحكم</p><h1 className="mt-1 text-3xl font-bold">أهلًا بك في إدارة الموقع</h1><p className="mt-2 text-sm text-[var(--brand-muted)]">{user.email} · الصلاحية: {admin.role==="owner"?"مالك":"محرر"}</p></div><SignOutButton/></header>
    <section className="mx-auto mt-10 grid max-w-6xl gap-4 sm:grid-cols-2 lg:grid-cols-4">{tiles.map(({title,desc,icon:Icon,href})=><Link key={href} href={href} className="rounded-3xl border border-[var(--brand-border)] bg-[var(--brand-card)] p-6 shadow-luxury transition hover:-translate-y-1 hover:border-[var(--brand-accent)]"><span className="grid size-12 place-items-center rounded-2xl bg-[var(--brand-primary)]/10 text-[var(--brand-primary)]"><Icon size={24}/></span><h2 className="mt-5 text-lg font-bold">{title}</h2><p className="mt-2 text-sm leading-6 text-[var(--brand-muted)]">{desc}</p></Link>)}</section>
    <section className="mx-auto mt-8 max-w-6xl rounded-3xl border border-dashed border-[var(--brand-border)] p-6"><h2 className="font-bold">حالة المشروع</h2><p className="mt-2 text-sm leading-7 text-[var(--brand-muted)]">تم تجهيز أساس لوحة الإدارة. ستظهر أدوات تحرير الإعدادات والمحتوى تباعًا في المراحل التالية بعد توصيل قاعدة البيانات.</p></section>
  </main>;
}