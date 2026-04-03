import { getSupabaseServerClient } from './supabase';

export async function requireTenant() {
  const supabase = await getSupabaseServerClient();
  const { data: auth } = await supabase.auth.getUser();
  if (!auth.user) throw new Error('Unauthorized');

  const { data: memberships, error } = await supabase
    .from('memberships')
    .select('tenant_id, role')
    .eq('user_id', auth.user.id)
    .limit(1)
    .single();

  if (error || !memberships) throw new Error('No tenant membership found');

  return { tenantId: memberships.tenant_id as string, role: memberships.role as string, userId: auth.user.id, supabase };
}
