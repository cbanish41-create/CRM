import { NextResponse } from 'next/server';
import crypto from 'node:crypto';
import { getSupabaseAdminClient } from '@/lib/supabase';

export async function POST(req: Request) {
  const raw = await req.text();
  const signature = req.headers.get('x-signature') ?? '';

  const hash = crypto.createHmac('sha256', process.env.WEBHOOK_SIGNING_SECRET ?? '').update(raw).digest('hex');
  if (hash !== signature) return NextResponse.json({ error: 'Invalid signature' }, { status: 401 });

  const payload = JSON.parse(raw) as { tenant_id: string; event: string; data: Record<string, unknown> };
  const supabase = getSupabaseAdminClient();

  const { data: endpoints } = await supabase
    .from('webhook_endpoints')
    .select('*')
    .eq('tenant_id', payload.tenant_id)
    .eq('is_active', true)
    .contains('events', [payload.event]);

  const deliveries = (endpoints ?? []).map(async (endpoint) => {
    try {
      const response = await fetch(endpoint.url, {
        method: 'POST',
        headers: {
          'content-type': 'application/json',
          'x-signature': signature
        },
        body: raw
      });

      await supabase.from('webhook_deliveries').insert({
        tenant_id: payload.tenant_id,
        webhook_endpoint_id: endpoint.id,
        event: payload.event,
        status_code: response.status,
        request_body: payload
      });
    } catch (error) {
      await supabase.from('webhook_deliveries').insert({
        tenant_id: payload.tenant_id,
        webhook_endpoint_id: endpoint.id,
        event: payload.event,
        status_code: 0,
        error: String(error),
        request_body: payload
      });
    }
  });

  await Promise.all(deliveries);

  return NextResponse.json({ ok: true });
}
