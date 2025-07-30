import { supabase } from '../supabaseClient';

export async function getChecklist(taskId: string) {
  return supabase.from('checklist_items').select('*').eq('task_id', taskId).order('position');
}

export async function createChecklistItem(item: {
  task_id: string;
  parent_id?: string;
  text: string;
  completed?: boolean;
  type: 'item' | 'group';
  position: number;
}) {
  return supabase.from('checklist_items').insert([item]).select().single();
}

export async function updateChecklistItem(id: string, updates: Partial<{ text: string; completed: boolean; position: number }>) {
  return supabase.from('checklist_items').update(updates).eq('id', id);
}

export async function deleteChecklistItem(id: string) {
  return supabase.from('checklist_items').delete().eq('id', id);
} 