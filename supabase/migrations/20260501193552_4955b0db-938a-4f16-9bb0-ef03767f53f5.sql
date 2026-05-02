
-- ENUMS
do $$ begin
  if not exists (select 1 from pg_type where typname = 'app_role') then
    create type public.app_role as enum ('admin', 'user');
  end if;
  if not exists (select 1 from pg_type where typname = 'committee_type') then
    create type public.committee_type as enum ('DISEC','UNHRC','UNSC','T20','LokSabha','IFI','JCC');
  end if;
  if not exists (select 1 from pg_type where typname = 'committee_category') then
    create type public.committee_category as enum ('country','party','actor','none');
  end if;
end $$;

-- PROFILES
create table if not exists public.profiles (
  id uuid primary key references auth.users(id) on delete cascade,
  email text,
  display_name text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);
alter table public.profiles enable row level security;
drop policy if exists "Profiles are viewable by self" on public.profiles;
create policy "Profiles are viewable by self" on public.profiles for select to authenticated using (auth.uid() = id);
drop policy if exists "Users can update own profile" on public.profiles;
create policy "Users can update own profile" on public.profiles for update to authenticated using (auth.uid() = id);
drop policy if exists "Users can insert own profile" on public.profiles;
create policy "Users can insert own profile" on public.profiles for insert to authenticated with check (auth.uid() = id);

-- USER ROLES
create table if not exists public.user_roles (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  role public.app_role not null,
  created_at timestamptz not null default now(),
  unique (user_id, role)
);
alter table public.user_roles enable row level security;

create or replace function public.has_role(_user_id uuid, _role public.app_role)
returns boolean language sql stable security definer set search_path = public as $$
  select exists (select 1 from public.user_roles where user_id = _user_id and role = _role)
$$;
revoke execute on function public.has_role(uuid, public.app_role) from public, anon;
grant execute on function public.has_role(uuid, public.app_role) to authenticated;
grant select on public.user_roles to authenticated;

drop policy if exists "Users can view own roles" on public.user_roles;
create policy "Users can view own roles" on public.user_roles for select to authenticated using (auth.uid() = user_id);
drop policy if exists "Admins can view all roles" on public.user_roles;
create policy "Admins can view all roles" on public.user_roles for select to authenticated using (public.has_role(auth.uid(), 'admin'));
drop policy if exists "Admins manage roles" on public.user_roles;
create policy "Admins manage roles" on public.user_roles for all to authenticated using (public.has_role(auth.uid(), 'admin')) with check (public.has_role(auth.uid(), 'admin'));

-- HANDLE NEW USER
create or replace function public.handle_new_user()
returns trigger language plpgsql security definer set search_path = public as $$
begin
  insert into public.profiles (id, email, display_name)
  values (new.id, new.email, coalesce(new.raw_user_meta_data->>'display_name', new.email));
  return new;
end;
$$;
drop trigger if exists on_auth_user_created on auth.users;
create trigger on_auth_user_created after insert on auth.users for each row execute function public.handle_new_user();

-- TOUCH UPDATED AT
create or replace function public.touch_updated_at()
returns trigger language plpgsql set search_path = public as $$
begin new.updated_at = now(); return new; end;
$$;

-- COMMITTEES
create table if not exists public.committees (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  short_code text,
  type public.committee_type,
  category public.committee_category not null default 'country',
  agenda text,
  image_url text,
  background_guide text,
  registration_open boolean not null default true,
  sort_order int not null default 0,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);
alter table public.committees add column if not exists category public.committee_category not null default 'country';
alter table public.committees add column if not exists registration_open boolean not null default true;
alter table public.committees add column if not exists background_guide text;
alter table public.committees enable row level security;
drop trigger if exists committees_touch on public.committees;
create trigger committees_touch before update on public.committees for each row execute function public.touch_updated_at();
drop policy if exists "Committees public read" on public.committees;
create policy "Committees public read" on public.committees for select using (true);
drop policy if exists "Admins manage committees" on public.committees;
create policy "Admins manage committees" on public.committees for all to authenticated using (public.has_role(auth.uid(),'admin')) with check (public.has_role(auth.uid(),'admin'));

-- SCHEDULE
create table if not exists public.schedule_events (
  id uuid primary key default gen_random_uuid(),
  title text not null,
  description text,
  starts_at timestamptz not null,
  ends_at timestamptz,
  location text,
  sort_order int not null default 0,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);
