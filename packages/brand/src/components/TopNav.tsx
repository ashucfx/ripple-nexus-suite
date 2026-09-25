'use client';

import React, { useState, useEffect } from 'react';
import { BrandMark } from './BrandMark';
import { StatusPill } from './StatusPill';

export type AppIdentifier = 'hub' | 'forge' | 'atlas' | 'ledger' | 'vault' | 'roster';

export interface NavItem {
  label: string;
  href: string;
  active?: boolean;
}

export interface TopNavProps {
  currentApp: AppIdentifier;
  navItems?: NavItem[];
  rightAction?: React.ReactNode;
}

export const APPS_DIRECTORY: Record<
  AppIdentifier,
  { name: string; tag: string; port: number; domain: string; desc: string }
> = {
  hub: {
    name: 'HUB',
    tag: 'COMMAND',
    port: 3000,
    domain: 'hub.theripplenexus.com',
    desc: 'Executive Operations & Radar',
  },
  forge: {
    name: 'FORGE',
    tag: 'ENGINEERING',
    port: 3001,
    domain: 'forge.theripplenexus.com',
    desc: 'Delivery & Deployment Engine',
  },
  atlas: {
    name: 'ATLAS',
    tag: 'CLIENTS',
    port: 3002,
    domain: 'atlas.theripplenexus.com',
    desc: 'Intelligence & CRM Matrix',
  },
  ledger: {
    name: 'LEDGER',
    tag: 'FINANCE',
    port: 3003,
    domain: 'ledger.theripplenexus.com',
    desc: 'Fiscal Architecture & Cashflow',
  },
  vault: {
    name: 'VAULT',
    tag: 'SECURITY',
    port: 3004,
    domain: 'vault.theripplenexus.com',
    desc: 'Secrets & Compliance Citadel',
  },
  roster: {
    name: 'ROSTER',
    tag: 'TALENT',
    port: 3005,
    domain: 'roster.theripplenexus.com',
    desc: 'Capacity & Squad Scheduling',
  },
};

