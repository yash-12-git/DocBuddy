/** @jsxImportSource @emotion/react */
'use client';

import { css } from '@emotion/react';
import { theme } from '@/lib/theme';
import { useAuth } from '@/contexts/AuthContext';
import { getDoctorStats } from '@/services/portal.service';
import { formatCurrency, formatDate, formatTime } from '@/lib/utils';
import { useQuery } from '@tanstack/react-query';
import { useRouter } from 'next/navigation';

const S = css`
  h1 { font-family: ${theme.fonts.heading}; font-size: ${theme.fontSizes.xl}; font-weight: 700; margin-bottom: ${theme.spacing.lg};
    @media (min-width: 768px) { font-size: ${theme.fontSizes['2xl']}; margin-bottom: ${theme.spacing.xl}; } }

  .stats-grid {
    display: grid; grid-template-columns: repeat(2, 1fr); gap: ${theme.spacing.sm};
    margin-bottom: ${theme.spacing.lg};
    @media (min-width: 640px) { grid-template-columns: repeat(3, 1fr); gap: ${theme.spacing.md}; }
    @media (min-width: 768px) { grid-template-columns: repeat(auto-fill, minmax(180px, 1fr)); margin-bottom: ${theme.spacing.xl}; }
    .stat-card { background: white; border: 1px solid ${theme.colors.border}; border-radius: ${theme.radii.lg}; padding: ${theme.spacing.base};
      .label { font-size: 11px; color: ${theme.colors.textMuted}; text-transform: uppercase; letter-spacing: 0.5px; margin-bottom: 4px; }
      .value { font-family: ${theme.fonts.heading}; font-size: ${theme.fontSizes.xl}; font-weight: 700;
        @media (min-width: 768px) { font-size: ${theme.fontSizes['2xl']}; } }
      &.primary .value { color: ${theme.colors.primary}; }
      &.success .value { color: ${theme.colors.success}; }
    }
  }

  .card { background: white; border: 1px solid ${theme.colors.border}; border-radius: ${theme.radii.xl};
    padding: ${theme.spacing.base}; margin-bottom: ${theme.spacing.base};
    @media (min-width: 768px) { padding: ${theme.spacing.xl}; margin-bottom: ${theme.spacing.lg}; }
    h2 { font-family: ${theme.fonts.heading}; font-size: ${theme.fontSizes.base}; font-weight: 700; margin: 0 0 ${theme.spacing.base};
      @media (min-width: 768px) { font-size: ${theme.fontSizes.lg}; margin-bottom: ${theme.spacing.lg}; } }
  }

  .order-row { display: flex; justify-content: space-between; align-items: center; padding: ${theme.spacing.sm} 0;
    border-bottom: 1px solid ${theme.colors.borderLight}; &:last-child { border: none; }
    .patient { font-weight: 600; font-size: ${theme.fontSizes.sm}; }
    .details { font-size: ${theme.fontSizes.xs}; color: ${theme.colors.textSecondary}; margin-top: 2px; }
    .status { font-size: 11px; font-weight: 600; padding: 3px 8px; border-radius: ${theme.radii.full};
      &.confirmed { background: ${theme.colors.successBg}; color: ${theme.colors.success}; }
      &.pending { background: ${theme.colors.warningBg}; color: ${theme.colors.warning}; }
      &.completed { background: ${theme.colors.infoBg}; color: ${theme.colors.info}; }
      &.cancelled { background: ${theme.colors.errorBg}; color: ${theme.colors.error}; }
    }
  }
  .empty { text-align: center; padding: ${theme.spacing.xl}; color: ${theme.colors.textMuted}; font-size: ${theme.fontSizes.sm}; }
`;

export default function DoctorDashboard() {
  const { user, isAdmin } = useAuth();
  const router = useRouter();
  
  // For admin, get selected doctor ID from sessionStorage
  const selectedDoctorId = isAdmin ? (typeof window !== 'undefined' ? sessionStorage.getItem('adminSelectedDoctorId') : null) : null;
  const userId = selectedDoctorId || (user as any)?.uid;

  // If admin but no doctor selected, redirect to selector
  if (isAdmin && !selectedDoctorId && typeof window !== 'undefined') {
    router.push('/portal/select-doctor');
    return null;
  }

  const { data: stats, isLoading } = useQuery({ queryKey: ['doctor-stats', userId], queryFn: () => getDoctorStats(userId), enabled: !!userId, staleTime: 30_000 });

  return (
    <div css={S}>
      <h1>Dashboard</h1>
      {isLoading ? <div className="empty">Loading...</div> : (<>
        <div className="stats-grid">
          <div className="stat-card primary"><div className="label">Today</div><div className="value">{stats?.confirmedToday || 0}</div></div>
          <div className="stat-card"><div className="label">Total</div><div className="value">{stats?.totalAppointments || 0}</div></div>
          <div className="stat-card success"><div className="label">Completed</div><div className="value">{stats?.completed || 0}</div></div>
          <div className="stat-card"><div className="label">Pending</div><div className="value">{stats?.pending || 0}</div></div>
          <div className="stat-card"><div className="label">Revenue</div><div className="value">{formatCurrency(stats?.totalRevenue || 0)}</div></div>
        </div>
        <div className="card">
          <h2>Recent Appointments</h2>
          {!stats?.recentOrders?.length ? <div className="empty">No appointments yet</div> :
            stats.recentOrders.map((o: any) => (
              <div key={o.id} className="order-row">
                <div><div className="patient">{o.patient?.name || 'Patient'}</div>
                  <div className="details">{formatDate(o.slot?.date)} · {formatTime(o.slot?.startTime)}</div></div>
                <span className={`status ${o.status}`}>{o.status}</span>
              </div>
            ))
          }
        </div>
      </>)}
    </div>
  );
}
