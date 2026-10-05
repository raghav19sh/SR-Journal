create table if not exists public.journal_ai_summaries (
  entry_id text primary key references public.journal_entries(id) on delete cascade,
  user_id uuid not null references auth.users(id) on delete cascade,
  summary text not null,
  updated_at timestamptz not null default now()
);
alter table public.journal_ai_summaries enable row level security;
drop policy if exists "summary owner select" on public.journal_ai_summaries;
create policy "summary owner select" on public.journal_ai_summaries for select using (auth.uid()=user_id);
drop policy if exists "summary owner insert" on public.journal_ai_summaries;
create policy "summary owner insert" on public.journal_ai_summaries for insert with check (auth.uid()=user_id);
drop policy if exists "summary owner update" on public.journal_ai_summaries;
create policy "summary owner update" on public.journal_ai_summaries for update using (auth.uid()=user_id) with check (auth.uid()=user_id);
drop policy if exists "summary owner delete" on public.journal_ai_summaries;
create policy "summary owner delete" on public.journal_ai_summaries for delete using (auth.uid()=user_id);
