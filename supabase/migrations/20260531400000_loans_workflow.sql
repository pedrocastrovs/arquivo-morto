-- Fluxo de empréstimos: criar, retirada, devolução e marcar atrasados

create or replace function public.sync_loan_overdue()
returns void
language plpgsql
security definer
set search_path = public
as $$
begin
  update public.loans
  set status = 'atrasado'::public.loan_status
  where status = 'em_andamento'::public.loan_status
    and return_deadline < current_date;
end;
$$;

create or replace function public.create_loan(
  p_box_id uuid,
  p_requester text,
  p_sector text,
  p_return_deadline date
)
returns uuid
language plpgsql
security definer
set search_path = public
as $$
declare
  v_box record;
  v_loan_id uuid;
begin
  if not public.is_operador_or_admin() then
    raise exception 'Sem permissão para criar empréstimos';
  end if;

  if trim(p_requester) = '' then
    raise exception 'Informe o solicitante';
  end if;
  if trim(p_sector) = '' then
    raise exception 'Informe o setor';
  end if;
  if p_return_deadline < current_date then
    raise exception 'O prazo de devolução não pode ser no passado';
  end if;

  select * into v_box from public.boxes where id = p_box_id;
  if not found then
    raise exception 'Caixa não encontrada';
  end if;

  if v_box.status <> 'arquivada'::public.box_status then
    raise exception 'Somente caixas arquivadas podem ser emprestadas';
  end if;

  if exists (
    select 1 from public.loans
    where box_id = p_box_id
      and status in (
        'pendente'::public.loan_status,
        'em_andamento'::public.loan_status,
        'atrasado'::public.loan_status
      )
  ) then
    raise exception 'Esta caixa já possui um empréstimo ativo';
  end if;

  insert into public.loans (
    box_id,
    box_code,
    requester,
    sector,
    return_deadline,
    created_by
  )
  values (
    p_box_id,
    v_box.code,
    trim(p_requester),
    trim(p_sector),
    p_return_deadline,
    auth.uid()
  )
  returning id into v_loan_id;

  return v_loan_id;
end;
$$;

create or replace function public.confirm_loan_pickup(p_loan_id uuid)
returns void
language plpgsql
security definer
set search_path = public
as $$
declare
  v_loan record;
begin
  if not public.is_operador_or_admin() then
    raise exception 'Sem permissão para confirmar retirada';
  end if;

  select * into v_loan from public.loans where id = p_loan_id;
  if not found then
    raise exception 'Empréstimo não encontrado';
  end if;

  if v_loan.status <> 'pendente'::public.loan_status then
    raise exception 'Somente empréstimos pendentes podem ter retirada confirmada';
  end if;

  update public.loans
  set
    status = 'em_andamento'::public.loan_status,
    pickup_date = current_date
  where id = p_loan_id;

  update public.boxes
  set status = 'emprestada'::public.box_status
  where id = v_loan.box_id;
end;
$$;

create or replace function public.return_loan(
  p_loan_id uuid,
  p_delivery_responsible text
)
returns void
language plpgsql
security definer
set search_path = public
as $$
declare
  v_loan record;
begin
  if not public.is_operador_or_admin() then
    raise exception 'Sem permissão para registrar devolução';
  end if;

  if trim(p_delivery_responsible) = '' then
    raise exception 'Informe o responsável pela entrega';
  end if;

  select * into v_loan from public.loans where id = p_loan_id;
  if not found then
    raise exception 'Empréstimo não encontrado';
  end if;

  if v_loan.status not in (
    'em_andamento'::public.loan_status,
    'atrasado'::public.loan_status
  ) then
    raise exception 'Este empréstimo não está em andamento';
  end if;

  update public.loans
  set
    status = 'devolvido'::public.loan_status,
    return_date = current_date,
    delivery_responsible = trim(p_delivery_responsible)
  where id = p_loan_id;

  update public.boxes
  set status = 'arquivada'::public.box_status
  where id = v_loan.box_id;
end;
$$;

grant execute on function public.sync_loan_overdue() to authenticated;
grant execute on function public.create_loan(uuid, text, text, date) to authenticated;
grant execute on function public.confirm_loan_pickup(uuid) to authenticated;
grant execute on function public.return_loan(uuid, text) to authenticated;
