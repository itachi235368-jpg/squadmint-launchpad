create table public.coins (
  id uuid primary key default gen_random_uuid(),
  mint text not null unique,
  name text not null,
  symbol text not null,
  uri text not null,
  image text not null,
  description text not null default '',
  twitter text,
  telegram text,
  website text,
  creator_wallet text not null,
  dev_buy_sol numeric not null default 0,
  signature text not null,
  created_at timestamptz not null default now()
);

GRANT SELECT ON public.coins TO anon, authenticated;
GRANT ALL ON public.coins TO service_role;

ALTER TABLE public.coins ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Anyone can view launched coins"
  ON public.coins
  FOR SELECT
  TO anon, authenticated
  USING (true);

create index coins_created_at_idx on public.coins (created_at desc);
create index coins_symbol_idx on public.coins (symbol);