/** @jsxImportSource @emotion/react */
'use client';

import { css } from '@emotion/react';
import { theme } from '@/lib/theme';
import { useDoctorProfile, useDoctorReviews } from '@/hooks';
import SlotSelector from '@/components/booking/SlotSelector';
import { useCart } from '@/contexts/CartContext';
import { useAuth } from '@/contexts/AuthContext';
import { DoctorSlot } from '@/types';
import { formatCurrency } from '@/lib/utils';
import { useParams, useRouter } from 'next/navigation';
import { useState } from 'react';

const pageStyles = css`
  max-width: 1000px;
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

  .profile-grid {
    display: grid;
    grid-template-columns: 1fr 380px;
    gap: ${theme.spacing.xl};
    align-items: flex-start;

    @media (max-width: 768px) {
      grid-template-columns: 1fr;
    }
  }

  .profile-main {
    .doc-header {
      background: white;
      border-radius: ${theme.radii.xl};
      border: 1px solid ${theme.colors.border};
      padding: ${theme.spacing.xl};
      margin-bottom: ${theme.spacing.lg};

      .top-row {
        display: flex;
        gap: ${theme.spacing.lg};
      }

      .avatar {
        width: 96px;
        height: 96px;
        border-radius: ${theme.radii.xl};
        background: linear-gradient(135deg, ${theme.colors.primaryBg}, ${theme.colors.primaryLight}20);
        display: flex;
        align-items: center;
        justify-content: center;
        font-size: 36px;
        font-weight: 700;
        color: ${theme.colors.primary};
        flex-shrink: 0;
        position: relative;

        .verified-badge {
          position: absolute;
          bottom: -4px;
          right: -4px;
          background: ${theme.colors.verified};
          color: white;
          padding: 3px 8px;
          border-radius: ${theme.radii.full};
          font-size: 11px;
          font-weight: 600;
          border: 2px solid white;
          display: flex;
          align-items: center;
          gap: 3px;
        }
      }

      .details {
        flex: 1;

        h1 {
          font-family: ${theme.fonts.heading};
          font-size: ${theme.fontSizes['2xl']};
          font-weight: 700;
          margin: 0;
        }

        .specialty {
          color: ${theme.colors.primary};
          font-weight: 500;
          margin-top: 2px;
        }

        .meta-chips {
          display: flex;
          gap: 8px;
          flex-wrap: wrap;
          margin-top: ${theme.spacing.md};

          .chip {
            display: inline-flex;
            align-items: center;
            gap: 4px;
            font-size: ${theme.fontSizes.xs};
            color: ${theme.colors.textSecondary};
            background: ${theme.colors.bgSecondary};
            padding: 4px 12px;
            border-radius: ${theme.radii.full};
          }
        }
      }
    }

    .section {
      background: white;
      border-radius: ${theme.radii.xl};
      border: 1px solid ${theme.colors.border};
      padding: ${theme.spacing.xl};
      margin-bottom: ${theme.spacing.lg};

      h2 {
        font-family: ${theme.fonts.heading};
        font-size: ${theme.fontSizes.lg};
        font-weight: 700;
        margin: 0 0 ${theme.spacing.base};
        display: flex;
        align-items: center;
        gap: 8px;
      }

      .bio { color: ${theme.colors.textSecondary}; line-height: 1.7; font-size: ${theme.fontSizes.sm}; }

      .edu-list {
        list-style: none;
        .edu-item {
          padding: 8px 0;
          border-bottom: 1px solid ${theme.colors.borderLight};
          &:last-child { border: none; }
          .degree { font-weight: 600; font-size: ${theme.fontSizes.sm}; }
          .inst { color: ${theme.colors.textSecondary}; font-size: ${theme.fontSizes.xs}; }
        }
      }

      .lang-tags {
        display: flex; gap: 6px; flex-wrap: wrap;
        span {
          background: ${theme.colors.bgTertiary};
          padding: 4px 12px;
          border-radius: ${theme.radii.full};
          font-size: ${theme.fontSizes.xs};
          color: ${theme.colors.textSecondary};
        }
      }
    }

    .clinic-section {
      .clinic-info {
        display: flex;
        align-items: flex-start;
        gap: ${theme.spacing.md};
        
        .clinic-details {
          font-size: ${theme.fontSizes.sm};
          color: ${theme.colors.textSecondary};
          line-height: 1.6;
          .clinic-name { font-weight: 600; color: ${theme.colors.text}; }
        }
      }

      .map-placeholder {
        margin-top: ${theme.spacing.base};
        height: 160px;
        border-radius: ${theme.radii.lg};
        background: ${theme.colors.bgTertiary};
        display: flex;
        align-items: center;
        justify-content: center;
        color: ${theme.colors.textMuted};
        font-size: ${theme.fontSizes.sm};
        border: 1px dashed ${theme.colors.border};
      }
    }
  }

  .booking-sidebar {
    position: sticky;
    top: 80px;

    .booking-card {
      background: white;
      border-radius: ${theme.radii.xl};
      border: 1px solid ${theme.colors.border};
      padding: ${theme.spacing.xl};

      h3 {
        font-family: ${theme.fonts.heading};
        font-size: ${theme.fontSizes.lg};
        font-weight: 700;
        margin: 0 0 4px;
      }

      .fee-display {
        font-size: ${theme.fontSizes['2xl']};
        font-weight: 700;
        color: ${theme.colors.primary};
        margin-bottom: ${theme.spacing.lg};
        small { font-size: ${theme.fontSizes.sm}; font-weight: 400; color: ${theme.colors.textMuted}; }
      }

      .mode-select {
        display: flex;
        gap: 8px;
        margin-bottom: ${theme.spacing.lg};

        button {
          flex: 1;
          padding: 10px;
          border: 1.5px solid ${theme.colors.border};
          border-radius: ${theme.radii.md};
          background: white;
          cursor: pointer;
          font-size: ${theme.fontSizes.sm};
          font-weight: 500;
          transition: all ${theme.transitions.fast};

          &.active {
            border-color: ${theme.colors.primary};
            background: ${theme.colors.primaryBg};
            color: ${theme.colors.primary};
          }

          &:hover:not(.active) {
            border-color: ${theme.colors.primaryLight};
          }
        }
      }

      .book-btn {
        width: 100%;
        padding: 14px;
        background: ${theme.colors.primary};
        color: white;
        border: none;
        border-radius: ${theme.radii.md};
        font-size: ${theme.fontSizes.base};
        font-weight: 600;
        cursor: pointer;
        transition: all ${theme.transitions.fast};
        margin-top: ${theme.spacing.lg};

        &:hover { background: ${theme.colors.primaryDark}; }
        &:disabled { opacity: 0.5; cursor: not-allowed; }
      }

      .error-msg {
        margin-top: ${theme.spacing.md};
        padding: 10px;
        background: ${theme.colors.errorBg};
        color: ${theme.colors.error};
        border-radius: ${theme.radii.md};
        font-size: ${theme.fontSizes.xs};
        text-align: center;
      }

      .success-msg {
        margin-top: ${theme.spacing.md};
        padding: 10px;
        background: ${theme.colors.successBg};
        color: ${theme.colors.success};
        border-radius: ${theme.radii.md};
        font-size: ${theme.fontSizes.xs};
        text-align: center;
      }
    }
  }

  .reviews-section {
    .review-card {
      padding: ${theme.spacing.base} 0;
      border-bottom: 1px solid ${theme.colors.borderLight};

      &:last-child { border: none; }

      .review-header {
        display: flex;
        justify-content: space-between;
        align-items: center;
        margin-bottom: 6px;

        .reviewer {
          font-weight: 600;
          font-size: ${theme.fontSizes.sm};
          display: flex;
          align-items: center;
          gap: 6px;

          .verified-tag {
            font-size: 10px;
            background: ${theme.colors.successBg};
            color: ${theme.colors.success};
            padding: 2px 6px;
            border-radius: ${theme.radii.full};
            font-weight: 500;
          }
        }

        .stars {
          color: ${theme.colors.star};
          font-size: ${theme.fontSizes.sm};
        }
      }

      .review-body {
        font-size: ${theme.fontSizes.sm};
        color: ${theme.colors.textSecondary};
        line-height: 1.6;
      }

      .review-date {
        font-size: 11px;
        color: ${theme.colors.textMuted};
        margin-top: 6px;
      }
    }
  }

  .loading-state {
    text-align: center;
    padding: ${theme.spacing['3xl']};
    color: ${theme.colors.textMuted};
  }
`;

