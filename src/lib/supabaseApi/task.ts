import { supabase } from '../supabaseClient';

export async function getTasks(dashboardId: string) {
  return supabase.from('tasks').select('*').eq('dashboard_id', dashboardId);
}

export async function createTask(task: {
  dashboard_id: string;
  column_id: string;
  title: string;
  description?: string;
  date?: string;
  image_url?: string;
  user_id: string;
}) {
  return supabase.from('tasks').insert([task]).select().single();
}

export async function updateTask(id: string, updates: Partial<{ title: string; description: string; date: string; image_url: string; column_id: string }>) {
  return supabase.from('tasks').update(updates).eq('id', id);
}

export async function deleteTask(id: string) {
  return supabase.from('tasks').delete().eq('id', id);
} 