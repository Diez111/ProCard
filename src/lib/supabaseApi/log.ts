import { supabase } from '../supabaseClient';

export async function logChange(log: {
  dashboard_id: string;
  user_id: string;
  action: string;
  entity_type: string;
  entity_id?: string;
  details?: any;
}) {
  return supabase.from('change_logs').insert([{ ...log, details: log.details ? JSON.stringify(log.details) : null }]);
} 