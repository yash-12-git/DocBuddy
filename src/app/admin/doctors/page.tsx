/** @jsxImportSource @emotion/react */
'use client';

import { css } from '@emotion/react';
import { theme } from '@/lib/theme';
import { useAuth } from '@/contexts/AuthContext';
import { getAllDoctors, approveDoctor, suspendDoctor } from '@/services/admin.service';
import { formatCurrency } from '@/lib/utils';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import { useRouter } from 'next/navigation';
import { useState } from 'react';

const S = css`
  h1 { font-family: ${theme.fonts.heading}; font-size: ${theme.fontSizes.xl}; font-weight: 700; margin-bottom: ${theme.spacing.lg};
    @media (min-width: 768px) { font-size: ${theme.fontSizes['2xl']}; margin-bottom: ${theme.spacing.xl}; } }

  .header-row {
    display: flex;
    justify-content: space-between;
    align-items: center;
    margin-bottom: ${theme.spacing.lg};
    flex-wrap: wrap;
    gap: ${theme.spacing.md};

    .onboard-btn {
      padding: 10px 20px;
      background: ${theme.colors.primary};
      color: white;
      border: none;
      border-radius: ${theme.radii.md};
      font-weight: 600;
      font-size: 14px;
      cursor: pointer;
      white-space: nowrap;
      &:hover { background: ${theme.colors.primaryDark}; }
    }
  }

  .tabs { display: flex; gap: 4px; margin-bottom: ${theme.spacing.lg}; background: ${theme.colors.bgSecondary};
    border-radius: ${theme.radii.md}; padding: 3px; overflow-x: auto; width: fit-content;
    button { padding: 7px 14px; border: none; background: transparent; border-radius: ${theme.radii.sm};
      font-size: ${theme.fontSizes.sm}; font-weight: 500; color: ${theme.colors.textSecondary}; white-space: nowrap;
      &.active { background: white; color: ${theme.colors.text}; box-shadow: ${theme.shadows.sm}; font-weight: 600; } }
  }

  .list { display: flex; flex-direction: column; gap: ${theme.spacing.sm}; }

  .doc-card {
    background: white; border: 1px solid ${theme.colors.border}; border-radius: ${theme.radii.xl};
    padding: ${theme.spacing.base};
    @media (min-width: 768px) { padding: ${theme.spacing.lg}; }

    .card-top { display: flex; gap: ${theme.spacing.md}; margin-bottom: ${theme.spacing.sm}; }

    .avatar {
      width: 48px; height: 48px; border-radius: ${theme.radii.lg};
      background: ${theme.colors.primaryBg}; display: flex; align-items: center; justify-content: center;
      font-weight: 700; font-size: ${theme.fontSizes.base}; color: ${theme.colors.primary}; flex-shrink: 0;
    }

    .info { flex: 1; min-width: 0;
      .name { font-weight: 700; font-size: ${theme.fontSizes.sm}; overflow: hidden; text-overflow: ellipsis; white-space: nowrap; }
      .spec { font-size: ${theme.fontSizes.xs}; color: ${theme.colors.primary}; margin-top: 1px; }
      .meta { font-size: ${theme.fontSizes.xs}; color: ${theme.colors.textSecondary}; margin-top: 2px; }
    }

    .badge {
      padding: 3px 10px; border-radius: ${theme.radii.full}; font-size: 11px; font-weight: 600;
      white-space: nowrap; flex-shrink: 0; align-self: flex-start;
      &.approved { background: ${theme.colors.successBg}; color: ${theme.colors.success}; }
      &.pending { background: ${theme.colors.warningBg}; color: ${theme.colors.warning}; }
      &.suspended { background: ${theme.colors.errorBg}; color: ${theme.colors.error}; }
    }

    .card-bottom { display: flex; gap: 6px; flex-wrap: wrap; margin-top: ${theme.spacing.sm};
      padding-top: ${theme.spacing.sm}; border-top: 1px solid ${theme.colors.borderLight};
    }

    .action-btn {
      padding: 6px 14px; border-radius: ${theme.radii.md}; font-size: 12px; font-weight: 600; border: none;
      &.approve { background: ${theme.colors.success}; color: white; }
      &.suspend { background: white; color: ${theme.colors.error}; border: 1px solid rgba(239,68,68,0.3); }
      &.reinstate { background: ${theme.colors.info}; color: white; }
      &.edit { background: ${theme.colors.infoBg}; color: ${theme.colors.info}; border: 1px solid ${theme.colors.info}; }
      &:disabled { opacity: 0.5; }
    }
  }

  .empty { text-align: center; padding: ${theme.spacing.xl}; color: ${theme.colors.textMuted}; font-size: ${theme.fontSizes.sm}; }
`;

