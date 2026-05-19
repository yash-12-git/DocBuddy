/** @jsxImportSource @emotion/react */
'use client';

import { css } from '@emotion/react';
import { theme } from '@/lib/theme';
import { useAuth } from '@/contexts/AuthContext';
import { useRouter, usePathname } from 'next/navigation';
import Link from 'next/link';
import { ReactNode } from 'react';

const S = css`
  display: flex; flex-direction: column; min-height: calc(100dvh - 56px);
  @media (min-width: 768px) { flex-direction: row; min-height: calc(100vh - 64px); }

  .sidebar {
    width: 100%; display: flex; overflow-x: auto; padding: ${theme.spacing.xs} ${theme.spacing.sm};
    border-bottom: 1px solid ${theme.colors.border}; background: white;
    -webkit-overflow-scrolling: touch; scrollbar-width: none;
    &::-webkit-scrollbar { display: none; }

    @media (min-width: 768px) {
      width: 220px; flex-direction: column; padding: ${theme.spacing.lg} 0;
      border-bottom: none; border-right: 1px solid ${theme.colors.border}; overflow-x: visible; flex-shrink: 0;
    }

    .sidebar-header { display: none;
      @media (min-width: 768px) { display: block; padding: 0 ${theme.spacing.lg} ${theme.spacing.lg};
        border-bottom: 1px solid ${theme.colors.borderLight}; margin-bottom: ${theme.spacing.md};
        h2 { font-family: ${theme.fonts.heading}; font-size: ${theme.fontSizes.md}; font-weight: 700; color: ${theme.colors.primary}; margin: 0; }
        p { font-size: 12px; color: ${theme.colors.textMuted}; margin-top: 2px; overflow: hidden; text-overflow: ellipsis; }
      }
    }

    .nav-item {
      display: flex; align-items: center; gap: 8px; padding: 8px 14px;
      font-size: ${theme.fontSizes.sm}; color: ${theme.colors.textSecondary};
      text-decoration: none; white-space: nowrap; border-radius: ${theme.radii.md};
      border-bottom: 2px solid transparent; flex-shrink: 0;

      @media (min-width: 768px) { padding: 10px ${theme.spacing.lg}; border-radius: 0;
        border-bottom: none; border-left: 3px solid transparent; }

      &:hover { background: ${theme.colors.bgSecondary}; color: ${theme.colors.text}; }
      &.active { color: ${theme.colors.primary}; font-weight: 600;
        border-bottom-color: ${theme.colors.primary};
        @media (min-width: 768px) { background: ${theme.colors.primaryBg}; border-bottom-color: transparent; border-left-color: ${theme.colors.primary}; }
      }
    }
  }

  .main-content { flex: 1; padding: ${theme.spacing.base}; overflow-x: hidden;
    @media (min-width: 768px) { padding: ${theme.spacing.xl} ${theme.spacing['2xl']}; max-width: 1100px; }
  }

  .auth-gate { display: flex; align-items: center; justify-content: center; flex: 1;
    text-align: center; padding: ${theme.spacing['2xl']};
    h2 { font-size: ${theme.fontSizes.xl}; margin-bottom: ${theme.spacing.md}; }
    p { color: ${theme.colors.textSecondary}; margin-bottom: ${theme.spacing.lg}; }
    .cta { padding: 12px 28px; background: ${theme.colors.primary}; color: white; border: none; border-radius: ${theme.radii.md}; font-weight: 600; }
  }
`;

const NAV = [
  { href: '/portal/dashboard', label: 'Dashboard', icon: '📊' },
  { href: '/portal/profile', label: 'Profile', icon: '👤' },
  { href: '/portal/schedule', label: 'Schedule', icon: '📅' },
  { href: '/portal/appointments', label: 'Appointments', icon: '📋' },
];

export default function PortalLayout({ children }: { children: ReactNode }) {
  const { user, loading } = useAuth();
  const router = useRouter();
  const pathname = usePathname();
  if (loading) return <div css={S}><div className="auth-gate"><p>Loading...</p></div></div>;
  if (!user) return <div css={S}><div className="auth-gate"><div><h2>🩺 Doctor Portal</h2><p>Sign in to access your dashboard</p><button className="cta" onClick={() => router.push('/login')}>Sign In</button></div></div></div>;
  return (
    <div css={S}>
      <nav className="sidebar">
        <div className="sidebar-header"><h2>🩺 Doctor Portal</h2><p>{user.email}</p></div>
        {NAV.map((n) => <Link key={n.href} href={n.href} className={`nav-item ${pathname === n.href ? 'active' : ''}`}>{n.icon} {n.label}</Link>)}
      </nav>
      <div className="main-content">{children}</div>
    </div>
  );
}
