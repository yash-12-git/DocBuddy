/** @jsxImportSource @emotion/react */
'use client';

import { css } from '@emotion/react';
import { theme } from '@/lib/theme';
import { useAuth } from '@/contexts/AuthContext';
import { getAllOrders, adminCancelOrder } from '@/services/admin.service';
import { formatCurrency, formatDate, formatTime } from '@/lib/utils';
import { OrderStatus } from '@/types';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import { useState } from 'react';

const S = css`
  h1 { font-family: ${theme.fonts.heading}; font-size: ${theme.fontSizes.xl}; font-weight: 700; margin-bottom: ${theme.spacing.lg};
    @media (min-width: 768px) { font-size: ${theme.fontSizes['2xl']}; margin-bottom: ${theme.spacing.xl}; } }

  .tabs { display: flex; gap: 4px; margin-bottom: ${theme.spacing.lg}; background: ${theme.colors.bgSecondary};
    border-radius: ${theme.radii.md}; padding: 3px; overflow-x: auto; width: fit-content;
    button { padding: 7px 12px; border: none; background: transparent; border-radius: ${theme.radii.sm};
      font-size: ${theme.fontSizes.sm}; font-weight: 500; color: ${theme.colors.textSecondary}; white-space: nowrap;
      &.active { background: white; color: ${theme.colors.text}; box-shadow: ${theme.shadows.sm}; font-weight: 600; } }
  }

  .list { display: flex; flex-direction: column; gap: ${theme.spacing.sm}; }

  .order-card {
    background: white; border: 1px solid ${theme.colors.border}; border-radius: ${theme.radii.xl};
    padding: ${theme.spacing.base};
    @media (min-width: 768px) { padding: ${theme.spacing.lg}; }

    .top { display: flex; justify-content: space-between; align-items: flex-start; gap: ${theme.spacing.sm}; margin-bottom: ${theme.spacing.sm}; }
    .doc-name { font-weight: 700; font-size: ${theme.fontSizes.sm}; }
    .sub { font-size: ${theme.fontSizes.xs}; color: ${theme.colors.textSecondary}; margin-top: 2px; }

    .badge { padding: 3px 10px; border-radius: ${theme.radii.full}; font-size: 11px; font-weight: 600;
      white-space: nowrap; flex-shrink: 0;
      &.confirmed { background: #ECFDF5; color: #10B981; }
      &.pending { background: #FFFBEB; color: #F59E0B; }
      &.completed { background: #EFF6FF; color: #3B82F6; }
      &.cancelled, &.failed { background: #FEF2F2; color: #EF4444; }
      &.draft { background: #F1F5F9; color: #94A3B8; }
      &.refunded { background: #F1F5F9; color: #64748B; }
      &.scheduled { background: #EFF6FF; color: #3B82F6; }
    }

    .details { display: flex; gap: ${theme.spacing.md}; flex-wrap: wrap; font-size: ${theme.fontSizes.xs};
      color: ${theme.colors.textSecondary}; margin-bottom: ${theme.spacing.sm}; }

    .bottom { display: flex; justify-content: space-between; align-items: center;
      padding-top: ${theme.spacing.sm}; border-top: 1px solid ${theme.colors.borderLight}; gap: ${theme.spacing.sm}; }
    .amount { font-weight: 700; font-size: ${theme.fontSizes.sm}; }
    .order-id { font-size: 10px; color: ${theme.colors.textMuted}; font-family: ${theme.fonts.mono}; }

    .cancel-btn { padding: 5px 12px; border-radius: ${theme.radii.md}; font-size: 11px; font-weight: 600;
      background: white; color: #EF4444; border: 1px solid rgba(239,68,68,0.3);
      &:hover { background: #FEF2F2; } &:disabled { opacity: 0.5; } }
  }

  .empty { text-align: center; padding: ${theme.spacing.xl}; color: ${theme.colors.textMuted}; font-size: ${theme.fontSizes.sm}; }
`;

const TABS: { key: string; label: string }[] = [
  { key: 'all', label: 'All' }, { key: 'pending', label: 'Pending' },
  { key: 'confirmed', label: 'Confirmed' }, { key: 'completed', label: 'Completed' },
  { key: 'cancelled', label: 'Cancelled' },
];

export default function AdminOrdersPage() {
  const { user } = useAuth();
  const qc = useQueryClient();
  const [filter, setFilter] = useState('all');
  const [cancellingId, setCancellingId] = useState<string | null>(null);

  const { data: orders, isLoading } = useQuery({
    queryKey: ['admin-orders'],
    queryFn: () => getAllOrders(),
    enabled: !!user,
    staleTime: 15_000,
  });

  const filtered = orders?.filter(o => filter === 'all' || o.status === filter);

  const handleCancel = async (orderId: string) => {
    setCancellingId(orderId);
    try {
      await adminCancelOrder(orderId, (user as any).uid, 'Cancelled by admin');
      qc.invalidateQueries({ queryKey: ['admin-orders'] });
      qc.invalidateQueries({ queryKey: ['admin-stats'] });
    } catch (err) { console.error(err); }
    setCancellingId(null);
  };

  return (
    <div css={S}>
      <h1>Order Management</h1>
      <div className="tabs">
        {TABS.map(t => <button key={t.key} className={filter === t.key ? 'active' : ''} onClick={() => setFilter(t.key)}>{t.label}</button>)}
      </div>

      {isLoading ? <div className="empty">Loading orders...</div>
      : !filtered?.length ? <div className="empty">No orders found</div>
      : (
        <div className="list">
          {filtered.map(order => {
            const canCancel = ['pending', 'confirmed', 'scheduled'].includes(order.status);
            return (
              <div key={order.id} className="order-card">
                <div className="top">
                  <div>
                    <div className="doc-name">Dr. {order.doctor.name}</div>
                    <div className="sub">{order.doctor.specialty} · Patient: {order.patient?.name || 'N/A'}</div>
                  </div>
                  <span className={`badge ${order.status}`}>{order.status}</span>
                </div>
                <div className="details">
                  <span>📅 {formatDate(order.slot.date)}</span>
                  <span>🕐 {formatTime(order.slot.startTime)}</span>
                  <span>{order.slot.mode === 'online' ? '💻' : '🏥'} {order.slot.mode}</span>
                </div>
                <div className="bottom">
                  <div>
                    <span className="amount">{formatCurrency(order.pricing.total)}</span>
                    <span className="order-id" style={{ marginLeft: 8 }}>#{order.id.slice(0, 10)}</span>
                  </div>
                  {canCancel && (
                    <button className="cancel-btn" onClick={() => handleCancel(order.id)} disabled={cancellingId === order.id}>
                      {cancellingId === order.id ? '...' : 'Cancel'}
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
