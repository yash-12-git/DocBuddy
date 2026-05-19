/** @jsxImportSource @emotion/react */
'use client';

import { css } from '@emotion/react';
import { theme } from '@/lib/theme';
import { useOrder, useCancelOrder } from '@/hooks';
import { useAuth } from '@/contexts/AuthContext';
import { Order, OrderStatus, StatusEvent } from '@/types';
import { formatCurrency, formatDate, formatTime } from '@/lib/utils';
import { useParams, useRouter, useSearchParams } from 'next/navigation';
import { useState, Suspense } from 'react';

const pageStyles = css`
  max-width: 800px;
  margin: 0 auto;
  padding: ${theme.spacing.xl} ${theme.spacing.lg} ${theme.spacing['3xl']};

  .back-link {
    display: inline-flex;
    align-items: center;
    gap: 6px;
    color: ${theme.colors.textSecondary};
    font-size: ${theme.fontSizes.sm};
    margin-bottom: ${theme.spacing.lg};
    cursor: pointer;
    &:hover { color: ${theme.colors.primary}; }
  }

  .success-banner {
    background: ${theme.colors.successBg};
    border: 1px solid ${theme.colors.success}30;
    border-radius: ${theme.radii.xl};
    padding: ${theme.spacing.xl};
    text-align: center;
    margin-bottom: ${theme.spacing.xl};

    .check-icon {
      width: 56px;
      height: 56px;
      background: ${theme.colors.success};
      border-radius: 50%;
      display: inline-flex;
      align-items: center;
      justify-content: center;
      color: white;
      font-size: 28px;
      margin-bottom: ${theme.spacing.md};
    }

    h2 {
      font-family: ${theme.fonts.heading};
      font-size: ${theme.fontSizes.xl};
      font-weight: 700;
      color: ${theme.colors.success};
      margin: 0;
    }

    p {
      color: ${theme.colors.textSecondary};
      font-size: ${theme.fontSizes.sm};
      margin-top: 4px;
    }
  }

  .card {
    background: white;
    border-radius: ${theme.radii.xl};
    border: 1px solid ${theme.colors.border};
    padding: ${theme.spacing.xl};
    margin-bottom: ${theme.spacing.lg};

    h3 {
      font-family: ${theme.fonts.heading};
      font-size: ${theme.fontSizes.lg};
      font-weight: 700;
      margin: 0 0 ${theme.spacing.lg};
    }
  }

  .detail-grid {
    display: grid;
    grid-template-columns: 1fr 1fr;
    gap: ${theme.spacing.base};

    @media (max-width: 480px) {
      grid-template-columns: 1fr;
    }

    .detail-item {
      .label {
        font-size: ${theme.fontSizes.xs};
        color: ${theme.colors.textMuted};
        text-transform: uppercase;
        letter-spacing: 0.5px;
        margin-bottom: 4px;
      }

      .value {
        font-weight: 600;
        font-size: ${theme.fontSizes.sm};
      }
    }
  }

  .timeline {
    position: relative;
    padding-left: 28px;

    &::before {
      content: '';
      position: absolute;
      left: 8px;
      top: 4px;
      bottom: 4px;
      width: 2px;
      background: ${theme.colors.border};
    }

    .timeline-item {
      position: relative;
      padding-bottom: ${theme.spacing.lg};

      &:last-child { padding-bottom: 0; }

      .dot {
        position: absolute;
        left: -24px;
        top: 2px;
        width: 18px;
        height: 18px;
        border-radius: 50%;
        background: white;
        border: 2px solid ${theme.colors.border};
        z-index: 1;

        &.active {
          border-color: ${theme.colors.primary};
          background: ${theme.colors.primary};

          &::after {
            content: '✓';
            color: white;
            font-size: 10px;
            position: absolute;
            top: 50%;
            left: 50%;
            transform: translate(-50%, -50%);
          }
        }

        &.current {
          border-color: ${theme.colors.primary};
          background: ${theme.colors.primaryBg};
          box-shadow: 0 0 0 4px ${theme.colors.primary}20;
        }

        &.error {
          border-color: ${theme.colors.error};
          background: ${theme.colors.error};
        }
      }

      .event-status {
        font-weight: 600;
        font-size: ${theme.fontSizes.sm};
        text-transform: capitalize;
      }

      .event-time {
        font-size: 11px;
        color: ${theme.colors.textMuted};
        margin-top: 2px;
      }

      .event-reason {
        font-size: ${theme.fontSizes.xs};
        color: ${theme.colors.textSecondary};
        margin-top: 4px;
        font-style: italic;
      }
    }
  }

  .pricing-table {
    width: 100%;
    border-collapse: collapse;

    tr {
      td {
        padding: 8px 0;
        font-size: ${theme.fontSizes.sm};
        color: ${theme.colors.textSecondary};
        border-bottom: 1px solid ${theme.colors.borderLight};

        &:last-child {
          text-align: right;
          font-weight: 500;
          color: ${theme.colors.text};
        }
      }

      &.total td {
        border-top: 2px solid ${theme.colors.border};
        border-bottom: none;
        font-weight: 700;
        font-size: ${theme.fontSizes.md};
        color: ${theme.colors.text};
        padding-top: ${theme.spacing.md};
      }
    }
  }

  .actions {
    display: flex;
    gap: ${theme.spacing.md};
    flex-wrap: wrap;

    .action-btn {
      padding: 10px 24px;
      border-radius: ${theme.radii.md};
      font-size: ${theme.fontSizes.sm};
      font-weight: 600;
      cursor: pointer;
      border: none;
      transition: all ${theme.transitions.fast};

      &.primary {
        background: ${theme.colors.primary};
        color: white;
        &:hover { background: ${theme.colors.primaryDark}; }
      }

      &.danger {
        background: white;
        color: ${theme.colors.error};
        border: 1.5px solid ${theme.colors.error}40;
        &:hover { background: ${theme.colors.errorBg}; }
      }

      &.secondary {
        background: ${theme.colors.bgSecondary};
        color: ${theme.colors.text};
        &:hover { background: ${theme.colors.bgTertiary}; }
      }

      &:disabled { opacity: 0.5; cursor: not-allowed; }
    }
  }

  .cancel-form {
    margin-top: ${theme.spacing.lg};
    padding: ${theme.spacing.base};
    background: ${theme.colors.errorBg};
    border-radius: ${theme.radii.md};

    textarea {
      width: 100%;
      padding: 10px;
      border: 1px solid ${theme.colors.error}30;
      border-radius: ${theme.radii.sm};
      font-family: inherit;
      font-size: ${theme.fontSizes.sm};
      resize: vertical;
      min-height: 60px;
      margin-bottom: ${theme.spacing.md};
      outline: none;
    }

    .cancel-actions {
      display: flex;
      gap: 8px;
      justify-content: flex-end;
    }
  }
`;

