import { supabase } from "@/lib/supabase";

export async function updateProfile(userId: string, updates: { full_name?: string; avatar_url?: string; email?: string }) {
  const { data, error } = await supabase
    .from("profiles")
    .upsert({ 
      id: userId,
      ...updates
    })
    .select()
    .single();

  if (error) {
    throw new Error(error.message);
  }

  // Se atualizou nome, tenta atualizar metadata do Auth também para consistência
  if (updates.full_name) {
    await supabase.auth.updateUser({
      data: { full_name: updates.full_name }
    });
  }

  return data;
}

export async function updateUserPassword(password: string) {
  const { data, error } = await supabase.auth.updateUser({
    password: password
  });

  if (error) {
    throw new Error(error.message);
  }

  return data;
}
