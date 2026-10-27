-- Phase 1: foundational schema. Safe to apply once to a fresh Supabase project.
create extension if not exists pgcrypto;
create extension if not exists pg_trgm;
create extension if not exists unaccent;

create type public.admin_role as enum ('owner', 'editor');
create type public.lecture_type as enum ('audio', 'video');
create type public.content_status as enum ('draft', 'published', 'scheduled');

create table public.admins (
  user_id uuid primary key references auth.users(id) on delete cascade,
  role public.admin_role not null default 'editor',
  is_active boolean not null default true,
  created_at timestamptz not null default now()
);

create or replace function public.is_admin()
returns boolean language sql stable security definer
set search_path = public, auth
as $$
  select exists (
    select 1 from public.admins a
    where a.user_id = auth.uid() and a.is_active = true
  );
$$;

create or replace function public.admin_role_for_user()
returns public.admin_role language sql stable security definer
set search_path = public, auth
as $$
  select a.role from public.admins a
  where a.user_id = auth.uid() and a.is_active = true
  limit 1;
$$;

create table public.site_settings (
  key text primary key,
  value jsonb not null default '{}'::jsonb,
  version integer not null default 1,
  updated_at timestamptz not null default now(),
  updated_by uuid references auth.users(id) on delete set null
);

create table public.nav_items (
  id uuid primary key default gen_random_uuid(),
  label text not null,
  href text not null,
  placement text not null default 'header' check (placement in ('header','footer')),
  sort_order integer not null default 0,
  is_visible boolean not null default true,
  created_at timestamptz not null default now()
);

create table public.home_sections (
  id uuid primary key default gen_random_uuid(),
  section_key text not null unique,
  title text not null,
  settings jsonb not null default '{}'::jsonb,
  sort_order integer not null default 0,
  is_visible boolean not null default true
);

create table public.pages (
  id uuid primary key default gen_random_uuid(),
  slug text not null unique,
  title text not null,
  content jsonb not null default '[]'::jsonb,
  seo jsonb not null default '{}'::jsonb,
  is_published boolean not null default false,
  updated_at timestamptz not null default now()
);

create table public.categories (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  slug text not null unique,
  description text not null default '',
  sort_order integer not null default 0,
  created_at timestamptz not null default now()
);

