import { NextResponse } from 'next/server';
import { contactSchema } from '@/lib/validators';
import { requireTenant } from '@/lib/tenant';
import { runWorkflow } from '@/lib/workflows';

export async function GET() {
  const { tenantId, supabase } = await requireTenant();

  const { data, error } = await supabase
    .from('contacts')
    .select('id, first_name, last_name, email, phone, company_id, lead_status, contact_tags(tags(name))')
    .eq('tenant_id', tenantId)
    .order('created_at', { ascending: false });

  if (error) return NextResponse.json({ error: error.message }, { status: 400 });

  return NextResponse.json(data);
}

export async function POST(req: Request) {
  const { tenantId, userId, supabase } = await requireTenant();
  const parsed = contactSchema.safeParse(await req.json());
  if (!parsed.success) return NextResponse.json({ error: parsed.error.flatten() }, { status: 400 });

  const payload = parsed.data;

  const { data: contact, error } = await supabase
    .from('contacts')
    .insert({
      tenant_id: tenantId,
      first_name: payload.first_name,
      last_name: payload.last_name,
      email: payload.email,
      phone: payload.phone ?? null,
      lead_status: payload.lead_status,
      company_id: payload.company_id ?? null,
      owner_id: userId
    })
    .select('*')
    .single();

  if (error || !contact) return NextResponse.json({ error: error?.message ?? 'Failed creating contact' }, { status: 400 });

  if (payload.tags.length) {
    const { data: tags } = await supabase.from('tags').select('id,name').eq('tenant_id', tenantId).in('name', payload.tags);
    const tagMap = new Map((tags ?? []).map((t) => [t.name, t.id]));
    const missing = payload.tags.filter((t) => !tagMap.has(t));

    if (missing.length) {
      const { data: createdTags } = await supabase
        .from('tags')
        .insert(missing.map((name) => ({ tenant_id: tenantId, name })))
        .select('id,name');
      for (const t of createdTags ?? []) tagMap.set(t.name, t.id);
    }

    const join = payload.tags
      .map((name) => tagMap.get(name))
      .filter(Boolean)
      .map((tagId) => ({ tenant_id: tenantId, contact_id: contact.id, tag_id: tagId }));

    if (join.length) await supabase.from('contact_tags').insert(join);
  }

  await runWorkflow('contact_created', tenantId, { contact_id: contact.id, owner_id: userId });

  return NextResponse.json(contact, { status: 201 });
}
