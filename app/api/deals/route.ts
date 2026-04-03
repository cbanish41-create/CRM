import { NextResponse } from 'next/server';
import { dealSchema } from '@/lib/validators';
import { requireTenant } from '@/lib/tenant';
import { runWorkflow } from '@/lib/workflows';

export async function GET() {
  const { tenantId, supabase } = await requireTenant();
  const { data, error } = await supabase
    .from('deals')
    .select('id,title,value,stage_id,owner_id,contact_id,company_id,stages(name,pipeline_id)')
    .eq('tenant_id', tenantId)
    .order('created_at', { ascending: false });

  if (error) return NextResponse.json({ error: error.message }, { status: 400 });
  return NextResponse.json(data);
}

export async function POST(req: Request) {
  const { tenantId, supabase } = await requireTenant();
  const parsed = dealSchema.safeParse(await req.json());
  if (!parsed.success) return NextResponse.json({ error: parsed.error.flatten() }, { status: 400 });

  const { data, error } = await supabase
    .from('deals')
    .insert({ tenant_id: tenantId, ...parsed.data })
    .select('*')
    .single();

  if (error || !data) return NextResponse.json({ error: error?.message ?? 'Failed creating deal' }, { status: 400 });

  return NextResponse.json(data, { status: 201 });
}

export async function PATCH(req: Request) {
  const { tenantId, supabase } = await requireTenant();
  const { dealId, stage_id } = await req.json();

  const { data, error } = await supabase
    .from('deals')
    .update({ stage_id })
    .eq('tenant_id', tenantId)
    .eq('id', dealId)
    .select('*')
    .single();

  if (error || !data) return NextResponse.json({ error: error?.message ?? 'Failed updating deal' }, { status: 400 });

  await runWorkflow('deal_stage_changed', tenantId, { deal_id: dealId, owner_id: data.owner_id });

  return NextResponse.json(data);
}
