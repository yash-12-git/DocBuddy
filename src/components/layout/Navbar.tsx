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
  height: 56px;
  background: rgba(255, 255, 255, 0.96);
  backdrop-filter: blur(16px);
  -webkit-backdrop-filter: blur(16px);
  border-bottom: 1px solid ${theme.colors.border};

  .nav-inner {
    max-width: 1200px;
    margin: 0 auto;
    padding: 0 16px;
    height: 56px;
    display: flex;
    align-items: center;
    justify-content: space-between;
    gap: 12px;
  }

  /* ─── Logo ─── */
  .logo {
    display: flex;
    align-items: center;
    gap: 8px;
    text-decoration: none;
    font-family: ${theme.fonts.heading};
    font-weight: 800;
    font-size: 18px;
    color: ${theme.colors.primary};
    flex-shrink: 0;
    letter-spacing: -0.3px;

    .logo-icon {
      width: 30px; height: 30px;
      background: ${theme.colors.primary};
      border-radius: 8px;
      display: flex; align-items: center; justify-content: center;
      color: white; font-size: 17px; font-weight: 700;
      box-shadow: 0 2px 8px ${theme.colors.primary}40;
    }
  }

  /* ─── Desktop nav ─── */
  .nav-center {
    display: flex;
    align-items: center;
    gap: 4px;
    flex: 1;
    max-width: 420px;
  }

  .nav-link {
    color: ${theme.colors.textSecondary};
    text-decoration: none;
    font-size: 14px;
    font-weight: 500;
    padding: 7px 14px;
    border-radius: 8px;
    transition: all 0.15s ease;
    white-space: nowrap;
    &:hover {
      color: ${theme.colors.primary};
      background: ${theme.colors.primaryBg};
    }
  }

  .nav-right {
    display: flex;
    align-items: center;
    gap: 8px;
    flex-shrink: 0;
  }

  .cart-btn {
    position: relative;
    display: flex; align-items: center; gap: 6px;
    background: none;
    border: 1.5px solid ${theme.colors.border};
    border-radius: 100px;
    padding: 7px 14px;
    font-size: 13px; font-weight: 500;
    color: ${theme.colors.text};
    transition: all 0.15s ease;
    cursor: pointer;
    white-space: nowrap;

    &:hover {
      border-color: ${theme.colors.primary};
      color: ${theme.colors.primary};
      background: ${theme.colors.primaryBg};
    }

    .badge {
      position: absolute; top: -5px; right: -5px;
      background: ${theme.colors.accent}; color: white;
      font-size: 10px; font-weight: 700;
      min-width: 18px; height: 18px;
      border-radius: 100px;
      display: flex; align-items: center; justify-content: center;
      padding: 0 4px;
      border: 2px solid white;
    }
  }

  .auth-btn {
    background: ${theme.colors.primary}; color: white;
    border: none; border-radius: 100px;
    padding: 8px 20px;
    font-size: 14px; font-weight: 600;
    cursor: pointer;
    transition: all 0.15s ease;
    white-space: nowrap;
    &:hover { background: ${theme.colors.primaryDark}; }
  }

  /* ─── Desktop user menu ─── */
  .user-menu-wrap { position: relative; }

  .user-menu-btn {
    display: flex; align-items: center; gap: 8px;
    padding: 5px 12px 5px 5px;
    border-radius: 100px;
    border: 1.5px solid ${theme.colors.border};
    background: none;
    font-size: 13px; font-weight: 500;
    color: ${theme.colors.text};
    cursor: pointer;
    transition: all 0.15s ease;
    &:hover { border-color: ${theme.colors.primary}; background: ${theme.colors.primaryBg}; }

    .avatar {
      width: 28px; height: 28px;
      border-radius: 50%;
      background: ${theme.colors.primaryBg};
      color: ${theme.colors.primary};
      display: flex; align-items: center; justify-content: center;
      font-weight: 700; font-size: 11px;
    }
    .user-name {
      max-width: 100px;
      overflow: hidden; text-overflow: ellipsis; white-space: nowrap;
    }
    .chevron {
      font-size: 10px; color: ${theme.colors.textMuted};
      transition: transform 0.15s ease;
    }
  }

  .dropdown {
    position: absolute; top: calc(100% + 10px); right: 0;
    background: white;
    border-radius: 14px;
    box-shadow: 0 8px 30px rgba(0,0,0,0.12), 0 2px 8px rgba(0,0,0,0.06);
    border: 1px solid ${theme.colors.border};
    padding: 6px; min-width: 210px; z-index: 200;

    .dropdown-header {
      padding: 10px 12px 8px;
      border-bottom: 1px solid ${theme.colors.borderLight};
      margin-bottom: 4px;
      .dropdown-name { font-weight: 600; font-size: 13px; color: ${theme.colors.text}; }
      .dropdown-role { font-size: 11px; color: ${theme.colors.textMuted}; margin-top: 1px; }
    }

    a, .dropdown-btn {
      display: flex; align-items: center; gap: 10px;
      width: 100%; text-align: left;
      padding: 9px 12px; border: none; background: none;
      font-size: 13px; color: ${theme.colors.text};
      text-decoration: none; border-radius: 8px;
      cursor: pointer; transition: all 0.12s ease;
      .item-icon { font-size: 15px; width: 20px; text-align: center; }
      &:hover { background: ${theme.colors.bgSecondary}; color: ${theme.colors.primary}; }
      &.danger { color: ${theme.colors.error}; &:hover { background: #FFF0F0; } }
    }
    .divider { height: 1px; background: ${theme.colors.borderLight}; margin: 4px 0; }
  }

  /* ─── Hamburger: always inline-flex, visibility controlled by JS via inline style ─── */
  .hamburger {
    width: 40px; height: 40px;
    background: none;
    border: 1.5px solid ${theme.colors.border};
    border-radius: 10px;
    display: flex;           /* always flex — parent (mobile-right) is hidden on desktop */
    flex-direction: column;
    justify-content: center;
    align-items: center;
    gap: 5px;
    cursor: pointer;
    padding: 0;
    transition: all 0.15s ease;
    -webkit-tap-highlight-color: transparent;

    &:hover { border-color: ${theme.colors.primary}; background: ${theme.colors.primaryBg}; }

    span {
      display: block; width: 18px; height: 2px;
      background: ${theme.colors.text};
      border-radius: 2px;
      transition: all 0.2s ease;
      transform-origin: center;
    }

    &.open {
      border-color: ${theme.colors.primary};
      background: ${theme.colors.primaryBg};
      span:nth-of-type(1) { transform: rotate(45deg) translate(5px, 5px); background: ${theme.colors.primary}; }
      span:nth-of-type(2) { opacity: 0; transform: scaleX(0); }
      span:nth-of-type(3) { transform: rotate(-45deg) translate(5px, -5px); background: ${theme.colors.primary}; }
    }
  }

  /* ─── Mobile menu overlay (display toggled via inline style in JSX) ─── */
  .mobile-menu {
    position: fixed;
    height: 100vh;
    top: 56px; left: 0; right: 0; bottom: 0;
    background: white;
    z-index: 150;
    overflow-y: auto;
    -webkit-overflow-scrolling: touch;
    animation: slideDown 180ms ease;

    @keyframes slideDown {
      from { opacity: 0; transform: translateY(-8px); }
      to   { opacity: 1; transform: translateY(0); }
    }

    .mobile-menu-inner {
      padding: 8px 16px 40px;
    }

    .mobile-user-info {
      display: flex; align-items: center; gap: 12px;
      padding: 16px 8px 14px;
      border-bottom: 1px solid ${theme.colors.borderLight};
      margin-bottom: 4px;

      .big-avatar {
        width: 44px; height: 44px; border-radius: 50%;
        background: ${theme.colors.primaryBg}; color: ${theme.colors.primary};
        display: flex; align-items: center; justify-content: center;
        font-weight: 700; font-size: 15px; flex-shrink: 0;
      }
      .name { font-weight: 600; font-size: 15px; color: ${theme.colors.text}; }
      .role { font-size: 12px; color: ${theme.colors.textMuted}; margin-top: 2px; }
    }

    .mobile-section-label {
      font-size: 11px; font-weight: 600;
      color: ${theme.colors.textMuted}; text-transform: uppercase;
      letter-spacing: 0.6px; padding: 16px 8px 6px;
    }

    .mobile-nav-item {
      display: flex; align-items: center; gap: 14px;
      padding: 13px 8px; border-radius: 12px;
      font-size: 15px; font-weight: 500;
      color: ${theme.colors.text}; text-decoration: none;
      cursor: pointer; transition: all 0.12s ease;
      border: none; background: none; width: 100%; text-align: left;
      -webkit-tap-highlight-color: transparent;

      .item-icon { font-size: 18px; width: 22px; text-align: center; flex-shrink: 0; }
      .item-label { flex: 1; }
      .item-arrow { font-size: 14px; color: ${theme.colors.textMuted}; }

      &:active { background: ${theme.colors.primaryBg}; color: ${theme.colors.primary}; }
    }

    .mobile-divider { height: 1px; background: ${theme.colors.borderLight}; margin: 6px 0; }

    .mobile-signout {
      display: flex; align-items: center; gap: 14px;
      width: 100%; text-align: left; padding: 13px 8px;
      border-radius: 12px; border: none; background: none;
      font-size: 15px; font-weight: 500;
      color: ${theme.colors.error}; cursor: pointer;
      -webkit-tap-highlight-color: transparent;
      .item-icon { font-size: 18px; width: 22px; text-align: center; flex-shrink: 0; }
      &:active { background: #FFF0F0; }
    }

    .mobile-auth-section {
      padding: 16px 0 8px;

      .mobile-sign-in-btn {
        width: 100%; padding: 15px;
        background: ${theme.colors.primary}; color: white;
        border: none; border-radius: 14px;
        font-size: 16px; font-weight: 600;
        cursor: pointer;
        &:active { background: ${theme.colors.primaryDark}; }
      }
      .sub { text-align: center; font-size: 12px; color: ${theme.colors.textMuted}; margin-top: 8px; }
    }
  }

  /* ─── Responsive: only hide/show wrappers, NOT individual buttons ─── */
  @media (max-width: 767px) {
    .desktop-nav-center,
    .desktop-nav-right { display: none !important; }
  }

  @media (min-width: 768px) {
    height: 64px;
    .mobile-nav-right { display: none !important; }
    .nav-inner { height: 64px; padding: 0 32px; }
    .logo { font-size: 20px; }
    .logo .logo-icon { width: 34px; height: 34px; }
  }
`;

export default function Navbar() {
  const { user, profile, signOut, isAdmin, isDoctor } = useAuth();
  const { itemCount, toggleCart } = useCart();
  const [showDropdown, setShowDropdown] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);
  const router = useRouter();
  const dropdownRef = useRef<HTMLDivElement>(null);

  // Close desktop dropdown on outside click
  useEffect(() => {
    function handleClick(e: MouseEvent) {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target as Node)) {
        setShowDropdown(false);
      }
    }
    document.addEventListener('mousedown', handleClick);
    return () => document.removeEventListener('mousedown', handleClick);
  }, []);

  // Lock body scroll when mobile menu is open
  useEffect(() => {
    document.body.style.overflow = mobileOpen ? 'hidden' : '';
    return () => { document.body.style.overflow = ''; };
  }, [mobileOpen]);

  const initials = (profile?.displayName || 'U')
    .split(' ').map((n: string) => n[0]).join('').slice(0, 2).toUpperCase();
  const firstName = profile?.displayName?.split(' ')[0] || 'User';
  const roleLabel = isAdmin ? 'Admin' : isDoctor ? 'Doctor' : 'Patient';

  const navigate = (path: string) => {
    setShowDropdown(false);
    setMobileOpen(false);
    router.push(path);
  };

  const handleSignOut = async () => {
    setShowDropdown(false);
    setMobileOpen(false);
    await signOut();
    router.push('/');
  };

  return (
    <nav css={navStyles}>
      <div className="nav-inner">
        {/* Logo */}
        <Link href="/" className="logo">
          <span className="logo-icon">+</span>
          DoctorHub
        </Link>

        {/* Desktop: center links — hidden on mobile via .desktop-nav-center */}
        <div className="nav-center desktop-nav-center">
          <Link href="/search" className="nav-link">Find Doctors</Link>
        </div>

        {/* Desktop: right actions — hidden on mobile via .desktop-nav-right */}
        <div className="nav-right desktop-nav-right">
          {user && (
            <button className="cart-btn" onClick={toggleCart} aria-label={`Cart, ${itemCount} items`}>
              🛒 Cart
              {itemCount > 0 && <span className="badge">{itemCount}</span>}
            </button>
          )}
          {!user ? (
            <button className="auth-btn" onClick={() => router.push('/login')}>Sign In</button>
          ) : (
            <div className="user-menu-wrap" ref={dropdownRef}>
              <button
                className="user-menu-btn"
                onClick={() => setShowDropdown(v => !v)}
                aria-expanded={showDropdown}
              >
                <span className="avatar">{initials}</span>
                <span className="user-name">{firstName}</span>
                <span className="chevron" style={{ transform: showDropdown ? 'rotate(180deg)' : undefined }}>▼</span>
              </button>
              {showDropdown && (
                <div className="dropdown">
                  <div className="dropdown-header">
                    <div className="dropdown-name">{profile?.displayName || 'User'}</div>
                    <div className="dropdown-role">{roleLabel}</div>
                  </div>
                  <Link href="/bookings" onClick={() => setShowDropdown(false)}>
                    <span className="item-icon">📋</span> My Bookings
                  </Link>
                  <Link href="/profile" onClick={() => setShowDropdown(false)}>
                    <span className="item-icon">👤</span> Profile
                  </Link>
                  {(isDoctor || isAdmin) && <div className="divider" />}
                  {isDoctor && (
                    <Link href="/portal/dashboard" onClick={() => setShowDropdown(false)}>
                      <span className="item-icon">🩺</span> Doctor Portal
                    </Link>
                  )}
                  {isAdmin && (
                    <Link href="/admin/dashboard" onClick={() => setShowDropdown(false)}>
                      <span className="item-icon">🛡</span> Admin Panel
                    </Link>
                  )}
                  <div className="divider" />
                  <button className="dropdown-btn danger" onClick={handleSignOut}>
                    <span className="item-icon">🚪</span> Sign Out
                  </button>
                </div>
              )}
            </div>
          )}
        </div>

        {/* Mobile: cart + hamburger — hidden on desktop via .mobile-nav-right */}
        <div className="nav-right mobile-nav-right">
          {user && (
            <button
              className="cart-btn"
              onClick={toggleCart}
              style={{ padding: '7px 10px' }}
              aria-label={`Cart, ${itemCount} items`}
            >
              🛒
              {itemCount > 0 && <span className="badge">{itemCount}</span>}
            </button>
          )}
          <button
            className={`hamburger${mobileOpen ? ' open' : ''}`}
            onClick={() => setMobileOpen(v => !v)}
            aria-label={mobileOpen ? 'Close menu' : 'Open menu'}
            type="button"
          >
            <span /><span /><span />
          </button>
        </div>
      </div>

      {/* Mobile full-screen menu — display controlled directly via inline style (no CSS class toggling) */}
      {mobileOpen && (
        <div className="mobile-menu" role="dialog" aria-modal="true">
          <div className="mobile-menu-inner">
            {user && (
              <div className="mobile-user-info">
                <div className="big-avatar">{initials}</div>
                <div>
                  <div className="name">{profile?.displayName || 'User'}</div>
                  <div className="role">{roleLabel}</div>
                </div>
              </div>
            )}

            <div className="mobile-section-label">Navigation</div>
            <button className="mobile-nav-item" onClick={() => navigate('/search')}>
              <span className="item-icon">🔍</span>
              <span className="item-label">Find Doctors</span>
              <span className="item-arrow">›</span>
            </button>

            {user ? (
              <>
                <button className="mobile-nav-item" onClick={() => navigate('/bookings')}>
                  <span className="item-icon">📋</span>
                  <span className="item-label">My Bookings</span>
                  <span className="item-arrow">›</span>
                </button>
                <button className="mobile-nav-item" onClick={() => navigate('/profile')}>
                  <span className="item-icon">👤</span>
                  <span className="item-label">Profile</span>
                  <span className="item-arrow">›</span>
                </button>

                {(isDoctor || isAdmin) && (
                  <>
                    <div className="mobile-section-label">Manage</div>
                    {isDoctor && (
                      <button className="mobile-nav-item" onClick={() => navigate('/portal/dashboard')}>
                        <span className="item-icon">🩺</span>
                        <span className="item-label">Doctor Portal</span>
                        <span className="item-arrow">›</span>
                      </button>
                    )}
                    {isAdmin && (
                      <button className="mobile-nav-item" onClick={() => navigate('/admin/dashboard')}>
                        <span className="item-icon">🛡</span>
                        <span className="item-label">Admin Panel</span>
                        <span className="item-arrow">›</span>
                      </button>
                    )}
                  </>
                )}

                <div className="mobile-divider" style={{ marginTop: 12 }} />
                <button className="mobile-signout" onClick={handleSignOut}>
                  <span className="item-icon">🚪</span>
                  Sign Out
                </button>
              </>
            ) : (
              <div className="mobile-auth-section">
                <button className="mobile-sign-in-btn" onClick={() => navigate('/login')}>
                  Sign In / Register
                </button>
                <p className="sub">Book appointments with top doctors</p>
              </div>
            )}
          </div>
        </div>
      )}
    </nav>
  );
}
