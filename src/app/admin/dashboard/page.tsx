/** @jsxImportSource @emotion/react */
'use client';

import { css } from '@emotion/react';
import { theme } from '@/lib/theme';
import { useAuth } from '@/contexts/AuthContext';
import { getAdminStats } from '@/services/admin.service';
import { formatCurrency, formatDate, formatTime } from '@/lib/utils';
import { useQuery } from '@tanstack/react-query';

const pageStyles = css`
  h1 { font-family: ${theme.fonts.heading}; font-size: ${theme.fontSizes['2xl']}; font-weight: 700; margin-bottom: ${theme.spacing.xl}; }

  .stats-grid {
    display: grid; grid-template-columns: repeat(auto-fill, minmax(200px, 1fr));
    gap: ${theme.spacing.md}; margin-bottom: ${theme.spacing.xl};

    .stat-card {
      background: white; border: 1px solid ${theme.colors.border}; border-radius: ${theme.radii.lg};
      padding: ${theme.spacing.lg};
      .label { font-size: 11px; color: ${theme.colors.textMuted}; text-transform: uppercase; letter-spacing: 0.5px; margin-bottom: 6px; }
      .value { font-family: ${theme.fonts.heading}; font-size: ${theme.fontSizes['2xl']}; font-weight: 700; }
      &.primary .value { color: ${theme.colors.primary}; }
      &.success .value { color: ${theme.colors.success}; }
      &.warning .value { color: ${theme.colors.warning}; }
      &.accent .value { color: ${theme.colors.accent}; }
    }
  }

  .card {
    background: white; border: 1px solid ${theme.colors.border}; border-radius: ${theme.radii.xl};
    padding: ${theme.spacing.xl}; margin-bottom: ${theme.spacing.lg};
    h2 { font-family: ${theme.fonts.heading}; font-size: ${theme.fontSizes.lg}; font-weight: 700; margin: 0 0 ${theme.spacing.lg}; }
  }

  .order-row {
    display: flex; justify-content: space-between; align-items: center;
    padding: ${theme.spacing.md} 0; border-bottom: 1px solid ${theme.colors.borderLight};
    &:last-child { border: none; }
    .info { .name { font-weight: 600; font-size: ${theme.fontSizes.sm}; }
      .meta { font-size: 12px; color: ${theme.colors.textSecondary}; margin-top: 2px; } }
    .right { text-align: right;
      .amount { font-weight: 700; font-size: ${theme.fontSizes.sm}; }
      .status { font-size: 11px; margin-top: 2px; font-weight: 600;
        &.confirmed { color: ${theme.colors.success}; }
        &.pending { color: ${theme.colors.warning}; }
        &.cancelled { color: ${theme.colors.error}; }
        &.completed { color: ${theme.colors.info}; }
      }
    }
  }

  .empty { text-align: center; padding: ${theme.spacing['2xl']}; color: ${theme.colors.textMuted}; }
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
    <div css={pageStyles}>
      <h1>Admin Dashboard</h1>

      {isLoading ? <div className="empty">Loading...</div> : (
        <>
          <div className="stats-grid">
            <div className="stat-card primary"><div className="label">Total Doctors</div><div className="value">{stats?.totalDoctors}</div></div>
            <div className="stat-card warning"><div className="label">Pending Approval</div><div className="value">{stats?.pendingDoctors}</div></div>
            <div className="stat-card"><div className="label">Total Orders</div><div className="value">{stats?.totalOrders}</div></div>
            <div className="stat-card success"><div className="label">Completed</div><div className="value">{stats?.completedOrders}</div></div>
            <div className="stat-card accent"><div className="label">Total Revenue</div><div className="value">{formatCurrency(stats?.totalRevenue || 0)}</div></div>
            <div className="stat-card"><div className="label">Platform Revenue</div><div className="value">{formatCurrency(stats?.platformRevenue || 0)}</div></div>
          </div>

          <div className="card">
            <h2>Recent Orders</h2>
            {!stats?.recentOrders?.length ? <div className="empty">No orders yet</div> : (
              stats.recentOrders.map((order: any) => (
                <div key={order.id} className="order-row">
                  <div className="info">
                    <div className="name">Dr. {order.doctor?.name} → {order.patient?.name || 'Patient'}</div>
                    <div className="meta">{formatDate(order.slot?.date)} · {formatTime(order.slot?.startTime)}</div>
                  </div>
                  <div className="right">
                    <div className="amount">{formatCurrency(order.pricing?.total || 0)}</div>
                    <div className={`status ${order.status}`}>{order.status}</div>
                  </div>
                </div>
              ))
            )}
          </div>
        </>
      )}
    </div>
  );
}
