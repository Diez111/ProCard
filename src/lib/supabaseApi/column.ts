import { supabase } from '../supabaseClient';

export async function getColumns(dashboardId: string) {
  return supabase.from('columns').select('*').eq('dashboard_id', dashboardId).order('position');
}

export async function createColumn(dashboardId: string, title: string, position: number) {
  return supabase.from('columns').insert([{ dashboard_id: dashboardId, title, position }]).select().single();
}

export async function updateColumn(id: string, updates: Partial<{ title: string; position: number }>) {
  return supabase.from('columns').update(updates).eq('id', id);
}

export async function deleteColumn(id: string) {
  return supabase.from('columns').delete().eq('id', id);
} 