import { supabase } from '../supabaseClient';

export async function getDashboardsByUser(userId: string) {
  return supabase
    .from('dashboard_users')
    .select('dashboard_id, dashboards(*)')
    .eq('user_id', userId);
}

export async function createDashboard(name: string, userId: string) {
  const { data, error } = await supabase
    .from('dashboards')
    .insert([{ name, owner: userId }])
    .select()
    .single();
  if (error) throw error;
  // Añadir al usuario como colaborador
  await supabase.from('dashboard_users').insert([{ dashboard_id: data.id, user_id: userId, role: 'owner' }]);
  return data;
}

export async function updateDashboard(id: string, updates: Partial<{ name: string; google_calendar_url: string; weather_location: string }>) {
  return supabase.from('dashboards').update(updates).eq('id', id);
}

export async function deleteDashboard(id: string) {
  return supabase.from('dashboards').delete().eq('id', id);
} 