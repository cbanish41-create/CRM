import { z } from 'zod';

export const contactSchema = z.object({
  first_name: z.string().min(1),
  last_name: z.string().min(1),
  email: z.string().email(),
  phone: z.string().optional(),
  lead_status: z.enum(['lead', 'customer']).default('lead'),
  company_id: z.string().uuid().nullable().optional(),
  tags: z.array(z.string()).default([])
});

export const dealSchema = z.object({
  title: z.string().min(1),
  value: z.number().nonnegative(),
  stage_id: z.string().uuid(),
  owner_id: z.string().uuid(),
  contact_id: z.string().uuid().nullable().optional(),
  company_id: z.string().uuid().nullable().optional()
});

export const taskSchema = z.object({
  title: z.string().min(1),
  due_at: z.string().datetime().optional(),
  assigned_to: z.string().uuid(),
  deal_id: z.string().uuid().nullable().optional(),
  contact_id: z.string().uuid().nullable().optional(),
  reminder_at: z.string().datetime().optional()
});
