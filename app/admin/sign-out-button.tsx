"use client";
import { useState } from "react";
import { useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/browser";
import { LogOut } from "lucide-react";
export default function SignOutButton() {
  const [busy,setBusy]=useState(false); const router=useRouter();
  return <button disabled={busy} onClick={async()=>{setBusy(true);await createClient().auth.signOut();router.replace("/admin/login");router.refresh();}} className="inline-flex min-h-11 items-center gap-2 rounded-xl border border-[var(--brand-border)] px-4 text-sm font-semibold hover:bg-[var(--brand-primary)]/5"><LogOut size={17}/>تسجيل الخروج</button>;
}