/** @jsxImportSource @emotion/react */
'use client';

import { css } from '@emotion/react';
import { theme } from '@/lib/theme';
import { useAuth } from '@/contexts/AuthContext';
import { getDoctorAppointments, updateAppointmentStatus } from '@/services/portal.service';
import { formatCurrency, formatDate, formatTime } from '@/lib/utils';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import { useRouter } from 'next/navigation';
import { useState } from 'react';

const S = css`
  h1 { font-family: ${theme.fonts.heading}; font-size: ${theme.fontSizes.xl}; font-weight: 700; margin-bottom: ${theme.spacing.lg};
    @media (min-width: 768px) { font-size: ${theme.fontSizes['2xl']}; margin-bottom: ${theme.spacing.xl}; } }

  .tabs { display: flex; gap: 4px; margin-bottom: ${theme.spacing.lg}; background: ${theme.colors.bgSecondary};
    border-radius: ${theme.radii.md}; padding: 3px; width: fit-content; overflow-x: auto;
    button { padding: 7px 12px; border: none; background: transparent; border-radius: ${theme.radii.sm};
      font-size: ${theme.fontSizes.sm}; font-weight: 500; color: ${theme.colors.textSecondary}; white-space: nowrap;
      &.active { background: white; color: ${theme.colors.text}; box-shadow: ${theme.shadows.sm}; font-weight: 600; } }
  }

  .list { display: flex; flex-direction: column; gap: ${theme.spacing.sm}; }

  .appt-card { background: white; border: 1px solid ${theme.colors.border}; border-radius: ${theme.radii.xl};
    padding: ${theme.spacing.base};
    @media (min-width: 768px) { padding: ${theme.spacing.lg}; }

    .appt-top { display: flex; justify-content: space-between; align-items: flex-start; margin-bottom: ${theme.spacing.sm}; gap: ${theme.spacing.sm}; }
    .patient-name { font-weight: 700; font-size: ${theme.fontSizes.sm}; }
    .patient-meta { font-size: ${theme.fontSizes.xs}; color: ${theme.colors.textSecondary}; margin-top: 2px; }
    .badge { padding: 3px 10px; border-radius: ${theme.radii.full}; font-size: 11px; font-weight: 600; white-space: nowrap; flex-shrink: 0;
      &.confirmed { background: ${theme.colors.successBg}; color: ${theme.colors.success}; }
      &.pending { background: ${theme.colors.warningBg}; color: ${theme.colors.warning}; }
      &.completed { background: ${theme.colors.infoBg}; color: ${theme.colors.info}; }
      &.cancelled { background: ${theme.colors.errorBg}; color: ${theme.colors.error}; }
    }

    .appt-details { display: flex; gap: ${theme.spacing.md}; flex-wrap: wrap; font-size: ${theme.fontSizes.xs};
      color: ${theme.colors.textSecondary}; margin-bottom: ${theme.spacing.sm}; }

    .symptoms { font-size: ${theme.fontSizes.xs}; color: ${theme.colors.textSecondary}; font-style: italic;
      padding: ${theme.spacing.sm}; background: ${theme.colors.bgSecondary}; border-radius: ${theme.radii.sm};
      margin-bottom: ${theme.spacing.sm}; }

    .appt-actions { display: flex; gap: 6px; flex-wrap: wrap;
      button { padding: 7px 14px; border-radius: ${theme.radii.md}; font-size: 12px; font-weight: 600; border: none;
        &.complete { background: ${theme.colors.success}; color: white; }
        &.cancel { background: white; color: ${theme.colors.error}; border: 1px solid rgba(239,68,68,0.3); }
        &:disabled { opacity: 0.5; } }
    }
  }
  .empty { text-align: center; padding: ${theme.spacing.xl}; color: ${theme.colors.textMuted}; font-size: ${theme.fontSizes.sm}; }
`;

const TABS = [{ key: 'all', label: 'All' }, { key: 'confirmed', label: 'Confirmed' }, { key: 'completed', label: 'Completed' }, { key: 'cancelled', label: 'Cancelled' }];

export default function AppointmentsPage() {
  const { user, isAdmin } = useAuth();
  const router = useRouter();
  const userId = (user as any)?.uid;
  const qc = useQueryClient();
  const [filter, setFilter] = useState('all');
  
  // For admin, get selected doctor ID from sessionStorage
  const selectedDoctorId = isAdmin ? (typeof window !== 'undefined' ? sessionStorage.getItem('adminSelectedDoctorId') : null) : null;
  const doctorId = selectedDoctorId || userId;

  // If admin but no doctor selected, redirect to selector
  if (isAdmin && !selectedDoctorId && typeof window !== 'undefined') {
    router.push('/portal/select-doctor');
    return null;
  }

  const { data: appts, isLoading } = useQuery({ queryKey: ['doctor-appointments', doctorId, filter], queryFn: () => getDoctorAppointments(doctorId, filter), enabled: !!doctorId, staleTime: 15_000 });

  const handleStatus = async (id: string, status: string) => {
    await updateAppointmentStatus(id, status, doctorId);
    qc.invalidateQueries({ queryKey: ['doctor-appointments'] });
    qc.invalidateQueries({ queryKey: ['doctor-stats'] });
  };

  return (
    <div css={S}>
      <h1>Appointments</h1>
      <div className="tabs">{TABS.map(t => <button key={t.key} className={filter === t.key ? 'active' : ''} onClick={() => setFilter(t.key)}>{t.label}</button>)}</div>
      {isLoading ? <div className="empty">Loading...</div> : !appts?.length ? <div className="empty">No appointments found</div> : (
        <div className="list">
          {appts.map(a => (
            <div key={a.id} className="appt-card">
              <div className="appt-top">
                <div><div className="patient-name">{a.patient?.name || 'Patient (pending)'}</div>
                  <div className="patient-meta">{a.patient?.age ? `${a.patient.age}yrs, ${a.patient.gender}` : ''}</div></div>
                <span className={`badge ${a.status}`}>{a.status}</span>
              </div>
              <div className="appt-details">
                <span>📅 {formatDate(a.slot.date)}</span>
                <span>🕐 {formatTime(a.slot.startTime)}</span>
                <span>{a.slot.mode === 'online' ? '💻' : '🏥'} {a.slot.mode}</span>
                <span>💰 {formatCurrency(a.pricing.consultationFee)}</span>
              </div>
              {a.patient?.symptoms && <div className="symptoms">💬 {a.patient.symptoms}</div>}
              <div className="appt-actions">
                {a.status === 'confirmed' && (<>
                  <button className="complete" onClick={() => handleStatus(a.id, 'completed')}>✓ Complete</button>
                  <button className="cancel" onClick={() => handleStatus(a.id, 'cancelled')}>Cancel</button>
                </>)}
                {a.status === 'pending' && <button className="cancel" onClick={() => handleStatus(a.id, 'cancelled')}>Reject</button>}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
