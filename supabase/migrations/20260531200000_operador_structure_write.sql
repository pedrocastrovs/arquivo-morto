-- Permite operador e administrador alterarem a estrutura física (antes: só admin)

-- Remover políticas de escrita exclusivas de admin na hierarquia
drop policy if exists "sectors_insert_admin" on public.sectors;
drop policy if exists "sectors_update_admin" on public.sectors;
drop policy if exists "sectors_delete_admin" on public.sectors;
drop policy if exists "units_insert_admin" on public.units;
drop policy if exists "units_update_admin" on public.units;
drop policy if exists "units_delete_admin" on public.units;
drop policy if exists "locations_insert_admin" on public.locations;
drop policy if exists "locations_update_admin" on public.locations;
drop policy if exists "locations_delete_admin" on public.locations;
drop policy if exists "streets_insert_admin" on public.streets;
drop policy if exists "streets_update_admin" on public.streets;
drop policy if exists "streets_delete_admin" on public.streets;
drop policy if exists "buildings_insert_admin" on public.buildings;
drop policy if exists "buildings_update_admin" on public.buildings;
drop policy if exists "buildings_delete_admin" on public.buildings;
drop policy if exists "floors_insert_admin" on public.floors;
drop policy if exists "floors_update_admin" on public.floors;
drop policy if exists "floors_delete_admin" on public.floors;
drop policy if exists "towers_insert_admin" on public.towers;
drop policy if exists "towers_update_admin" on public.towers;
drop policy if exists "towers_delete_admin" on public.towers;
drop policy if exists "positions_insert_admin" on public.positions;
drop policy if exists "positions_update_admin" on public.positions;
drop policy if exists "positions_delete_admin" on public.positions;

-- Cadastros auxiliares: operador ou admin
create policy "sectors_write_operador"
  on public.sectors for insert to authenticated
  with check (public.is_operador_or_admin());
create policy "sectors_update_operador"
  on public.sectors for update to authenticated
  using (public.is_operador_or_admin()) with check (public.is_operador_or_admin());
create policy "sectors_delete_operador"
  on public.sectors for delete to authenticated
  using (public.is_operador_or_admin());

create policy "units_write_operador"
  on public.units for insert to authenticated
  with check (public.is_operador_or_admin());
create policy "units_update_operador"
  on public.units for update to authenticated
  using (public.is_operador_or_admin()) with check (public.is_operador_or_admin());
create policy "units_delete_operador"
  on public.units for delete to authenticated
  using (public.is_operador_or_admin());

-- Hierarquia física: operador ou admin
create policy "locations_write_operador"
  on public.locations for insert to authenticated with check (public.is_operador_or_admin());
create policy "locations_update_operador"
  on public.locations for update to authenticated
  using (public.is_operador_or_admin()) with check (public.is_operador_or_admin());
create policy "locations_delete_operador"
  on public.locations for delete to authenticated using (public.is_operador_or_admin());

create policy "streets_write_operador"
  on public.streets for insert to authenticated with check (public.is_operador_or_admin());
create policy "streets_update_operador"
  on public.streets for update to authenticated
  using (public.is_operador_or_admin()) with check (public.is_operador_or_admin());
create policy "streets_delete_operador"
  on public.streets for delete to authenticated using (public.is_operador_or_admin());

create policy "buildings_write_operador"
  on public.buildings for insert to authenticated with check (public.is_operador_or_admin());
create policy "buildings_update_operador"
  on public.buildings for update to authenticated
  using (public.is_operador_or_admin()) with check (public.is_operador_or_admin());
create policy "buildings_delete_operador"
  on public.buildings for delete to authenticated using (public.is_operador_or_admin());

create policy "floors_write_operador"
  on public.floors for insert to authenticated with check (public.is_operador_or_admin());
create policy "floors_update_operador"
  on public.floors for update to authenticated
  using (public.is_operador_or_admin()) with check (public.is_operador_or_admin());
create policy "floors_delete_operador"
  on public.floors for delete to authenticated using (public.is_operador_or_admin());

create policy "towers_write_operador"
  on public.towers for insert to authenticated with check (public.is_operador_or_admin());
create policy "towers_update_operador"
  on public.towers for update to authenticated
  using (public.is_operador_or_admin()) with check (public.is_operador_or_admin());
create policy "towers_delete_operador"
  on public.towers for delete to authenticated using (public.is_operador_or_admin());

create policy "positions_write_operador"
  on public.positions for insert to authenticated with check (public.is_operador_or_admin());
create policy "positions_update_operador"
  on public.positions for update to authenticated
  using (public.is_operador_or_admin()) with check (public.is_operador_or_admin());
create policy "positions_delete_operador"
  on public.positions for delete to authenticated using (public.is_operador_or_admin());
