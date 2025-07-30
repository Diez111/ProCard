import { supabase } from '../supabaseClient';

export async function uploadImage(file: File, userId: string) {
  const filePath = `${userId}/${Date.now()}_${file.name}`;
  const { data, error } = await supabase.storage.from('task-images').upload(filePath, file);
  if (error) throw error;
  const { data: publicUrl } = supabase.storage.from('task-images').getPublicUrl(filePath);
  return publicUrl.publicUrl;
} 