import { supabase } from '../supabaseClient';

export async function getLabels(dashboardId: string) {
  return supabase.from('labels').select('*').eq('dashboard_id', dashboardId);
}

export async function createLabel(dashboardId: string, name: string, color: string, pinned = false) {
  return supabase.from('labels').insert([{ dashboard_id: dashboardId, name, color, pinned }]).select().single();
}

export async function updateLabel(id: string, updates: Partial<{ name: string; color: string; pinned: boolean }>) {
  return supabase.from('labels').update(updates).eq('id', id);
}

export async function deleteLabel(id: string) {
  return supabase.from('labels').delete().eq('id', id);
}

export async function addLabelToTask(taskId: string, labelId: string) {
  return supabase.from('task_labels').insert([{ task_id: taskId, label_id: labelId }]);
}

export async function removeLabelFromTask(taskId: string, labelId: string) {
  return supabase.from('task_labels').delete().eq('task_id', taskId).eq('label_id', labelId);
} 