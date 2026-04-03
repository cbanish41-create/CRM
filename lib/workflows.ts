import { getSupabaseAdminClient } from './supabase';

type TriggerType = 'deal_stage_changed' | 'task_overdue' | 'contact_created';

export async function runWorkflow(trigger: TriggerType, tenantId: string, payload: Record<string, unknown>) {
  const supabase = getSupabaseAdminClient();

  const { data: rules } = await supabase
    .from('workflow_rules')
    .select('*')
    .eq('tenant_id', tenantId)
    .eq('is_active', true)
    .eq('trigger_type', trigger);

  for (const rule of rules ?? []) {
    const actions = rule.actions as Array<Record<string, unknown>>;

    for (const action of actions) {
      if (action.type === 'create_task') {
        await supabase.from('tasks').insert({
          tenant_id: tenantId,
          title: String(action.title ?? 'Follow up'),
          assigned_to: String(action.assigned_to ?? payload.owner_id),
          deal_id: payload.deal_id ?? null,
          contact_id: payload.contact_id ?? null,
          status: 'open'
        });
      }

      if (action.type === 'assign_deal' && payload.deal_id) {
        await supabase.from('deals').update({ owner_id: action.assigned_to }).eq('id', String(payload.deal_id));
      }

      if (action.type === 'send_email') {
        await supabase.from('notifications').insert({
          tenant_id: tenantId,
          user_id: String(action.user_id ?? payload.owner_id),
          title: 'Automation email queued',
          body: String(action.template ?? 'Email template triggered by workflow')
        });
      }
    }

    await supabase.from('workflow_runs').insert({
      tenant_id: tenantId,
      workflow_rule_id: rule.id,
      payload,
      status: 'success'
    });
  }
}
