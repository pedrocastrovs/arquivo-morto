-- Arquivo Morto — schema inicial
-- Fase 2: enums, tabelas, triggers, RLS

-- ---------------------------------------------------------------------------
-- Enums
-- ---------------------------------------------------------------------------
create type public.user_role as enum ('administrador', 'operador', 'consultante');
create type public.box_status as enum (
  'preparacao',
  'arquivada',
  'emprestada',
  'em_movimentacao',
  'aguardando_descarte',
  'descartada'
);
create type public.document_type as enum (
  'financeiro',
  'rh',
  'contratos',
  'assistencial',
  'administrativo',
  'juridico'
);
create type public.loan_status as enum ('pendente', 'em_andamento', 'devolvido', 'atrasado');

-- ---------------------------------------------------------------------------
-- Cadastros auxiliares
-- ---------------------------------------------------------------------------
create table public.sectors (
  id uuid primary key default gen_random_uuid(),
  name text not null unique,
  created_at timestamptz not null default now()
);

create table public.units (
  id uuid primary key default gen_random_uuid(),
  name text not null unique,
  created_at timestamptz not null default now()
);

-- ---------------------------------------------------------------------------
-- Estrutura física
-- ---------------------------------------------------------------------------
create table public.locations (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  created_at timestamptz not null default now()
);

create table public.streets (
  id uuid primary key default gen_random_uuid(),
  location_id uuid not null references public.locations (id) on delete cascade,
  name text not null,
  created_at timestamptz not null default now(),
  unique (location_id, name)
);

create table public.buildings (
  id uuid primary key default gen_random_uuid(),
  street_id uuid not null references public.streets (id) on delete cascade,
  name text not null,
  created_at timestamptz not null default now(),
  unique (street_id, name)
);

create table public.floors (
  id uuid primary key default gen_random_uuid(),
  building_id uuid not null references public.buildings (id) on delete cascade,
  name text not null,
  created_at timestamptz not null default now(),
  unique (building_id, name)
);

create table public.towers (
  id uuid primary key default gen_random_uuid(),
  floor_id uuid not null references public.floors (id) on delete cascade,
  name text not null,
  created_at timestamptz not null default now(),
  unique (floor_id, name)
);

create table public.positions (
  id uuid primary key default gen_random_uuid(),
  tower_id uuid not null references public.towers (id) on delete cascade,
  name text not null,
  is_occupied boolean not null default false,
  box_id uuid,
  created_at timestamptz not null default now(),
  unique (tower_id, name)
);

