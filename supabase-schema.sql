-- Player saves table
create table public.player_saves (
  id uuid default gen_random_uuid() primary key,
  user_id uuid references auth.users on delete cascade not null unique,
  game_state jsonb not null default '{}',
  updated_at timestamp with time zone default now()
);

-- Enable RLS
alter table public.player_saves enable row level security;

-- Policies: user hanya bisa akses data sendiri
create policy "Users can read own save"
  on public.player_saves for select
  using (auth.uid() = user_id);

create policy "Users can insert own save"
  on public.player_saves for insert
  with check (auth.uid() = user_id);

create policy "Users can update own save"
  on public.player_saves for update
  using (auth.uid() = user_id);
