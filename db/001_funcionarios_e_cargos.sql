-- =====================================================================
-- BySabel BI — Funcionários (vendedores) + Hierarquia de Cargos
-- Rode este script UMA VEZ no SQL Editor do Supabase.
-- É idempotente: pode rodar de novo sem quebrar.
-- =====================================================================

-- ---------------------------------------------------------------------
-- 1) Tabela de funcionários (vendedores) com filial editável.
--    Substitui o mapeamento hardcoded (SELLER_MAP) por dados gerenciáveis.
--    `name` = nome EXATO do vendedor como vem do ERP Microwork (em maiúsculas).
-- ---------------------------------------------------------------------
create table if not exists public.employees (
  id           uuid primary key default gen_random_uuid(),
  name         text not null unique,          -- chave de casamento com o ERP (UPPER)
  display_name text,                           -- nome amigável (opcional)
  branch_id    integer,                         -- id da filial (1..50); null = sem filial
  active       boolean not null default true,
  created_at   timestamptz not null default now(),
  updated_at   timestamptz not null default now()
);

create index if not exists employees_branch_id_idx on public.employees (branch_id);
create index if not exists employees_active_idx    on public.employees (active);

-- Mantém updated_at em dia automaticamente.
create or replace function public.set_updated_at()
returns trigger language plpgsql as $$
begin
  new.updated_at = now();
  return new;
end $$;

drop trigger if exists employees_set_updated_at on public.employees;
create trigger employees_set_updated_at
  before update on public.employees
  for each row execute function public.set_updated_at();

-- ---------------------------------------------------------------------
-- 2) Hierarquia de cargos: tabela profiles e colunas.
--    Garante a criação de public.profiles se ela ainda não existir no Supabase.
-- ---------------------------------------------------------------------
create table if not exists public.profiles (
  id           uuid primary key references auth.users(id) on delete cascade,
  email        text,
  full_name    text,
  role         text default 'seller',
  avatar_url   text,
  created_at   timestamptz default now()
);

alter table public.profiles add column if not exists branch_id  integer;
alter table public.profiles add column if not exists seller_name text;

alter table public.profiles enable row level security;

drop policy if exists "Users can view their own profile" on public.profiles;
create policy "Users can view their own profile" on public.profiles
  for select using (auth.uid() = id);

drop policy if exists "Users can update their own profile" on public.profiles;
create policy "Users can update their own profile" on public.profiles
  for update using (auth.uid() = id);

drop policy if exists "Users can insert their own profile" on public.profiles;
create policy "Users can insert their own profile" on public.profiles
  for insert with check (auth.uid() = id);

-- Trigger para auto-criar perfil quando um novo usuário for registrado no Supabase Auth
create or replace function public.handle_new_user() 
returns trigger as $$
begin
  insert into public.profiles (id, email, full_name, role)
  values (
    new.id, 
    new.email, 
    new.raw_user_meta_data->>'full_name',
    coalesce(new.raw_user_meta_data->>'role', 'seller')
  )
  on conflict (id) do nothing;
  return new;
end;
$$ language plpgsql security definer;

drop trigger if exists on_auth_user_created on auth.users;
create trigger on_auth_user_created
  after insert on auth.users
  for each row execute procedure public.handle_new_user();

-- ---------------------------------------------------------------------
-- 3) RLS da tabela employees.
--    Leitura: qualquer usuário autenticado.
--    Escrita: apenas admin/diretor (verificado pelo próprio profiles).
-- ---------------------------------------------------------------------
alter table public.employees enable row level security;

drop policy if exists employees_read  on public.employees;
drop policy if exists employees_write on public.employees;

create policy employees_read
  on public.employees for select
  to authenticated
  using (true);

create policy employees_write
  on public.employees for all
  to authenticated
  using (
    exists (
      select 1 from public.profiles p
      where p.id = auth.uid() and p.role in ('admin', 'director')
    )
  )
  with check (
    exists (
      select 1 from public.profiles p
      where p.id = auth.uid() and p.role in ('admin', 'director')
    )
  );

-- =====================================================================
-- 4) (OPCIONAL) Como configurar a hierarquia de um usuário existente:
--
--   -- Tornar alguém GERENTE da filial 3 (03 - Icoaraci):
--   update public.profiles set role = 'manager', branch_id = 3
--   where id = '<uuid-do-usuario>';
--
--   -- Tornar alguém VENDEDOR vinculado ao nome do ERP:
--   update public.profiles set role = 'seller',
--          seller_name = 'ANA PAULA VALERIO DO NASCIMENTO'
--   where id = '<uuid-do-usuario>';
--
--   -- Admin/Diretor veem tudo (não precisam de branch_id):
--   update public.profiles set role = 'admin' where id = '<uuid>';
--
-- Dica: o cadastro de vendedores (tabela employees) é feito pela nova
-- página /dashboard/funcionarios. Use o botão "Importar mapeamento atual"
-- lá para popular a tabela a partir do SELLER_MAP existente de uma vez.
-- =====================================================================
