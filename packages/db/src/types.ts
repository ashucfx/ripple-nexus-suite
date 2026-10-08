export type BriefStatus = 'intake' | 'in_progress' | 'review' | 'delivered' | 'blocked';
export type PriorityLevel = 'p0_critical' | 'p1_high' | 'p2_medium' | 'p3_low';
export type JsonValue = string | number | boolean | null | JsonValue[] | { [key: string]: JsonValue };
export type JsonObject = { [key: string]: JsonValue };
import type { PaymentMethod, PaymentProvider } from './payments';

export interface Brief {
  id: string;
  tenant_id?: string;
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
  tenant_id?: string;
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
  tenant_id?: string;
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
  tenant_id?: string;
  client_id: string;
  client_name?: string;
  client_email?: string;
  country_code?: string;
  invoice_number: string;
  amount: number;
  currency: string;
  status: 'draft' | 'issued' | 'paid' | 'overdue';
  payment_method?: PaymentMethod;
  payment_provider?: PaymentProvider;
  subtotal?: number;
  discount_rate?: number;
  discount_amount?: number;
  tax_rate?: number;
  tax_amount?: number;
  processing_fee?: number;
  gateway_fee_rate?: number;
  gateway_fixed_fee?: number;
  provider_payment_id?: string;
  provider_reference?: string;
  local_currency_code?: string;
  local_equivalent_amount?: number;
  settlement_status?: 'pending' | 'settled' | 'failed' | 'reconciled';
  amount_settled?: number;
  settlement_note?: string;
  settled_at?: string;
  due_date: string;
  paid_date?: string;
  created_at: string;
}

export interface TeamMember {
  id: string;
  tenant_id?: string;
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
  tenant_id?: string;
  user_email: string;
  action: string;
  resource_type: string;
  resource_id?: string;
  metadata?: Record<string, unknown>;
  timestamp: string;
}

export interface SystemMetric {
  id: string;
  tenant_id?: string;
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
        Relationships: [];
      };
      deliverables: {
        Row: Deliverable;
        Insert: Omit<Deliverable, 'id' | 'created_at'>;
        Update: Partial<Omit<Deliverable, 'id'>>;
        Relationships: [];
      };
      clients: {
        Row: Client;
        Insert: Omit<Client, 'id' | 'created_at'>;
        Update: Partial<Omit<Client, 'id'>>;
        Relationships: [];
      };
      invoices: {
        Row: Invoice;
        Insert: Omit<Invoice, 'id' | 'created_at'>;
        Update: Partial<Omit<Invoice, 'id'>>;
        Relationships: [];
      };
      team_members: {
        Row: TeamMember;
        Insert: Omit<TeamMember, 'id' | 'created_at'>;
        Update: Partial<Omit<TeamMember, 'id'>>;
        Relationships: [];
      };
      audit_logs: {
        Row: AuditLog;
        Insert: Omit<AuditLog, 'id' | 'timestamp'>;
        Update: Partial<Omit<AuditLog, 'id'>>;
        Relationships: [];
      };
      system_metrics: {
        Row: SystemMetric;
        Insert: Omit<SystemMetric, 'id' | 'timestamp'>;
        Update: Partial<Omit<SystemMetric, 'id'>>;
        Relationships: [];
      };
      vault_secret_references: {
        Row: VaultSecretReference;
        Insert: Omit<VaultSecretReference, 'id' | 'created_at'>;
        Update: Partial<Omit<VaultSecretReference, 'id'>>;
        Relationships: [];
      };
      rn_onboarding_jobs: {
        Row: OnboardingJob;
        Insert: Omit<OnboardingJob, 'id' | 'correlation_id' | 'created_at' | 'updated_at' | 'attempt_count' | 'status' | 'next_attempt_at'>;
        Update: Partial<Omit<OnboardingJob, 'id'>>;
        Relationships: [];
      };
      rn_payment_events: {
        Row: PaymentEvent;
        Insert: Omit<PaymentEvent, 'id' | 'created_at' | 'processed_at'>;
        Update: Partial<Omit<PaymentEvent, 'id'>>;
        Relationships: [];
      };
      rn_payment_accounts: {
        Row: PaymentAccount;
        Insert: Omit<PaymentAccount, 'id' | 'created_at' | 'updated_at'>;
        Update: Partial<Omit<PaymentAccount, 'id'>>;
        Relationships: [];
      };
    };
    Views: {};
    Functions: {};
  };
}

export interface VaultSecretReference {
  id: string;
  tenant_id: string;
  secret_name: string;
  provider_reference: string;
  environment: string;
  last_rotated_at?: string;
  status: 'active' | 'rotation_due' | 'revoked';
  created_at: string;
}

export type OnboardingJobStatus = 'queued' | 'provisioning' | 'ready' | 'failed';

export interface OnboardingJob {
  id: string;
  external_key: string;
  idempotency_key: string;
  tenant_id?: string;
  requested_by: string;
  correlation_id: string;
  payload: JsonObject;
  status: OnboardingJobStatus;
  attempt_count: number;
  last_error?: string;
  next_attempt_at: string;
  created_at: string;
  updated_at: string;
}

export interface PaymentEvent {
  id: string;
  tenant_id?: string;
  invoice_id: string;
  provider: PaymentProvider;
  provider_event_id: string;
  event_type: string;
  status: 'received' | 'processed' | 'failed';
  payload: JsonObject;
  created_at: string;
  processed_at?: string;
}

export interface PaymentAccount {
  id: string;
  provider: PaymentProvider;
  rail: 'native' | 'swift';
  currency: string;
  country?: string;
  display_name: string;
  provider_reference?: string;
  encrypted_instructions?: string;
  is_active: boolean;
  created_at: string;
  updated_at: string;
}
