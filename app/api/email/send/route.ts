import { NextResponse } from 'next/server';
import { requireTenant } from '@/lib/tenant';

export async function POST(req: Request) {
  const { tenantId, userId, supabase } = await requireTenant();
  const body = await req.json();

  const { data: message, error } = await supabase.from('email_messages').insert({
    tenant_id: tenantId,
    direction: 'outbound',
    from_email: process.env.EMAIL_FROM,
    to_email: body.to,
    subject: body.subject,
    body: body.body,
    created_by: userId,
    contact_id: body.contact_id ?? null,
    deal_id: body.deal_id ?? null,
    status: 'queued'
  }).select('*').single();

  if (error || !message) return NextResponse.json({ error: error?.message ?? 'Failed queueing email' }, { status: 400 });

  return NextResponse.json({
    message,
    note: 'Connect your SMTP/ESP worker to process queued outbound emails'
  }, { status: 202 });
}
