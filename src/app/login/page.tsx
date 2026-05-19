/** @jsxImportSource @emotion/react */
'use client';

import { css } from '@emotion/react';
import { theme } from '@/lib/theme';
import { useAuth } from '@/contexts/AuthContext';
import { LoginSchema, RegisterSchema } from '@/schemas';
import { useRouter } from 'next/navigation';
import { useState, useEffect } from 'react';

const pageStyles = css`
  min-height: calc(100dvh - 56px);
  display: flex;
  align-items: center;
  justify-content: center;
  padding: ${theme.spacing.base};
  background: linear-gradient(135deg, ${theme.colors.primaryBg} 0%, white 100%);

  .auth-card {
    width: 100%;
    max-width: 420px;
    background: white;
    border-radius: ${theme.radii.xl};
    box-shadow: ${theme.shadows.lg};
    border: 1px solid ${theme.colors.border};
    padding: ${theme.spacing.lg};

    @media (min-width: 768px) {
      padding: ${theme.spacing['2xl']};
    }

    .logo {
      text-align: center;
      margin-bottom: ${theme.spacing.xl};
      .icon {
        width: 44px; height: 44px;
        background: ${theme.colors.primary};
        border-radius: ${theme.radii.lg};
        display: inline-flex; align-items: center; justify-content: center;
        color: white; font-size: 22px;
        margin-bottom: ${theme.spacing.sm};
      }
      h1 { font-family: ${theme.fonts.heading}; font-size: ${theme.fontSizes['2xl']}; font-weight: 700; margin: 0; }
      p { color: ${theme.colors.textSecondary}; font-size: ${theme.fontSizes.sm}; margin-top: 4px; }
    }

    .tabs {
      display: flex; gap: 0;
      margin-bottom: ${theme.spacing.xl};
      background: ${theme.colors.bgSecondary};
      border-radius: ${theme.radii.md}; padding: 3px;
      button {
        flex: 1; padding: 10px; border: none; background: transparent;
        border-radius: ${theme.radii.sm}; font-size: ${theme.fontSizes.sm};
        font-weight: 500; color: ${theme.colors.textSecondary};
        transition: all var(--transition-fast);
        &.active { background: white; color: ${theme.colors.text}; box-shadow: ${theme.shadows.sm}; font-weight: 600; }
      }
    }

    .form-group {
      margin-bottom: ${theme.spacing.base};
      label { display: block; font-size: ${theme.fontSizes.sm}; font-weight: 500; margin-bottom: 6px; }
      input {
        width: 100%; padding: 11px 14px;
        border: 1.5px solid ${theme.colors.border}; border-radius: ${theme.radii.md};
        font-size: 16px; outline: none;
        transition: border-color var(--transition-fast);
        &:focus { border-color: ${theme.colors.primary}; }
      }
      .field-error { color: ${theme.colors.error}; font-size: 12px; margin-top: 4px; }
    }

    .submit-btn {
      width: 100%; padding: 13px;
      background: ${theme.colors.primary}; color: white;
      border: none; border-radius: ${theme.radii.md};
      font-size: ${theme.fontSizes.base}; font-weight: 600;
      transition: all var(--transition-fast);
      margin-top: ${theme.spacing.base};
      &:hover { background: ${theme.colors.primaryDark}; }
      &:disabled { opacity: 0.6; cursor: not-allowed; }
    }

    .divider {
      display: flex; align-items: center; gap: ${theme.spacing.base};
      margin: ${theme.spacing.lg} 0;
      color: ${theme.colors.textMuted}; font-size: ${theme.fontSizes.xs};
      &::before, &::after { content: ''; flex: 1; height: 1px; background: ${theme.colors.border}; }
    }

    .google-btn {
      width: 100%; padding: 12px;
      border: 1.5px solid ${theme.colors.border}; border-radius: ${theme.radii.md};
      background: white; font-size: ${theme.fontSizes.sm}; font-weight: 500;
      display: flex; align-items: center; justify-content: center; gap: 10px;
      transition: all var(--transition-fast);
      &:hover { border-color: ${theme.colors.textMuted}; background: ${theme.colors.bgSecondary}; }
    }

    .error-banner {
      background: ${theme.colors.errorBg}; color: ${theme.colors.error};
      padding: 10px 14px; border-radius: ${theme.radii.md};
      font-size: ${theme.fontSizes.sm}; margin-bottom: ${theme.spacing.base}; text-align: center;
    }
  }
`;

