/** @jsxImportSource @emotion/react */
'use client';

import { css } from '@emotion/react';
import { theme } from '@/lib/theme';
import { useAuth } from '@/contexts/AuthContext';
import { getDoctorAppointments, updateAppointmentStatus } from '@/services/portal.service';
import { formatCurrency, formatDate, formatTime } from '@/lib/utils';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import { useState } from 'react';

const pageStyles = css`
  h1 { font-family: ${theme.fonts.heading}; font-size: ${theme.fontSizes['2xl']}; font-weight: 700; margin-bottom: ${theme.spacing.xl}; }

  .tabs {
    display: flex; gap: 4px; margin-bottom: ${theme.spacing.xl};
    background: ${theme.colors.bgSecondary}; border-radius: ${theme.radii.md}; padding: 3px; width: fit-content;
    button {
      padding: 8px 16px; border: none; background: transparent; border-radius: ${theme.radii.sm};
      font-size: ${theme.fontSizes.sm}; font-weight: 500; cursor: pointer; color: ${theme.colors.textSecondary};
      &.active { background: white; color: ${theme.colors.text}; box-shadow: ${theme.shadows.sm}; font-weight: 600; }
    }
  }

  .appointments-list { display: flex; flex-direction: column; gap: ${theme.spacing.md}; }

  .appt-card {
    background: white; border: 1px solid ${theme.colors.border}; border-radius: ${theme.radii.xl};
    padding: ${theme.spacing.lg};

    .appt-top { display: flex; justify-content: space-between; align-items: flex-start; margin-bottom: ${theme.spacing.base}; }

    .patient-info {
      .patient-name { font-weight: 700; font-size: ${theme.fontSizes.base}; }
      .patient-meta { font-size: ${theme.fontSizes.xs}; color: ${theme.colors.textSecondary}; margin-top: 2px; }
    }

    .status-badge {
      padding: 4px 12px; border-radius: ${theme.radii.full}; font-size: 11px; font-weight: 600;
      &.confirmed { background: ${theme.colors.successBg}; color: ${theme.colors.success}; }
      &.pending { background: ${theme.colors.warningBg}; color: ${theme.colors.warning}; }
      &.completed { background: ${theme.colors.infoBg}; color: ${theme.colors.info}; }
      &.cancelled { background: ${theme.colors.errorBg}; color: ${theme.colors.error}; }
      &.failed { background: ${theme.colors.errorBg}; color: ${theme.colors.error}; }
    }

    .appt-details {
      display: flex; gap: ${theme.spacing.lg}; flex-wrap: wrap;
      font-size: ${theme.fontSizes.xs}; color: ${theme.colors.textSecondary};
      margin-bottom: ${theme.spacing.base};
      span { display: flex; align-items: center; gap: 4px; }
    }

    .symptoms {
      font-size: ${theme.fontSizes.sm}; color: ${theme.colors.textSecondary}; font-style: italic;
      padding: ${theme.spacing.sm} ${theme.spacing.md}; background: ${theme.colors.bgSecondary};
      border-radius: ${theme.radii.sm}; margin-bottom: ${theme.spacing.base};
    }

    .appt-actions {
      display: flex; gap: 8px; flex-wrap: wrap;
      button {
        padding: 8px 16px; border-radius: ${theme.radii.md}; font-size: 13px; font-weight: 600;
        cursor: pointer; border: none; transition: all ${theme.transitions.fast};
        &.complete { background: ${theme.colors.success}; color: white; &:hover { opacity: 0.9; } }
        &.cancel { background: white; color: ${theme.colors.error}; border: 1px solid ${theme.colors.error}30; &:hover { background: ${theme.colors.errorBg}; } }
        &:disabled { opacity: 0.5; cursor: not-allowed; }
      }
    }
  }

  .empty { text-align: center; padding: ${theme.spacing['2xl']}; color: ${theme.colors.textMuted}; font-size: ${theme.fontSizes.sm}; }
`;

const TABS = [
  { key: 'all', label: 'All' },
  { key: 'confirmed', label: 'Confirmed' },
  { key: 'completed', label: 'Completed' },
  { key: 'cancelled', label: 'Cancelled' },
];

export default function AppointmentsPage() {
  const { user } = useAuth();
  const userId = (user as any)?.uid;
  const queryClient = useQueryClient();
  const [filter, setFilter] = useState('all');

  const { data: appointments, isLoading } = useQuery({
    queryKey: ['doctor-appointments', userId, filter],
    queryFn: () => getDoctorAppointments(userId, filter),
    enabled: !!userId,
    staleTime: 15_000,
  });

  const handleStatusUpdate = async (orderId: string, newStatus: string) => {
    await updateAppointmentStatus(orderId, newStatus, userId);
    queryClient.invalidateQueries({ queryKey: ['doctor-appointments'] });
    queryClient.invalidateQueries({ queryKey: ['doctor-stats'] });
  };

  return (
    <div css={pageStyles}>
      <h1>Appointments</h1>

      <div className="tabs">
        {TABS.map((tab) => (
          <button key={tab.key} className={filter === tab.key ? 'active' : ''} onClick={() => setFilter(tab.key)}>
            {tab.label}
          </button>
        ))}
      </div>

      {isLoading ? (
        <div className="empty">Loading appointments...</div>
      ) : !appointments?.length ? (
        <div className="empty">No appointments found</div>
      ) : (
        <div className="appointments-list">
          {appointments.map((appt) => (
            <div key={appt.id} className="appt-card">
              <div className="appt-top">
                <div className="patient-info">
                  <div className="patient-name">{appt.patient?.name || 'Patient (info pending)'}</div>
                  <div className="patient-meta">
                    {appt.patient?.age ? `${appt.patient.age} yrs, ${appt.patient.gender}` : 'Details not filled'}
                  </div>
                </div>
                <span className={`status-badge ${appt.status}`}>{appt.status}</span>
              </div>

              <div className="appt-details">
                <span>📅 {formatDate(appt.slot.date)}</span>
                <span>🕐 {formatTime(appt.slot.startTime)} – {formatTime(appt.slot.endTime)}</span>
                <span>{appt.slot.mode === 'online' ? '💻 Online' : '🏥 In-Clinic'}</span>
                <span>💰 {formatCurrency(appt.pricing.consultationFee)}</span>
              </div>

              {appt.patient?.symptoms && (
                <div className="symptoms">💬 {appt.patient.symptoms}</div>
              )}

              <div className="appt-actions">
                {appt.status === 'confirmed' && (
                  <>
                    <button className="complete" onClick={() => handleStatusUpdate(appt.id, 'completed')}>
                      ✓ Mark Completed
                    </button>
                    <button className="cancel" onClick={() => handleStatusUpdate(appt.id, 'cancelled')}>
                      Cancel
                    </button>
                  </>
                )}
                {appt.status === 'pending' && (
                  <button className="cancel" onClick={() => handleStatusUpdate(appt.id, 'cancelled')}>
                    Reject
                  </button>
                )}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
