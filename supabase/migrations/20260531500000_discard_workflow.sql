-- Descarte: marcar elegíveis e aprovar (admin)

create or replace function public.sync_boxes_discard_eligibility()
returns void
language plpgsql
security definer
set search_path = public
as $$
begin
  update public.boxes
  set status = 'aguardando_descarte'::public.box_status
  where status = 'arquivada'::public.box_status
    and expected_discard_date <= current_date;
end;
$$;

create or replace function public.approve_discard(
  p_box_ids uuid[],
  p_justification text
)
returns int
language plpgsql
security definer
set search_path = public
as $$
declare
  v_box_id uuid;
  v_box record;
  v_user_id uuid;
  v_user_name text;
  v_count int := 0;
  v_justification text;
begin
  if not public.is_admin() then
    raise exception 'Somente administradores podem aprovar descarte';
  end if;

  v_justification := trim(p_justification);
  if v_justification = '' then
    raise exception 'Informe a justificativa do descarte';
  end if;

  if p_box_ids is null or array_length(p_box_ids, 1) is null then
    raise exception 'Selecione ao menos uma caixa';
  end if;

  v_user_id := auth.uid();
  select coalesce(name, 'Administrador') into v_user_name
  from public.profiles where id = v_user_id;

  foreach v_box_id in array p_box_ids
  loop
    select * into v_box from public.boxes where id = v_box_id;
    if not found then
      raise exception 'Caixa não encontrada: %', v_box_id;
    end if;

    if v_box.status <> 'aguardando_descarte'::public.box_status then
      raise exception 'Caixa % não está aguardando descarte', v_box.code;
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
      v_box.id,
      v_box.code,
      v_user_id,
      v_user_name,
      coalesce(nullif(trim(v_box.location_path), ''), 'Sem localização'),
      'Descartada',
      'Descarte aprovado: ' || v_justification
    );

    if v_box.position_id is not null then
      update public.positions
      set is_occupied = false, box_id = null
      where id = v_box.position_id;
    end if;

    update public.boxes
    set
      status = 'descartada'::public.box_status,
      position_id = null,
      location_path = 'Descartada'
    where id = v_box.id;

    v_count := v_count + 1;
  end loop;

  return v_count;
end;
$$;

grant execute on function public.sync_boxes_discard_eligibility() to authenticated;
grant execute on function public.approve_discard(uuid[], text) to authenticated;