create table public.series (
  id uuid primary key default gen_random_uuid(),
  title text not null,
  slug text not null unique,
  description text not null default '',
  cover_url text,
  is_featured boolean not null default false,
  status public.content_status not null default 'draft',
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table public.lectures (
  id uuid primary key default gen_random_uuid(),
  title text not null,
  slug text not null unique,
  description text not null default '',
  type public.lecture_type not null,
  audio_url text,
  r2_key text,
  youtube_id text,
  duration_seconds integer not null default 0 check (duration_seconds >= 0),
  waveform_peaks jsonb not null default '[]'::jsonb,
  cover_url text,
  category_id uuid references public.categories(id) on delete set null,
  series_id uuid references public.series(id) on delete set null,
  series_order integer not null default 0,
  tags text[] not null default '{}',
  recorded_at date,
  status public.content_status not null default 'draft',
  published_at timestamptz,
  scheduled_at timestamptz,
  allow_download boolean not null default false,
  featured boolean not null default false,
  play_count bigint not null default 0,
  search_vector tsvector generated always as (
    to_tsvector('simple', coalesce(title,'') || ' ' || coalesce(description,'') || ' ' || array_to_string(tags,' '))
  ) stored,
  deleted_at timestamptz,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  constraint lecture_media_check check (
    (type = 'audio' and (audio_url is not null or r2_key is not null)) or
    (type = 'video' and youtube_id is not null)
  )
);

create index lectures_public_idx on public.lectures(status, published_at desc) where deleted_at is null;
create index lectures_series_idx on public.lectures(series_id, series_order);
create index lectures_category_idx on public.lectures(category_id);
create index lectures_search_idx on public.lectures using gin(search_vector);
create index lectures_title_trgm_idx on public.lectures using gin(title gin_trgm_ops);

create table public.lecture_chapters (
  id uuid primary key default gen_random_uuid(),
  lecture_id uuid not null references public.lectures(id) on delete cascade,
  title text not null,
  time_seconds integer not null check (time_seconds >= 0),
  sort_order integer not null default 0
);

create table public.lecture_attachments (
  id uuid primary key default gen_random_uuid(),
  lecture_id uuid not null references public.lectures(id) on delete cascade,
  title text not null,
  file_url text not null,
  r2_key text,
  mime_type text,
  file_size bigint,
  sort_order integer not null default 0
);

create table public.locations (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  address text not null default '',
  map_url text,
  is_active boolean not null default true
);

create table public.lessons (
  id uuid primary key default gen_random_uuid(),
  title text not null,
  description text not null default '',
  location_id uuid references public.locations(id) on delete set null,
  is_online boolean not null default false,
  live_url text,
  category_id uuid references public.categories(id) on delete set null,
  recurrence_rule jsonb not null default '{}'::jsonb,
  start_time timestamptz not null,
  end_time timestamptz not null,
  timezone text not null default 'Africa/Cairo',
  is_active boolean not null default true,
  is_published boolean not null default false,
  created_at timestamptz not null default now(),
  constraint lesson_time_check check (end_time > start_time)
);

create table public.lesson_exceptions (
  id uuid primary key default gen_random_uuid(),
  lesson_id uuid not null references public.lessons(id) on delete cascade,
  occurrence_date date not null,
  exception_type text not null check (exception_type in ('cancelled','moved')),
  new_start timestamptz,
  new_end timestamptz,
  note text not null default '',
  unique (lesson_id, occurrence_date),
  constraint moved_occurrence_has_times check (
    exception_type <> 'moved' or (new_start is not null and new_end is not null and new_end > new_start)
  )
);

create table public.media_assets (
  id uuid primary key default gen_random_uuid(),
  r2_key text not null unique,
  public_url text,
  filename text not null,
  mime_type text not null,
  size_bytes bigint not null default 0,
  width integer,
  height integer,
  created_by uuid references auth.users(id) on delete set null,
  deleted_at timestamptz,
  created_at timestamptz not null default now()
);

create table public.contact_messages (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  email text,
  phone text,
  subject text not null,
  message text not null,
  is_read boolean not null default false,
  is_archived boolean not null default false,
  created_at timestamptz not null default now()
);

create table public.analytics_events (
  id bigint generated always as identity primary key,
  event_type text not null check (event_type in ('play','video_view','download','share','page_view')),
  lecture_id uuid references public.lectures(id) on delete set null,
  session_hash text,
  path text,
  referrer_host text,
  device_type text check (device_type is null or device_type in ('mobile','tablet','desktop','other')),
  created_at timestamptz not null default now()
);
create index analytics_events_created_idx on public.analytics_events(created_at desc);

create table public.push_subscriptions (
  id uuid primary key default gen_random_uuid(),
  endpoint text not null unique,
  subscription jsonb not null,
  created_at timestamptz not null default now()
);

create table public.activity_log (
  id bigint generated always as identity primary key,
  actor_id uuid references auth.users(id) on delete set null,
  action text not null,
  entity_type text not null,
  entity_id text,
  details jsonb not null default '{}'::jsonb,
  created_at timestamptz not null default now()
);

create or replace function public.normalize_arabic(input_text text)
returns text language sql immutable
as $$
  select trim(regexp_replace(
    translate(lower(unaccent(coalesce(input_text,''))),
      'أإآىةـ', 'اااهي'),
    '[[:space:][:punct:]]+', ' ', 'g'
  ));
$$;

create or replace function public.next_lesson()
returns setof public.lessons language sql stable security invoker
set search_path = public
as $$
  select l.* from public.lessons l
  where l.is_active and l.is_published and l.end_time >= now()
  order by l.start_time asc limit 1;
$$;

create or replace function public.increment_play(p_lecture_id uuid, p_session_hash text)
returns bigint language plpgsql security definer
set search_path = public
as $$
declare updated_count bigint;
begin
  if p_session_hash is null or length(p_session_hash) < 16 or length(p_session_hash) > 128 then
    raise exception 'Invalid session identifier';
  end if;
  if not exists (select 1 from public.lectures where id = p_lecture_id and status = 'published' and deleted_at is null) then
    raise exception 'Lecture not available';
  end if;
  if exists (select 1 from public.analytics_events where lecture_id = p_lecture_id and session_hash = p_session_hash and event_type = 'play' and created_at > now() - interval '12 hours') then
    select play_count into updated_count from public.lectures where id = p_lecture_id;
    return updated_count;
  end if;
  update public.lectures set play_count = play_count + 1, updated_at = now() where id = p_lecture_id returning play_count into updated_count;
  insert into public.analytics_events(event_type, lecture_id, session_hash) values ('play', p_lecture_id, p_session_hash);
  return updated_count;
end;
$$;

create or replace function public.site_stats()
returns jsonb language sql stable security invoker
set search_path = public
as $$
  select jsonb_build_object(
    'lectures', (select count(*) from public.lectures where status='published' and deleted_at is null),
    'series', (select count(*) from public.series where status='published'),
    'listening_hours', coalesce((select round(sum(duration_seconds)::numeric / 3600, 1) from public.lectures where status='published' and type='audio' and deleted_at is null),0)
  );
$$;

alter table public.admins enable row level security;
alter table public.site_settings enable row level security;
alter table public.nav_items enable row level security;
alter table public.home_sections enable row level security;
alter table public.pages enable row level security;
alter table public.categories enable row level security;
alter table public.series enable row level security;
alter table public.lectures enable row level security;
alter table public.lecture_chapters enable row level security;
alter table public.lecture_attachments enable row level security;
alter table public.locations enable row level security;
alter table public.lessons enable row level security;
alter table public.lesson_exceptions enable row level security;
alter table public.media_assets enable row level security;
alter table public.contact_messages enable row level security;
alter table public.analytics_events enable row level security;
alter table public.push_subscriptions enable row level security;
alter table public.activity_log enable row level security;

create policy "admins read own admin row" on public.admins for select to authenticated using (user_id = auth.uid() or public.admin_role_for_user() = 'owner');
create policy "owner manages admins" on public.admins for all to authenticated using (public.admin_role_for_user() = 'owner') with check (public.admin_role_for_user() = 'owner');

create policy "public reads settings" on public.site_settings for select to anon, authenticated using (true);
create policy "admins manage settings" on public.site_settings for all to authenticated using (public.is_admin()) with check (public.is_admin());
create policy "public reads nav" on public.nav_items for select to anon, authenticated using (is_visible = true or public.is_admin());
create policy "admins manage nav" on public.nav_items for all to authenticated using (public.is_admin()) with check (public.is_admin());
create policy "public reads visible home sections" on public.home_sections for select to anon, authenticated using (is_visible = true or public.is_admin());
create policy "admins manage home sections" on public.home_sections for all to authenticated using (public.is_admin()) with check (public.is_admin());
create policy "public reads published pages" on public.pages for select to anon, authenticated using (is_published or public.is_admin());
create policy "admins manage pages" on public.pages for all to authenticated using (public.is_admin()) with check (public.is_admin());
create policy "public reads categories" on public.categories for select to anon, authenticated using (true);
create policy "admins manage categories" on public.categories for all to authenticated using (public.is_admin()) with check (public.is_admin());
create policy "public reads published series" on public.series for select to anon, authenticated using (status='published' or public.is_admin());
create policy "admins manage series" on public.series for all to authenticated using (public.is_admin()) with check (public.is_admin());
create policy "public reads published lectures" on public.lectures for select to anon, authenticated using ((status='published' and deleted_at is null) or public.is_admin());
create policy "admins manage lectures" on public.lectures for all to authenticated using (public.is_admin()) with check (public.is_admin());
create policy "public reads chapters for published lectures" on public.lecture_chapters for select to anon, authenticated using (exists(select 1 from public.lectures l where l.id=lecture_id and l.status='published' and l.deleted_at is null) or public.is_admin());
create policy "admins manage chapters" on public.lecture_chapters for all to authenticated using (public.is_admin()) with check (public.is_admin());
create policy "public reads attachments for published lectures" on public.lecture_attachments for select to anon, authenticated using (exists(select 1 from public.lectures l where l.id=lecture_id and l.status='published' and l.deleted_at is null) or public.is_admin());
create policy "admins manage attachments" on public.lecture_attachments for all to authenticated using (public.is_admin()) with check (public.is_admin());
create policy "public reads active locations" on public.locations for select to anon, authenticated using (is_active or public.is_admin());
create policy "admins manage locations" on public.locations for all to authenticated using (public.is_admin()) with check (public.is_admin());
create policy "public reads published lessons" on public.lessons for select to anon, authenticated using ((is_published and is_active) or public.is_admin());
create policy "admins manage lessons" on public.lessons for all to authenticated using (public.is_admin()) with check (public.is_admin());
create policy "public reads exceptions" on public.lesson_exceptions for select to anon, authenticated using (exists(select 1 from public.lessons l where l.id=lesson_id and l.is_published and l.is_active) or public.is_admin());
create policy "admins manage exceptions" on public.lesson_exceptions for all to authenticated using (public.is_admin()) with check (public.is_admin());
create policy "public reads media assets" on public.media_assets for select to anon, authenticated using (deleted_at is null or public.is_admin());
create policy "admins manage media assets" on public.media_assets for all to authenticated using (public.is_admin()) with check (public.is_admin());
create policy "admins manage contact inbox" on public.contact_messages for all to authenticated using (public.is_admin()) with check (public.is_admin());
create policy "admins read analytics" on public.analytics_events for select to authenticated using (public.is_admin());
create policy "admins manage push subscriptions" on public.push_subscriptions for all to authenticated using (public.is_admin()) with check (public.is_admin());
create policy "admins read activity log" on public.activity_log for select to authenticated using (public.is_admin());
create policy "admins insert activity log" on public.activity_log for insert to authenticated with check (public.is_admin() and actor_id = auth.uid());

grant execute on function public.is_admin() to anon, authenticated;
grant execute on function public.admin_role_for_user() to authenticated;
grant execute on function public.normalize_arabic(text) to anon, authenticated;
grant execute on function public.next_lesson() to anon, authenticated;
grant execute on function public.increment_play(uuid,text) to anon, authenticated;
grant execute on function public.site_stats() to anon, authenticated;

insert into public.site_settings(key, value) values
('brand', '{"siteName":"الشيخ محمود فتحي","tagline":"الموقع الرسمي","primary":"#0B3D2E","accent":"#C9A961","background":"#F7F2E7","text":"#12201A","timezone":"Africa/Cairo","arabicIndicNumerals":true,"showHijri":false}'::jsonb),
('hero', '{"headline":"مجلس علمٍ يقرّبك من المعنى","subheadline":"تابع دروس الشيخ محمود فتحي، واستمع إلى المحاضرات، وتعرّف على مواعيد اللقاءات القادمة.","primaryCtaLabel":"استكشف المحاضرات","primaryCtaHref":"/lectures","secondaryCtaLabel":"مواعيد الدروس","secondaryCtaHref":"/schedule"}'::jsonb)
on conflict (key) do nothing;

insert into public.nav_items(label,href,placement,sort_order) values
('الرئيسية','/','header',0),('المحاضرات','/lectures','header',1),('جدول الدروس','/schedule','header',2),('عن الشيخ','/about','header',3)
on conflict do nothing;

insert into public.home_sections(section_key,title,sort_order,is_visible) values
('hero','الواجهة الرئيسية',0,true),('next_lesson','الدرس القادم',1,true),('latest_audio','أحدث المحاضرات الصوتية',2,true),('latest_video','أحدث الفيديوهات',3,true),('featured_series','سلاسل مختارة',4,true),('about','عن الشيخ',5,true)
on conflict(section_key) do nothing;
