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
  padding: ${theme.spacing.base};
  transition: all var(--transition-base);
  cursor: pointer;

  @media (min-width: 768px) { padding: ${theme.spacing.lg}; }

  &:hover {
    box-shadow: ${theme.shadows.cardHover};
    border-color: ${theme.colors.primaryLight};
    transform: translateY(-2px);
  }

  /* Prevent hover effects on touch */
  @media (hover: none) {
    &:hover { transform: none; box-shadow: none; }
    &:active { background: ${theme.colors.bgSecondary}; }
  }

  .card-top { display: flex; gap: ${theme.spacing.md}; }

  .avatar {
    width: 56px; height: 56px;
    border-radius: ${theme.radii.lg};
    background: linear-gradient(135deg, ${theme.colors.primaryBg}, ${theme.colors.primaryLight});
    display: flex; align-items: center; justify-content: center;
    font-size: 20px; font-weight: 700; color: ${theme.colors.primary};
    flex-shrink: 0; position: relative;

    @media (min-width: 768px) { width: 72px; height: 72px; font-size: 28px; }

    .verified {
      position: absolute; bottom: -3px; right: -3px;
      background: ${theme.colors.verified}; color: white;
      width: 18px; height: 18px; border-radius: 50%;
      display: flex; align-items: center; justify-content: center;
      font-size: 10px; border: 2px solid white;
    }
  }

  .info {
    flex: 1; min-width: 0;

    h3 {
      font-family: ${theme.fonts.heading};
      font-size: ${theme.fontSizes.base}; font-weight: 700;
      color: ${theme.colors.text}; margin: 0;
      overflow: hidden; text-overflow: ellipsis; white-space: nowrap;
      @media (min-width: 768px) { font-size: ${theme.fontSizes.lg}; }
    }

    .specialty {
      color: ${theme.colors.primary}; font-size: ${theme.fontSizes.xs};
      font-weight: 500; margin-top: 1px;
      overflow: hidden; text-overflow: ellipsis; white-space: nowrap;
      @media (min-width: 768px) { font-size: ${theme.fontSizes.sm}; }
    }

    .meta {
      display: flex; align-items: center; gap: ${theme.spacing.md};
      margin-top: 4px; font-size: ${theme.fontSizes.xs};
      color: ${theme.colors.textSecondary};
      span { display: flex; align-items: center; gap: 3px; }
    }

    .rating { color: ${theme.colors.star}; font-weight: 700;
      .count { color: ${theme.colors.textMuted}; font-weight: 400; }
    }
  }

  .clinic-info {
    margin-top: ${theme.spacing.sm}; font-size: ${theme.fontSizes.xs};
    color: ${theme.colors.textSecondary};
    overflow: hidden; text-overflow: ellipsis; white-space: nowrap;
    @media (min-width: 768px) { margin-top: ${theme.spacing.md}; }
  }

  .card-bottom {
    display: flex; align-items: center; justify-content: space-between;
    margin-top: ${theme.spacing.sm}; padding-top: ${theme.spacing.sm};
    border-top: 1px solid ${theme.colors.borderLight};
    @media (min-width: 768px) { margin-top: ${theme.spacing.base}; padding-top: ${theme.spacing.base}; }
  }

  .modes {
    display: flex; gap: 4px;
    .mode-tag {
      font-size: 10px; font-weight: 600;
      padding: 2px 8px; border-radius: ${theme.radii.full};
      text-transform: uppercase; letter-spacing: 0.3px;
      &.online { background: ${theme.colors.successBg}; color: ${theme.colors.success}; }
      &.offline { background: ${theme.colors.bgTertiary}; color: ${theme.colors.textSecondary}; }
      @media (min-width: 768px) { font-size: 11px; padding: 3px 10px; }
    }
  }

  .fee {
    font-family: ${theme.fonts.heading}; font-size: ${theme.fontSizes.base};
    font-weight: 700; color: ${theme.colors.text};
    small { font-size: ${theme.fontSizes.xs}; font-weight: 400; color: ${theme.colors.textMuted}; }
    @media (min-width: 768px) { font-size: ${theme.fontSizes.lg}; }
  }

  .book-btn {
    margin-top: ${theme.spacing.sm}; width: 100%;
    background: ${theme.colors.primary}; color: white;
    border: none; border-radius: ${theme.radii.md};
    padding: 10px; font-size: ${theme.fontSizes.sm}; font-weight: 600;
    transition: all var(--transition-fast);
    @media (min-width: 768px) { padding: 12px; margin-top: ${theme.spacing.base}; }
    &:hover { background: ${theme.colors.primaryDark}; }
  }
`;

interface DoctorCardProps { doctor: DoctorProfile; showBookButton?: boolean; }

export default function DoctorCard({ doctor, showBookButton = true }: DoctorCardProps) {
  const router = useRouter();
  const initials = doctor.profile.name.split(' ').map((n) => n[0]).join('').slice(0, 2).toUpperCase();

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
            <span className="rating">⭐ {doctor.rating.toFixed(1)} <span className="count">({doctor.totalReviews})</span></span>
          </div>
        </div>
      </div>
      <div className="clinic-info">📍 {doctor.clinic.name}, {doctor.clinic.address}</div>
      <div className="card-bottom">
        <div className="modes">
          {doctor.consultation.modes.map((mode) => (
            <span key={mode} className={`mode-tag ${mode}`}>
              {mode === 'online' ? '💻 Online' : '🏥 Clinic'}
            </span>
          ))}
        </div>
        <div className="fee">{formatCurrency(doctor.consultation.fee)}<small> /consult</small></div>
      </div>
      {showBookButton && (
        <button className="book-btn" onClick={(e) => { e.stopPropagation(); router.push(`/doctors/${doctor.uid}`); }}>
          Book Appointment
        </button>
      )}
    </div>
  );
}
