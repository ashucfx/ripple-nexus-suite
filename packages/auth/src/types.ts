export type UserRole =
  | 'executive_admin'
  | 'systems_architect'
  | 'operations_lead'
  | 'security_officer'
  | 'client_contractor'
  | 'auditor';

export type Permission =
  | 'ops:read'
  | 'ops:write'
  | 'deploy:trigger'
  | 'deploy:rollback'
  | 'financial:read'
  | 'financial:write'
  | 'secrets:read'
  | 'secrets:rotate'
  | 'team:schedule'
  | 'audit:read';

export interface UserSession {
  userId: string;
  email: string;
  name: string;
  role: UserRole;
  clientId?: string; // Tenant boundary for multi-client isolation
  token?: string;
  mfaVerified: boolean;
  authenticatedAt: string;
}

export type SuiteApp = 'hub' | 'forge' | 'atlas' | 'ledger' | 'vault' | 'roster';
