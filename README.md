# الموقع الرسمي للشيخ محمود فتحي

## العربية

المشروع مبني على Next.js App Router وTypeScript وTailwind CSS، مع Supabase للمصادقة وقاعدة البيانات، وCloudflare R2 لتخزين الوسائط في المرحلة الثالثة.

### المتطلبات
- Node.js 20 أو أحدث
- pnpm
- مشروع Supabase
- حساب GitHub وVercel للنشر

### التشغيل المحلي
1. انسخ `.env.example` إلى `.env.local`.
2. ضع رابط Supabase والمفتاح العام (publishable/anon) في `NEXT_PUBLIC_SUPABASE_URL` و`NEXT_PUBLIC_SUPABASE_ANON_KEY`.
3. ثبّت الحزم وشغّل التطبيق:
   ```bash
   pnpm install
   pnpm dev
   ```
4. افتح `http://localhost:3000`.

### قاعدة البيانات وإنشاء أول مدير
1. افتح Supabase SQL Editor وشغّل ملف `supabase/migrations/202610270001_phase1_foundation.sql` كاملًا على مشروع جديد مخصص لهذا الموقع.
2. من Supabase Authentication أنشئ مستخدمًا بالبريد وكلمة المرور.
3. انسخ UUID الخاص بالمستخدم ثم نفّذ الاستعلام التالي بعد استبدال القيمة:
   ```sql
   insert into public.admins (user_id, role, is_active)
   values ('PUT-AUTH-USER-UUID-HERE', 'owner', true);
   ```
4. لا تستخدم مفتاح service-role في المتصفح. لا تضف حسابات الإدارة من الواجهة العامة.

### إعدادات البيئة
راجع `.env.example`. المتغيرات الخاصة بـ R2 والبريد والتنبيهات اختيارية حتى المراحل التي تستخدمها. لا تضع الأسرار في أي متغير يبدأ بـ `NEXT_PUBLIC_`.

### النشر
اربط المستودع بـ Vercel، وأضف متغيرات Supabase في Project Settings → Environment Variables، ثم انشر فرع `main`. تأكد من ضبط `NEXT_PUBLIC_SITE_URL` على عنوان الموقع الفعلي.

### استخدام لوحة الإدارة
افتح `/admin/login` وسجّل الدخول بحساب مضاف إلى جدول `admins`. لوحة المرحلة الأولى هي الهيكل الآمن؛ إدارة الإعدادات والمحتوى تُبنى في المراحل اللاحقة. لا تُدخل بيانات حقيقية قبل مراجعة إعدادات المشروع وسياسات الوصول.

## English

### Stack
Next.js App Router, strict TypeScript, Tailwind CSS, Supabase Auth/Postgres with RLS, Cloudflare R2 (later phase), and Vercel deployment.

### Local setup
1. Copy `.env.example` to `.env.local`.
2. Set `NEXT_PUBLIC_SUPABASE_URL` and `NEXT_PUBLIC_SUPABASE_ANON_KEY`.
3. Run `pnpm install` then `pnpm dev`.
4. Apply `supabase/migrations/202610270001_phase1_foundation.sql` to a dedicated fresh Supabase project.
5. Create a user in Supabase Auth, then insert its UUID into `public.admins` with role `owner`.
6. Configure the same environment variables in Vercel and deploy `main`.

Never expose the Supabase service-role key to browser code. R2 credentials must remain server-only. The first phase provides the foundation and admin shell; later phases add the full editing workflows.
