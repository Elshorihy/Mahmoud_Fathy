"use client";
import { useState, type FormEvent } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { createClient } from "@/lib/supabase/browser";
import { ShieldCheck, LoaderCircle } from "lucide-react";

export default function AdminLoginPage() {
  const router = useRouter();
  const params = useSearchParams();
  const [email,setEmail] = useState("");
  const [password,setPassword] = useState("");
  const [error,setError] = useState("");
  const [busy,setBusy] = useState(false);
  async function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault(); setError(""); setBusy(true);
    try {
      const supabase = createClient();
      const { error: authError } = await supabase.auth.signInWithPassword({ email, password });
      if (authError) throw authError;
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error("تعذر التحقق من الحساب.");
      const { data: admin, error: roleError } = await supabase.from("admins").select("is_active").eq("user_id",user.id).maybeSingle();
      if (roleError || !admin?.is_active) { await supabase.auth.signOut(); throw new Error("هذا الحساب غير مخوّل لدخول لوحة الإدارة."); }
      router.replace("/admin"); router.refresh();
    } catch (e) { setError(e instanceof Error ? e.message : "تعذر تسجيل الدخول. حاول مرة أخرى."); }
    finally { setBusy(false); }
  }
  return <main className="grid min-h-screen place-items-center px-4 py-10">
    <section className="w-full max-w-md rounded-3xl border border-[var(--brand-border)] bg-[var(--brand-card)] p-7 shadow-luxury md:p-9">
      <div className="mb-7 grid size-14 place-items-center rounded-2xl bg-[var(--brand-primary)] text-[var(--brand-accent)]"><ShieldCheck size={28}/></div>
      <p className="text-sm font-bold text-[var(--brand-accent)]">منطقة محمية</p><h1 className="mt-2 text-3xl font-bold">تسجيل دخول الإدارة</h1>
      <p className="mt-3 leading-7 text-[var(--brand-muted)]">سجّل الدخول بحساب الإدارة المعتمد للوصول إلى أدوات إدارة الموقع.</p>
      {params.get("setup") && <p role="alert" className="mt-4 rounded-xl bg-amber-100 p-3 text-sm text-amber-950">إعدادات Supabase غير مكتملة. أضف المتغيرات المطلوبة إلى ملف البيئة.</p>}
      {params.get("access") && <p role="alert" className="mt-4 rounded-xl bg-red-100 p-3 text-sm text-red-900">الحساب لا يملك صلاحية إدارة نشطة.</p>}
      {error && <p role="alert" className="mt-4 rounded-xl bg-red-100 p-3 text-sm text-red-900">{error}</p>}
      <form onSubmit={submit} className="mt-6 space-y-4">
        <label className="block text-sm font-semibold">البريد الإلكتروني<input required type="email" autoComplete="username" value={email} onChange={e=>setEmail(e.target.value)} className="mt-2 min-h-12 w-full rounded-xl border border-[var(--brand-border)] bg-transparent px-4 outline-none focus:border-[var(--brand-accent)]" dir="ltr"/></label>
        <label className="block text-sm font-semibold">كلمة المرور<input required type="password" autoComplete="current-password" value={password} onChange={e=>setPassword(e.target.value)} className="mt-2 min-h-12 w-full rounded-xl border border-[var(--brand-border)] bg-transparent px-4 outline-none focus:border-[var(--brand-accent)]" dir="ltr"/></label>
        <button disabled={busy} className="flex min-h-12 w-full items-center justify-center gap-2 rounded-xl bg-[var(--brand-primary)] px-4 font-bold text-white transition hover:opacity-90 disabled:opacity-60">{busy&&<LoaderCircle className="animate-spin" size={18}/>}دخول آمن</button>
      </form>
      <a href="/" className="mt-5 inline-block text-sm text-[var(--brand-muted)] hover:underline">العودة إلى الموقع</a>
    </section>
  </main>;
}