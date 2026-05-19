/** @jsxImportSource @emotion/react */
'use client';

import { css } from '@emotion/react';
import { theme } from '@/lib/theme';
import { useCart } from '@/contexts/CartContext';
import { useAuth } from '@/contexts/AuthContext';
import { useCreateOrder, useProcessPayment } from '@/hooks';
import { PatientInfoSchema } from '@/schemas';
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

  .checkout-grid {
    display: flex; flex-direction: column; gap: ${theme.spacing.lg};
    @media (min-width: 768px) { display: grid; grid-template-columns: 1fr 340px; gap: ${theme.spacing.xl}; align-items: flex-start; }
  }

  .section {
    background: white; border-radius: ${theme.radii.xl}; border: 1px solid ${theme.colors.border};
    padding: ${theme.spacing.base}; margin-bottom: ${theme.spacing.base};
    @media (min-width: 768px) { padding: ${theme.spacing.xl}; margin-bottom: ${theme.spacing.lg}; }
    h2 {
      font-family: ${theme.fonts.heading}; font-size: ${theme.fontSizes.base}; font-weight: 700;
      margin: 0 0 ${theme.spacing.base}; display: flex; align-items: center; gap: 8px;
      @media (min-width: 768px) { font-size: ${theme.fontSizes.lg}; margin-bottom: ${theme.spacing.lg}; }
    }
    .step-num {
      width: 26px; height: 26px; background: ${theme.colors.primary}; color: white;
      border-radius: 50%; display: inline-flex; align-items: center; justify-content: center;
      font-size: 12px; font-weight: 700; flex-shrink: 0;
    }
  }

  .form-row {
    display: grid; grid-template-columns: 1fr; gap: ${theme.spacing.md};
    @media (min-width: 480px) { grid-template-columns: 1fr 1fr; }
  }

  .form-group {
    margin-bottom: ${theme.spacing.base};
    label { display: block; font-size: ${theme.fontSizes.sm}; font-weight: 500; margin-bottom: 6px; }
    input, select, textarea {
      width: 100%; padding: 11px 14px; border: 1.5px solid ${theme.colors.border};
      border-radius: ${theme.radii.md}; font-size: 16px; outline: none; background: white;
      &:focus { border-color: ${theme.colors.primary}; }
    }
    textarea { resize: vertical; min-height: 70px; }
    .field-error { color: ${theme.colors.error}; font-size: 12px; margin-top: 4px; }
  }

  .order-summary {
    background: white; border-radius: ${theme.radii.xl}; border: 1px solid ${theme.colors.border};
    padding: ${theme.spacing.base};
    @media (min-width: 768px) { position: sticky; top: 80px; padding: ${theme.spacing.xl}; }
    h3 { font-family: ${theme.fonts.heading}; font-size: ${theme.fontSizes.lg}; font-weight: 700; margin: 0 0 ${theme.spacing.base}; }
    .summary-item {
      margin-bottom: ${theme.spacing.base}; padding-bottom: ${theme.spacing.base};
      border-bottom: 1px solid ${theme.colors.borderLight};
      .doc-name { font-weight: 600; font-size: ${theme.fontSizes.sm}; }
      .slot-info { font-size: ${theme.fontSizes.xs}; color: ${theme.colors.textSecondary}; margin-top: 4px; line-height: 1.5; }
    }
    .price-row {
      display: flex; justify-content: space-between; font-size: ${theme.fontSizes.sm};
      color: ${theme.colors.textSecondary}; margin-bottom: 8px;
      &.total { font-size: ${theme.fontSizes.md}; font-weight: 700; color: ${theme.colors.text};
        padding-top: ${theme.spacing.md}; border-top: 1.5px solid ${theme.colors.border}; margin-top: ${theme.spacing.md}; }
    }
    .pay-btn {
      width: 100%; margin-top: ${theme.spacing.lg}; padding: 14px;
      background: ${theme.colors.primary}; color: white; border: none;
      border-radius: ${theme.radii.md}; font-size: ${theme.fontSizes.base}; font-weight: 600;
      &:hover { background: ${theme.colors.primaryDark}; }
      &:disabled { opacity: 0.5; cursor: not-allowed; }
    }
    .secure-note { display: flex; justify-content: center; gap: 6px; margin-top: ${theme.spacing.md};
      font-size: 11px; color: ${theme.colors.textMuted}; }
  }

  .payment-methods {
    display: flex; flex-direction: column; gap: 8px;
    .method-btn {
      display: flex; align-items: center; gap: ${theme.spacing.md}; padding: 12px;
      border: 1.5px solid ${theme.colors.border}; border-radius: ${theme.radii.md};
      background: white; font-size: ${theme.fontSizes.sm};
      &.active { border-color: ${theme.colors.primary}; background: ${theme.colors.primaryBg}; }
      .radio {
        width: 18px; height: 18px; border: 2px solid ${theme.colors.border}; border-radius: 50%;
        display: flex; align-items: center; justify-content: center; flex-shrink: 0;
        &.checked { border-color: ${theme.colors.primary};
          &::after { content: ''; width: 10px; height: 10px; border-radius: 50%; background: ${theme.colors.primary}; }
        }
      }
    }
  }

  .empty-checkout {
    text-align: center; padding: ${theme.spacing['2xl']}; color: ${theme.colors.textMuted};
    .emoji { font-size: 48px; margin-bottom: ${theme.spacing.base}; }
    h2 { color: ${theme.colors.text}; margin-bottom: 8px; }
  }

  .error-banner { padding: 12px; background: ${theme.colors.errorBg}; color: ${theme.colors.error};
    border-radius: ${theme.radii.md}; font-size: ${theme.fontSizes.sm}; margin-bottom: ${theme.spacing.base}; text-align: center; }
