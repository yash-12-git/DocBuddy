/** @jsxImportSource @emotion/react */
'use client';

import { css } from '@emotion/react';
import { theme } from '@/lib/theme';
import { useAuth } from '@/contexts/AuthContext';
import { useCart } from '@/contexts/CartContext';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useState } from 'react';

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
    padding: 0 ${theme.spacing.lg};
    height: 64px;
    display: flex;
    align-items: center;
    justify-content: space-between;
    gap: ${theme.spacing.lg};
  }

  .logo {
    display: flex;
    align-items: center;
    gap: ${theme.spacing.sm};
    text-decoration: none;
    font-family: ${theme.fonts.heading};
    font-weight: 700;
    font-size: ${theme.fontSizes.xl};
    color: ${theme.colors.primary};

    .logo-icon {
      width: 32px;
      height: 32px;
      background: ${theme.colors.primary};
      border-radius: ${theme.radii.md};
      display: flex;
      align-items: center;
      justify-content: center;
      color: white;
      font-size: 18px;
    }
  }

  .nav-actions {
    display: flex;
    align-items: center;
    gap: ${theme.spacing.md};
  }

  .nav-link {
    color: ${theme.colors.textSecondary};
    text-decoration: none;
    font-size: ${theme.fontSizes.sm};
    font-weight: 500;
    padding: ${theme.spacing.sm} ${theme.spacing.md};
    border-radius: ${theme.radii.md};
    transition: all ${theme.transitions.fast};

    &:hover {
      color: ${theme.colors.primary};
      background: ${theme.colors.primaryBg};
    }
  }

  .cart-btn {
    position: relative;
    display: flex;
    align-items: center;
    gap: 6px;
    background: none;
    border: 1.5px solid ${theme.colors.border};
    border-radius: ${theme.radii.full};
    padding: 8px 14px;
    cursor: pointer;
    font-size: ${theme.fontSizes.sm};
    color: ${theme.colors.text};
    transition: all ${theme.transitions.fast};

    &:hover {
      border-color: ${theme.colors.primary};
      color: ${theme.colors.primary};
    }

    .badge {
      position: absolute;
      top: -4px;
      right: -4px;
      background: ${theme.colors.accent};
      color: white;
      font-size: 11px;
      font-weight: 700;
      width: 20px;
      height: 20px;
      border-radius: 50%;
      display: flex;
      align-items: center;
      justify-content: center;
    }
  }

  .auth-btn {
    background: ${theme.colors.primary};
    color: white;
    border: none;
    border-radius: ${theme.radii.full};
    padding: 8px 20px;
    font-size: ${theme.fontSizes.sm};
    font-weight: 600;
    cursor: pointer;
    transition: all ${theme.transitions.fast};

    &:hover {
      background: ${theme.colors.primaryDark};
      transform: translateY(-1px);
    }
  }

  .user-menu {
    position: relative;
    display: flex;
    align-items: center;
    gap: ${theme.spacing.sm};
    cursor: pointer;
    padding: 6px 12px;
    border-radius: ${theme.radii.full};
    border: 1.5px solid ${theme.colors.border};
    background: none;
    font-size: ${theme.fontSizes.sm};
    color: ${theme.colors.text};
    transition: all ${theme.transitions.fast};

    &:hover {
      border-color: ${theme.colors.primary};
    }

    .avatar {
      width: 28px;
      height: 28px;
      border-radius: 50%;
      background: ${theme.colors.primaryBg};
      color: ${theme.colors.primary};
      display: flex;
      align-items: center;
      justify-content: center;
      font-weight: 700;
      font-size: 12px;
    }
  }

  .dropdown {
    position: absolute;
    top: calc(100% + 8px);
    right: 0;
    background: white;
    border-radius: ${theme.radii.lg};
    box-shadow: ${theme.shadows.xl};
    border: 1px solid ${theme.colors.border};
    padding: ${theme.spacing.sm};
    min-width: 200px;
    z-index: 200;

    a, button {
      display: block;
      width: 100%;
      text-align: left;
      padding: 10px 14px;
      border: none;
      background: none;
      font-size: ${theme.fontSizes.sm};
      color: ${theme.colors.text};
      text-decoration: none;
      border-radius: ${theme.radii.md};
      cursor: pointer;

      &:hover {
        background: ${theme.colors.bgSecondary};
        color: ${theme.colors.primary};
      }
    }

    .divider {
      height: 1px;
      background: ${theme.colors.border};
      margin: ${theme.spacing.sm} 0;
    }
  }
`;

export default function Navbar() {
  const { user, profile, signOut } = useAuth();
  const { itemCount, toggleCart } = useCart();
  const [showDropdown, setShowDropdown] = useState(false);
  const router = useRouter();

  const initials = profile?.displayName
    ? profile.displayName.split(' ').map((n: string) => n[0]).join('').slice(0, 2).toUpperCase()
    : '?';

  return (
    <nav css={navStyles}>
      <div className="nav-inner">
        <Link href="/" className="logo">
          <span className="logo-icon">+</span>
          DoctorHub
        </Link>

        <div className="nav-actions">
          <Link href="/search" className="nav-link">
            Find Doctors
          </Link>

          {user && (
            <button className="cart-btn" onClick={toggleCart}>
              🛒 Cart
              {itemCount > 0 && <span className="badge">{itemCount}</span>}
            </button>
          )}

          {!user ? (
            <button className="auth-btn" onClick={() => router.push('/login')}>
              Sign In
            </button>
          ) : (
            <div style={{ position: 'relative' }}>
              <button
                className="user-menu"
                onClick={() => setShowDropdown(!showDropdown)}
              >
                <span className="avatar">{initials}</span>
                {profile?.displayName?.split(' ')[0] || 'User'}
              </button>

              {showDropdown && (
                <div className="dropdown">
                  <Link href="/bookings" onClick={() => setShowDropdown(false)}>
                    My Bookings
                  </Link>
                  <Link href="/profile" onClick={() => setShowDropdown(false)}>
                    Profile
                  </Link>
                  <div className="divider" />
                  <button
                    onClick={() => {
                      setShowDropdown(false);
                      signOut();
                      router.push('/');
                    }}
                  >
                    Sign Out
                  </button>
                </div>
              )}
            </div>
          )}
        </div>
      </div>
    </nav>
  );
}
