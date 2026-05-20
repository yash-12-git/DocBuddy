/** @jsxImportSource @emotion/react */
'use client';

import { css } from '@emotion/react';
import { theme } from '@/lib/theme';
import { DoctorProfile } from '@/types';
import { formatCurrency } from '@/lib/utils';
import { useRouter } from 'next/navigation';

const cardStyles = css`
  background: white;
  border-radius: ${theme.radii.xl};
  border: 1px solid ${theme.colors.border};
  padding: 14px;
  transition: box-shadow 0.2s ease, border-color 0.2s ease, transform 0.2s ease;
  cursor: pointer;
  /* FIX: prevent card from expanding past its grid cell */
  min-width: 0;
  overflow: hidden;
  width: 100%;
  box-sizing: border-box;

  @media (min-width: 768px) {
    padding: ${theme.spacing.lg};
  }

  &:hover {
    box-shadow: ${theme.shadows.cardHover};
    border-color: ${theme.colors.primaryLight};
    transform: translateY(-2px);
  }

  @media (hover: none) {
    &:hover { transform: none; box-shadow: none; }
    &:active { background: ${theme.colors.bgSecondary}; }
  }

  /* ── Top row: avatar + info ── */
  .card-top {
    display: flex;
    gap: 12px;
    /* FIX: ensure children don't overflow */
    min-width: 0;
  }

  .avatar {
    width: 52px; height: 52px;
    border-radius: ${theme.radii.lg};
    background: linear-gradient(135deg, ${theme.colors.primaryBg}, ${theme.colors.primaryLight});
    display: flex; align-items: center; justify-content: center;
    font-size: 18px; font-weight: 700; color: ${theme.colors.primary};
    flex-shrink: 0;
    position: relative;

    @media (min-width: 768px) { width: 68px; height: 68px; font-size: 24px; }

    .verified {
      position: absolute; bottom: -3px; right: -3px;
      background: ${theme.colors.verified}; color: white;
      width: 18px; height: 18px; border-radius: 50%;
      display: flex; align-items: center; justify-content: center;
      font-size: 10px; border: 2px solid white;
    }
  }

  .info {
    flex: 1;
    /* FIX: critical — without this, text ellipsis won't work inside flex */
    min-width: 0;
    overflow: hidden;

    h3 {
      font-family: ${theme.fonts.heading};
      font-size: 14px; font-weight: 700;
      color: ${theme.colors.text}; margin: 0;
      overflow: hidden; text-overflow: ellipsis; white-space: nowrap;
      @media (min-width: 768px) { font-size: ${theme.fontSizes.lg}; }
    }

    .specialty {
      color: ${theme.colors.primary}; font-size: 12px;
      font-weight: 500; margin-top: 2px;
      overflow: hidden; text-overflow: ellipsis; white-space: nowrap;
      @media (min-width: 768px) { font-size: ${theme.fontSizes.sm}; }
    }

    .meta {
      display: flex; align-items: center; gap: 10px;
      flex-wrap: wrap;
      margin-top: 5px; font-size: 12px;
      color: ${theme.colors.textSecondary};

      span { display: flex; align-items: center; gap: 3px; white-space: nowrap; }
    }

    .rating {
      color: ${theme.colors.star}; font-weight: 700;
      .count { color: ${theme.colors.textMuted}; font-weight: 400; }
    }
  }

  /* ── Clinic info ── */
  .clinic-info {
    display: flex; align-items: center; gap: 4px;
    margin-top: 10px; font-size: 12px;
    color: ${theme.colors.textSecondary};
    /* FIX: must have overflow:hidden for ellipsis to work */
    overflow: hidden;
    white-space: nowrap;
    text-overflow: ellipsis;
    @media (min-width: 768px) { margin-top: ${theme.spacing.md}; font-size: 13px; }
  }

  /* ── Bottom row: modes + fee ── */
  .card-bottom {
    display: flex; align-items: center; justify-content: space-between;
    margin-top: 10px; padding-top: 10px;
    border-top: 1px solid ${theme.colors.borderLight};
    gap: 8px;
    /* FIX: don't let children overflow */
    min-width: 0;
    @media (min-width: 768px) { margin-top: ${theme.spacing.base}; padding-top: ${theme.spacing.base}; }
  }

  .modes {
    display: flex; gap: 4px;
    /* FIX: allow shrinking */
    flex-shrink: 1;
    flex-wrap: wrap;

    .mode-tag {
      font-size: 10px; font-weight: 600;
      padding: 3px 8px; border-radius: ${theme.radii.full};
      text-transform: uppercase; letter-spacing: 0.3px;
      white-space: nowrap;

      &.online { background: ${theme.colors.successBg}; color: ${theme.colors.success}; }
      &.offline { background: ${theme.colors.bgTertiary}; color: ${theme.colors.textSecondary}; }
      @media (min-width: 768px) { font-size: 11px; padding: 3px 10px; }
    }
  }

  .fee {
    font-family: ${theme.fonts.heading}; font-size: 15px;
    font-weight: 700; color: ${theme.colors.text};
    white-space: nowrap;
    flex-shrink: 0;

    small { font-size: 11px; font-weight: 400; color: ${theme.colors.textMuted}; }
    @media (min-width: 768px) { font-size: ${theme.fontSizes.lg}; }
  }

  /* ── Book button ── */
  .book-btn {
    margin-top: 12px; width: 100%;
    background: ${theme.colors.primary}; color: white;
    border: none; border-radius: ${theme.radii.md};
    padding: 11px; font-size: 14px; font-weight: 600;
    cursor: pointer; transition: all 0.15s ease;

    @media (min-width: 768px) { padding: 12px; margin-top: ${theme.spacing.base}; }

    &:hover { background: ${theme.colors.primaryDark}; }
    &:active { transform: scale(0.99); }
  }
`;

interface DoctorCardProps {
  doctor: DoctorProfile;
  showBookButton?: boolean;
}

export default function DoctorCard({ doctor, showBookButton = true }: DoctorCardProps) {
  const router = useRouter();
  const initials = doctor.profile.name
    .split(' ').map((n) => n[0]).join('').slice(0, 2).toUpperCase();

  return (
    <div css={cardStyles} onClick={() => router.push(`/doctors/${doctor.uid}`)}>
      <div className="card-top">
        <div className="avatar">
          {initials}
          {doctor.isVerified && <span className="verified">✓</span>}
        </div>
        <div className="info">
          <h3>Dr. {doctor.profile.name}</h3>
          <div className="specialty">{doctor.profile.specialty.join(' · ')}</div>
          <div className="meta">
            <span>🎓 {doctor.profile.experience} yrs</span>
            <span className="rating">
              ⭐ {doctor.rating.toFixed(1)}
              <span className="count"> ({doctor.totalReviews})</span>
            </span>
          </div>
        </div>
      </div>

      <div className="clinic-info">
        📍 {doctor.clinic.name}, {doctor.clinic.address}
      </div>

      <div className="card-bottom">
        <div className="modes">
          {doctor.consultation.modes.map((mode) => (
            <span key={mode} className={`mode-tag ${mode}`}>
              {mode === 'online' ? '💻 Online' : '🏥 Clinic'}
            </span>
          ))}
        </div>
        <div className="fee">
          {formatCurrency(doctor.consultation.fee)}<small> /consult</small>
        </div>
      </div>

      {showBookButton && (
        <button
          className="book-btn"
          onClick={(e) => { e.stopPropagation(); router.push(`/doctors/${doctor.uid}`); }}
        >
          Book Appointment
        </button>
      )}
    </div>
  );
}
