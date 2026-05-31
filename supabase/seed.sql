-- Seed inicial (estrutura + cadastros). Execute após migrations.
-- Dashboard → SQL Editor ou: supabase db seed

insert into public.sectors (name) values
  ('Financeiro'),
  ('RH'),
  ('Jurídico'),
  ('Assistencial'),
  ('Administrativo')
on conflict (name) do nothing;

insert into public.units (name) values
  ('Matriz'),
  ('Filial SP'),
  ('Filial RJ')
on conflict (name) do nothing;

-- Estrutura: Arquivo Central > Rua A > Prédio 01 > Andar 01 > Torre A (5 posições)
do $$
declare
  v_loc uuid;
  v_str uuid;
  v_bld uuid;
  v_flr uuid;
  v_twr uuid;
begin
  select id into v_loc from public.locations where name = 'Arquivo Central' limit 1;
  if v_loc is null then
    insert into public.locations (name) values ('Arquivo Central')
    returning id into v_loc;
  end if;

  insert into public.streets (location_id, name) values (v_loc, 'Rua A')
  returning id into v_str;

  insert into public.buildings (street_id, name) values (v_str, 'Prédio 01')
  returning id into v_bld;

  insert into public.floors (building_id, name) values (v_bld, 'Andar 01')
  returning id into v_flr;

  insert into public.towers (floor_id, name) values (v_flr, 'Torre A')
  returning id into v_twr;

  insert into public.positions (tower_id, name) values
    (v_twr, 'Posição 01'),
    (v_twr, 'Posição 02'),
    (v_twr, 'Posição 03'),
    (v_twr, 'Posição 04'),
    (v_twr, 'Posição 05');
end $$;