export default function DoctorProfilePage() {
  const params = useParams();
  const router = useRouter();
  const doctorId = params.doctorId as string;

  const { data: doctor, isLoading } = useDoctorProfile(doctorId);
  const { data: reviews } = useDoctorReviews(doctorId, 5);
  const { addItem, isSlotInCart } = useCart();
  const { user } = useAuth();

  const [selectedSlot, setSelectedSlot] = useState<DoctorSlot | null>(null);
  const [selectedMode, setSelectedMode] = useState<'offline' | 'online'>('offline');
  const [bookingStatus, setBookingStatus] = useState<{ type: 'error' | 'success'; message: string } | null>(null);
  const [isBooking, setIsBooking] = useState(false);

  if (isLoading) {
    return <div css={pageStyles}><div className="loading-state">Loading doctor profile...</div></div>;
  }

  if (!doctor) {
    return <div css={pageStyles}><div className="loading-state">Doctor not found</div></div>;
  }

  const initials = doctor.profile.name.split(' ').map(n => n[0]).join('').slice(0, 2).toUpperCase();

  const handleAddToCart = async () => {
    if (!selectedSlot) {
      setBookingStatus({ type: 'error', message: 'Please select a time slot' });
      return;
    }

    if (!user) {
      router.push('/login');
      return;
    }

    setIsBooking(true);
    setBookingStatus(null);

    const result = await addItem({
      slotId: selectedSlot.id,
      doctorId: doctor.uid,
      doctorName: doctor.profile.name,
      specialty: doctor.profile.specialty[0],
      date: selectedSlot.date,
      startTime: selectedSlot.startTime,
      endTime: selectedSlot.endTime,
      fee: doctor.consultation.fee,
      mode: selectedMode,
    });

    setIsBooking(false);

    if (result.success) {
      setBookingStatus({ type: 'success', message: 'Slot reserved! Complete checkout within 10 minutes.' });
      setSelectedSlot(null);
    } else {
      setBookingStatus({ type: 'error', message: result.error || 'Could not reserve slot' });
    }
  };

  return (
    <div css={pageStyles}>
      <div className="back-link" onClick={() => router.back()}>
        ← Back to results
      </div>

      <div className="profile-grid">
        <div className="profile-main">
          {/* Header */}
          <div className="doc-header">
            <div className="top-row">
              <div className="avatar">
                {initials}
                {doctor.isVerified && (
                  <span className="verified-badge">✓ Verified</span>
                )}
              </div>
              <div className="details">
                <h1>Dr. {doctor.profile.name}</h1>
                <div className="specialty">{doctor.profile.specialty.join(' · ')}</div>
                <div className="meta-chips">
                  <span className="chip">🎓 {doctor.profile.experience} years exp</span>
                  <span className="chip">⭐ {doctor.rating.toFixed(1)} ({doctor.totalReviews} reviews)</span>
                  <span className="chip">⏱ {doctor.consultation.duration} min consult</span>
                  <span className="chip">🏥 {doctor.clinic.city}</span>
                </div>
              </div>
            </div>
          </div>

          {/* About */}
          <div className="section">
            <h2>About</h2>
            <p className="bio">{doctor.profile.bio}</p>
          </div>

          {/* Education */}
          <div className="section">
            <h2>🎓 Education</h2>
            <div className="edu-list">
              {doctor.profile.education.map((edu, i) => (
                <div key={i} className="edu-item">
                  <div className="degree">{edu.degree}</div>
                  <div className="inst">{edu.institution} · {edu.year}</div>
                </div>
              ))}
            </div>
          </div>

          {/* Languages */}
          <div className="section">
            <h2>🗣 Languages</h2>
            <div className="lang-tags">
              {doctor.profile.languages.map((lang) => (
                <span key={lang}>{lang}</span>
              ))}
            </div>
          </div>

          {/* Clinic */}
          <div className="section clinic-section">
            <h2>📍 Clinic</h2>
            <div className="clinic-info">
              <div className="clinic-details">
                <div className="clinic-name">{doctor.clinic.name}</div>
                <div>{doctor.clinic.address}</div>
                <div>{doctor.clinic.city}, {doctor.clinic.state} — {doctor.clinic.pincode}</div>
              </div>
            </div>
            <div className="map-placeholder">
              🗺 Map view (Google Maps integration)
            </div>
          </div>

          {/* Reviews */}
          <div className="section reviews-section">
            <h2>⭐ Patient Reviews ({doctor.totalReviews})</h2>
            {reviews?.map((review) => (
              <div key={review.id} className="review-card">
                <div className="review-header">
                  <span className="reviewer">
                    {review.userName}
                    {review.isVerified && <span className="verified-tag">Verified Visit</span>}
                  </span>
                  <span className="stars">{'★'.repeat(review.rating)}{'☆'.repeat(5 - review.rating)}</span>
                </div>
                <div className="review-body">{review.body}</div>
                <div className="review-date">
                  {new Date(review.createdAt).toLocaleDateString('en-IN', {
                    day: 'numeric', month: 'short', year: 'numeric',
                  })}
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Booking Sidebar */}
        <div className="booking-sidebar">
          <div className="booking-card">
            <h3>Book Appointment</h3>
            <div className="fee-display">
              {formatCurrency(doctor.consultation.fee)}
              <small> / consultation</small>
            </div>

            {/* Mode Selection */}
            {doctor.consultation.modes.length > 1 && (
              <div className="mode-select">
                {doctor.consultation.modes.map((mode) => (
                  <button
                    key={mode}
                    className={selectedMode === mode ? 'active' : ''}
                    onClick={() => setSelectedMode(mode)}
                  >
                    {mode === 'online' ? '💻 Online' : '🏥 In-Clinic'}
                  </button>
                ))}
              </div>
            )}

            {/* Slot Selector */}
            <SlotSelector
              doctorId={doctorId}
              selectedSlot={selectedSlot}
              onSlotSelect={setSelectedSlot}
              disabledSlotIds={[]}
            />

            <button
              className="book-btn"
              onClick={handleAddToCart}
              disabled={!selectedSlot || isBooking}
            >
              {isBooking
                ? 'Reserving...'
                : selectedSlot
                ? `Add to Cart — ${formatCurrency(doctor.consultation.fee)}`
                : 'Select a Time Slot'}
            </button>

            {bookingStatus && (
              <div className={bookingStatus.type === 'error' ? 'error-msg' : 'success-msg'}>
                {bookingStatus.message}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
