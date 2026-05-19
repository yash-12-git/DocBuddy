/** @jsxImportSource @emotion/react */
'use client';

import { css } from '@emotion/react';
import { theme } from '@/lib/theme';
import { useCart } from '@/contexts/CartContext';
import { formatCurrency, formatDate, formatTime } from '@/lib/utils';
import { useRouter } from 'next/navigation';
import { useEffect, useState } from 'react';

const overlayStyles = css`
  position: fixed;
  inset: 0;
  z-index: 200;
  display: flex;
  justify-content: flex-end;

  .backdrop {
    position: absolute;
    inset: 0;
    background: ${theme.colors.overlay};
    animation: fadeIn 200ms ease;
  }

  @keyframes fadeIn {
    from { opacity: 0; }
    to { opacity: 1; }
  }

  .drawer {
    position: relative;
    width: 100%;
    background: white;
    height: 100%;
    display: flex;
    flex-direction: column;
    animation: slideIn 250ms ease;
    box-shadow: ${theme.shadows.xl};

    @media (min-width: 480px) { width: 420px; }
  }

  @keyframes slideIn {
    from { transform: translateX(100%); }
    to { transform: translateX(0); }
  }

  .drawer-header {
    padding: ${theme.spacing.lg};
    border-bottom: 1px solid ${theme.colors.border};
    display: flex;
    align-items: center;
    justify-content: space-between;

    h3 {
      font-family: ${theme.fonts.heading};
      font-size: ${theme.fontSizes.lg};
      font-weight: 700;
      margin: 0;
    }

    .close-btn {
      width: 36px;
      height: 36px;
      border: none;
      background: ${theme.colors.bgSecondary};
      border-radius: 50%;
      cursor: pointer;
      display: flex;
      align-items: center;
      justify-content: center;
      font-size: 18px;
      color: ${theme.colors.textSecondary};
      transition: all ${theme.transitions.fast};

      &:hover {
        background: ${theme.colors.bgTertiary};
        color: ${theme.colors.text};
      }
    }
  }

  .drawer-body {
    flex: 1;
    overflow-y: auto;
    padding: ${theme.spacing.lg};
  }

  .cart-item {
    background: ${theme.colors.bgSecondary};
    border-radius: ${theme.radii.lg};
    padding: ${theme.spacing.base};
    margin-bottom: ${theme.spacing.md};
    position: relative;

    .item-header {
      display: flex;
      justify-content: space-between;
      align-items: flex-start;
      margin-bottom: 8px;
    }

    .doctor-name {
      font-weight: 600;
      font-size: ${theme.fontSizes.base};
      color: ${theme.colors.text};
    }

    .remove-btn {
      background: none;
      border: none;
      color: ${theme.colors.error};
      cursor: pointer;
      font-size: ${theme.fontSizes.xs};
      padding: 4px 8px;
      border-radius: ${theme.radii.sm};

      &:hover {
        background: ${theme.colors.errorBg};
      }
    }

    .specialty {
      font-size: ${theme.fontSizes.xs};
      color: ${theme.colors.primary};
      margin-bottom: 8px;
    }

    .detail-row {
      display: flex;
      align-items: center;
      gap: 6px;
      font-size: ${theme.fontSizes.xs};
      color: ${theme.colors.textSecondary};
      margin-bottom: 4px;
    }

    .fee {
      font-weight: 700;
      color: ${theme.colors.text};
      font-size: ${theme.fontSizes.base};
      margin-top: 8px;
    }

    .lock-timer {
      margin-top: 8px;
      font-size: 11px;
      color: ${theme.colors.warning};
      display: flex;
      align-items: center;
      gap: 4px;
    }

    &.expired {
      opacity: 0.5;
      border: 1px dashed ${theme.colors.error};
    }
  }

  .empty-cart {
    text-align: center;
    padding: ${theme.spacing['2xl']};
    color: ${theme.colors.textMuted};

    .emoji { font-size: 48px; margin-bottom: ${theme.spacing.base}; }
    p { margin: 0; font-size: ${theme.fontSizes.sm}; }
  }

  .drawer-footer {
    padding: ${theme.spacing.lg};
    border-top: 1px solid ${theme.colors.border};
    background: white;

    .summary-row {
      display: flex;
      justify-content: space-between;
      margin-bottom: 8px;
      font-size: ${theme.fontSizes.sm};
      color: ${theme.colors.textSecondary};

      &.total {
        font-size: ${theme.fontSizes.md};
        font-weight: 700;
        color: ${theme.colors.text};
        padding-top: 8px;
        border-top: 1px solid ${theme.colors.border};
        margin-top: 8px;
      }
    }

    .checkout-btn {
      width: 100%;
      margin-top: ${theme.spacing.base};
      background: ${theme.colors.primary};
      color: white;
      border: none;
      border-radius: ${theme.radii.md};
      padding: 14px;
      font-size: ${theme.fontSizes.base};
      font-weight: 600;
      cursor: pointer;
      transition: all ${theme.transitions.fast};

      &:hover {
        background: ${theme.colors.primaryDark};
      }

      &:disabled {
        opacity: 0.5;
        cursor: not-allowed;
      }
    }
  }
`;

