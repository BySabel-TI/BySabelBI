-- ==========================================
-- FIX: PERMITIR QUE USUÁRIOS ATUALIZEM SEUS PRÓPRIOS DADOS
-- ==========================================

-- 1. Política de UPDATE (Para alterar nome/avatar)
create policy "Users can update their own profile" on profiles
for update using (auth.uid() = id);

-- 2. Política de INSERT (Para criar perfil caso não exista - Upsert)
create policy "Users can insert their own profile" on profiles
for insert with check (auth.uid() = id);
