/** @jsxImportSource @emotion/react */
'use client';

import { css } from '@emotion/react';
import { theme } from '@/lib/theme';
import { useUserOrders } from '@/hooks';
import { useAuth } from '@/contexts/AuthContext';
import { Order, OrderStatus } from '@/types';
import { formatCurrency, formatDate, formatTime } from '@/lib/utils';
import { useRouter } from 'next/navigation';
import { useState } from 'react';

const pageStyles = css`
  max-width: 900px;
  margin: 0 auto;
  padding: ${theme.spacing.xl} ${theme.spacing.lg} ${theme.spacing['3xl']};

  h1 {
    font-family: ${theme.fonts.heading};
    font-size: ${theme.fontSizes['2xl']};
    font-weight: 700;
    margin-bottom: ${theme.spacing.xl};
  }

  .tabs {
    display: flex;
    gap: 4px;
    margin-bottom: ${theme.spacing.xl};
    background: ${theme.colors.bgSecondary};
    border-radius: ${theme.radii.md};
    padding: 3px;
    width: fit-content;

    button {
      padding: 8px 18px;
      border: none;
      background: transparent;
      border-radius: ${theme.radii.sm};
      font-size: ${theme.fontSizes.sm};
      font-weight: 500;
      cursor: pointer;
      color: ${theme.colors.textSecondary};
      transition: all ${theme.transitions.fast};

      &.active {
        background: white;
        color: ${theme.colors.text};
        box-shadow: ${theme.shadows.sm};
        font-weight: 600;
      }
    }
  }

  .order-list {
    display: flex;
    flex-direction: column;
    gap: ${theme.spacing.md};
  }

  .order-card {
    background: white;
    border-radius: ${theme.radii.xl};
    border: 1px solid ${theme.colors.border};
    padding: ${theme.spacing.lg};
    cursor: pointer;
    transition: all ${theme.transitions.fast};

    &:hover {
      border-color: ${theme.colors.primaryLight};
      box-shadow: ${theme.shadows.md};
    }

    .order-top {
      display: flex;
      justify-content: space-between;
      align-items: flex-start;
      margin-bottom: ${theme.spacing.base};
    }

    .doc-info {
      .doc-name {
        font-weight: 700;
        font-size: ${theme.fontSizes.base};
      }

      .specialty {
        font-size: ${theme.fontSizes.xs};
        color: ${theme.colors.primary};
        margin-top: 2px;
      }
    }

    .order-meta {
      display: flex;
      gap: ${theme.spacing.lg};
      margin-top: ${theme.spacing.md};
      flex-wrap: wrap;

      .meta-item {
        font-size: ${theme.fontSizes.xs};
        color: ${theme.colors.textSecondary};
        display: flex;
        align-items: center;
        gap: 4px;
      }
    }

    .order-bottom {
      display: flex;
      justify-content: space-between;
      align-items: center;
      margin-top: ${theme.spacing.base};
      padding-top: ${theme.spacing.base};
      border-top: 1px solid ${theme.colors.borderLight};

      .amount {
        font-weight: 700;
        font-size: ${theme.fontSizes.md};
      }

      .order-id {
        font-size: 11px;
        color: ${theme.colors.textMuted};
        font-family: ${theme.fonts.mono};
      }
    }
  }

  .empty-state {
    text-align: center;
    padding: ${theme.spacing['3xl']};
    color: ${theme.colors.textMuted};
    .emoji { font-size: 48px; margin-bottom: ${theme.spacing.base}; }
    h3 { color: ${theme.colors.text}; }
    p { font-size: ${theme.fontSizes.sm}; margin-top: 8px; }
    .cta {
      margin-top: ${theme.spacing.lg};
      padding: 12px 28px;
      background: ${theme.colors.primary};
      color: white;
      border: none;
      border-radius: ${theme.radii.md};
      font-weight: 600;
      cursor: pointer;
      &:hover { background: ${theme.colors.primaryDark}; }
    }
  }
`;

