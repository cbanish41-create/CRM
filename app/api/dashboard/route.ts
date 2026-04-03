import { NextResponse } from 'next/server';
import { requireTenant } from '@/lib/tenant';

export async function GET() {
  const { tenantId, supabase } = await requireTenant();

  const [{ data: dealRows }, { data: wonRows }, { data: lostRows }, { data: contactRows }] = await Promise.all([
    supabase.from('deals').select('value,stage_id').eq('tenant_id', tenantId),
    supabase.from('deals').select('id', { count: 'exact' }).eq('tenant_id', tenantId).eq('deal_status', 'won'),
    supabase.from('deals').select('id', { count: 'exact' }).eq('tenant_id', tenantId).eq('deal_status', 'lost'),
    supabase.from('contacts').select('id,lead_status').eq('tenant_id', tenantId)
  ]);

  const pipelineValue = (dealRows ?? []).reduce((sum, d) => sum + Number(d.value ?? 0), 0);
  const leads = (contactRows ?? []).filter((c) => c.lead_status === 'lead').length;
  const customers = (contactRows ?? []).filter((c) => c.lead_status === 'customer').length;
  const conversionRate = leads + customers === 0 ? 0 : Number(((customers / (leads + customers)) * 100).toFixed(2));

  return NextResponse.json({
    pipelineValue,
    conversionRate,
    wonDeals: wonRows?.length ?? 0,
    lostDeals: lostRows?.length ?? 0
  });
}