function OrderDetailContent() {
  const params = useParams();
  const router = useRouter();
  const searchParams = useSearchParams();
  const orderId = params.orderId as string;
  const justConfirmed = searchParams.get('status') === 'confirmed';

  const { user } = useAuth();
  const { data: order, isLoading } = useOrder(orderId);
  const cancelMutation = useCancelOrder();

  const [showCancelForm, setShowCancelForm] = useState(false);
  const [cancelReason, setCancelReason] = useState('');

  if (!user) { router.push('/login'); return null; }

  if (isLoading) {
    return <div css={pageStyles}><div style={{ textAlign: 'center', padding: 60, color: theme.colors.textMuted }}>Loading...</div></div>;
  }

  if (!order) {
    return <div css={pageStyles}><div style={{ textAlign: 'center', padding: 60 }}>Order not found</div></div>;
  }

  const canCancel = ['pending', 'confirmed', 'scheduled'].includes(order.status);

  const handleCancel = async () => {
    if (!cancelReason.trim() || cancelReason.length < 5) return;
    
    await cancelMutation.mutateAsync({
      orderId: order.id,
      userId: (user as any).uid,
      reason: cancelReason,
    });
    setShowCancelForm(false);
  };

  const STATUS_ORDER: OrderStatus[] = ['pending', 'confirmed', 'scheduled', 'completed'];
  const currentIdx = STATUS_ORDER.indexOf(order.status);

  return (
    <div css={pageStyles}>
      <div className="back-link" onClick={() => router.push('/bookings')}>
        ← Back to Bookings
      </div>

      {justConfirmed && order.status === 'confirmed' && (
        <div className="success-banner">
          <div className="check-icon">✓</div>
          <h2>Booking Confirmed!</h2>
          <p>Your appointment has been successfully booked and payment received.</p>
        </div>
      )}

      {/* Appointment Details */}
      <div className="card">
        <h3>Appointment Details</h3>
        <div className="detail-grid">
          <div className="detail-item">
            <div className="label">Doctor</div>
            <div className="value">Dr. {order.doctor.name}</div>
          </div>
          <div className="detail-item">
            <div className="label">Specialty</div>
            <div className="value">{order.doctor.specialty}</div>
          </div>
          <div className="detail-item">
            <div className="label">Date</div>
            <div className="value">{formatDate(order.slot.date)}</div>
          </div>
          <div className="detail-item">
            <div className="label">Time</div>
            <div className="value">{formatTime(order.slot.startTime)} – {formatTime(order.slot.endTime)}</div>
          </div>
          <div className="detail-item">
            <div className="label">Mode</div>
            <div className="value">{order.slot.mode === 'online' ? '💻 Online' : '🏥 In-Clinic'}</div>
          </div>
          <div className="detail-item">
            <div className="label">Order ID</div>
            <div className="value" style={{ fontFamily: theme.fonts.mono, fontSize: 12 }}>
              #{order.id.slice(0, 16)}
            </div>
          </div>
        </div>
      </div>

      {/* Status Timeline */}
      <div className="card">
        <h3>Booking Status</h3>
        <div className="timeline">
          {order.statusHistory.map((event, i) => {
            const isCurrent = i === order.statusHistory.length - 1;
            const isError = ['cancelled', 'failed'].includes(event.status);

            return (
              <div key={i} className="timeline-item">
                <div className={`dot ${isError ? 'error' : isCurrent ? 'current' : 'active'}`} />
                <div className="event-status">{event.status}</div>
                <div className="event-time">
                  {new Date(event.timestamp).toLocaleString('en-IN', {
                    day: 'numeric', month: 'short', year: 'numeric',
                    hour: '2-digit', minute: '2-digit',
                  })}
                </div>
                {event.reason && <div className="event-reason">{event.reason}</div>}
              </div>
            );
          })}
        </div>
      </div>

      {/* Payment Summary */}
      <div className="card">
        <h3>Payment Summary</h3>
        <table className="pricing-table">
          <tbody>
            <tr>
              <td>Consultation Fee</td>
              <td>{formatCurrency(order.pricing.consultationFee)}</td>
            </tr>
            <tr>
              <td>Platform Fee</td>
              <td>{formatCurrency(order.pricing.platformFee)}</td>
            </tr>
            <tr>
              <td>GST (18%)</td>
              <td>{formatCurrency(order.pricing.gst)}</td>
            </tr>
            <tr className="total">
              <td>Total Paid</td>
              <td>{formatCurrency(order.pricing.total)}</td>
            </tr>
          </tbody>
        </table>
      </div>

      {/* Actions */}
      <div className="card">
        <h3>Actions</h3>
        <div className="actions">
          {canCancel && !showCancelForm && (
            <button
              className="action-btn danger"
              onClick={() => setShowCancelForm(true)}
            >
              Cancel Booking
            </button>
          )}
          <button className="action-btn secondary" onClick={() => window.print()}>
            🖨 Print Receipt
          </button>
        </div>

        {showCancelForm && (
          <div className="cancel-form">
            <textarea
              placeholder="Please provide a reason for cancellation (min 5 characters)..."
              value={cancelReason}
              onChange={(e) => setCancelReason(e.target.value)}
            />
            <div className="cancel-actions">
              <button
                className="action-btn secondary"
                onClick={() => setShowCancelForm(false)}
              >
                Never mind
              </button>
              <button
                className="action-btn danger"
                onClick={handleCancel}
                disabled={cancelReason.length < 5 || cancelMutation.isPending}
              >
                {cancelMutation.isPending ? 'Cancelling...' : 'Confirm Cancellation'}
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

export default function OrderDetailPage() {
  return (
    <Suspense fallback={<div style={{ padding: 60, textAlign: 'center' }}>Loading...</div>}>
      <OrderDetailContent />
    </Suspense>
  );
}
