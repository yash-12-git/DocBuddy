/** @jsxImportSource @emotion/react */
'use client';

import { css } from '@emotion/react';
import { theme } from '@/lib/theme';
import { useAuth } from '@/contexts/AuthContext';
import { useCart } from '@/contexts/CartContext';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useState, useEffect, useRef } from 'react';

const navStyles = css`
  position: sticky;
  top: 0;
  z-index: 100;
  background: rgba(255, 255, 255, 0.92);
  backdrop-filter: blur(12px);
  border-bottom: 1px solid ${theme.colors.border};

  .nav-inner {
    max-width: 1200px;
    margin: 0 auto;
    padding: 0 ${theme.spacing.base};
    height: 56px;
    display: flex;
    align-items: center;
    justify-content: space-between;
    gap: ${theme.spacing.md};
  }

  .logo {
    display: flex;
    align-items: center;
    gap: ${theme.spacing.sm};
    text-decoration: none;
    font-family: ${theme.fonts.heading};
    font-weight: 700;
    font-size: ${theme.fontSizes.lg};
    color: ${theme.colors.primary};
    flex-shrink: 0;

    .logo-icon {
      width: 28px; height: 28px;
      background: ${theme.colors.primary};
      border-radius: ${theme.radii.sm};
      display: flex; align-items: center; justify-content: center;
      color: white; font-size: 16px;
    }
  }

  /* Desktop nav actions */
  .nav-actions {
    display: flex;
    align-items: center;
    gap: ${theme.spacing.sm};
  }

  .nav-link {
    color: ${theme.colors.textSecondary};
    text-decoration: none;
    font-size: ${theme.fontSizes.sm};
    font-weight: 500;
    padding: 6px 12px;
    border-radius: ${theme.radii.md};
    transition: all var(--transition-fast);
    white-space: nowrap;
    &:hover { color: ${theme.colors.primary}; background: ${theme.colors.primaryBg}; }
  }

  .cart-btn {
    position: relative;
    display: flex; align-items: center; gap: 4px;
    background: none;
    border: 1.5px solid ${theme.colors.border};
    border-radius: ${theme.radii.full};
    padding: 6px 12px;
    font-size: ${theme.fontSizes.sm};
    color: ${theme.colors.text};
    transition: all var(--transition-fast);
    &:hover { border-color: ${theme.colors.primary}; color: ${theme.colors.primary}; }

    .badge {
      position: absolute; top: -4px; right: -4px;
      background: ${theme.colors.accent}; color: white;
      font-size: 10px; font-weight: 700;
      width: 18px; height: 18px;
      border-radius: 50%;
      display: flex; align-items: center; justify-content: center;
    }
  }

  .auth-btn {
    background: ${theme.colors.primary}; color: white;
    border: none; border-radius: ${theme.radii.full};
    padding: 7px 18px;
    font-size: ${theme.fontSizes.sm}; font-weight: 600;
    transition: all var(--transition-fast);
    &:hover { background: ${theme.colors.primaryDark}; }
  }

  .user-menu {
    position: relative;
    display: flex; align-items: center; gap: 6px;
    padding: 4px 10px 4px 4px;
    border-radius: ${theme.radii.full};
    border: 1.5px solid ${theme.colors.border};
    background: none;
    font-size: ${theme.fontSizes.sm};
    color: ${theme.colors.text};
    transition: all var(--transition-fast);
    &:hover { border-color: ${theme.colors.primary}; }

    .avatar {
      width: 26px; height: 26px;
      border-radius: 50%;
      background: ${theme.colors.primaryBg};
      color: ${theme.colors.primary};
      display: flex; align-items: center; justify-content: center;
      font-weight: 700; font-size: 11px;
    }
  }

  .dropdown {
    position: absolute; top: calc(100% + 8px); right: 0;
    background: white;
    border-radius: ${theme.radii.lg};
    box-shadow: ${theme.shadows.xl};
    border: 1px solid ${theme.colors.border};
    padding: 6px; min-width: 200px; z-index: 200;

    a, button {
      display: block; width: 100%; text-align: left;
      padding: 10px 14px; border: none; background: none;
      font-size: ${theme.fontSizes.sm}; color: ${theme.colors.text};
      text-decoration: none; border-radius: ${theme.radii.md};
      &:hover { background: ${theme.colors.bgSecondary}; color: ${theme.colors.primary}; }
    }
    .divider { height: 1px; background: ${theme.colors.border}; margin: 4px 0; }
  }

  /* Mobile hamburger */
  .hamburger {
    display: none;
    width: 36px; height: 36px;
    background: none; border: none;
    flex-direction: column; justify-content: center; align-items: center; gap: 5px;

    span {
      display: block; width: 20px; height: 2px;
      background: ${theme.colors.text};
      border-radius: 2px;
      transition: all var(--transition-fast);
    }

    &.open span:nth-of-type(1) { transform: rotate(45deg) translate(5px, 5px); }
    &.open span:nth-of-type(2) { opacity: 0; }
    &.open span:nth-of-type(3) { transform: rotate(-45deg) translate(5px, -5px); }
  }

  /* Mobile menu overlay */
  .mobile-menu {
    display: none;
    position: fixed;
    top: 56px; left: 0; right: 0; bottom: 0;
    background: white;
    z-index: 150;
    padding: ${theme.spacing.lg};
    overflow-y: auto;
    animation: slideDown 200ms ease;

    @keyframes slideDown {
      from { opacity: 0; transform: translateY(-10px); }
      to { opacity: 1; transform: translateY(0); }
    }

    .mobile-nav-item {
      display: flex; align-items: center; gap: 10px;
      padding: 14px 0;
      border-bottom: 1px solid ${theme.colors.borderLight};
      font-size: ${theme.fontSizes.md}; font-weight: 500;
      color: ${theme.colors.text}; text-decoration: none;
    }

    .mobile-section-label {
      font-size: ${theme.fontSizes.xs}; font-weight: 600;
      color: ${theme.colors.textMuted}; text-transform: uppercase;
      letter-spacing: 0.5px; margin-top: ${theme.spacing.lg};
      margin-bottom: ${theme.spacing.sm};
    }

    .mobile-auth-btn {
      width: 100%; margin-top: ${theme.spacing.lg};
      padding: 14px; background: ${theme.colors.primary};
      color: white; border: none; border-radius: ${theme.radii.md};
      font-size: ${theme.fontSizes.md}; font-weight: 600;
    }

    .mobile-signout {
      width: 100%; margin-top: ${theme.spacing.base};
      padding: 14px; background: white;
      color: ${theme.colors.error}; border: 1.5px solid ${theme.colors.error};
      border-radius: ${theme.radii.md}; font-size: ${theme.fontSizes.sm}; font-weight: 600;
    }
  }

  /* Responsive */
  @media (max-width: 767px) {
    .desktop-only { display: none !important; }
    .hamburger { display: flex; }
    .mobile-menu.open { display: block; }
  }

  @media (min-width: 768px) {
    .nav-inner { height: 64px; padding: 0 ${theme.spacing.lg}; }
    .logo { font-size: ${theme.fontSizes.xl}; }
    .hamburger { display: none !important; }
    .mobile-menu { display: none !important; }
  }
`;

