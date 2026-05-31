-- Registra movimentação e atualiza caixa em uma transação

create or replace function public.register_movement(
  p_box_id uuid,
  p_new_position_id uuid,
  p_new_location_path text,
  p_reason text
)
returns uuid
language plpgsql
security definer
set search_path = public
as $$
declare
  v_box record;
  v_movement_id uuid;
  v_user_id uuid;
  v_user_name text;
  v_path text;
begin
  if not public.is_operador_or_admin() then
    raise exception 'Sem permissão para registrar movimentações';
  end if;

  v_user_id := auth.uid();
  select coalesce(name, 'Usuário') into v_user_name
  from public.profiles where id = v_user_id;

  select * into v_box from public.boxes where id = p_box_id;
  if not found then
    raise exception 'Caixa não encontrada';
  end if;

  if v_box.status = 'descartada' then
    raise exception 'Caixa descartada não pode ser movimentada';
  end if;

  v_path := trim(p_new_location_path);
  if v_path = '' then
    raise exception 'Informe a nova localização';
  end if;

  if p_new_position_id is not null then
    if exists (
      select 1 from public.positions
      where id = p_new_position_id
        and is_occupied
        and (box_id is null or box_id <> p_box_id)
    ) then
      raise exception 'Posição de destino já está ocupada';
    end if;
  end if;

  insert into public.movements (
    box_id,
    box_code,
    user_id,
    user_name,
    previous_location,
    new_location,
    reason
  )
  values (
    p_box_id,
    v_box.code,
    v_user_id,
    v_user_name,
    coalesce(nullif(trim(v_box.location_path), ''), 'Sem localização'),
    v_path,
    trim(p_reason)
  )
  returning id into v_movement_id;

  update public.boxes
  set
    position_id = p_new_position_id,
    location_path = v_path,
    status = 'arquivada'::public.box_status
  where id = p_box_id;

  return v_movement_id;
end;
$$;

grant execute on function public.register_movement(uuid, uuid, text, text) to authenticated;