alter table public.schedule_events enable row level security;
drop trigger if exists schedule_touch on public.schedule_events;
create trigger schedule_touch before update on public.schedule_events for each row execute function public.touch_updated_at();
drop policy if exists "Schedule public read" on public.schedule_events;
create policy "Schedule public read" on public.schedule_events for select using (true);
drop policy if exists "Admins manage schedule" on public.schedule_events;
create policy "Admins manage schedule" on public.schedule_events for all to authenticated using (public.has_role(auth.uid(),'admin')) with check (public.has_role(auth.uid(),'admin'));

-- TEAM
create table if not exists public.team_members (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  role_title text,
  photo_url text,
  bio text,
  sort_order int not null default 0,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);
alter table public.team_members enable row level security;
drop trigger if exists team_touch on public.team_members;
create trigger team_touch before update on public.team_members for each row execute function public.touch_updated_at();
drop policy if exists "Team public read" on public.team_members;
create policy "Team public read" on public.team_members for select using (true);
drop policy if exists "Admins manage team" on public.team_members;
create policy "Admins manage team" on public.team_members for all to authenticated using (public.has_role(auth.uid(),'admin')) with check (public.has_role(auth.uid(),'admin'));

-- NOTICES
create table if not exists public.notices (
  id uuid primary key default gen_random_uuid(),
  title text not null,
  body text,
  active boolean not null default true,
  starts_at timestamptz,
  ends_at timestamptz,
  attachment_url text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);
alter table public.notices add column if not exists attachment_url text;
alter table public.notices enable row level security;
drop trigger if exists notices_touch on public.notices;
create trigger notices_touch before update on public.notices for each row execute function public.touch_updated_at();
drop policy if exists "Active notices public read" on public.notices;
create policy "Active notices public read" on public.notices for select using (
  active = true and (starts_at is null or starts_at <= now()) and (ends_at is null or ends_at >= now())
);
drop policy if exists "Admins read all notices" on public.notices;
create policy "Admins read all notices" on public.notices for select to authenticated using (public.has_role(auth.uid(),'admin'));
drop policy if exists "Admins manage notices" on public.notices;
create policy "Admins manage notices" on public.notices for all to authenticated using (public.has_role(auth.uid(),'admin')) with check (public.has_role(auth.uid(),'admin'));

-- SITE SETTINGS
create table if not exists public.site_settings (
  id int primary key default 1,
  countdown_target timestamptz,
  countdown_active boolean not null default false,
  registration_open boolean not null default true,
  hero_bg_url text,
  secgen_note text,
  secgen_signature_url text,
  album_title text,
  updated_at timestamptz not null default now(),
  constraint singleton check (id = 1)
);
alter table public.site_settings add column if not exists album_title text;
alter table public.site_settings enable row level security;
drop trigger if exists site_settings_touch on public.site_settings;
create trigger site_settings_touch before update on public.site_settings for each row execute function public.touch_updated_at();
insert into public.site_settings (id) values (1) on conflict do nothing;
drop policy if exists "Settings public read" on public.site_settings;
create policy "Settings public read" on public.site_settings for select using (true);
drop policy if exists "Admins manage settings" on public.site_settings;
create policy "Admins manage settings" on public.site_settings for all to authenticated using (public.has_role(auth.uid(),'admin')) with check (public.has_role(auth.uid(),'admin'));

-- ALBUM IMAGES (about page)
create table if not exists public.album_images (
  id uuid primary key default gen_random_uuid(),
  image_url text not null,
  caption text,
  sort_order int not null default 0,
  created_at timestamptz not null default now()
);
alter table public.album_images enable row level security;
drop policy if exists "Album public read" on public.album_images;
create policy "Album public read" on public.album_images for select using (true);
drop policy if exists "Admins manage album" on public.album_images;
create policy "Admins manage album" on public.album_images for all to authenticated using (public.has_role(auth.uid(),'admin')) with check (public.has_role(auth.uid(),'admin'));

-- REGISTRATIONS (2 prefs)
create table if not exists public.registrations (
  id uuid primary key default gen_random_uuid(),
  full_name text not null,
  class_grade text not null,
  email text not null,
  mobile text not null,
  address text not null,
  mun_experience text,
  committee_pref1 text not null,
  committee_pref2 text,
  preference1 text,
  preference2 text,
  receipt_path text,
  created_at timestamptz not null default now()
);
alter table public.registrations add column if not exists committee_pref1 text;
alter table public.registrations add column if not exists committee_pref2 text;
alter table public.registrations add column if not exists preference1 text;
alter table public.registrations add column if not exists preference2 text;
alter table public.registrations enable row level security;

