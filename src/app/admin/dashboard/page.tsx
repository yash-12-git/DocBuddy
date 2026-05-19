/** @jsxImportSource @emotion/react */
'use client';

import { css } from '@emotion/react';
import { theme } from '@/lib/theme';
import { useAuth } from '@/contexts/AuthContext';
import { getAdminStats } from '@/services/admin.service';
import { formatCurrency } from '@/lib/utils';
import { useQuery } from '@tanstack/react-query';

const S = css`
  h1 { font-family: ${theme.fonts.heading}; font-size: ${theme.fontSizes.xl}; font-weight: 700; margin-bottom: ${theme.spacing.lg};
    @media (min-width: 768px) { font-size: ${theme.fontSizes['2xl']}; margin-bottom: ${theme.spacing.xl}; } }

  .stats-grid {
    display: grid; grid-template-columns: repeat(2, 1fr); gap: ${theme.spacing.sm};
    margin-bottom: ${theme.spacing.lg};
    @media (min-width: 640px) { grid-template-columns: repeat(3, 1fr); gap: ${theme.spacing.md}; }
    @media (min-width: 1024px) { grid-template-columns: repeat(5, 1fr); }

    .stat-card {
      background: white; border: 1px solid ${theme.colors.border}; border-radius: ${theme.radii.lg};
      padding: ${theme.spacing.base};
      .label { font-size: 11px; color: ${theme.colors.textMuted}; text-transform: uppercase; letter-spacing: 0.5px; margin-bottom: 4px; }
      .value { font-family: ${theme.fonts.heading}; font-size: ${theme.fontSizes.lg}; font-weight: 700;
        @media (min-width: 768px) { font-size: ${theme.fontSizes['2xl']}; } }
      &.primary .value { color: ${theme.colors.primary}; }
      &.accent .value { color: ${theme.colors.accent}; }
      &.success .value { color: ${theme.colors.success}; }
      &.info .value { color: ${theme.colors.info}; }
    }
  }

  .cards-row {
    display: grid; grid-template-columns: 1fr; gap: ${theme.spacing.base};
    @media (min-width: 768px) { grid-template-columns: 1fr 1fr; gap: ${theme.spacing.lg}; }
  }

  .card {
    background: white; border: 1px solid ${theme.colors.border}; border-radius: ${theme.radii.xl};
    padding: ${theme.spacing.base};
    @media (min-width: 768px) { padding: ${theme.spacing.xl}; }
    h2 { font-family: ${theme.fonts.heading}; font-size: ${theme.fontSizes.base}; font-weight: 700;
      margin: 0 0 ${theme.spacing.base};
      @media (min-width: 768px) { font-size: ${theme.fontSizes.lg}; } }
  }

  .activity-item {
    display: flex; justify-content: space-between; align-items: center;
    padding: ${theme.spacing.sm} 0; border-bottom: 1px solid ${theme.colors.borderLight};
    gap: ${theme.spacing.sm};
    &:last-child { border: none; }
    .label { font-size: ${theme.fontSizes.sm}; font-weight: 500; min-width: 0; overflow: hidden; text-overflow: ellipsis; white-space: nowrap; }
    .val { font-size: ${theme.fontSizes.sm}; font-weight: 600; color: ${theme.colors.primary}; white-space: nowrap; }
  }

  .empty { text-align: center; padding: ${theme.spacing.xl}; color: ${theme.colors.textMuted}; font-size: ${theme.fontSizes.sm}; }
`;

export default function AdminDashboard() {
  const { user } = useAuth();
  const { data: stats, isLoading } = useQuery({
    queryKey: ['admin-stats'],
    queryFn: getAdminStats,
    enabled: !!user,
    staleTime: 30_000,
  });

  return (
    <div css={S}>
      <h1>Admin Dashboard</h1>

      {isLoading ? <div className="empty">Loading stats...</div> : (
        <>
          <div className="stats-grid">
            <div className="stat-card primary">
              <div className="label">Total Doctors</div>
              <div className="value">{stats?.totalDoctors || 0}</div>
            </div>
            <div className="stat-card success">
              <div className="label">Approved</div>
              <div className="value">{stats?.approvedDoctors || 0}</div>
            </div>
            <div className="stat-card info">
              <div className="label">Total Orders</div>
              <div className="value">{stats?.totalOrders || 0}</div>
            </div>
            <div className="stat-card accent">
              <div className="label">Revenue</div>
              <div className="value">{formatCurrency(stats?.totalRevenue || 0)}</div>
            </div>
            <div className="stat-card">
              <div className="label">Pending</div>
              <div className="value">{stats?.pendingDoctors || 0}</div>
            </div>
          </div>

          <div className="cards-row">
            <div className="card">
              <h2>Orders by Status</h2>
              {[
                { label: 'Confirmed', count: stats?.confirmedOrders || 0 },
                { label: 'Completed', count: stats?.completedOrders || 0 },
                { label: 'Cancelled', count: stats?.cancelledOrders || 0 },
                { label: 'Today', count: stats?.todayOrders || 0 },
              ].map(item => (
                <div key={item.label} className="activity-item">
                  <span className="label">{item.label}</span>
                  <span className="val">{item.count}</span>
                </div>
              ))}
            </div>

            <div className="card">
              <h2>Quick Actions</h2>
              <div className="activity-item">
                <span className="label">Review pending doctors</span>
                <span className="val">{stats?.pendingDoctors || 0} pending</span>
              </div>
              <div className="activity-item">
                <span className="label">Pending orders</span>
                <span className="val">{stats?.totalOrders ? stats.totalOrders - (stats.confirmedOrders || 0) - (stats.completedOrders || 0) - (stats.cancelledOrders || 0) : 0}</span>
              </div>
            </div>
          </div>
        </>
      )}
    </div>
  );
}
