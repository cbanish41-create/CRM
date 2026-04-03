import { NextResponse } from 'next/server';
import { getSupabaseAdminClient } from '@/lib/supabase';

export async function POST(req: Request) {
  const body = await req.json();
  const supabase = getSupabaseAdminClient();

  const { error } = await supabase.from('email_messages').insert({
    tenant_id: body.tenant_id,
    direction: 'inbound',
    from_email: body.from,
    to_email: body.to,
    subject: body.subject,
    body: body.body,
    contact_id: body.contact_id ?? null,
    deal_id: body.deal_id ?? null,
    status: 'received'
  });

  if (error) return NextResponse.json({ error: error.message }, { status: 400 });
  return NextResponse.json({ ok: true }, { status: 201 });
}