export const TopNav: React.FC<TopNavProps> = ({
  currentApp,
  navItems = [],
  rightAction,
}) => {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [appSwitcherOpen, setAppSwitcherOpen] = useState(false);
  const [timeUtc, setTimeUtc] = useState<string>('');

  useEffect(() => {
    const updateTime = () => {
      const now = new Date();
      setTimeUtc(
        now.toISOString().slice(11, 19) + ' UTC'
      );
    };
    updateTime();
    const interval = setInterval(updateTime, 1000);
    return () => clearInterval(interval);
  }, []);

  const currentAppMeta = APPS_DIRECTORY[currentApp] || APPS_DIRECTORY.hub;

  const getAppUrl = (appKey: AppIdentifier) => {
    if (typeof window !== 'undefined') {
      const isLocalhost =
        window.location.hostname === 'localhost' ||
        window.location.hostname === '127.0.0.1';
      if (isLocalhost) {
        return `http://localhost:${APPS_DIRECTORY[appKey].port}`;
      }
    }
    return `https://${APPS_DIRECTORY[appKey].domain}`;
  };

  return (
    <header
      style={{
        position: 'sticky',
        top: 0,
        zIndex: 50,
        width: '100%',
        backgroundColor: 'rgba(10, 13, 18, 0.92)',
        backdropFilter: 'blur(12px)',
        borderBottom: '1px solid var(--nexus-border, #1F2633)',
      }}
    >
      <div
        className="rn-container"
        style={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          height: '64px',
        }}
      >
        {/* Left: Brand Monogram + Title + App Selector */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
          <a
            href={getAppUrl('hub')}
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: '0.75rem',
              textDecoration: 'none',
              color: 'inherit',
            }}
          >
            <BrandMark size={34} />
            <div>
              <div
                style={{
                  fontFamily: 'var(--font-sans, sans-serif)',
                  fontSize: '0.9375rem',
                  fontWeight: 800,
                  letterSpacing: '0.12em',
                  color: '#FFFFFF',
                  lineHeight: 1.1,
                }}
              >
                RIPPLE NEXUS
              </div>
              <div
                style={{
                  fontFamily: 'var(--font-mono, monospace)',
                  fontSize: '0.5625rem',
                  letterSpacing: '0.14em',
                  color: 'var(--nexus-slate, #8A99AD)',
                  textTransform: 'uppercase',
                }}
              >
                SYSTEMS ARCHITECTURE
              </div>
            </div>
          </a>

          {/* App Badge with Switcher Trigger */}
          <div style={{ position: 'relative' }}>
            <button
              onClick={() => setAppSwitcherOpen(!appSwitcherOpen)}
              type="button"
              style={{
                display: 'inline-flex',
                alignItems: 'center',
                gap: '0.4rem',
                backgroundColor: 'var(--nexus-surface3, #1A212E)',
                border: '1px solid var(--nexus-border, #1F2633)',
                borderRadius: '4px',
                padding: '4px 8px',
                cursor: 'pointer',
                color: 'var(--nexus-white, #FFFFFF)',
                fontFamily: 'var(--font-mono, monospace)',
                fontSize: '0.6875rem',
                fontWeight: 600,
                letterSpacing: '0.06em',
                transition: 'all 150ms ease',
              }}
              aria-expanded={appSwitcherOpen}
              aria-label="Switch Operations Suite Application"
            >
              <span style={{ color: 'var(--nexus-cyan, #00D2FF)' }}>
                [{currentAppMeta.name}]
              </span>
              <span
                style={{
                  color: 'var(--nexus-slate, #8A99AD)',
                  fontSize: '0.625rem',
                }}
              >
                ▼
              </span>
            </button>

            {/* App Switcher Dropdown */}
            {appSwitcherOpen && (
              <>
                <div
                  onClick={() => setAppSwitcherOpen(false)}
                  style={{
                    position: 'fixed',
                    inset: 0,
                    zIndex: 90,
                  }}
                />
                <div
                  style={{
                    position: 'absolute',
                    top: 'calc(100% + 6px)',
                    left: 0,
                    width: '280px',
                    backgroundColor: 'var(--nexus-carbon, #141923)',
                    border: '1px solid var(--nexus-border, #1F2633)',
                    borderRadius: '6px',
                    boxShadow: '0 10px 30px rgba(0, 0, 0, 0.6)',
                    padding: '6px',
                    zIndex: 100,
                  }}
                >
                  <div
                    style={{
                      fontFamily: 'var(--font-mono, monospace)',
                      fontSize: '0.625rem',
                      letterSpacing: '0.1em',
                      color: 'var(--nexus-slate, #8A99AD)',
                      padding: '6px 8px',
                      textTransform: 'uppercase',
                      borderBottom: '1px solid var(--nexus-border, #1F2633)',
                    }}
                  >
                    NEXUS OPS SUITE (6 APPS)
                  </div>
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '2px', marginTop: '4px' }}>
                    {(Object.keys(APPS_DIRECTORY) as AppIdentifier[]).map((key) => {
                      const app = APPS_DIRECTORY[key];
                      const isActive = key === currentApp;
                      return (
                        <a
                          key={key}
                          href={getAppUrl(key)}
                          onClick={() => setAppSwitcherOpen(false)}
                          style={{
                            display: 'flex',
                            flexDirection: 'column',
                            gap: '2px',
                            padding: '8px 10px',
                            borderRadius: '4px',
                            textDecoration: 'none',
                            backgroundColor: isActive
                              ? 'rgba(0, 82, 255, 0.15)'
                              : 'transparent',
                            border: isActive
                              ? '1px solid rgba(0, 82, 255, 0.4)'
                              : '1px solid transparent',
                            color: '#FFFFFF',
                            transition: 'background-color 150ms ease',
                          }}
                        >
                          <div
                            style={{
                              display: 'flex',
                              alignItems: 'center',
                              justifyContent: 'space-between',
                            }}
                          >
                            <span
                              style={{
                                fontFamily: 'var(--font-mono, monospace)',
                                fontWeight: 700,
                                fontSize: '0.8125rem',
                                color: isActive
                                  ? 'var(--nexus-cyan, #00D2FF)'
                                  : 'var(--nexus-white, #FFFFFF)',
                              }}
                            >
                              {app.name}
                            </span>
                            <span
                              style={{
                                fontFamily: 'var(--font-mono, monospace)',
                                fontSize: '0.625rem',
                                color: 'var(--nexus-slate, #8A99AD)',
                              }}
                            >
                              :{app.port}
                            </span>
                          </div>
                          <span
                            style={{
                              fontSize: '0.6875rem',
                              color: 'var(--nexus-slate, #8A99AD)',
                            }}
                          >
                            {app.desc}
                          </span>
                        </a>
                      );
                    })}
                  </div>
                </div>
              </>
            )}
          </div>

          {/* Desktop Navigation Links */}
          <nav
            style={{
              display: 'none',
              alignItems: 'center',
              gap: '0.25rem',
              marginLeft: '1rem',
            }}
            className="rn-desktop-nav"
          >
            {navItems.map((item) => (
              <a
                key={item.label}
                href={item.href}
                style={{
                  fontFamily: 'var(--font-mono, monospace)',
                  fontSize: '0.75rem',
                  letterSpacing: '0.04em',
                  textTransform: 'uppercase',
                  padding: '6px 12px',
                  borderRadius: '4px',
                  textDecoration: 'none',
                  color: item.active
                    ? 'var(--nexus-white, #FFFFFF)'
                    : 'var(--nexus-slate, #8A99AD)',
                  backgroundColor: item.active
                    ? 'var(--nexus-surface3, #1A212E)'
                    : 'transparent',
                  border: item.active
                    ? '1px solid var(--nexus-border, #1F2633)'
                    : '1px solid transparent',
                  transition: 'color 150ms ease',
                }}
              >
                {item.label}
              </a>
            ))}
          </nav>
        </div>

        {/* Right Section: Status, Clock, Action, Mobile Hamburger */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
          {timeUtc && (
            <div
              style={{
                display: 'none',
                fontFamily: 'var(--font-mono, monospace)',
                fontSize: '0.6875rem',
                color: 'var(--nexus-slate, #8A99AD)',
                letterSpacing: '0.06em',
              }}
              className="rn-desktop-clock"
            >
              {timeUtc}
            </div>
          )}

          <StatusPill label="LIVE PROD" variant="live" />

          {rightAction}

          {/* Mobile Menu Toggle Button */}
          <button
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            type="button"
            className="rn-mobile-menu-btn"
            style={{
              display: 'flex',
              flexDirection: 'column',
              justifyContent: 'center',
              alignItems: 'center',
              gap: '4px',
              width: '36px',
              height: '36px',
              backgroundColor: 'var(--nexus-surface3, #1A212E)',
              border: '1px solid var(--nexus-border, #1F2633)',
              borderRadius: '4px',
              cursor: 'pointer',
              color: 'var(--nexus-white, #FFFFFF)',
            }}
            aria-label="Toggle navigation drawer"
          >
            <span
              style={{
                width: '18px',
                height: '2px',
                backgroundColor: 'var(--nexus-white, #FFFFFF)',
                transition: 'transform 200ms ease',
                transform: mobileMenuOpen
                  ? 'rotate(45deg) translate(4px, 4px)'
                  : 'none',
              }}
            />
            <span
              style={{
                width: '18px',
                height: '2px',
                backgroundColor: 'var(--nexus-white, #FFFFFF)',
                opacity: mobileMenuOpen ? 0 : 1,
                transition: 'opacity 200ms ease',
              }}
            />
            <span
              style={{
                width: '18px',
                height: '2px',
                backgroundColor: 'var(--nexus-white, #FFFFFF)',
                transition: 'transform 200ms ease',
                transform: mobileMenuOpen
                  ? 'rotate(-45deg) translate(4px, -4px)'
                  : 'none',
              }}
            />
          </button>
        </div>
      </div>

      {/* Mobile Drawer Menu */}
      {mobileMenuOpen && (
        <div
          className="rn-mobile-drawer"
          style={{
            borderTop: '1px solid var(--nexus-border, #1F2633)',
            backgroundColor: 'var(--nexus-carbon, #141923)',
            padding: '1rem',
            display: 'flex',
            flexDirection: 'column',
            gap: '1rem',
          }}
        >
          {navItems.length > 0 && (
            <div>
              <div
                style={{
                  fontFamily: 'var(--font-mono, monospace)',
                  fontSize: '0.625rem',
                  letterSpacing: '0.1em',
                  color: 'var(--nexus-slate, #8A99AD)',
                  textTransform: 'uppercase',
                  marginBottom: '0.5rem',
                }}
              >
                {currentAppMeta.name} VIEWS
              </div>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '0.35rem' }}>
                {navItems.map((item) => (
                  <a
                    key={item.label}
                    href={item.href}
                    onClick={() => setMobileMenuOpen(false)}
                    style={{
                      fontFamily: 'var(--font-mono, monospace)',
                      fontSize: '0.8125rem',
                      letterSpacing: '0.04em',
                      padding: '8px 12px',
                      borderRadius: '4px',
                      textDecoration: 'none',
                      color: item.active ? '#FFFFFF' : 'var(--nexus-slate, #8A99AD)',
                      backgroundColor: item.active
                        ? 'var(--nexus-surface3, #1A212E)'
                        : 'transparent',
                    }}
                  >
                    {item.label}
                  </a>
                ))}
              </div>
            </div>
          )}

          <div>
            <div
              style={{
                fontFamily: 'var(--font-mono, monospace)',
                fontSize: '0.625rem',
                letterSpacing: '0.1em',
                color: 'var(--nexus-slate, #8A99AD)',
                textTransform: 'uppercase',
                marginBottom: '0.5rem',
              }}
            >
              NEXUS SUITE SUBNETS
            </div>
            <div
              style={{
                display: 'grid',
                gridTemplateColumns: 'repeat(2, 1fr)',
                gap: '0.5rem',
              }}
            >
              {(Object.keys(APPS_DIRECTORY) as AppIdentifier[]).map((key) => {
                const app = APPS_DIRECTORY[key];
                const isActive = key === currentApp;
                return (
                  <a
                    key={key}
                    href={getAppUrl(key)}
                    style={{
                      padding: '8px',
                      backgroundColor: isActive
                        ? 'rgba(0, 82, 255, 0.15)'
                        : 'var(--nexus-surface3, #1A212E)',
                      border: isActive
                        ? '1px solid rgba(0, 82, 255, 0.4)'
                        : '1px solid var(--nexus-border, #1F2633)',
                      borderRadius: '4px',
                      textDecoration: 'none',
                      color: '#FFFFFF',
                    }}
                  >
                    <div
                      style={{
                        fontFamily: 'var(--font-mono, monospace)',
                        fontSize: '0.75rem',
                        fontWeight: 700,
                        color: isActive ? 'var(--nexus-cyan, #00D2FF)' : '#FFFFFF',
                      }}
                    >
                      {app.name}
                    </div>
                    <div
                      style={{
                        fontSize: '0.625rem',
                        color: 'var(--nexus-slate, #8A99AD)',
                      }}
                    >
                      :{app.port}
                    </div>
                  </a>
                );
              })}
            </div>
          </div>
        </div>
      )}

      {/* Global CSS for Responsive TopNav */}
      <style>{`
        @media (min-width: 900px) {
          .rn-desktop-nav {
            display: flex !important;
          }
          .rn-desktop-clock {
            display: block !important;
          }
          .rn-mobile-menu-btn {
            display: none !important;
          }
          .rn-mobile-drawer {
            display: none !important;
          }
        }
      `}</style>
    </header>
  );
};
