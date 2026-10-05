create extension if not exists pgcrypto;

create table if not exists public.journal_entries (
  id text primary key,
  user_id uuid not null references auth.users(id) on delete cascade default auth.uid(),
  entry_date timestamptz not null,
  title text not null default '',
  note text not null default '',
  tags text[] not null default '{}',
  mood text,
  transcript text not null default '',
  is_favorite boolean not null default false,
  video_path text not null,
  updated_at timestamptz not null default now(),
  created_at timestamptz not null default now()
);

create index if not exists journal_entries_user_date_idx on public.journal_entries(user_id,entry_date desc);
create index if not exists journal_entries_user_updated_idx on public.journal_entries(user_id,updated_at desc);

alter table public.journal_entries enable row level security;

drop policy if exists "journal owner select" on public.journal_entries;
create policy "journal owner select" on public.journal_entries for select using (auth.uid()=user_id);
drop policy if exists "journal owner insert" on public.journal_entries;
create policy "journal owner insert" on public.journal_entries for insert with check (auth.uid()=user_id);
drop policy if exists "journal owner update" on public.journal_entries;
create policy "journal owner update" on public.journal_entries for update using (auth.uid()=user_id) with check (auth.uid()=user_id);
drop policy if exists "journal owner delete" on public.journal_entries;
create policy "journal owner delete" on public.journal_entries for delete using (auth.uid()=user_id);

insert into storage.buckets (id,name,public) values ('journal-videos','journal-videos',false) on conflict (id) do nothing;

drop policy if exists "journal video select" on storage.objects;
create policy "journal video select" on storage.objects for select to authenticated using (bucket_id='journal-videos' and (storage.foldername(name))[1]=auth.uid()::text);
drop policy if exists "journal video insert" on storage.objects;
create policy "journal video insert" on storage.objects for insert to authenticated with check (bucket_id='journal-videos' and (storage.foldername(name))[1]=auth.uid()::text);
drop policy if exists "journal video update" on storage.objects;
create policy "journal video update" on storage.objects for update to authenticated using (bucket_id='journal-videos' and (storage.foldername(name))[1]=auth.uid()::text);
drop policy if exists "journal video delete" on storage.objects;
create policy "journal video delete" on storage.objects for delete to authenticated using (bucket_id='journal-videos' and (storage.foldername(name))[1]=auth.uid()::text);
