/** @jsxImportSource @emotion/react */
'use client';

import { css } from '@emotion/react';
import { theme } from '@/lib/theme';
import { useAuth } from '@/contexts/AuthContext';
import { useRouter } from 'next/navigation';
import { useState } from 'react';

const pageStyles = css`
  max-width: 700px;
  margin: 0 auto;
  padding: ${theme.spacing.xl} ${theme.spacing.lg} ${theme.spacing['3xl']};

  h1 {
    font-family: ${theme.fonts.heading};
    font-size: ${theme.fontSizes['2xl']};
    font-weight: 700;
    margin-bottom: ${theme.spacing.xl};
  }

  .card {
    background: white;
    border-radius: ${theme.radii.xl};
    border: 1px solid ${theme.colors.border};
    padding: ${theme.spacing.xl};
    margin-bottom: ${theme.spacing.lg};

    h2 {
      font-family: ${theme.fonts.heading};
      font-size: ${theme.fontSizes.lg};
      font-weight: 700;
      margin: 0 0 ${theme.spacing.lg};
    }
  }

  .profile-header {
    display: flex;
    align-items: center;
    gap: ${theme.spacing.lg};
    margin-bottom: ${theme.spacing.xl};

    .avatar {
      width: 80px;
      height: 80px;
      border-radius: 50%;
      background: linear-gradient(135deg, ${theme.colors.primaryBg}, ${theme.colors.primaryLight}30);
      display: flex;
      align-items: center;
      justify-content: center;
      font-size: 32px;
      font-weight: 700;
      color: ${theme.colors.primary};
    }

    .info {
      h2 {
        font-size: ${theme.fontSizes.xl};
        margin-bottom: 4px;
      }
      .email {
        color: ${theme.colors.textSecondary};
        font-size: ${theme.fontSizes.sm};
      }
      .role {
        margin-top: 4px;
        font-size: 11px;
        background: ${theme.colors.primaryBg};
        color: ${theme.colors.primary};
        padding: 3px 10px;
        border-radius: ${theme.radii.full};
        font-weight: 600;
        text-transform: uppercase;
        display: inline-block;
      }
    }
  }

  .form-group {
    margin-bottom: ${theme.spacing.base};
    label {
      display: block;
      font-size: ${theme.fontSizes.sm};
      font-weight: 500;
      margin-bottom: 6px;
      color: ${theme.colors.text};
    }
    input {
      width: 100%;
      padding: 11px 14px;
      border: 1.5px solid ${theme.colors.border};
      border-radius: ${theme.radii.md};
      font-size: ${theme.fontSizes.base};
      outline: none;
      &:focus { border-color: ${theme.colors.primary}; }
      &:disabled { background: ${theme.colors.bgSecondary}; color: ${theme.colors.textMuted}; }
    }
  }

  .form-row {
    display: grid;
    grid-template-columns: 1fr 1fr;
    gap: ${theme.spacing.md};
  }

  .save-btn {
    padding: 12px 28px;
    background: ${theme.colors.primary};
    color: white;
    border: none;
    border-radius: ${theme.radii.md};
    font-weight: 600;
    cursor: pointer;
    margin-top: ${theme.spacing.base};
    &:hover { background: ${theme.colors.primaryDark}; }
  }

  .danger-zone {
    border-color: ${theme.colors.error}20;

    h2 { color: ${theme.colors.error}; }

    .signout-btn {
      padding: 12px 28px;
      background: white;
      color: ${theme.colors.error};
      border: 1.5px solid ${theme.colors.error}40;
      border-radius: ${theme.radii.md};
      font-weight: 600;
      cursor: pointer;
      &:hover { background: ${theme.colors.errorBg}; }
    }
  }
`;

export default function ProfilePage() {
  const { user, profile, signOut } = useAuth();
  const router = useRouter();
  const [saved, setSaved] = useState(false);

  if (!user) {
    router.push('/login');
    return null;
  }

  const initials = (profile?.displayName || 'U')
    .split(' ').map((n: string) => n[0]).join('').slice(0, 2).toUpperCase();

  const handleSave = () => {
    setSaved(true);
    setTimeout(() => setSaved(false), 2000);
  };

  return (
    <div css={pageStyles}>
      <h1>Profile</h1>

      <div className="card">
        <div className="profile-header">
          <div className="avatar">{initials}</div>
          <div className="info">
            <h2>{profile?.displayName || 'User'}</h2>
            <div className="email">{profile?.email}</div>
            <div className="role">{profile?.role || 'user'}</div>
          </div>
        </div>

        <div className="form-row">
          <div className="form-group">
            <label>Full Name</label>
            <input type="text" defaultValue={profile?.displayName || ''} />
          </div>
          <div className="form-group">
            <label>Phone</label>
            <input type="tel" placeholder="+91 9876543210" />
          </div>
        </div>

        <div className="form-group">
          <label>Email</label>
          <input type="email" value={profile?.email || ''} disabled />
        </div>

        <div className="form-row">
          <div className="form-group">
            <label>Date of Birth</label>
            <input type="date" />
          </div>
          <div className="form-group">
            <label>Gender</label>
            <input type="text" placeholder="Male / Female / Other" />
          </div>
        </div>

        <button className="save-btn" onClick={handleSave}>
          {saved ? '✓ Saved!' : 'Save Changes'}
        </button>
      </div>

      <div className="card danger-zone">
        <h2>Account</h2>
        <p style={{ fontSize: theme.fontSizes.sm, color: theme.colors.textSecondary, marginBottom: theme.spacing.base }}>
          Sign out of your DoctorHub account on this device.
        </p>
        <button
          className="signout-btn"
          onClick={async () => {
            await signOut();
            router.push('/');
          }}
        >
          Sign Out
        </button>
      </div>
    </div>
  );
}
