import { UserRole, Permission, SuiteApp, UserSession } from './types';

export const ROLE_PERMISSIONS: Record<UserRole, Permission[]> = {
  executive_admin: [
    'ops:read',
    'ops:write',
    'deploy:trigger',
    'deploy:rollback',
    'financial:read',
    'financial:write',
    'secrets:read',
    'secrets:rotate',
    'team:schedule',
    'audit:read',
  ],
  systems_architect: [
    'ops:read',
    'ops:write',
    'deploy:trigger',
    'deploy:rollback',
    'audit:read',
  ],
  operations_lead: [
    'ops:read',
    'ops:write',
    'team:schedule',
    'audit:read',
  ],
  security_officer: [
    'ops:read',
    'secrets:read',
    'secrets:rotate',
    'audit:read',
  ],
  auditor: [
    'ops:read',
    'financial:read',
    'audit:read',
  ],
  client_contractor: [
    'ops:read',
  ],
};

export const APP_ACCESS_MATRIX: Record<SuiteApp, UserRole[]> = {
  hub: ['executive_admin', 'systems_architect', 'operations_lead', 'security_officer', 'auditor', 'client_contractor'],
  forge: ['executive_admin', 'systems_architect', 'operations_lead', 'client_contractor'],
  atlas: ['executive_admin', 'systems_architect', 'operations_lead', 'auditor'],
  ledger: ['executive_admin', 'operations_lead', 'auditor'],
  vault: ['executive_admin', 'security_officer'],
  roster: ['executive_admin', 'operations_lead', 'systems_architect'],
};

export const hasPermission = (role: UserRole, permission: Permission): boolean => {
  const allowed = ROLE_PERMISSIONS[role] || [];
  return allowed.includes(permission);
};

export const canAccessApp = (role: UserRole, app: SuiteApp): boolean => {
  const allowedRoles = APP_ACCESS_MATRIX[app] || [];
  return allowedRoles.includes(role);
};

/**
 * Strict Multi-Tenant Boundary Guard
 * Ensures client contractors can strictly NEVER see deliverables, briefs,
 * or telemetry belonging to other clients or organizations.
 */
export function filterByTenantBoundary<T extends { client_id?: string }>(
  records: T[],
  session: UserSession | null
): T[] {
  if (!session) return [];

  // Internal operations staff have global suite clearance
  if (session.role !== 'client_contractor') {
    return records;
  }

  // Client contractors are strictly constrained to their designated client_id
  if (!session.clientId) {
    return [];
  }

  return records.filter(
    (record) => record.client_id?.toUpperCase() === session.clientId?.toUpperCase()
  );
}
