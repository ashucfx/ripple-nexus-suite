export type BriefStatus = 'intake' | 'in_progress' | 'review' | 'delivered' | 'blocked';
export type PriorityLevel = 'p0_critical' | 'p1_high' | 'p2_medium' | 'p3_low';

export interface Brief {
  id: string;
  client_id: string;
  client_name?: string;
  title: string;
  scope?: string;
  status: BriefStatus;
  priority: PriorityLevel;
  budget?: number;
  sla_deadline: string;
  created_at: string;
  updated_at: string;
}

export interface Deliverable {
  id: string;
  brief_id: string;
  title: string;
  status: 'pending' | 'in_review' | 'approved' | 'deployed';
  assignee: string;
  target_date: string;
  artifact_url?: string;
  created_at: string;
}

export interface Client {
  id: string;
  name: string;
  code: string;
  tier: 'enterprise' | 'growth' | 'stealth';
  status: 'active' | 'onboarding' | 'churned';
  contact_email: string;
  health_score: number;
  mrr: number;
  created_at: string;
}

export interface Invoice {
  id: string;
  client_id: string;
  client_name?: string;
  invoice_number: string;
  amount: number;
  currency: string;
  status: 'draft' | 'issued' | 'paid' | 'overdue';
  due_date: string;
  paid_date?: string;
  created_at: string;
}

export interface TeamMember {
  id: string;
  full_name: string;
  email: string;
  role: string;
  squad: string;
  active_status: 'active' | 'on_call' | 'away';
  allocation_percentage: number;
  created_at: string;
}

export interface AuditLog {
  id: string;
  user_email: string;
  action: string;
  resource_type: string;
  resource_id?: string;
  metadata?: Record<string, unknown>;
  timestamp: string;
}

export interface SystemMetric {
  id: string;
  node_name: string;
  cpu_load: number;
  memory_load: number;
  latency_ms: number;
  status: 'nominal' | 'degraded' | 'critical';
  timestamp: string;
}

export interface Database {
  public: {
    Tables: {
      briefs: {
        Row: Brief;
        Insert: Omit<Brief, 'id' | 'created_at' | 'updated_at'>;
        Update: Partial<Omit<Brief, 'id'>>;
      };
      deliverables: {
        Row: Deliverable;
        Insert: Omit<Deliverable, 'id' | 'created_at'>;
        Update: Partial<Omit<Deliverable, 'id'>>;
      };
      clients: {
        Row: Client;
        Insert: Omit<Client, 'id' | 'created_at'>;
        Update: Partial<Omit<Client, 'id'>>;
      };
      invoices: {
        Row: Invoice;
        Insert: Omit<Invoice, 'id' | 'created_at'>;
        Update: Partial<Omit<Invoice, 'id'>>;
      };
      team_members: {
        Row: TeamMember;
        Insert: Omit<TeamMember, 'id' | 'created_at'>;
        Update: Partial<Omit<TeamMember, 'id'>>;
      };
      audit_logs: {
        Row: AuditLog;
        Insert: Omit<AuditLog, 'id' | 'timestamp'>;
        Update: Partial<Omit<AuditLog, 'id'>>;
      };
      system_metrics: {
        Row: SystemMetric;
        Insert: Omit<SystemMetric, 'id' | 'timestamp'>;
        Update: Partial<Omit<SystemMetric, 'id'>>;
      };
    };
  };
}