const TABS = [
  { key: 'all', label: 'All' },
  { key: 'pending', label: 'Pending' },
  { key: 'approved', label: 'Approved' },
  { key: 'suspended', label: 'Suspended' },
];

export default function AdminDoctorsPage() {
  const { user } = useAuth();
  const router = useRouter();
  const qc = useQueryClient();
  const [filter, setFilter] = useState('all');
  const [actionLoading, setActionLoading] = useState<string | null>(null);

  const { data: doctors, isLoading } = useQuery({
    queryKey: ['admin-doctors'],
    queryFn: () => getAllDoctors(),
    enabled: !!user,
    staleTime: 15_000,
  });

  const filtered = doctors?.filter(d => filter === 'all' || d.status === filter);

  const handleAction = async (action: 'approve' | 'suspend', doctorId: string) => {
    setActionLoading(doctorId);
    const adminId = (user as any).uid;
    try {
      if (action === 'approve') await approveDoctor(doctorId, adminId);
      else await suspendDoctor(doctorId, adminId, 'Suspended by admin');
      qc.invalidateQueries({ queryKey: ['admin-doctors'] });
      qc.invalidateQueries({ queryKey: ['admin-stats'] });
    } catch (err) { console.error(err); }
    setActionLoading(null);
  };

  return (
    <div css={S}>
      <div className="header-row">
        <h1>Doctor Management</h1>
        <button className="onboard-btn" onClick={() => router.push('/admin/onboard-doctor')}>
          + Onboard New Doctor
        </button>
      </div>
      <div className="tabs">
        {TABS.map(t => (
          <button key={t.key} className={filter === t.key ? 'active' : ''} onClick={() => setFilter(t.key)}>
            {t.label}
          </button>
        ))}
      </div>

      {isLoading ? <div className="empty">Loading doctors...</div>
      : !filtered?.length ? <div className="empty">No doctors found</div>
      : (
        <div className="list">
          {filtered.map(doc => {
            const initials = doc.profile.name.split(' ').map((n: string) => n[0]).join('').slice(0, 2).toUpperCase();
            const loading = actionLoading === doc.uid;
            return (
              <div key={doc.uid} className="doc-card">
                <div className="card-top">
                  <div className="avatar">{initials}</div>
                  <div className="info">
                    <div className="name">Dr. {doc.profile.name}</div>
                    <div className="spec">{doc.profile.specialty.join(', ')}</div>
                    <div className="meta">{doc.clinic.city} · {doc.profile.experience} yrs · ⭐ {doc.rating?.toFixed(1) || 'N/A'} · {formatCurrency(doc.consultation.fee)}</div>
                  </div>
                  <span className={`badge ${doc.status}`}>{doc.status}</span>
                </div>
                <div className="card-bottom">
                  {doc.status === 'pending' && (
                    <button className="action-btn approve" onClick={() => handleAction('approve', doc.uid)} disabled={loading}>
                      {loading ? '...' : '✓ Approve'}
                    </button>
                  )}
                  {doc.status === 'approved' && (
                    <>
                      <button className="action-btn edit" onClick={() => router.push(`/admin/doctors/${doc.uid}`)} disabled={loading}>
                        ✏️ Edit
                      </button>
                      <button className="action-btn suspend" onClick={() => handleAction('suspend', doc.uid)} disabled={loading}>
                        {loading ? '...' : 'Suspend'}
                      </button>
                    </>
                  )}
                  {doc.status === 'suspended' && (
                    <button className="action-btn approve" onClick={() => handleAction('approve', doc.uid)} disabled={loading}>
                      {loading ? '...' : 'Reinstate'}
                    </button>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