export default function Navbar() {
  const { user, profile, role, signOut, isAdmin, isDoctor } = useAuth();
  const { itemCount, toggleCart } = useCart();
  const [showDropdown, setShowDropdown] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);
  const router = useRouter();
  const dropdownRef = useRef<HTMLDivElement>(null);

  // Close dropdown on outside click
  useEffect(() => {
    function handleClick(e: MouseEvent) {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target as Node)) {
        setShowDropdown(false);
      }
    }
    document.addEventListener('mousedown', handleClick);
    return () => document.removeEventListener('mousedown', handleClick);
  }, []);

  // Close mobile menu on route change
  useEffect(() => { setMobileOpen(false); }, []);

  const initials = (profile?.displayName || 'U')
    .split(' ').map((n: string) => n[0]).join('').slice(0, 2).toUpperCase();

  const handleNavigate = (path: string) => {
    setShowDropdown(false);
    setMobileOpen(false);
    router.push(path);
  };

  return (
    <nav css={navStyles}>
      <div className="nav-inner">
        <Link href="/" className="logo">
          <span className="logo-icon">+</span>
          DoctorHub
        </Link>

        {/* Desktop navigation */}
        <div className="nav-actions desktop-only">
          <Link href="/search" className="nav-link">Find Doctors</Link>

          {user && (
            <button className="cart-btn" onClick={toggleCart}>
              🛒 Cart
              {itemCount > 0 && <span className="badge">{itemCount}</span>}
            </button>
          )}

          {!user ? (
            <button className="auth-btn" onClick={() => router.push('/login')}>Sign In</button>
          ) : (
            <div style={{ position: 'relative' }} ref={dropdownRef}>
              <button className="user-menu" onClick={() => setShowDropdown(!showDropdown)}>
                <span className="avatar">{initials}</span>
                <span className="hide-mobile">{profile?.displayName?.split(' ')[0] || 'User'}</span>
              </button>

              {showDropdown && (
                <div className="dropdown">
                  <Link href="/bookings" onClick={() => setShowDropdown(false)}>📋 My Bookings</Link>
                  <Link href="/profile" onClick={() => setShowDropdown(false)}>👤 Profile</Link>
                  {(isDoctor || isAdmin) && <div className="divider" />}
                  {isDoctor && <Link href="/portal/dashboard" onClick={() => setShowDropdown(false)}>🩺 Doctor Portal</Link>}
                  {isAdmin && <Link href="/admin/dashboard" onClick={() => setShowDropdown(false)}>🛡 Admin Panel</Link>}
                  <div className="divider" />
                  <button onClick={async () => { setShowDropdown(false); await signOut(); router.push('/'); }}>
                    Sign Out
                  </button>
                </div>
              )}
            </div>
          )}
        </div>

        {/* Mobile: cart + hamburger */}
        <div style={{ display: 'flex', alignItems: 'center', gap: 8 }} className="mobile-only">
          {user && (
            <button className="cart-btn" onClick={toggleCart} style={{ display: 'flex' }}>
              🛒
              {itemCount > 0 && <span className="badge">{itemCount}</span>}
            </button>
          )}
          <button className={`hamburger ${mobileOpen ? 'open' : ''}`} onClick={() => setMobileOpen(!mobileOpen)}>
            <span /><span /><span />
          </button>
        </div>
      </div>

      {/* Mobile slide-down menu */}
      <div className={`mobile-menu ${mobileOpen ? 'open' : ''}`}>
        <a className="mobile-nav-item" onClick={() => handleNavigate('/search')}>🔍 Find Doctors</a>

        {user ? (
          <>
            <a className="mobile-nav-item" onClick={() => handleNavigate('/bookings')}>📋 My Bookings</a>
            <a className="mobile-nav-item" onClick={() => handleNavigate('/profile')}>👤 Profile</a>

            {(isDoctor || isAdmin) && (
              <>
                <div className="mobile-section-label">Manage</div>
                {isDoctor && <a className="mobile-nav-item" onClick={() => handleNavigate('/portal/dashboard')}>🩺 Doctor Portal</a>}
                {isAdmin && <a className="mobile-nav-item" onClick={() => handleNavigate('/admin/dashboard')}>🛡 Admin Panel</a>}
              </>
            )}

            <button className="mobile-signout" onClick={async () => { setMobileOpen(false); await signOut(); router.push('/'); }}>
              Sign Out
            </button>
          </>
        ) : (
          <button className="mobile-auth-btn" onClick={() => handleNavigate('/login')}>
            Sign In / Register
          </button>
        )}
      </div>
    </nav>
  );
}