-- ---------------------------------------------------------------------------
-- Perfis (ligados ao Auth)
-- ---------------------------------------------------------------------------
create table public.profiles (
  id uuid primary key references auth.users (id) on delete cascade,
  email text not null,
  name text not null,
  role public.user_role not null default 'operador',
  sector text,
  avatar_url text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

-- ---------------------------------------------------------------------------
-- Caixas
-- ---------------------------------------------------------------------------
create sequence public.box_code_seq start 1;

create table public.boxes (
  id uuid primary key default gen_random_uuid(),
  code text not null unique,
  barcode text not null unique,
  description text not null,
  sector text not null,
  unit text not null,
  responsible text not null,
  document_type public.document_type not null,
  start_date date not null,
  end_date date not null,
  observations text,
  archive_date date not null,
  expected_discard_date date not null,
  status public.box_status not null default 'preparacao',
  location_path text not null default '',
  position_id uuid references public.positions (id) on delete set null,
  created_by uuid references public.profiles (id) on delete set null,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

alter table public.positions
  add constraint positions_box_id_fkey
  foreign key (box_id) references public.boxes (id) on delete set null;

create unique index boxes_one_active_per_position_idx
  on public.boxes (position_id)
  where position_id is not null and status <> 'descartada';

create index boxes_status_idx on public.boxes (status);
create index boxes_code_idx on public.boxes (code);
create index boxes_barcode_idx on public.boxes (barcode);

-- ---------------------------------------------------------------------------
-- Movimentações (append-only)
-- ---------------------------------------------------------------------------
create table public.movements (
  id uuid primary key default gen_random_uuid(),
  box_id uuid not null references public.boxes (id) on delete restrict,
  box_code text not null,
  moved_at timestamptz not null default now(),
  user_id uuid references public.profiles (id) on delete set null,
  user_name text not null default '',
  previous_location text not null,
  new_location text not null,
  reason text not null,
  created_at timestamptz not null default now()
);

create index movements_box_id_idx on public.movements (box_id);
create index movements_moved_at_idx on public.movements (moved_at desc);

-- ---------------------------------------------------------------------------
-- Empréstimos
-- ---------------------------------------------------------------------------
create table public.loans (
  id uuid primary key default gen_random_uuid(),
  box_id uuid not null references public.boxes (id) on delete restrict,
  box_code text not null,
  requester text not null,
  sector text not null,
  request_date date not null default current_date,
  pickup_date date,
  return_deadline date not null,
  return_date date,
  delivery_responsible text,
  status public.loan_status not null default 'pendente',
  created_by uuid references public.profiles (id) on delete set null,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create index loans_status_idx on public.loans (status);
create index loans_box_id_idx on public.loans (box_id);

-- ---------------------------------------------------------------------------
-- Funções auxiliares
-- ---------------------------------------------------------------------------
create or replace function public.get_user_role()
returns public.user_role
language sql
stable
security definer
set search_path = public
as $$
  select coalesce(
    (select role from public.profiles where id = auth.uid()),
    'consultante'::public.user_role
  );
$$;

create or replace function public.is_admin()
returns boolean
language sql
stable
security definer
set search_path = public
as $$
  select public.get_user_role() = 'administrador'::public.user_role;
$$;

create or replace function public.is_operador_or_admin()
returns boolean
language sql
stable
security definer
set search_path = public
as $$
  select public.get_user_role() in (
    'administrador'::public.user_role,
    'operador'::public.user_role
  );
$$;

create or replace function public.next_box_code()
returns text
language plpgsql
security definer
set search_path = public
as $$
declare
  n bigint;
begin
  n := nextval('public.box_code_seq');
  return 'CX-' || lpad(n::text, 6, '0');
end;
$$;

create or replace function public.sync_position_on_box_change()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
begin
  if tg_op = 'DELETE' then
    if old.position_id is not null then
      update public.positions
      set is_occupied = false, box_id = null
      where id = old.position_id;
    end if;
    return old;
  end if;

  if tg_op = 'UPDATE' and old.position_id is distinct from new.position_id and old.position_id is not null then
    update public.positions
    set is_occupied = false, box_id = null
    where id = old.position_id;
  end if;

  if new.position_id is not null and new.status <> 'descartada' then
    update public.positions
    set is_occupied = true, box_id = new.id
    where id = new.position_id;
  elsif new.position_id is not null and new.status = 'descartada' then
    update public.positions
    set is_occupied = false, box_id = null
    where id = new.position_id;
  end if;

  return new;
end;
$$;

create trigger boxes_sync_position
  after insert or update or delete on public.boxes
  for each row execute function public.sync_position_on_box_change();

create or replace function public.handle_new_user()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
begin
  insert into public.profiles (id, email, name, role)
  values (
    new.id,
    coalesce(new.email, ''),
    coalesce(new.raw_user_meta_data ->> 'name', split_part(coalesce(new.email, 'usuario'), '@', 1)),
    'operador'::public.user_role
  );
  return new;
end;
$$;

create trigger on_auth_user_created
  after insert on auth.users
  for each row execute function public.handle_new_user();

create or replace function public.set_updated_at()
returns trigger
language plpgsql
as $$
begin
  new.updated_at = now();
  return new;
end;
$$;

create trigger profiles_set_updated_at
  before update on public.profiles
  for each row execute function public.set_updated_at();

create trigger boxes_set_updated_at
  before update on public.boxes
  for each row execute function public.set_updated_at();

create trigger loans_set_updated_at
  before update on public.loans
  for each row execute function public.set_updated_at();

-- ---------------------------------------------------------------------------
-- Row Level Security
-- ---------------------------------------------------------------------------
alter table public.sectors enable row level security;
alter table public.units enable row level security;
alter table public.locations enable row level security;
alter table public.streets enable row level security;
alter table public.buildings enable row level security;
alter table public.floors enable row level security;
alter table public.towers enable row level security;
alter table public.positions enable row level security;
alter table public.profiles enable row level security;
alter table public.boxes enable row level security;
alter table public.movements enable row level security;
alter table public.loans enable row level security;

-- Leitura: qualquer autenticado
create policy "sectors_select_authenticated"
  on public.sectors for select to authenticated using (true);
create policy "units_select_authenticated"
  on public.units for select to authenticated using (true);
create policy "locations_select_authenticated"
  on public.locations for select to authenticated using (true);
create policy "streets_select_authenticated"
  on public.streets for select to authenticated using (true);
create policy "buildings_select_authenticated"
  on public.buildings for select to authenticated using (true);
create policy "floors_select_authenticated"
  on public.floors for select to authenticated using (true);
create policy "towers_select_authenticated"
  on public.towers for select to authenticated using (true);
create policy "positions_select_authenticated"
  on public.positions for select to authenticated using (true);

create policy "boxes_select_authenticated"
  on public.boxes for select to authenticated using (true);

create policy "movements_select_authenticated"
  on public.movements for select to authenticated using (true);

create policy "loans_select_authenticated"
  on public.loans for select to authenticated using (true);

-- Profiles
create policy "profiles_select_own_or_admin"
  on public.profiles for select to authenticated
  using (id = auth.uid() or public.is_admin());

create policy "profiles_update_own"
  on public.profiles for update to authenticated
  using (id = auth.uid())
  with check (id = auth.uid());

create policy "profiles_admin_update"
  on public.profiles for update to authenticated
  using (public.is_admin())
  with check (public.is_admin());

-- Cadastros e estrutura: escrita só admin
create policy "sectors_insert_admin"
  on public.sectors for insert to authenticated with check (public.is_admin());
create policy "sectors_update_admin"
  on public.sectors for update to authenticated
  using (public.is_admin()) with check (public.is_admin());
create policy "sectors_delete_admin"
  on public.sectors for delete to authenticated using (public.is_admin());

create policy "units_insert_admin"
  on public.units for insert to authenticated with check (public.is_admin());
create policy "units_update_admin"
  on public.units for update to authenticated
  using (public.is_admin()) with check (public.is_admin());
create policy "units_delete_admin"
  on public.units for delete to authenticated using (public.is_admin());

create policy "locations_insert_admin"
  on public.locations for insert to authenticated with check (public.is_admin());
create policy "locations_update_admin"
  on public.locations for update to authenticated
  using (public.is_admin()) with check (public.is_admin());
create policy "locations_delete_admin"
  on public.locations for delete to authenticated using (public.is_admin());

create policy "streets_insert_admin"
  on public.streets for insert to authenticated with check (public.is_admin());
create policy "streets_update_admin"
  on public.streets for update to authenticated
  using (public.is_admin()) with check (public.is_admin());
create policy "streets_delete_admin"
  on public.streets for delete to authenticated using (public.is_admin());

create policy "buildings_insert_admin"
  on public.buildings for insert to authenticated with check (public.is_admin());
create policy "buildings_update_admin"
  on public.buildings for update to authenticated
  using (public.is_admin()) with check (public.is_admin());
create policy "buildings_delete_admin"
  on public.buildings for delete to authenticated using (public.is_admin());

create policy "floors_insert_admin"
  on public.floors for insert to authenticated with check (public.is_admin());
create policy "floors_update_admin"
  on public.floors for update to authenticated
  using (public.is_admin()) with check (public.is_admin());
create policy "floors_delete_admin"
  on public.floors for delete to authenticated using (public.is_admin());

create policy "towers_insert_admin"
  on public.towers for insert to authenticated with check (public.is_admin());
create policy "towers_update_admin"
  on public.towers for update to authenticated
  using (public.is_admin()) with check (public.is_admin());
create policy "towers_delete_admin"
  on public.towers for delete to authenticated using (public.is_admin());

create policy "positions_insert_admin"
  on public.positions for insert to authenticated with check (public.is_admin());
create policy "positions_update_admin"
  on public.positions for update to authenticated
  using (public.is_admin()) with check (public.is_admin());
create policy "positions_delete_admin"
  on public.positions for delete to authenticated using (public.is_admin());

-- Caixas: operador+ escreve; consultante só lê
create policy "boxes_insert_operador"
  on public.boxes for insert to authenticated
  with check (public.is_operador_or_admin());

create policy "boxes_update_operador"
  on public.boxes for update to authenticated
  using (public.is_operador_or_admin())
  with check (public.is_operador_or_admin());

create policy "boxes_delete_admin"
  on public.boxes for delete to authenticated
  using (public.is_admin());

-- Movimentações: operador+ insere; sem update/delete
create policy "movements_insert_operador"
  on public.movements for insert to authenticated
  with check (public.is_operador_or_admin());

-- Empréstimos: operador+
create policy "loans_insert_operador"
  on public.loans for insert to authenticated
  with check (public.is_operador_or_admin());

create policy "loans_update_operador"
  on public.loans for update to authenticated
  using (public.is_operador_or_admin())
  with check (public.is_operador_or_admin());

-- Grants
grant usage on schema public to authenticated;
grant select, insert, update, delete on all tables in schema public to authenticated;
grant usage on sequence public.box_code_seq to authenticated;
grant execute on function public.next_box_code() to authenticated;
