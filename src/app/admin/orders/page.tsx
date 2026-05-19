/** @jsxImportSource @emotion/react */
'use client';

import { css } from '@emotion/react';
import { theme } from '@/lib/theme';
import { useAuth } from '@/contexts/AuthContext';
import { getAllOrders, adminCancelOrder } from '@/services/admin.service';
import { formatCurrency, formatDate, formatTime } from '@/lib/utils';
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

  .order-list { display: flex; flex-direction: column; gap: ${theme.spacing.md}; }

  .order-card {
    background: white; border: 1px solid ${theme.colors.border}; border-radius: ${theme.radii.xl};
    padding: ${theme.spacing.lg};

    .order-top { display: flex; justify-content: space-between; align-items: flex-start; margin-bottom: ${theme.spacing.base}; }

    .order-info {
      .title { font-weight: 700; font-size: ${theme.fontSizes.sm}; }
      .subtitle { font-size: 12px; color: ${theme.colors.textSecondary}; margin-top: 2px; }
    }

    .badge {
      padding: 4px 12px; border-radius: ${theme.radii.full}; font-size: 11px; font-weight: 600;
      &.confirmed { background: ${theme.colors.successBg}; color: ${theme.colors.success}; }
      &.pending { background: ${theme.colors.warningBg}; color: ${theme.colors.warning}; }
      &.completed { background: ${theme.colors.infoBg}; color: ${theme.colors.info}; }
      &.cancelled { background: ${theme.colors.errorBg}; color: ${theme.colors.error}; }
      &.failed { background: ${theme.colors.errorBg}; color: ${theme.colors.error}; }
    }

    .order-meta {
      display: flex; gap: ${theme.spacing.lg}; flex-wrap: wrap;
      font-size: ${theme.fontSizes.xs}; color: ${theme.colors.textSecondary};
      margin-bottom: ${theme.spacing.base};
    }

    .order-footer {
      display: flex; justify-content: space-between; align-items: center;
      padding-top: ${theme.spacing.base}; border-top: 1px solid ${theme.colors.borderLight};

      .amount { font-weight: 700; }
      .order-id { font-size: 11px; font-family: ${theme.fonts.mono}; color: ${theme.colors.textMuted}; }

      .cancel-btn {
        padding: 6px 14px; background: white; color: ${theme.colors.error};
        border: 1px solid ${theme.colors.error}30; border-radius: ${theme.radii.sm};
        cursor: pointer; font-size: 12px; font-weight: 600;
        &:hover { background: ${theme.colors.errorBg}; }
      }
    }
  }

  .count { font-size: ${theme.fontSizes.sm}; color: ${theme.colors.textSecondary}; margin-bottom: ${theme.spacing.lg}; }
  .empty { text-align: center; padding: ${theme.spacing['2xl']}; color: ${theme.colors.textMuted}; }
`;

export default function AdminOrdersPage() {
  const { user } = useAuth();
  const userId = (user as any)?.uid;
  const queryClient = useQueryClient();
  const [filter, setFilter] = useState('all');

  const { data: orders, isLoading } = useQuery({
    queryKey: ['admin-orders', filter],
    queryFn: () => getAllOrders(filter),
    enabled: !!user,
    staleTime: 15_000,
  });

  const handleCancel = async (orderId: string) => {
    const reason = prompt('Reason for cancellation:');
    if (!reason) return;
    await adminCancelOrder(orderId, userId, reason);
    queryClient.invalidateQueries({ queryKey: ['admin-orders'] });
    queryClient.invalidateQueries({ queryKey: ['admin-stats'] });
  };

  return (
    <div css={pageStyles}>
      <h1>Order Management</h1>

      <div className="tabs">
        {['all', 'pending', 'confirmed', 'completed', 'cancelled'].map((t) => (
          <button key={t} className={filter === t ? 'active' : ''} onClick={() => setFilter(t)}>
            {t.charAt(0).toUpperCase() + t.slice(1)}
          </button>
        ))}
      </div>

      {orders && <div className="count">{orders.length} order{orders.length !== 1 ? 's' : ''}</div>}

      {isLoading ? <div className="empty">Loading...</div> : !orders?.length ? (
        <div className="empty">No orders found</div>
      ) : (
        <div className="order-list">
          {orders.map((order) => (
            <div key={order.id} className="order-card">
              <div className="order-top">
                <div className="order-info">
                  <div className="title">Dr. {order.doctor.name} → {order.patient?.name || 'Patient'}</div>
                  <div className="subtitle">{order.doctor.specialty}</div>
                </div>
                <span className={`badge ${order.status}`}>{order.status}</span>
              </div>

              <div className="order-meta">
                <span>📅 {formatDate(order.slot.date)}</span>
                <span>🕐 {formatTime(order.slot.startTime)}</span>
                <span>{order.slot.mode === 'online' ? '💻 Online' : '🏥 Clinic'}</span>
                <span>👤 User: {order.userId.slice(0, 12)}...</span>
              </div>

              <div className="order-footer">
                <div>
                  <span className="amount">{formatCurrency(order.pricing.total)}</span>
                  <span className="order-id" style={{ marginLeft: 12 }}>#{order.id.slice(0, 14)}</span>
                </div>
                {['confirmed', 'pending'].includes(order.status) && (
                  <button className="cancel-btn" onClick={() => handleCancel(order.id)}>Cancel Order</button>
                )}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
