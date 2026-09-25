'use client';

import React, { createContext, useContext, useState, useEffect } from 'react';
import { UserRole, Permission, UserSession, SuiteApp } from './types';
import { hasPermission, canAccessApp } from './rbac';
import { getSupabaseClient } from '@rn/db';

interface AuthContextValue {
  session: UserSession | null;
  role: UserRole;
  isAuthenticated: boolean;
  login: (email: string, role?: UserRole, clientId?: string) => Promise<void>;
  logout: () => void;
  switchRole: (role: UserRole, clientId?: string) => void;
  checkPermission: (permission: Permission) => boolean;
}

const DEFAULT_SESSION: UserSession = {
  userId: 'usr-admin-master',
  email: 'admin@theripplenexus.com',
  name: 'Executive Architect',
  role: 'executive_admin',
  mfaVerified: true,
  authenticatedAt: new Date().toISOString(),
};

const AuthContext = createContext<AuthContextValue | null>(null);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [session, setSession] = useState<UserSession | null>(DEFAULT_SESSION);

  useEffect(() => {
    const supabase = getSupabaseClient();
    if (!supabase) return;

    // Listen to real Supabase auth state
    supabase.auth.getSession().then(({ data: { session: sbSession } }) => {
      if (sbSession?.user) {
        const metadata = sbSession.user.user_metadata || {};
        setSession({
          userId: sbSession.user.id,
          email: sbSession.user.email || 'user@theripplenexus.com',
          name: metadata.full_name || 'Enclave Operator',
          role: (metadata.role as UserRole) || 'systems_architect',
          clientId: metadata.client_id,
          token: sbSession.access_token,
          mfaVerified: true,
          authenticatedAt: new Date().toISOString(),
        });
      }
    });

    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, sbSession) => {
      if (sbSession?.user) {
        const metadata = sbSession.user.user_metadata || {};
        setSession({
          userId: sbSession.user.id,
          email: sbSession.user.email || 'user@theripplenexus.com',
          name: metadata.full_name || 'Enclave Operator',
          role: (metadata.role as UserRole) || 'systems_architect',
          clientId: metadata.client_id,
          token: sbSession.access_token,
          mfaVerified: true,
          authenticatedAt: new Date().toISOString(),
        });
      } else {
        // Fall back to default session in dev mode
        setSession(DEFAULT_SESSION);
      }
    });

    return () => {
      subscription.unsubscribe();
    };
  }, []);

  const login = async (email: string, role: UserRole = 'systems_architect', clientId?: string) => {
    const newSession: UserSession = {
      userId: `usr-${Date.now()}`,
      email,
      name: email.split('@')[0].toUpperCase(),
      role,
      clientId,
      mfaVerified: true,
      authenticatedAt: new Date().toISOString(),
    };
    setSession(newSession);
  };

  const logout = () => {
    setSession(null);
    const supabase = getSupabaseClient();
    if (supabase) {
      supabase.auth.signOut().catch(() => {});
    }
  };

  const switchRole = (role: UserRole, clientId?: string) => {
    if (!session) return;
    setSession({
      ...session,
      role,
      clientId: role === 'client_contractor' ? (clientId || 'HELIOS-AI') : undefined,
    });
  };

  const checkPermission = (permission: Permission): boolean => {
    if (!session) return false;
    return hasPermission(session.role, permission);
  };

  return (
    <AuthContext.Provider
      value={{
        session,
        role: session?.role || 'client_contractor',
        isAuthenticated: !!session,
        login,
        logout,
        switchRole,
        checkPermission,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = (): AuthContextValue => {
  const ctx = useContext(AuthContext);
  if (!ctx) {
    throw new Error('useAuth must be used within an <AuthProvider>');
  }
  return ctx;
};

interface AuthGuardProps {
  requiredApp: SuiteApp;
  requiredPermission?: Permission;
  children: React.ReactNode;
}

export const AuthGuard: React.FC<AuthGuardProps> = ({
  requiredApp,
  requiredPermission,
  children,
}) => {
  const { session, role, isAuthenticated, switchRole } = useAuth();

  if (!isAuthenticated || !session) {
    return (
      <div
        style={{
          minHeight: '100vh',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          backgroundColor: '#0A0D12',
          padding: '1.5rem',
        }}
      >
        <div
          style={{
            maxWidth: '460px',
            width: '100%',
            backgroundColor: '#141923',
            border: '1px solid #1F2633',
            borderRadius: '8px',
            padding: '2rem',
            textAlign: 'center',
          }}
        >
          <div
            style={{
              fontFamily: 'var(--font-mono, monospace)',
              fontSize: '0.75rem',
              color: '#EF4444',
              letterSpacing: '0.1em',
              marginBottom: '0.5rem',
            }}
          >
            [SECURITY CLEARANCE REQUIRED]
          </div>
          <h2
            style={{
              fontFamily: 'var(--font-sans, sans-serif)',
              fontSize: '1.25rem',
              fontWeight: 800,
              color: '#FFFFFF',
              marginBottom: '1rem',
            }}
          >
            Nexus Operations Citadel
          </h2>
          <p
            style={{
              fontFamily: 'var(--font-sans, sans-serif)',
              fontSize: '0.8125rem',
              color: '#8A99AD',
              marginBottom: '1.5rem',
              lineHeight: 1.5,
            }}
          >
            Authentication required to access Ripple Nexus Operations Enclave. Session unverified.
          </p>
          <button
            type="button"
            onClick={() => switchRole('executive_admin')}
            style={{
              width: '100%',
              backgroundColor: '#0052FF',
              color: '#FFFFFF',
              border: 'none',
              padding: '0.75rem',
              borderRadius: '4px',
              fontWeight: 600,
              fontFamily: 'var(--font-mono, monospace)',
              cursor: 'pointer',
            }}
          >
            AUTHENTICATE WITH MASTER ENCLAVE
          </button>
        </div>
      </div>
    );
  }

  const appAllowed = canAccessApp(role, requiredApp);
  const permissionAllowed = requiredPermission ? hasPermission(role, requiredPermission) : true;

  if (!appAllowed || !permissionAllowed) {
    return (
      <div
        style={{
          minHeight: '100vh',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          backgroundColor: '#0A0D12',
          padding: '1.5rem',
        }}
      >
        <div
          style={{
            maxWidth: '520px',
            width: '100%',
            backgroundColor: '#141923',
            border: '1px solid #1F2633',
            borderRadius: '8px',
            padding: '2rem',
            textAlign: 'center',
          }}
        >
          <div
            style={{
              display: 'inline-flex',
              padding: '4px 12px',
              borderRadius: '9999px',
              backgroundColor: 'rgba(239, 68, 68, 0.1)',
              border: '1px solid rgba(239, 68, 68, 0.4)',
              color: '#EF4444',
              fontFamily: 'var(--font-mono, monospace)',
              fontSize: '0.6875rem',
              fontWeight: 700,
              letterSpacing: '0.08em',
              marginBottom: '1rem',
            }}
          >
            RESTRICTED ACCESS // 403 FORBIDDEN
          </div>
          <h2
            style={{
              fontFamily: 'var(--font-sans, sans-serif)',
              fontSize: '1.25rem',
              fontWeight: 800,
              color: '#FFFFFF',
              marginBottom: '0.75rem',
            }}
          >
            Security Boundary Enforced
          </h2>
          <p
            style={{
              fontFamily: 'var(--font-sans, sans-serif)',
              fontSize: '0.8125rem',
              color: '#8A99AD',
              marginBottom: '1.5rem',
              lineHeight: 1.5,
            }}
          >
            Your current security role <strong>[{role.toUpperCase()}]</strong> is not authorized to access the{' '}
            <strong>{requiredApp.toUpperCase()}</strong> subnet. Multi-tenant boundaries and RBAC policies prevent unauthorized vector execution.
          </p>
          <div style={{ display: 'flex', gap: '0.75rem', justifyContent: 'center' }}>
            <button
              type="button"
              onClick={() => switchRole('executive_admin')}
              style={{
                backgroundColor: '#1A212E',
                border: '1px solid #1F2633',
                color: '#00D2FF',
                padding: '0.6rem 1.2rem',
                borderRadius: '4px',
                fontSize: '0.75rem',
                fontFamily: 'var(--font-mono, monospace)',
                cursor: 'pointer',
              }}
            >
              ELEVATE TO EXECUTIVE ADMIN
            </button>
            <a
              href="http://localhost:3000"
              style={{
                backgroundColor: '#0052FF',
                color: '#FFFFFF',
                padding: '0.6rem 1.2rem',
                borderRadius: '4px',
                fontSize: '0.75rem',
                fontFamily: 'var(--font-mono, monospace)',
                textDecoration: 'none',
                display: 'inline-flex',
                alignItems: 'center',
              }}
            >
              RETURN TO HUB
            </a>
          </div>
        </div>
      </div>
    );
  }

  return <>{children}</>;
};
