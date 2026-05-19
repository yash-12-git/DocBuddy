/** @jsxImportSource @emotion/react */
'use client';

import { css } from '@emotion/react';
import { theme } from '@/lib/theme';
import { useAuth } from '@/contexts/AuthContext';
import { getAllDoctors, approveDoctor, suspendDoctor } from '@/services/admin.service';
import { formatCurrency } from '@/lib/utils';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import { useState } from 'react';

const pageStyles = css`
  h1 { font-family: ${theme.fonts.heading}; font-size: ${theme.fontSizes['2xl']}; font-weight: 700; margin-bottom: ${theme.spacing.xl}; }

  .tabs {
    display: flex; gap: 4px; margin-bottom: ${theme.spacing.xl};
    background: ${theme.colors.bgSecondary}; border-radius: ${theme.radii.md}; padding: 3px; width: fit-content;
    button { padding: 8px 16px; border: none; background: transparent; border-radius: ${theme.radii.sm};
      font-size: ${theme.fontSizes.sm}; font-weight: 500; cursor: pointer; color: ${theme.colors.textSecondary};
      &.active { background: white; color: ${theme.colors.text}; box-shadow: ${theme.shadows.sm}; font-weight: 600; }
    }
  }

  .doc-list { display: flex; flex-direction: column; gap: ${theme.spacing.md}; }

  .doc-card {
    background: white; border: 1px solid ${theme.colors.border}; border-radius: ${theme.radii.xl};
    padding: ${theme.spacing.lg};

    .doc-top { display: flex; justify-content: space-between; align-items: flex-start; margin-bottom: ${theme.spacing.base}; }

    .doc-info {
      .name { font-weight: 700; font-size: ${theme.fontSizes.base}; }
      .specialty { font-size: ${theme.fontSizes.xs}; color: ${theme.colors.primary}; margin-top: 2px; }
      .meta { font-size: 12px; color: ${theme.colors.textSecondary}; margin-top: 4px; }
    }

    .badge {
      padding: 4px 12px; border-radius: ${theme.radii.full}; font-size: 11px; font-weight: 600;
      &.pending { background: ${theme.colors.warningBg}; color: ${theme.colors.warning}; }
      &.approved { background: ${theme.colors.successBg}; color: ${theme.colors.success}; }
      &.suspended { background: ${theme.colors.errorBg}; color: ${theme.colors.error}; }
    }

    .doc-details {
      display: flex; gap: ${theme.spacing.lg}; flex-wrap: wrap; font-size: ${theme.fontSizes.xs};
      color: ${theme.colors.textSecondary}; margin-bottom: ${theme.spacing.base};
    }

    .doc-actions {
      display: flex; gap: 8px;
      button {
        padding: 8px 16px; border-radius: ${theme.radii.md}; font-size: 13px; font-weight: 600;
        cursor: pointer; border: none;
        &.approve { background: ${theme.colors.success}; color: white; &:hover { opacity: 0.9; } }
        &.suspend { background: white; color: ${theme.colors.error}; border: 1px solid ${theme.colors.error}30; &:hover { background: ${theme.colors.errorBg}; } }
        &:disabled { opacity: 0.5; cursor: not-allowed; }
      }
    }
  }

  .empty { text-align: center; padding: ${theme.spacing['2xl']}; color: ${theme.colors.textMuted}; }
`;

export default function AdminDoctorsPage() {
  const { user } = useAuth();
  const userId = (user as any)?.uid;
  const queryClient = useQueryClient();
  const [filter, setFilter] = useState('all');

  const { data: doctors, isLoading } = useQuery({
    queryKey: ['admin-doctors', filter],
    queryFn: () => getAllDoctors(filter),
    enabled: !!user,
    staleTime: 15_000,
  });

  const handleApprove = async (doctorId: string) => {
    await approveDoctor(doctorId, userId);
    queryClient.invalidateQueries({ queryKey: ['admin-doctors'] });
    queryClient.invalidateQueries({ queryKey: ['admin-stats'] });
  };

  const handleSuspend = async (doctorId: string) => {
    const reason = prompt('Reason for suspension:');
    if (!reason) return;
    await suspendDoctor(doctorId, userId, reason);
    queryClient.invalidateQueries({ queryKey: ['admin-doctors'] });
  };

  return (
    <div css={pageStyles}>
      <h1>Doctor Management</h1>

      <div className="tabs">
        {['all', 'pending', 'approved', 'suspended'].map((t) => (
          <button key={t} className={filter === t ? 'active' : ''} onClick={() => setFilter(t)}>
            {t.charAt(0).toUpperCase() + t.slice(1)}
          </button>
        ))}
      </div>

      {isLoading ? <div className="empty">Loading...</div> : !doctors?.length ? (
        <div className="empty">No doctors found</div>
      ) : (
        <div className="doc-list">
          {doctors.map((doc) => (
            <div key={doc.uid} className="doc-card">
              <div className="doc-top">
                <div className="doc-info">
                  <div className="name">Dr. {doc.profile.name}</div>
                  <div className="specialty">{doc.profile.specialty.join(', ')}</div>
                  <div className="meta">Reg: {doc.profile.registrationNumber} · {doc.profile.experience} yrs exp</div>
                </div>
                <span className={`badge ${doc.status}`}>{doc.status}</span>
              </div>

              <div className="doc-details">
                <span>🏥 {doc.clinic.name}, {doc.clinic.city}</span>
                <span>💰 {formatCurrency(doc.consultation.fee)}</span>
                <span>⭐ {doc.rating.toFixed(1)} ({doc.totalReviews} reviews)</span>
                <span>📞 {doc.consultation.modes.join(', ')}</span>
              </div>

              <div className="doc-actions">
                {doc.status === 'pending' && (
                  <button className="approve" onClick={() => handleApprove(doc.uid)}>✓ Approve</button>
                )}
                {doc.status === 'approved' && (
                  <button className="suspend" onClick={() => handleSuspend(doc.uid)}>Suspend</button>
                )}
                {doc.status === 'suspended' && (
                  <button className="approve" onClick={() => handleApprove(doc.uid)}>Reinstate</button>
                )}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
