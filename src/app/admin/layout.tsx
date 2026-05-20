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
    border-bottom: 1px solid ${theme.colors.border}; background: #1E293B;
    -webkit-overflow-scrolling: touch; scrollbar-width: none;
    &::-webkit-scrollbar { display: none; }

    @media (min-width: 768px) {
      width: 220px; flex-direction: column; padding: ${theme.spacing.lg} 0;
      border-bottom: none; overflow-x: visible; flex-shrink: 0;
    }

    .sidebar-header { display: none;
      @media (min-width: 768px) { display: block; padding: 0 ${theme.spacing.lg} ${theme.spacing.lg};
        border-bottom: 1px solid rgba(255,255,255,0.1); margin-bottom: ${theme.spacing.md};
        h2 { font-family: ${theme.fonts.heading}; font-size: ${theme.fontSizes.md}; font-weight: 700; color: ${theme.colors.accent}; margin: 0; }
        p { font-size: 12px; color: rgba(255,255,255,0.4); margin-top: 2px; overflow: hidden; text-overflow: ellipsis; }
      }
    }

    .nav-item {
      display: flex; align-items: center; gap: 8px; padding: 8px 14px;
      font-size: ${theme.fontSizes.sm}; color: rgba(255,255,255,0.55);
      text-decoration: none; white-space: nowrap; flex-shrink: 0;

      @media (min-width: 768px) { padding: 10px ${theme.spacing.lg}; border-left: 3px solid transparent; }

      &:hover { background: rgba(255,255,255,0.05); color: white; }
      &.active { color: white; font-weight: 600;
        @media (min-width: 768px) { background: rgba(255,255,255,0.08); border-left-color: ${theme.colors.accent}; }
      }
    }
  }

  .main-content { flex: 1; padding: ${theme.spacing.base}; overflow-x: hidden;
    @media (min-width: 768px) { padding: ${theme.spacing.xl} ${theme.spacing['2xl']}; max-width: 1200px; }
  }

  .gate-screen {
    display: flex; align-items: center; justify-content: center; flex: 1;
    min-height: calc(100dvh - 56px);
    @media (min-width: 768px) { min-height: calc(100vh - 64px); }
  }

  .gate-card {
    text-align: center; padding: ${theme.spacing['2xl']} ${theme.spacing.lg};
    max-width: 420px;

    .gate-icon {
      width: 72px; height: 72px; border-radius: 50%; margin: 0 auto ${theme.spacing.lg};
      display: flex; align-items: center; justify-content: center; font-size: 32px;
    }
    .gate-icon.denied { background: ${theme.colors.errorBg}; }
    .gate-icon.login { background: ${theme.colors.primaryBg}; }

    h2 {
      font-family: ${theme.fonts.heading}; font-size: ${theme.fontSizes.xl};
      font-weight: 700; margin-bottom: ${theme.spacing.sm};
    }

    p { color: ${theme.colors.textSecondary}; font-size: ${theme.fontSizes.sm};
      line-height: 1.6; margin-bottom: ${theme.spacing.xl}; }

    .gate-btn {
      display: inline-block; padding: 12px 28px;
      border-radius: ${theme.radii.md}; font-weight: 600; font-size: ${theme.fontSizes.sm};
      border: none; cursor: pointer; transition: all 0.15s ease;
      text-decoration: none;
    }
    .gate-btn.primary { background: ${theme.colors.primary}; color: white;
      &:hover { background: ${theme.colors.primaryDark}; }
    }
    .gate-btn.secondary { background: ${theme.colors.bgSecondary}; color: ${theme.colors.text};
      margin-left: 8px;
      &:hover { background: ${theme.colors.bgTertiary}; }
    }
  }
`;

const NAV = [
  { href: '/admin/dashboard', label: 'Dashboard', icon: '📊' },
  { href: '/admin/doctors', label: 'Doctors', icon: '🩺' },
  { href: '/admin/onboard-doctor', label: 'Onboard Doctor', icon: '➕' },
  { href: '/admin/orders', label: 'Orders', icon: '📋' },
  { href: '/admin/users', label: 'Users', icon: '👥' },
];

export default function AdminLayout({ children }: { children: ReactNode }) {
  const { user, loading, isAdmin } = useAuth();
  const router = useRouter();
  const pathname = usePathname();

  // Loading
  if (loading) {
    return (
      <div css={S}>
        <div className="gate-screen">
          <div className="gate-card">
            <p>Loading...</p>
          </div>
        </div>
      </div>
    );
  }

  // Not logged in
  if (!user) {
    return (
      <div css={S}>
        <div className="gate-screen">
          <div className="gate-card">
            <div className="gate-icon login">🔒</div>
            <h2>Admin Panel</h2>
            <p>You need to sign in to access this page.</p>
            <button className="gate-btn primary" onClick={() => router.push('/login')}>Sign In</button>
          </div>
        </div>
      </div>
    );
  }

  // Logged in but NOT admin → Access Denied
  if (!isAdmin) {
    return (
      <div css={S}>
        <div className="gate-screen">
          <div className="gate-card">
            <div className="gate-icon denied">🚫</div>
            <h2>Access Denied</h2>
            <p>
              This area is restricted to administrators only.
              Your current role does not have permission to access the admin panel.
            </p>
            <button className="gate-btn primary" onClick={() => router.push('/')}>Go Home</button>
            <button className="gate-btn secondary" onClick={() => router.back()}>Go Back</button>
          </div>
        </div>
      </div>
    );
  }

  // Admin → render the dashboard
  return (
    <div css={S}>
      <nav className="sidebar">
        <div className="sidebar-header"><h2>🛡 Admin</h2><p>{user.email}</p></div>
        {NAV.map(n => (
          <Link key={n.href} href={n.href} className={`nav-item ${pathname === n.href ? 'active' : ''}`}>
            {n.icon} {n.label}
          </Link>
        ))}
      </nav>
      <div className="main-content">{children}</div>
    </div>
  );
}