const STATUS_CONFIG: Record<OrderStatus, { label: string; color: string; bg: string }> = {
  draft: { label: 'Draft', color: theme.colors.textMuted, bg: theme.colors.bgTertiary },
  pending: { label: 'Pending', color: theme.colors.warning, bg: theme.colors.warningBg },
  confirmed: { label: 'Confirmed', color: theme.colors.success, bg: theme.colors.successBg },
  scheduled: { label: 'Scheduled', color: theme.colors.info, bg: theme.colors.infoBg },
  completed: { label: 'Completed', color: theme.colors.success, bg: theme.colors.successBg },
  cancelled: { label: 'Cancelled', color: theme.colors.error, bg: theme.colors.errorBg },
  failed: { label: 'Failed', color: theme.colors.error, bg: theme.colors.errorBg },
  refunded: { label: 'Refunded', color: theme.colors.textSecondary, bg: theme.colors.bgTertiary },
};

function StatusBadge({ status }: { status: OrderStatus }) {
  const config = STATUS_CONFIG[status];
  return (
    <span
      style={{
        display: 'inline-flex',
        alignItems: 'center',
        gap: 4,
        padding: '4px 12px',
        borderRadius: theme.radii.full,
        fontSize: '12px',
        fontWeight: 600,
        color: config.color,
        background: config.bg,
      }}
    >
      <span style={{
        width: 6, height: 6, borderRadius: '50%',
        background: config.color,
      }} />
      {config.label}
    </span>
  );
}

export default function BookingsPage() {
  const router = useRouter();
  const { user } = useAuth();
  const { data: orders, isLoading } = useUserOrders();
  const [filter, setFilter] = useState<'all' | 'upcoming' | 'past'>('all');

  if (!user) {
    router.push('/login');
    return null;
  }

  const filtered = orders?.filter((order) => {
    if (filter === 'upcoming') return ['confirmed', 'scheduled', 'pending'].includes(order.status);
    if (filter === 'past') return ['completed', 'cancelled', 'failed', 'refunded'].includes(order.status);
    return true;
  });

  return (
    <div css={pageStyles}>
      <h1>My Bookings</h1>

      <div className="tabs">
        {(['all', 'upcoming', 'past'] as const).map((tab) => (
          <button
            key={tab}
            className={filter === tab ? 'active' : ''}
            onClick={() => setFilter(tab)}
          >
            {tab.charAt(0).toUpperCase() + tab.slice(1)}
          </button>
        ))}
      </div>

      {isLoading ? (
        <div style={{ textAlign: 'center', padding: 60, color: theme.colors.textMuted }}>
          Loading bookings...
        </div>
      ) : !filtered || filtered.length === 0 ? (
        <div className="empty-state">
          <div className="emoji">📋</div>
          <h3>No bookings found</h3>
          <p>{filter === 'all' ? "You haven't booked any appointments yet" : `No ${filter} bookings`}</p>
          <button className="cta" onClick={() => router.push('/search')}>
            Find a Doctor
          </button>
        </div>
      ) : (
        <div className="order-list">
          {filtered.map((order) => (
            <div
              key={order.id}
              className="order-card"
              onClick={() => router.push(`/bookings/${order.id}`)}
            >
              <div className="order-top">
                <div className="doc-info">
                  <div className="doc-name">Dr. {order.doctor.name}</div>
                  <div className="specialty">{order.doctor.specialty}</div>
                </div>
                <StatusBadge status={order.status} />
              </div>

              <div className="order-meta">
                <span className="meta-item">📅 {formatDate(order.slot.date)}</span>
                <span className="meta-item">🕐 {formatTime(order.slot.startTime)} – {formatTime(order.slot.endTime)}</span>
                <span className="meta-item">
                  {order.slot.mode === 'online' ? '💻 Online' : '🏥 In-Clinic'}
                </span>
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
