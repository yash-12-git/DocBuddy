/** @jsxImportSource @emotion/react */
'use client';

import { css } from '@emotion/react';
import { theme } from '@/lib/theme';
import { useUserOrders } from '@/hooks';
import { useAuth } from '@/contexts/AuthContext';
import { OrderStatus } from '@/types';
import { formatCurrency, formatDate, formatTime } from '@/lib/utils';
import { useRouter } from 'next/navigation';
import { useState } from 'react';

const S = css`
  max-width: 900px; margin: 0 auto;
  padding: ${theme.spacing.base} ${theme.spacing.base} ${theme.spacing['2xl']};
  @media (min-width: 768px) { padding: ${theme.spacing.xl} ${theme.spacing.lg} ${theme.spacing['3xl']}; }

  h1 { font-family: ${theme.fonts.heading}; font-size: ${theme.fontSizes.xl}; font-weight: 700; margin-bottom: ${theme.spacing.lg};
    @media (min-width: 768px) { font-size: ${theme.fontSizes['2xl']}; margin-bottom: ${theme.spacing.xl}; }
  }

  .tabs {
    display: flex; gap: 4px; margin-bottom: ${theme.spacing.lg}; background: ${theme.colors.bgSecondary};
    border-radius: ${theme.radii.md}; padding: 3px; width: fit-content;
    button { padding: 8px 14px; border: none; background: transparent; border-radius: ${theme.radii.sm};
      font-size: ${theme.fontSizes.sm}; font-weight: 500; color: ${theme.colors.textSecondary};
      white-space: nowrap;
      &.active { background: white; color: ${theme.colors.text}; box-shadow: ${theme.shadows.sm}; font-weight: 600; }
    }
  }

  .order-list { display: flex; flex-direction: column; gap: ${theme.spacing.md}; }

  .order-card {
    background: white; border-radius: ${theme.radii.xl}; border: 1px solid ${theme.colors.border};
    padding: ${theme.spacing.base}; cursor: pointer; transition: all var(--transition-fast);
    @media (min-width: 768px) { padding: ${theme.spacing.lg}; }
    @media (hover: hover) { &:hover { border-color: ${theme.colors.primaryLight}; box-shadow: ${theme.shadows.md}; } }

    .order-top { display: flex; justify-content: space-between; align-items: flex-start; margin-bottom: ${theme.spacing.sm}; }
    .doc-info {
      min-width: 0; flex: 1;
      .doc-name { font-weight: 700; font-size: ${theme.fontSizes.sm}; overflow: hidden; text-overflow: ellipsis; white-space: nowrap;
        @media (min-width: 768px) { font-size: ${theme.fontSizes.base}; }
      }
      .specialty { font-size: ${theme.fontSizes.xs}; color: ${theme.colors.primary}; margin-top: 2px; }
    }

    .order-meta {
      display: flex; gap: ${theme.spacing.md}; margin-top: ${theme.spacing.sm}; flex-wrap: wrap;
      .meta-item { font-size: ${theme.fontSizes.xs}; color: ${theme.colors.textSecondary}; display: flex; align-items: center; gap: 3px; }
    }

    .order-bottom {
      display: flex; justify-content: space-between; align-items: center;
      margin-top: ${theme.spacing.sm}; padding-top: ${theme.spacing.sm}; border-top: 1px solid ${theme.colors.borderLight};
      .amount { font-weight: 700; font-size: ${theme.fontSizes.sm}; }
      .order-id { font-size: 10px; color: ${theme.colors.textMuted}; font-family: ${theme.fonts.mono}; }
    }
  }

  .empty-state {
    text-align: center; padding: ${theme.spacing['2xl']}; color: ${theme.colors.textMuted};
    .emoji { font-size: 48px; margin-bottom: ${theme.spacing.base}; }
    h3 { color: ${theme.colors.text}; }
    p { font-size: ${theme.fontSizes.sm}; margin-top: 8px; }
    .cta { margin-top: ${theme.spacing.lg}; padding: 12px 28px; background: ${theme.colors.primary};
      color: white; border: none; border-radius: ${theme.radii.md}; font-weight: 600; }
  }
`;

const STATUS_CFG: Record<OrderStatus, { label: string; color: string; bg: string }> = {
  draft: { label: 'Draft', color: '#94A3B8', bg: '#F1F5F9' },
  pending: { label: 'Pending', color: '#F59E0B', bg: '#FFFBEB' },
  confirmed: { label: 'Confirmed', color: '#10B981', bg: '#ECFDF5' },
  scheduled: { label: 'Scheduled', color: '#3B82F6', bg: '#EFF6FF' },
  completed: { label: 'Completed', color: '#10B981', bg: '#ECFDF5' },
  cancelled: { label: 'Cancelled', color: '#EF4444', bg: '#FEF2F2' },
  failed: { label: 'Failed', color: '#EF4444', bg: '#FEF2F2' },
  refunded: { label: 'Refunded', color: '#64748B', bg: '#F1F5F9' },
};

function Badge({ status }: { status: OrderStatus }) {
  const c = STATUS_CFG[status];
  return <span style={{ padding: '3px 10px', borderRadius: 9999, fontSize: 11, fontWeight: 600, color: c.color, background: c.bg, whiteSpace: 'nowrap', flexShrink: 0 }}>{c.label}</span>;
}

export default function BookingsPage() {
  const router = useRouter();
  const { user } = useAuth();
  const { data: orders, isLoading } = useUserOrders();
  const [filter, setFilter] = useState<'all' | 'upcoming' | 'past'>('all');

  if (!user) { router.push('/login'); return null; }

  const filtered = orders?.filter((o) => {
    if (filter === 'upcoming') return ['confirmed', 'scheduled', 'pending'].includes(o.status);
    if (filter === 'past') return ['completed', 'cancelled', 'failed', 'refunded'].includes(o.status);
    return true;
  });

  return (
    <div css={S}>
      <h1>My Bookings</h1>
      <div className="tabs">
        {(['all', 'upcoming', 'past'] as const).map((t) => (
          <button key={t} className={filter === t ? 'active' : ''} onClick={() => setFilter(t)}>
            {t.charAt(0).toUpperCase() + t.slice(1)}
          </button>
        ))}
      </div>

      {isLoading ? <div style={{ textAlign: 'center', padding: 60, color: '#94A3B8' }}>Loading...</div>
      : !filtered?.length ? (
        <div className="empty-state">
          <div className="emoji">📋</div><h3>No bookings found</h3>
          <p>{filter === 'all' ? "You haven't booked any appointments yet" : `No ${filter} bookings`}</p>
          <button className="cta" onClick={() => router.push('/search')}>Find a Doctor</button>
        </div>
      ) : (
        <div className="order-list">
          {filtered.map((order) => (
            <div key={order.id} className="order-card" onClick={() => router.push(`/bookings/${order.id}`)}>
              <div className="order-top">
                <div className="doc-info">
                  <div className="doc-name">Dr. {order.doctor.name}</div>
                  <div className="specialty">{order.doctor.specialty}</div>
                </div>
                <Badge status={order.status} />
              </div>
              <div className="order-meta">
                <span className="meta-item">📅 {formatDate(order.slot.date)}</span>
                <span className="meta-item">🕐 {formatTime(order.slot.startTime)}</span>
                <span className="meta-item">{order.slot.mode === 'online' ? '💻 Online' : '🏥 Clinic'}</span>
              </div>
              <div className="order-bottom">
                <span className="amount">{formatCurrency(order.pricing.total)}</span>
                <span className="order-id">#{order.id.slice(0, 12)}</span>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
