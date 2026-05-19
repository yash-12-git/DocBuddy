/** @jsxImportSource @emotion/react */
'use client';

import { css } from '@emotion/react';
import { theme } from '@/lib/theme';
import { useAuth } from '@/contexts/AuthContext';
import { getDoctorStats } from '@/services/portal.service';
import { formatCurrency, formatDate, formatTime } from '@/lib/utils';
import { useQuery } from '@tanstack/react-query';

const pageStyles = css`
  h1 {
    font-family: ${theme.fonts.heading};
    font-size: ${theme.fontSizes['2xl']};
    font-weight: 700;
    margin-bottom: ${theme.spacing.xl};
  }

  .stats-grid {
    display: grid;
    grid-template-columns: repeat(auto-fill, minmax(180px, 1fr));
    gap: ${theme.spacing.md};
    margin-bottom: ${theme.spacing.xl};

    .stat-card {
      background: white;
      border: 1px solid ${theme.colors.border};
      border-radius: ${theme.radii.lg};
      padding: ${theme.spacing.lg};

      .label {
        font-size: 12px;
        color: ${theme.colors.textMuted};
        text-transform: uppercase;
        letter-spacing: 0.5px;
        margin-bottom: 6px;
      }

      .value {
        font-family: ${theme.fonts.heading};
        font-size: ${theme.fontSizes['2xl']};
        font-weight: 700;
        color: ${theme.colors.text};
      }

      &.primary .value { color: ${theme.colors.primary}; }
      &.success .value { color: ${theme.colors.success}; }
      &.warning .value { color: ${theme.colors.warning}; }
    }
  }

  .card {
    background: white;
    border: 1px solid ${theme.colors.border};
    border-radius: ${theme.radii.xl};
    padding: ${theme.spacing.xl};
    margin-bottom: ${theme.spacing.lg};

    h2 {
      font-family: ${theme.fonts.heading};
      font-size: ${theme.fontSizes.lg};
      font-weight: 700;
      margin: 0 0 ${theme.spacing.lg};
    }
  }

  .order-row {
    display: flex;
    justify-content: space-between;
    align-items: center;
    padding: ${theme.spacing.md} 0;
    border-bottom: 1px solid ${theme.colors.borderLight};

    &:last-child { border: none; }

    .patient { font-weight: 600; font-size: ${theme.fontSizes.sm}; }
    .details { font-size: ${theme.fontSizes.xs}; color: ${theme.colors.textSecondary}; margin-top: 2px; }

    .status {
      font-size: 11px;
      font-weight: 600;
      padding: 4px 10px;
      border-radius: ${theme.radii.full};

      &.confirmed { background: ${theme.colors.successBg}; color: ${theme.colors.success}; }
      &.pending { background: ${theme.colors.warningBg}; color: ${theme.colors.warning}; }
      &.completed { background: ${theme.colors.infoBg}; color: ${theme.colors.info}; }
      &.cancelled { background: ${theme.colors.errorBg}; color: ${theme.colors.error}; }
    }
  }

  .empty { text-align: center; padding: ${theme.spacing['2xl']}; color: ${theme.colors.textMuted}; }
`;

export default function DoctorDashboard() {
  const { user } = useAuth();
  const userId = (user as any)?.uid;

  const { data: stats, isLoading } = useQuery({
    queryKey: ['doctor-stats', userId],
    queryFn: () => getDoctorStats(userId),
    enabled: !!userId,
    staleTime: 30_000,
  });

  return (
    <div css={pageStyles}>
      <h1>Dashboard</h1>

      {isLoading ? (
        <div className="empty">Loading stats...</div>
      ) : (
        <>
          <div className="stats-grid">
            <div className="stat-card primary">
              <div className="label">Today's Appointments</div>
              <div className="value">{stats?.confirmedToday || 0}</div>
            </div>
            <div className="stat-card">
              <div className="label">Total Appointments</div>
              <div className="value">{stats?.totalAppointments || 0}</div>
            </div>
            <div className="stat-card success">
              <div className="label">Completed</div>
              <div className="value">{stats?.completed || 0}</div>
            </div>
            <div className="stat-card warning">
              <div className="label">Pending</div>
              <div className="value">{stats?.pending || 0}</div>
            </div>
            <div className="stat-card">
              <div className="label">Total Revenue</div>
              <div className="value">{formatCurrency(stats?.totalRevenue || 0)}</div>
            </div>
          </div>

          <div className="card">
            <h2>Recent Appointments</h2>
            {!stats?.recentOrders?.length ? (
              <div className="empty">No appointments yet</div>
            ) : (
              stats.recentOrders.map((order: any) => (
                <div key={order.id} className="order-row">
                  <div>
                    <div className="patient">{order.patient?.name || 'Patient'}</div>
                    <div className="details">
                      {formatDate(order.slot?.date)} · {formatTime(order.slot?.startTime)} · {order.slot?.mode}
                    </div>
                  </div>
                  <span className={`status ${order.status}`}>{order.status}</span>
                </div>
              ))
            )}
          </div>
        </>
      )}
    </div>
  );
}
