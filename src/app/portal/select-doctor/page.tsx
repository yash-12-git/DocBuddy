/** @jsxImportSource @emotion/react */
'use client';

import { css } from '@emotion/react';
import { theme } from '@/lib/theme';
import { useAuth } from '@/contexts/AuthContext';
import { getAllDoctors } from '@/services/admin.service';
import { formatCurrency } from '@/lib/utils';
import { useQuery } from '@tanstack/react-query';
import { useRouter } from 'next/navigation';
import { useState } from 'react';

const S = css`
  max-width: 1000px;
  margin: 0 auto;

  h1 {
    font-family: ${theme.fonts.heading};
    font-size: ${theme.fontSizes['2xl']};
    font-weight: 700;
    margin-bottom: ${theme.spacing.sm};
  }

  .subtitle {
    color: ${theme.colors.textSecondary};
    font-size: ${theme.fontSizes.sm};
    margin-bottom: ${theme.spacing.xl};
  }

  .search {
    margin-bottom: ${theme.spacing.lg};
    input {
      width: 100%;
      padding: 12px 16px;
      border: 1.5px solid ${theme.colors.border};
      border-radius: ${theme.radii.md};
      font-size: 16px;
      outline: none;
      &:focus {
        border-color: ${theme.colors.primary};
      }
    }
  }

  .doctors-grid {
    display: grid;
    grid-template-columns: 1fr;
    gap: ${theme.spacing.md};
    @media (min-width: 640px) {
      grid-template-columns: repeat(2, 1fr);
    }
    @media (min-width: 1024px) {
      grid-template-columns: repeat(3, 1fr);
    }
  }

  .doctor-card {
    background: white;
    border: 1.5px solid ${theme.colors.border};
    border-radius: ${theme.radii.xl};
    padding: ${theme.spacing.lg};
    cursor: pointer;
    transition: all 0.15s ease;

    &:hover {
      border-color: ${theme.colors.primary};
      box-shadow: ${theme.shadows.md};
      transform: translateY(-2px);
    }

    .avatar {
      width: 56px;
      height: 56px;
      border-radius: ${theme.radii.lg};
      background: ${theme.colors.primaryBg};
      color: ${theme.colors.primary};
      display: flex;
      align-items: center;
      justify-content: center;
      font-weight: 700;
      font-size: 20px;
      margin-bottom: ${theme.spacing.sm};
    }

    .name {
      font-family: ${theme.fonts.heading};
      font-size: ${theme.fontSizes.base};
      font-weight: 700;
      margin-bottom: 4px;
    }

    .specialty {
      font-size: ${theme.fontSizes.xs};
      color: ${theme.colors.primary};
      margin-bottom: ${theme.spacing.sm};
    }

    .meta {
      display: flex;
      gap: ${theme.spacing.md};
      font-size: ${theme.fontSizes.xs};
      color: ${theme.colors.textSecondary};
      flex-wrap: wrap;
    }

    .badge {
      padding: 3px 10px;
      border-radius: ${theme.radii.full};
      font-size: 11px;
      font-weight: 600;
      margin-top: ${theme.spacing.sm};
      display: inline-block;

      &.approved {
        background: ${theme.colors.successBg};
        color: ${theme.colors.success};
      }
      &.pending {
        background: ${theme.colors.warningBg};
        color: ${theme.colors.warning};
      }
      &.suspended {
        background: ${theme.colors.errorBg};
        color: ${theme.colors.error};
      }
    }
  }

  .empty {
    text-align: center;
    padding: ${theme.spacing['2xl']};
    color: ${theme.colors.textMuted};
  }
`;

export default function SelectDoctorPage() {
  const { user, isAdmin } = useAuth();
  const router = useRouter();
  const [search, setSearch] = useState('');

  const { data: doctors, isLoading } = useQuery({
    queryKey: ['admin-doctors'],
    queryFn: () => getAllDoctors(),
    enabled: !!user && isAdmin,
  });

  if (!isAdmin) {
    router.push('/portal/dashboard');
    return null;
  }

  const filtered = doctors?.filter(
    (d) =>
      d.profile.name.toLowerCase().includes(search.toLowerCase()) ||
      d.profile.specialty.some((s) => s.toLowerCase().includes(search.toLowerCase()))
  );

  const handleSelect = (doctorId: string) => {
    // Store selected doctor ID in sessionStorage
    sessionStorage.setItem('adminSelectedDoctorId', doctorId);
    router.push('/portal/dashboard');
  };

  return (
    <div css={S}>
      <h1>Select Doctor to View</h1>
      <p className="subtitle">
        As an admin, you can view any doctor's portal. Select a doctor to see their dashboard,
        appointments, and schedule.
      </p>

      <div className="search">
        <input
          type="text"
          placeholder="Search by name or specialty..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
        />
      </div>

      {isLoading ? (
        <div className="empty">Loading doctors...</div>
      ) : !filtered?.length ? (
        <div className="empty">No doctors found</div>
      ) : (
        <div className="doctors-grid">
          {filtered.map((doc) => {
            const initials = doc.profile.name
              .split(' ')
              .map((n) => n[0])
              .join('')
              .slice(0, 2)
              .toUpperCase();

            return (
              <div key={doc.uid} className="doctor-card" onClick={() => handleSelect(doc.uid)}>
                <div className="avatar">{initials}</div>
                <div className="name">Dr. {doc.profile.name}</div>
                <div className="specialty">{doc.profile.specialty.join(' · ')}</div>
                <div className="meta">
                  <span>🎓 {doc.profile.experience} yrs</span>
                  <span>⭐ {doc.rating.toFixed(1)}</span>
                  <span>💰 {formatCurrency(doc.consultation.fee)}</span>
                </div>
                <span className={`badge ${doc.status}`}>{doc.status}</span>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