export default function LoginPage() {
  const { signIn, signUp, signInWithGoogle, error, clearError, loading, user } = useAuth();
  const router = useRouter();

  const [tab, setTab] = useState<'login' | 'register'>('login');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [name, setName] = useState('');
  const [fieldErrors, setFieldErrors] = useState<Record<string, string>>({});

  // Auth guard: redirect if already logged in
  useEffect(() => {
    if (user && !loading) {
      router.replace('/');
    }
  }, [user, loading, router]);

  if (user) return null;

  const switchTab = (t: 'login' | 'register') => {
    setTab(t);
    clearError();
    setFieldErrors({});
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setFieldErrors({});
    clearError();

    if (tab === 'login') {
      const result = LoginSchema.safeParse({ email, password });
      if (!result.success) {
        const errs: Record<string, string> = {};
        result.error.issues.forEach((e) => { errs[e.path[0] as string] = e.message; });
        setFieldErrors(errs);
        return;
      }
      try {
        await signIn(email, password);
        router.push('/');
      } catch {}
    } else {
      const result = RegisterSchema.safeParse({ email, password, displayName: name });
      if (!result.success) {
        const errs: Record<string, string> = {};
        result.error.issues.forEach((e) => { errs[e.path[0] as string] = e.message; });
        setFieldErrors(errs);
        return;
      }
      try {
        await signUp(email, password, name);
        router.push('/');
      } catch {}
    }
  };

  const handleGoogle = async () => {
    try {
      await signInWithGoogle();
      router.push('/');
    } catch {}
  };

  return (
    <div css={pageStyles}>
      <div className="auth-card">
        <div className="logo">
          <div className="icon">+</div>
          <h1>DoctorHub</h1>
          <p>{tab === 'login' ? 'Welcome back' : 'Create your account'}</p>
        </div>

        <div className="tabs">
          <button className={tab === 'login' ? 'active' : ''} onClick={() => switchTab('login')}>Sign In</button>
          <button className={tab === 'register' ? 'active' : ''} onClick={() => switchTab('register')}>Register</button>
        </div>

        {error && <div className="error-banner">{error}</div>}

        <form onSubmit={handleSubmit}>
          {tab === 'register' && (
            <div className="form-group">
              <label>Full Name</label>
              <input type="text" placeholder="John Doe" value={name} onChange={(e) => setName(e.target.value)} />
              {fieldErrors.displayName && <div className="field-error">{fieldErrors.displayName}</div>}
            </div>
          )}
          <div className="form-group">
            <label>Email</label>
            <input type="email" placeholder="you@example.com" value={email} onChange={(e) => setEmail(e.target.value)} />
            {fieldErrors.email && <div className="field-error">{fieldErrors.email}</div>}
          </div>
          <div className="form-group">
            <label>Password</label>
            <input type="password" placeholder="••••••••" value={password} onChange={(e) => setPassword(e.target.value)} />
            {fieldErrors.password && <div className="field-error">{fieldErrors.password}</div>}
          </div>
          <button type="submit" className="submit-btn" disabled={loading}>
            {loading ? 'Please wait...' : tab === 'login' ? 'Sign In' : 'Create Account'}
          </button>
        </form>

        <div className="divider">or</div>

        <button className="google-btn" onClick={handleGoogle} disabled={loading}>
          <svg width="18" height="18" viewBox="0 0 24 24">
            <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92a5.06 5.06 0 0 1-2.2 3.32v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.1z"/>
            <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/>
            <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"/>
            <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"/>
          </svg>
          Continue with Google
        </button>
      </div>
    </div>
  );
}
