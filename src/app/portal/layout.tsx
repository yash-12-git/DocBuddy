/** @jsxImportSource @emotion/react */
'use client';

import { css } from '@emotion/react';
import { theme } from '@/lib/theme';
import { useAuth } from '@/contexts/AuthContext';
import { useRouter, usePathname } from 'next/navigation';
import Link from 'next/link';
import { ReactNode } from 'react';

const layoutStyles = css`
  display: flex;
  min-height: calc(100vh - 64px);

  .sidebar {
    width: 240px;
    background: white;
    border-right: 1px solid ${theme.colors.border};
    padding: ${theme.spacing.lg} 0;
    flex-shrink: 0;

    .sidebar-header {
      padding: 0 ${theme.spacing.lg} ${theme.spacing.lg};
      border-bottom: 1px solid ${theme.colors.borderLight};
      margin-bottom: ${theme.spacing.md};

      h2 {
        font-family: ${theme.fonts.heading};
        font-size: ${theme.fontSizes.md};
        font-weight: 700;
        color: ${theme.colors.primary};
        margin: 0;
      }

      p {
        font-size: 12px;
        color: ${theme.colors.textMuted};
        margin-top: 2px;
      }
    }

    .nav-item {
      display: flex;
      align-items: center;
      gap: 10px;
      padding: 10px ${theme.spacing.lg};
      font-size: ${theme.fontSizes.sm};
      color: ${theme.colors.textSecondary};
      text-decoration: none;
      transition: all ${theme.transitions.fast};
      border-left: 3px solid transparent;

      &:hover {
        background: ${theme.colors.bgSecondary};
        color: ${theme.colors.text};
      }

      &.active {
        background: ${theme.colors.primaryBg};
        color: ${theme.colors.primary};
        font-weight: 600;
        border-left-color: ${theme.colors.primary};
      }
    }
  }

  .main-content {
    flex: 1;
    padding: ${theme.spacing.xl} ${theme.spacing['2xl']};
    max-width: 1100px;
    overflow-x: hidden;
  }

  .auth-gate {
    display: flex;
    align-items: center;
    justify-content: center;
    flex: 1;
    text-align: center;
    padding: ${theme.spacing['3xl']};

    h2 { font-size: ${theme.fontSizes.xl}; margin-bottom: ${theme.spacing.md}; }
    p { color: ${theme.colors.textSecondary}; margin-bottom: ${theme.spacing.lg}; }

    .cta {
      padding: 12px 28px;
      background: ${theme.colors.primary};
      color: white;
      border: none;
      border-radius: ${theme.radii.md};
      font-weight: 600;
      cursor: pointer;
      &:hover { background: ${theme.colors.primaryDark}; }
    }
  }

  @media (max-width: 768px) {
    flex-direction: column;
    .sidebar {
      width: 100%;
      display: flex;
      overflow-x: auto;
      padding: ${theme.spacing.sm};
      border-right: none;
      border-bottom: 1px solid ${theme.colors.border};
      .sidebar-header { display: none; }
      .nav-item { white-space: nowrap; border-left: none; border-bottom: 3px solid transparent; padding: 8px 14px; }
      .nav-item.active { border-bottom-color: ${theme.colors.primary}; border-left-color: transparent; }
    }
  }
`;

const NAV_ITEMS = [
  { href: '/portal/dashboard', label: 'Dashboard', icon: '📊' },
  { href: '/portal/profile', label: 'My Profile', icon: '👤' },
  { href: '/portal/schedule', label: 'Schedule', icon: '📅' },
  { href: '/portal/appointments', label: 'Appointments', icon: '📋' },
];

export default function PortalLayout({ children }: { children: ReactNode }) {
  const { user, loading } = useAuth();
  const router = useRouter();
  const pathname = usePathname();

  if (loading) {
    return <div css={layoutStyles}><div className="auth-gate"><p>Loading...</p></div></div>;
  }

  if (!user) {
    return (
      <div css={layoutStyles}>
        <div className="auth-gate">
          <div>
            <h2>🩺 Doctor Portal</h2>
            <p>Sign in to access your doctor dashboard</p>
            <button className="cta" onClick={() => router.push('/login')}>Sign In</button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div css={layoutStyles}>
      <nav className="sidebar">
        <div className="sidebar-header">
          <h2>🩺 Doctor Portal</h2>
          <p>{user.email}</p>
        </div>
        {NAV_ITEMS.map((item) => (
          <Link
            key={item.href}
            href={item.href}
            className={`nav-item ${pathname === item.href ? 'active' : ''}`}
          >
            {item.icon} {item.label}
          </Link>
        ))}
      </nav>
      <div className="main-content">{children}</div>
    </div>
  );
}
