'use client';

import React, { useState } from 'react';
import { TopNav, TelemetryMetric, Button } from '@rn/brand';
import { useAuth, AuthGuard, UserRole } from '@rn/auth';
import { SecretsMatrix, EnclaveSecret } from '../components/SecretsMatrix';
import { RotateSecretModal } from '../components/RotateSecretModal';
import { ComplianceRadar } from '../components/ComplianceRadar';

export default function VaultPage() {
  const { role, switchRole } = useAuth();
  const [secrets, setSecrets] = useState<EnclaveSecret[]>([]);
  const [activeSecretForRotate, setActiveSecretForRotate] = useState<EnclaveSecret | null>(null);
  const [modalOpen, setModalOpen] = useState(false);

  const handleOpenRotate = (secret: EnclaveSecret) => {
    setActiveSecretForRotate(secret);
    setModalOpen(true);
  };

  const handleOpenNewSecret = () => {
    setActiveSecretForRotate(null);
    setModalOpen(true);
  };

  const handleSaveSecret = async (secretData: Partial<EnclaveSecret>) => {
    if (activeSecretForRotate) {
      // Update existing
      setSecrets((prev) =>
        prev.map((s) => (s.id === activeSecretForRotate.id ? ({ ...s, ...secretData } as EnclaveSecret) : s))
      );
    } else {
      // Provision new
      const newSecret: EnclaveSecret = {
        id: secretData.id || `sec-${Date.now()}`,
        name: secretData.name || 'Provisioned Key',
        key_alias: secretData.key_alias || `KEY_${Date.now()}`,
        scope: secretData.scope || 'global',
        environment: secretData.environment || 'production',
        last_rotated: new Date().toISOString(),
        status: 'active',
        masked_value: secretData.masked_value || 'rn_sec_••••••••••••38f2',
      };
      setSecrets((prev) => [newSecret, ...prev]);
    }
  };

  const activeKeys = secrets.filter((s) => s.status === 'active').length;
  const rotationDue = secrets.filter((s) => s.status === 'rotation_due').length;

  const navItems = [
    { label: 'SECRETS MATRIX', href: '#secrets', active: true },
    { label: 'COMPLIANCE AUDIT', href: '#compliance', active: false },
    { label: 'HSM ENCLAVES', href: '#hsm', active: false },
  ];

  return (
    <AuthGuard requiredApp="vault" requiredPermission="secrets:read">
      <div style={{ minHeight: '100vh', display: 'flex', flexDirection: 'column' }}>
        <TopNav
          currentApp="vault"
          navItems={navItems}
          rightAction={
            <Button
              variant="primary"
              size="sm"
              onClick={handleOpenNewSecret}
            >
              + PROVISION KEY
            </Button>
          }
        />

        <main className="rn-container" style={{ flex: 1, paddingTop: '1.5rem', paddingBottom: '3rem' }}>
          {/* Header Bar */}
          <div
            style={{
              display: 'flex',
              flexWrap: 'wrap',
              alignItems: 'center',
              justifyContent: 'space-between',
              gap: '1rem',
              marginBottom: '1.5rem',
            }}
          >
            <div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', flexWrap: 'wrap' }}>
                <span
                  style={{
                    fontFamily: 'var(--font-mono, monospace)',
                    fontSize: '0.75rem',
                    letterSpacing: '0.12em',
                    color: 'var(--nexus-cyan, #00D2FF)',
                    textTransform: 'uppercase',
                  }}
                >
                  RIPPLE NEXUS // SECURITY CITADEL
                </span>
                <span style={{ color: 'var(--nexus-border, #1F2633)' }}>|</span>
                <span
                  style={{
                    fontFamily: 'var(--font-mono, monospace)',
                    fontSize: '0.75rem',
                    color: 'var(--status-nominal, #00E599)',
                  }}
                >
                  ● HARDWARE ENCLAVE SECURE
                </span>
              </div>
              <h1
                style={{
                  fontFamily: 'var(--font-sans, sans-serif)',
                  fontSize: 'clamp(1.5rem, 3vw, 2.25rem)',
                  fontWeight: 900,
                  letterSpacing: '-0.02em',
                  color: 'var(--nexus-white, #FFFFFF)',
                  marginTop: '0.25rem',
                }}
              >
                Secrets Enclave & HSM Key Rotation Matrix
              </h1>
            </div>

            {/* Quick Role Elevation Switcher for RBAC Boundary Testing */}
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', flexWrap: 'wrap' }}>
              <span
                style={{
                  fontFamily: 'var(--font-mono, monospace)',
                  fontSize: '0.6875rem',
                  color: 'var(--nexus-slate, #8A99AD)',
                }}
              >
                RBAC TEST:
              </span>
              {(['executive_admin', 'security_officer', 'client_contractor'] as UserRole[]).map((r) => (
                <button
                  key={r}
                  type="button"
                  onClick={() => switchRole(r, r === 'client_contractor' ? 'HELIOS-AI' : undefined)}
                  style={{
                    fontFamily: 'var(--font-mono, monospace)',
                    fontSize: '0.625rem',
                    padding: '4px 8px',
                    borderRadius: '4px',
                    border: role === r ? '1px solid var(--nexus-cobalt, #0052FF)' : '1px solid var(--nexus-border, #1F2633)',
                    backgroundColor: role === r ? 'var(--nexus-surface3, #1A212E)' : 'transparent',
                    color: role === r ? 'var(--nexus-cyan, #00D2FF)' : 'var(--nexus-slate, #8A99AD)',
                    cursor: 'pointer',
                  }}
                >
                  {r.split('_')[0].toUpperCase()}
                </button>
              ))}
            </div>
          </div>

          {/* Metric Telemetry Row */}
          <div
            style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))',
              gap: '1rem',
              marginBottom: '1.5rem',
            }}
          >
            <TelemetryMetric
              label="TOTAL ENCLAVE SECRETS"
              value={secrets.length.toString()}
              subValue={`${activeKeys} Active in HSM`}
              trend="up"
              statusColor="var(--nexus-cobalt)"
            />
            <TelemetryMetric
              label="ROTATION COMPLIANCE"
              value={rotationDue === 0 ? '100%' : 'ATTN'}
              subValue={rotationDue === 0 ? 'All Keys Within SLA' : `${rotationDue} Keys Due`}
              trend={rotationDue === 0 ? 'up' : 'down'}
              statusColor={rotationDue === 0 ? 'var(--status-nominal)' : 'var(--status-critical)'}
            />
            <TelemetryMetric
              label="HSM LATENCY (TRNG)"
              value="3.2ms"
              subValue="FIPS 140-3 Nominal"
              trend="up"
              statusColor="var(--status-nominal)"
            />
            <TelemetryMetric
              label="ZERO-TRUST INTEGRITY"
              value="ENFORCED"
              subValue="mTLS + Enclave Attested"
              trend="up"
              statusColor="var(--status-nominal)"
            />
          </div>

          {/* Main Layout Grid */}
          <div style={{ display: 'grid', gridTemplateColumns: 'minmax(0, 2fr) minmax(0, 1fr)', gap: '1.5rem', alignItems: 'start' }}>
            <SecretsMatrix
              secrets={secrets}
              onOpenRotate={handleOpenRotate}
              onOpenNewSecret={handleOpenNewSecret}
            />
            <ComplianceRadar secrets={secrets} />
          </div>
        </main>

        <RotateSecretModal
          isOpen={modalOpen}
          onClose={() => setModalOpen(false)}
          secret={activeSecretForRotate}
          onSave={handleSaveSecret}
        />
      </div>
    </AuthGuard>
  );
}
