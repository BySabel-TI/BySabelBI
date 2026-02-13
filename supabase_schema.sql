-- ==========================================
-- 1. TABELA DE METAS (JÁ EXISTENTE - REFORÇO)
-- ==========================================
create table if not exists sales_goals (
  id uuid default gen_random_uuid() primary key,
  seller_name text not null,       
  branch_id text not null,         
  month date not null,             
  target_amount numeric default 0, 
  target_units integer default 0,  
  created_at timestamp with time zone default timezone('utc'::text, now()) not null,
  unique(seller_name, month)
);

alter table sales_goals enable row level security;

-- Política: Apenas usuários autenticados podem ver/editar
create policy "Authenticated users can manage goals" on sales_goals
for all using (auth.role() = 'authenticated');

-- ==========================================
-- 2. TABELA DE PERFIS DE USUÁRIO (PROFILES)
-- ==========================================
create table if not exists public.profiles (
  id uuid references auth.users not null primary key,
  email text,
  full_name text,
  role text check (role in ('admin', 'director', 'manager', 'seller')) default 'seller',
  branch_access text[] default array['all'], -- Ex: ['01 - Ananindeua'] ou ['all']
  avatar_url text,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null
);

alter table profiles enable row level security;

create policy "Users can view their own profile" on profiles
for select using (auth.uid() = id);

-- ==========================================
-- FIX: FUNÇÃO AUXILIAR PARA EVITAR RECURSÃO INFINITA
-- ==========================================
create or replace function public.is_admin_or_director()
returns boolean as $$
declare
  current_role text;
begin
  select role into current_role from public.profiles where id = auth.uid();
  return current_role in ('admin', 'director');
end;
$$ language plpgsql security definer;

-- Re-criar política sem recursão
drop policy if exists "Admins/Directors can view all profiles" on profiles;

create policy "Admins/Directors can view all profiles" on profiles
for select using (
  public.is_admin_or_director()
);

-- ==========================================
-- 3. TRIGGER PARA CRIAR PERFIL AUTOMÁTICO
-- ==========================================
-- Função que roda sempre que um usuário é criado no Auth
create or replace function public.handle_new_user() 
returns trigger as $$
begin
  insert into public.profiles (id, email, full_name, role)
  values (
    new.id, 
    new.email, 
    new.raw_user_meta_data->>'full_name',
    coalesce(new.raw_user_meta_data->>'role', 'seller') -- Default para vendedor se não especificado
  );
  return new;
end;
$$ language plpgsql security definer;

-- Trigger
create or replace trigger on_auth_user_created
  after insert on auth.users
  for each row execute procedure public.handle_new_user();

-- ==========================================
-- 4. POLÍTICAS DE EDIÇÃO DE PERFIL
-- ==========================================
create policy "Users can update their own profile" on profiles
for update using (auth.uid() = id);

create policy "Users can insert their own profile" on profiles
for insert with check (auth.uid() = id);
