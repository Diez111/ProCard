import { supabase } from '../supabaseClient';

export async function createInvite(dashboardId: string, inviteCode: string) {
  return supabase.from('dashboard_invites').insert([{ dashboard_id: dashboardId, invite_code: inviteCode }]).select().single();
}

export async function getInvite(inviteCode: string) {
  return supabase.from('dashboard_invites').select('*').eq('invite_code', inviteCode).single();
}

export async function joinDashboardByInvite(inviteCode: string, userId: string) {
  const { data: invite, error } = await getInvite(inviteCode);
  if (error || !invite) throw error || new Error('Invitación no encontrada');
  await supabase.from('dashboard_users').insert([{ dashboard_id: invite.dashboard_id, user_id: userId, role: 'member' }]);
  return invite.dashboard_id;
} 