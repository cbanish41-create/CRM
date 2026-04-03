export type Role = 'admin' | 'manager' | 'sales_rep';

export interface DashboardMetrics {
  pipelineValue: number;
  conversionRate: number;
  wonDeals: number;
  lostDeals: number;
}

export interface Contact {
  id: string;
  first_name: string;
  last_name: string;
  email: string;
  phone: string | null;
  company_id: string | null;
  tags: string[];
  lead_status: 'lead' | 'customer';
}

export interface Deal {
  id: string;
  title: string;
  value: number;
  stage_id: string;
  owner_id: string;
  contact_id: string | null;
  company_id: string | null;
}
