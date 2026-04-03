import { NextResponse } from 'next/server';
import { taskSchema } from '@/lib/validators';
import { requireTenant } from '@/lib/tenant';

export async function GET() {
  const { tenantId, supabase } = await requireTenant();
  const { data, error } = await supabase
    .from('tasks')
    .select('*')
    .eq('tenant_id', tenantId)
    .order('due_at', { ascending: true, nullsFirst: false });

  if (error) return NextResponse.json({ error: error.message }, { status: 400 });
  return NextResponse.json(data);
}

export async function POST(req: Request) {
  const { tenantId, supabase } = await requireTenant();
  const parsed = taskSchema.safeParse(await req.json());
  if (!parsed.success) return NextResponse.json({ error: parsed.error.flatten() }, { status: 400 });

  const { data, error } = await supabase
    .from('tasks')
    .insert({ tenant_id: tenantId, status: 'open', ...parsed.data })
    .select('*')
    .single();

  if (error || !data) return NextResponse.json({ error: error?.message ?? 'Failed creating task' }, { status: 400 });
  return NextResponse.json(data, { status: 201 });
}

export async function PATCH(req: Request) {
  const { tenantId, supabase } = await requireTenant();
  const { id, status } = await req.json();
  const { data, error } = await supabase.from('tasks').update({ status }).eq('tenant_id', tenantId).eq('id', id).select('*').single();

  if (error || !data) return NextResponse.json({ error: error?.message ?? 'Failed updating task' }, { status: 400 });
  return NextResponse.json(data);
}
