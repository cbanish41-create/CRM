import { NextResponse } from 'next/server';
import { requireTenant } from '@/lib/tenant';

export async function GET() {
  const { tenantId, supabase } = await requireTenant();
  const { data, error } = await supabase.from('workflow_rules').select('*').eq('tenant_id', tenantId).order('created_at', { ascending: false });

  if (error) return NextResponse.json({ error: error.message }, { status: 400 });
  return NextResponse.json(data);
}

export async function POST(req: Request) {
  const { tenantId, supabase } = await requireTenant();
  const body = await req.json();

  const { data, error } = await supabase.from('workflow_rules').insert({
    tenant_id: tenantId,
    name: body.name,
    trigger_type: body.trigger_type,
    conditions: body.conditions ?? {},
    actions: body.actions ?? [],
    is_active: true
  }).select('*').single();

  if (error || !data) return NextResponse.json({ error: error?.message ?? 'Workflow create failed' }, { status: 400 });
  return NextResponse.json(data, { status: 201 });
}
