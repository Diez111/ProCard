import { supabase } from '../supabaseClient';

export async function getChatMessages(dashboardId: string) {
  return supabase.from('chat_messages').select('*').eq('dashboard_id', dashboardId).order('timestamp');
}

export async function sendChatMessage(message: {
  dashboard_id: string;
  user_id: string;
  sender_type: 'user' | 'ai';
  content: string;
}) {
  return supabase.from('chat_messages').insert([message]).select().single();
} 