`;

export default function CheckoutPage() {
  const router = useRouter();
  const { user } = useAuth();
  const { items, pricing, clearCart } = useCart();
  const createOrder = useCreateOrder();
  const processPayment = useProcessPayment();

  const [patientName, setPatientName] = useState('');
  const [patientAge, setPatientAge] = useState('');
  const [patientGender, setPatientGender] = useState('');
  const [symptoms, setSymptoms] = useState('');
  const [paymentMethod, setPaymentMethod] = useState('mock');
  const [fieldErrors, setFieldErrors] = useState<Record<string, string>>({});
  const [isProcessing, setIsProcessing] = useState(false);
  const [error, setError] = useState<string | null>(null);

  if (!user) { router.push('/login'); return null; }

  if (items.length === 0) {
    return (
      <div css={S}>
        <div className="empty-checkout">
          <div className="emoji">🛒</div>
          <h2>Your cart is empty</h2>
          <p>Search for a doctor and book a slot first</p>
          <button style={{ marginTop: 20, padding: '12px 28px', background: 'var(--color-primary)', color: 'white', border: 'none', borderRadius: 'var(--radius-md)', fontWeight: 600 }}
            onClick={() => router.push('/search')}>Find Doctors</button>
        </div>
      </div>
    );
  }

  const item = items[0];

  const handleCheckout = async () => {
    setFieldErrors({}); setError(null);
    const validation = PatientInfoSchema.safeParse({ name: patientName, age: patientAge ? Number(patientAge) : undefined, gender: patientGender, symptoms });
    if (!validation.success) {
      const errs: Record<string, string> = {};
      validation.error.issues.forEach((e) => { errs[e.path[0] as string] = e.message; });
      setFieldErrors(errs); return;
    }
    setIsProcessing(true);
    try {
      const userId = (user as any).uid;
      const order = await createOrder.mutateAsync({ userId, doctorId: item.doctorId, slotId: item.slotId, doctorName: item.doctorName, specialty: item.specialty, clinicName: '', fee: item.fee, date: item.date, startTime: item.startTime, endTime: item.endTime, mode: item.mode });
      const paymentResult = await processPayment.mutateAsync({ orderId: order.id, userId, method: paymentMethod });
      if (paymentResult.success) { clearCart(); router.push(`/bookings/${order.id}?status=confirmed`); }
      else { setError(paymentResult.error || 'Payment failed'); }
    } catch (err: any) { setError(err.message || 'Something went wrong'); }
    finally { setIsProcessing(false); }
  };

  return (
    <div css={S}>
      <h1>Checkout</h1>
      {error && <div className="error-banner">{error}</div>}
      <div className="checkout-grid">
        <div className="checkout-form">
          <div className="section">
            <h2><span className="step-num">1</span> Patient Information</h2>
            <div className="form-row">
              <div className="form-group"><label>Patient Name *</label>
                <input type="text" placeholder="Full name" value={patientName} onChange={(e) => setPatientName(e.target.value)} />
                {fieldErrors.name && <div className="field-error">{fieldErrors.name}</div>}
              </div>
              <div className="form-group"><label>Age *</label>
                <input type="number" placeholder="Age" value={patientAge} onChange={(e) => setPatientAge(e.target.value)} min={0} max={150} />
                {fieldErrors.age && <div className="field-error">{fieldErrors.age}</div>}
              </div>
            </div>
            <div className="form-group"><label>Gender *</label>
              <select value={patientGender} onChange={(e) => setPatientGender(e.target.value)}>
                <option value="">Select gender</option><option value="male">Male</option><option value="female">Female</option><option value="other">Other</option>
              </select>
              {fieldErrors.gender && <div className="field-error">{fieldErrors.gender}</div>}
            </div>
            <div className="form-group"><label>Symptoms / Reason for visit</label>
              <textarea placeholder="Describe your symptoms..." value={symptoms} onChange={(e) => setSymptoms(e.target.value)} />
            </div>
          </div>
          <div className="section">
            <h2><span className="step-num">2</span> Payment Method</h2>
            <div className="payment-methods">
              {[{ key: 'mock', icon: '💳', label: 'Simulated Payment' }, { key: 'upi', icon: '📱', label: 'UPI (Coming Soon)' }, { key: 'card', icon: '💳', label: 'Card (Coming Soon)' }].map((m) => (
                <button key={m.key} className={`method-btn ${paymentMethod === m.key ? 'active' : ''}`} onClick={() => setPaymentMethod(m.key)}>
                  <span className={`radio ${paymentMethod === m.key ? 'checked' : ''}`} /> {m.icon} {m.label}
                </button>
              ))}
            </div>
          </div>
        </div>

        <div className="order-summary">
          <h3>Order Summary</h3>
          <div className="summary-item">
            <div className="doc-name">Dr. {item.doctorName}</div>
            <div className="slot-info">{item.specialty}<br />📅 {formatDate(item.date)}<br />🕐 {formatTime(item.startTime)} – {formatTime(item.endTime)}<br />{item.mode === 'online' ? '💻 Online' : '🏥 In-Clinic'}</div>
          </div>
          {pricing && (<>
            <div className="price-row"><span>Consultation Fee</span><span>{formatCurrency(pricing.consultationFee)}</span></div>
            <div className="price-row"><span>Platform Fee</span><span>{formatCurrency(pricing.platformFee)}</span></div>
            <div className="price-row"><span>GST (18%)</span><span>{formatCurrency(pricing.gst)}</span></div>
            <div className="price-row total"><span>Total</span><span>{formatCurrency(pricing.total)}</span></div>
          </>)}
          <button className="pay-btn" onClick={handleCheckout} disabled={isProcessing}>
            {isProcessing ? 'Processing...' : `Pay ${formatCurrency(pricing?.total || 0)}`}
          </button>
          <div className="secure-note">🔒 Secure checkout · 256-bit encryption</div>
        </div>
      </div>
    </div>
  );
}
