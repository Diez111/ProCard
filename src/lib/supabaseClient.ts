import { createClient } from '@supabase/supabase-js';

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL as string;
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY as string;

if (!supabaseUrl || !supabaseAnonKey || supabaseUrl === 'tu_url_supabase' || supabaseAnonKey === 'tu_anon_key') {
  throw new Error('Debes definir VITE_SUPABASE_URL y VITE_SUPABASE_ANON_KEY en tu entorno.');
}

export const supabase = createClient(supabaseUrl, supabaseAnonKey); 