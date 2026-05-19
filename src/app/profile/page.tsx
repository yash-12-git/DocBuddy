/** @jsxImportSource @emotion/react */
'use client';

import { css } from '@emotion/react';
import { theme } from '@/lib/theme';
import { useAuth } from '@/contexts/AuthContext';
import { useRouter } from 'next/navigation';
import { useState, useEffect } from 'react';

const pageStyles = css`
  max-width: 700px;
  margin: 0 auto;
  padding: ${theme.spacing.lg} ${theme.spacing.base} ${theme.spacing['3xl']};

  @media (min-width: 768px) { padding: ${theme.spacing.xl} ${theme.spacing.lg} ${theme.spacing['3xl']}; }

  h1 { font-family: ${theme.fonts.heading}; font-size: ${theme.fontSizes['2xl']}; font-weight: 700; margin-bottom: ${theme.spacing.xl}; }

  .card {
    background: white; border-radius: ${theme.radii.xl};
    border: 1px solid ${theme.colors.border}; padding: ${theme.spacing.lg};
    margin-bottom: ${theme.spacing.lg};
    @media (min-width: 768px) { padding: ${theme.spacing.xl}; }
    h2 { font-family: ${theme.fonts.heading}; font-size: ${theme.fontSizes.lg}; font-weight: 700; margin: 0 0 ${theme.spacing.lg}; }
  }

  .profile-header {
    display: flex; align-items: center; gap: ${theme.spacing.base};
    margin-bottom: ${theme.spacing.xl};
    @media (min-width: 768px) { gap: ${theme.spacing.lg}; }

    .avatar {
      width: 64px; height: 64px;
      border-radius: 50%;
      background: linear-gradient(135deg, ${theme.colors.primaryBg}, ${theme.colors.primaryLight});
      display: flex; align-items: center; justify-content: center;
      font-size: 24px; font-weight: 700; color: ${theme.colors.primary};
      flex-shrink: 0;
      @media (min-width: 768px) { width: 80px; height: 80px; font-size: 32px; }
    }

    .info {
      min-width: 0;
      h2 { font-size: ${theme.fontSizes.lg}; margin-bottom: 2px; overflow: hidden; text-overflow: ellipsis; white-space: nowrap; }
      .email { color: ${theme.colors.textSecondary}; font-size: ${theme.fontSizes.xs}; overflow: hidden; text-overflow: ellipsis; white-space: nowrap; }
      .role {
        margin-top: 4px; font-size: 11px;
        background: ${theme.colors.primaryBg}; color: ${theme.colors.primary};
        padding: 3px 10px; border-radius: ${theme.radii.full};
        font-weight: 600; text-transform: uppercase; display: inline-block;
      }
    }
  }

  .form-group {
    margin-bottom: ${theme.spacing.base};
    label { display: block; font-size: ${theme.fontSizes.sm}; font-weight: 500; margin-bottom: 6px; }
    input, select {
      width: 100%; padding: 11px 14px;
      border: 1.5px solid ${theme.colors.border}; border-radius: ${theme.radii.md};
      font-size: 16px; outline: none; background: white;
      &:focus { border-color: ${theme.colors.primary}; }
      &:disabled { background: ${theme.colors.bgSecondary}; color: ${theme.colors.textMuted}; }
    }
  }

  .form-row {
    display: grid; grid-template-columns: 1fr; gap: ${theme.spacing.md};
    @media (min-width: 480px) { grid-template-columns: 1fr 1fr; }
  }

  .save-btn {
    padding: 12px 28px;
    background: ${theme.colors.primary}; color: white;
    border: none; border-radius: ${theme.radii.md};
    font-weight: 600; margin-top: ${theme.spacing.base};
    transition: all var(--transition-fast);
    &:hover { background: ${theme.colors.primaryDark}; }
    &:disabled { opacity: 0.5; cursor: not-allowed; }
  }

  .toast {
    position: fixed; bottom: 24px; left: 50%; transform: translateX(-50%);
    padding: 12px 24px;
    background: ${theme.colors.success}; color: white;
    border-radius: ${theme.radii.md}; font-weight: 600;
    font-size: ${theme.fontSizes.sm}; z-index: 1000;
    box-shadow: ${theme.shadows.lg};
  }

  .danger-zone {
    border-color: ${theme.colors.errorBg};
    h2 { color: ${theme.colors.error}; }
    .signout-btn {
      padding: 12px 28px; background: white;
      color: ${theme.colors.error}; border: 1.5px solid ${theme.colors.error};
      border-radius: ${theme.radii.md}; font-weight: 600;
      transition: all var(--transition-fast);
      &:hover { background: ${theme.colors.errorBg}; }
    }
  }
`;

export default function ProfilePage() {
  const { user, profile, signOut, updateUserProfile, loading } = useAuth();
  const router = useRouter();

  const [displayName, setDisplayName] = useState('');
  const [phone, setPhone] = useState('');
  const [dateOfBirth, setDateOfBirth] = useState('');
  const [gender, setGender] = useState('');
  const [saving, setSaving] = useState(false);
  const [showToast, setShowToast] = useState(false);

  useEffect(() => {
    if (!user && !loading) router.replace('/login');
  }, [user, loading, router]);

  useEffect(() => {
    if (profile) {
      setDisplayName(profile.displayName || '');
      setPhone(profile.phone || '');
      setDateOfBirth(profile.dateOfBirth || '');
      setGender(profile.gender || '');
    }
  }, [profile]);

  if (!user) return null;

  const initials = (profile?.displayName || 'U')
    .split(' ').map((n: string) => n[0]).join('').slice(0, 2).toUpperCase();

  const handleSave = async () => {
    setSaving(true);
    try {
      await updateUserProfile({
        displayName,
        phone: phone || null,
        dateOfBirth: dateOfBirth || null,
        gender: (gender as any) || null,
      });
      setShowToast(true);
      setTimeout(() => setShowToast(false), 3000);
    } catch (err) {
      console.error('Failed to save profile:', err);
    }
    setSaving(false);
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
            <input type="text" value={displayName} onChange={(e) => setDisplayName(e.target.value)} />
          </div>
          <div className="form-group">
            <label>Phone</label>
            <input type="tel" placeholder="+91 9876543210" value={phone} onChange={(e) => setPhone(e.target.value)} />
          </div>
        </div>

        <div className="form-group">
          <label>Email</label>
          <input type="email" value={profile?.email || ''} disabled />
        </div>

        <div className="form-row">
          <div className="form-group">
            <label>Date of Birth</label>
            <input type="date" value={dateOfBirth} onChange={(e) => setDateOfBirth(e.target.value)} />
          </div>
          <div className="form-group">
            <label>Gender</label>
            <select value={gender} onChange={(e) => setGender(e.target.value)}>
              <option value="">Select</option>
              <option value="male">Male</option>
              <option value="female">Female</option>
              <option value="other">Other</option>
            </select>
          </div>
        </div>

        <button className="save-btn" onClick={handleSave} disabled={saving}>
          {saving ? 'Saving...' : 'Save Changes'}
        </button>
      </div>

      <div className="card danger-zone">
        <h2>Account</h2>
        <p style={{ fontSize: 'var(--text-sm)', color: 'var(--color-text-secondary)', marginBottom: 'var(--space-base)' }}>
          Sign out of your DoctorHub account on this device.
        </p>
        <button className="signout-btn" onClick={async () => { await signOut(); router.push('/'); }}>
          Sign Out
        </button>
      </div>

      {showToast && <div className="toast">✓ Profile saved</div>}
    </div>
  );
}
