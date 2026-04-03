import { NextResponse } from 'next/server';
import { requireTenant } from '@/lib/tenant';

export async function GET() {
  const { tenantId, userId, supabase } = await requireTenant();
  const { data, error } = await supabase
    .from('notifications')
    .select('*')
    .eq('tenant_id', tenantId)
    .eq('user_id', userId)
    .order('created_at', { ascending: false })
    .limit(50);

  if (error) return NextResponse.json({ error: error.message }, { status: 400 });
  return NextResponse.json(data);
}