drop policy if exists "Anyone can submit a registration" on public.registrations;
create policy "Anyone can submit a registration" on public.registrations for insert with check (
  length(trim(full_name)) between 2 and 120
  and email ~* '^[^@\s]+@[^@\s]+\.[^@\s]+$'
  and length(trim(mobile)) between 7 and 20
  and length(trim(address)) between 3 and 500
  and length(trim(class_grade)) between 1 and 40
);
drop policy if exists "Admins read all registrations" on public.registrations;
create policy "Admins read all registrations" on public.registrations for select to authenticated using (public.has_role(auth.uid(),'admin'));
drop policy if exists "Admins update registrations" on public.registrations;
create policy "Admins update registrations" on public.registrations for update to authenticated using (public.has_role(auth.uid(),'admin')) with check (public.has_role(auth.uid(),'admin'));
drop policy if exists "Admins delete registrations" on public.registrations;
create policy "Admins delete registrations" on public.registrations for delete to authenticated using (public.has_role(auth.uid(),'admin'));

-- ALLOCATIONS
create table if not exists public.allocations (
  id uuid primary key default gen_random_uuid(),
  registration_id uuid references public.registrations(id) on delete set null,
  delegate_name text,
  school text,
  class_grade text,
  committee_id uuid references public.committees(id) on delete set null,
  portfolio text,
  status text not null default 'draft',
  published boolean not null default false,
  notes text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);
alter table public.allocations add column if not exists school text;
alter table public.allocations add column if not exists class_grade text;
alter table public.allocations add column if not exists published boolean not null default false;
alter table public.allocations enable row level security;
drop trigger if exists allocations_touch on public.allocations;
create trigger allocations_touch before update on public.allocations for each row execute function public.touch_updated_at();
drop policy if exists "Published allocations public read" on public.allocations;
create policy "Published allocations public read" on public.allocations for select using (published = true);
drop policy if exists "Admins read all allocations" on public.allocations;
create policy "Admins read all allocations" on public.allocations for select to authenticated using (public.has_role(auth.uid(),'admin'));
drop policy if exists "Admins manage allocations" on public.allocations;
create policy "Admins manage allocations" on public.allocations for all to authenticated using (public.has_role(auth.uid(),'admin')) with check (public.has_role(auth.uid(),'admin'));

-- STORAGE: receipts
insert into storage.buckets (id, name, public) values ('receipts', 'receipts', false) on conflict (id) do nothing;
drop policy if exists "Anyone can upload a receipt" on storage.objects;
create policy "Anyone can upload a receipt" on storage.objects for insert with check (
  bucket_id = 'receipts' and length(name) between 3 and 300
);
drop policy if exists "Admins read receipts" on storage.objects;
create policy "Admins read receipts" on storage.objects for select to authenticated using (bucket_id = 'receipts' and public.has_role(auth.uid(),'admin'));
drop policy if exists "Admins delete receipts" on storage.objects;
create policy "Admins delete receipts" on storage.objects for delete to authenticated using (bucket_id = 'receipts' and public.has_role(auth.uid(),'admin'));

-- ADMIN BOOTSTRAP
update auth.users set email_confirmed_at = now() where email = 'secretary@dpsmun' and email_confirmed_at is null;
insert into public.user_roles (user_id, role)
select id, 'admin'::app_role from auth.users where email = 'secretary@dpsmun'
on conflict (user_id, role) do nothing;

-- REALTIME
alter table public.site_settings replica identity full;
alter table public.notices replica identity full;
alter table public.committees replica identity full;
alter table public.allocations replica identity full;
alter table public.album_images replica identity full;
do $$ begin
  begin alter publication supabase_realtime add table public.site_settings; exception when duplicate_object then null; end;
  begin alter publication supabase_realtime add table public.notices; exception when duplicate_object then null; end;
  begin alter publication supabase_realtime add table public.committees; exception when duplicate_object then null; end;
  begin alter publication supabase_realtime add table public.allocations; exception when duplicate_object then null; end;
  begin alter publication supabase_realtime add table public.album_images; exception when duplicate_object then null; end;
end $$;
