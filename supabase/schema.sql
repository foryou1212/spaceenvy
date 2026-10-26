create extension if not exists pgcrypto;

create table if not exists public.admin_users (
  user_id uuid primary key references auth.users (id) on delete cascade,
  created_at timestamptz not null default now()
);

create table if not exists public.site_settings (
  id text primary key check (id = 'home'),
  hero_eyebrow text not null,
  hero_title text not null,
  hero_description text not null,
  hero_image_url text,
  hero_image_path text,
  about_heading text not null,
  about_text text not null,
  updated_at timestamptz not null default now()
);

alter table public.site_settings
  add column if not exists hero_image_url text,
  add column if not exists hero_image_path text;

create table if not exists public.projects (
  id uuid primary key default gen_random_uuid(),
  title text not null,
  slug text not null unique,
  category text not null,
  location text not null default 'Hyderabad',
  status text not null check (status in ('upcoming', 'completed')),
  description text not null default '',
  image_url text,
  image_path text,
  is_published boolean not null default false,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists public.enquiries (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  mobile text not null,
  email text,
  space_type text,
  location text,
  requirements text,
  privacy_consent_at timestamptz not null default now(),
  created_at timestamptz not null default now(),
  constraint enquiry_name_length check (char_length(trim(name)) between 2 and 120),
  constraint enquiry_mobile_format check (mobile ~ '^[+]?[0-9][0-9 ()().-]{6,18}[0-9]$')
);

create table if not exists public.testimonials (
  id uuid primary key default gen_random_uuid(),
  client_name text not null,
  project_type text,
  review text not null,
  status text not null default 'pending'
    check (status in ('pending', 'approved', 'rejected')),
  consent_at timestamptz not null default now(),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  constraint testimonial_name_length check (char_length(trim(client_name)) between 2 and 80),
  constraint testimonial_project_type_length check (project_type is null or char_length(project_type) <= 100),
  constraint testimonial_review_length check (char_length(trim(review)) between 20 and 1500)
);

alter table public.enquiries
  add column if not exists privacy_consent_at timestamptz not null default now();

alter table public.admin_users enable row level security;
alter table public.site_settings enable row level security;
alter table public.projects enable row level security;
alter table public.enquiries enable row level security;
alter table public.testimonials enable row level security;

grant select on public.admin_users to authenticated;
grant select on public.site_settings to anon, authenticated;
grant insert on public.enquiries to anon, authenticated;
grant select on public.projects to anon, authenticated;
grant insert, update, delete on public.projects to authenticated;
grant select, delete on public.enquiries to authenticated;
grant insert, select on public.testimonials to anon, authenticated;
grant update, delete on public.testimonials to authenticated;
grant update on public.site_settings to authenticated;

drop policy if exists "Admins can read their own access" on public.admin_users;
create policy "Admins can read their own access"
  on public.admin_users for select to authenticated
  using (user_id = (select auth.uid()));

drop policy if exists "Public can read homepage content" on public.site_settings;
create policy "Public can read homepage content"
  on public.site_settings for select to anon, authenticated
  using (true);

drop policy if exists "Admins can update homepage content" on public.site_settings;
create policy "Admins can update homepage content"
  on public.site_settings for update to authenticated
  using (exists (
    select 1 from public.admin_users as admins
    where admins.user_id = (select auth.uid())
  ))
  with check (exists (
    select 1 from public.admin_users as admins
    where admins.user_id = (select auth.uid())
  ));

drop policy if exists "Public can read published projects" on public.projects;
create policy "Public can read published projects"
  on public.projects for select to anon, authenticated
  using (is_published);

drop policy if exists "Admins can read all projects" on public.projects;
create policy "Admins can read all projects"
  on public.projects for select to authenticated
  using (exists (
    select 1 from public.admin_users as admins
    where admins.user_id = (select auth.uid())
  ));

drop policy if exists "Admins can create projects" on public.projects;
create policy "Admins can create projects"
  on public.projects for insert to authenticated
  with check (exists (
    select 1 from public.admin_users as admins
    where admins.user_id = (select auth.uid())
  ));

drop policy if exists "Admins can update projects" on public.projects;
create policy "Admins can update projects"
  on public.projects for update to authenticated
  using (exists (
    select 1 from public.admin_users as admins
    where admins.user_id = (select auth.uid())
  ))
  with check (exists (
    select 1 from public.admin_users as admins
    where admins.user_id = (select auth.uid())
  ));

drop policy if exists "Admins can delete projects" on public.projects;
create policy "Admins can delete projects"
  on public.projects for delete to authenticated
  using (exists (
    select 1 from public.admin_users as admins
    where admins.user_id = (select auth.uid())
  ));

drop policy if exists "Visitors can submit enquiries" on public.enquiries;
create policy "Visitors can submit enquiries"
  on public.enquiries for insert to anon, authenticated
  with check (
    char_length(trim(name)) between 2 and 120
    and mobile ~ '^[+]?[0-9][0-9 ()().-]{6,18}[0-9]$'
    and privacy_consent_at is not null
  );

drop policy if exists "Admins can read enquiries" on public.enquiries;
create policy "Admins can read enquiries"
  on public.enquiries for select to authenticated
  using (exists (
    select 1 from public.admin_users as admins
    where admins.user_id = (select auth.uid())
  ));

drop policy if exists "Admins can delete enquiries" on public.enquiries;
create policy "Admins can delete enquiries"
  on public.enquiries for delete to authenticated
  using (exists (
    select 1 from public.admin_users as admins
    where admins.user_id = (select auth.uid())
  ));

drop policy if exists "Visitors can submit pending testimonials" on public.testimonials;
create policy "Visitors can submit pending testimonials"
  on public.testimonials for insert to anon, authenticated
  with check (
    status = 'pending'
    and consent_at is not null
    and char_length(trim(client_name)) between 2 and 80
    and char_length(trim(review)) between 20 and 1500
    and (project_type is null or char_length(project_type) <= 100)
  );

drop policy if exists "Public can read approved testimonials" on public.testimonials;
create policy "Public can read approved testimonials"
  on public.testimonials for select to anon, authenticated
  using (status = 'approved');

drop policy if exists "Admins can read all testimonials" on public.testimonials;
create policy "Admins can read all testimonials"
  on public.testimonials for select to authenticated
  using (exists (
    select 1 from public.admin_users as admins
    where admins.user_id = (select auth.uid())
  ));

drop policy if exists "Admins can update testimonials" on public.testimonials;
create policy "Admins can update testimonials"
  on public.testimonials for update to authenticated
  using (exists (
    select 1 from public.admin_users as admins
    where admins.user_id = (select auth.uid())
  ))
  with check (exists (
    select 1 from public.admin_users as admins
    where admins.user_id = (select auth.uid())
  ));

drop policy if exists "Admins can delete testimonials" on public.testimonials;
create policy "Admins can delete testimonials"
  on public.testimonials for delete to authenticated
  using (exists (
    select 1 from public.admin_users as admins
    where admins.user_id = (select auth.uid())
  ));

insert into public.site_settings (
  id,
  hero_eyebrow,
  hero_title,
  hero_description,
  hero_image_url,
  about_heading,
  about_text
)
values (
  'home',
  'SpaceEnvy · Hyderabad',
  'Spaces that feel like you.',
  'Thoughtful interiors for the way you live, work, and gather. From the first sketch to the final detail, your vision leads the way.',
  'https://images.unsplash.com/photo-1600210492486-724fe5c67fb0?auto=format&fit=crop&w=2400&q=90',
  'Good design should feel like coming home.',
  'SpaceEnvy brings your ideas to life through considered design, clear communication, and careful execution. Every space starts with listening: to how you live, what matters to you, and how you want your space to feel.'
)
on conflict (id) do nothing;

insert into storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
values (
  'project-images',
  'project-images',
  true,
  10485760,
  array['image/jpeg', 'image/png', 'image/webp', 'image/avif']
)
on conflict (id) do update
set public = excluded.public,
    file_size_limit = excluded.file_size_limit,
    allowed_mime_types = excluded.allowed_mime_types;

drop policy if exists "Public can view project images" on storage.objects;
create policy "Public can view project images"
  on storage.objects for select to anon, authenticated
  using (bucket_id = 'project-images');

drop policy if exists "Admins can upload project images" on storage.objects;
create policy "Admins can upload project images"
  on storage.objects for insert to authenticated
  with check (
    bucket_id = 'project-images'
    and exists (
      select 1 from public.admin_users as admins
      where admins.user_id = (select auth.uid())
    )
  );

drop policy if exists "Admins can update project images" on storage.objects;
create policy "Admins can update project images"
  on storage.objects for update to authenticated
  using (
    bucket_id = 'project-images'
    and exists (
      select 1 from public.admin_users as admins
      where admins.user_id = (select auth.uid())
    )
  )
  with check (
    bucket_id = 'project-images'
    and exists (
      select 1 from public.admin_users as admins
      where admins.user_id = (select auth.uid())
    )
  );

drop policy if exists "Admins can delete project images" on storage.objects;
create policy "Admins can delete project images"
  on storage.objects for delete to authenticated
  using (
    bucket_id = 'project-images'
    and exists (
      select 1 from public.admin_users as admins
      where admins.user_id = (select auth.uid())
    )
  );