function LockTimer({ expiry }: { expiry: number }) {
  const [remaining, setRemaining] = useState('');

  useEffect(() => {
    const update = () => {
      const diff = expiry - Date.now();
      if (diff <= 0) {
        setRemaining('Expired');
        return;
      }
      const mins = Math.floor(diff / 60000);
      const secs = Math.floor((diff % 60000) / 1000);
      setRemaining(`${mins}:${secs.toString().padStart(2, '0')}`);
    };

    update();
    const interval = setInterval(update, 1000);
    return () => clearInterval(interval);
  }, [expiry]);

  const isExpired = remaining === 'Expired';

  return (
    <span style={{ color: isExpired ? theme.colors.error : theme.colors.warning }}>
      ⏱ {isExpired ? 'Reservation expired' : `Reserved for ${remaining}`}
    </span>
  );
}

export default function CartDrawer() {
  const { items, isOpen, closeCart, removeItem, pricing } = useCart();
  const router = useRouter();

  if (!isOpen) return null;

  const handleCheckout = () => {
    closeCart();
    router.push('/checkout');
  };

  return (
    <div css={overlayStyles}>
      <div className="backdrop" onClick={closeCart} />
      <div className="drawer">
        <div className="drawer-header">
          <h3>Your Cart ({items.length})</h3>
          <button className="close-btn" onClick={closeCart}>
            ✕
          </button>
        </div>

        <div className="drawer-body">
          {items.length === 0 ? (
            <div className="empty-cart">
              <div className="emoji">🛒</div>
              <p>Your cart is empty</p>
              <p style={{ marginTop: 8, fontSize: 13 }}>
                Search for doctors and book a slot to get started
              </p>
            </div>
          ) : (
            items.map((item) => {
              const isExpired = item.lockExpiry < Date.now();
              return (
                <div
                  key={item.id}
                  className={`cart-item ${isExpired ? 'expired' : ''}`}
                >
                  <div className="item-header">
                    <div>
                      <div className="doctor-name">Dr. {item.doctorName}</div>
                      <div className="specialty">{item.specialty}</div>
                    </div>
                    <button
                      className="remove-btn"
                      onClick={() => removeItem(item.id)}
                    >
                      Remove
                    </button>
                  </div>
                  <div className="detail-row">📅 {formatDate(item.date)}</div>
                  <div className="detail-row">
                    🕐 {formatTime(item.startTime)} – {formatTime(item.endTime)}
                  </div>
                  <div className="detail-row">
                    {item.mode === 'online' ? '💻 Online' : '🏥 In-clinic'}
                  </div>
                  <div className="fee">{formatCurrency(item.fee)}</div>
                  <div className="lock-timer">
                    <LockTimer expiry={item.lockExpiry} />
                  </div>
                </div>
              );
            })
          )}
        </div>

        {items.length > 0 && pricing && (
          <div className="drawer-footer">
            <div className="summary-row">
              <span>Consultation Fee</span>
              <span>{formatCurrency(pricing.consultationFee)}</span>
            </div>
            <div className="summary-row">
              <span>Platform Fee</span>
              <span>{formatCurrency(pricing.platformFee)}</span>
            </div>
            <div className="summary-row">
              <span>GST (18%)</span>
              <span>{formatCurrency(pricing.gst)}</span>
            </div>
            <div className="summary-row total">
              <span>Total</span>
              <span>{formatCurrency(pricing.total)}</span>
            </div>
            <button className="checkout-btn" onClick={handleCheckout}>
              Proceed to Checkout
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
