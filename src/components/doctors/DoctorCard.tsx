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
  padding: ${theme.spacing.lg};
  transition: all ${theme.transitions.base};
  cursor: pointer;

  &:hover {
    box-shadow: ${theme.shadows.cardHover};
    border-color: ${theme.colors.primaryLight};
    transform: translateY(-2px);
  }

  .card-top {
    display: flex;
    gap: ${theme.spacing.base};
  }

  .avatar {
    width: 72px;
    height: 72px;
    border-radius: ${theme.radii.lg};
    background: linear-gradient(135deg, ${theme.colors.primaryBg}, ${theme.colors.primaryLight}20);
    display: flex;
    align-items: center;
    justify-content: center;
    font-size: 28px;
    font-weight: 700;
    color: ${theme.colors.primary};
    flex-shrink: 0;
    position: relative;

    .verified {
      position: absolute;
      bottom: -4px;
      right: -4px;
      background: ${theme.colors.verified};
      color: white;
      width: 22px;
      height: 22px;
      border-radius: 50%;
      display: flex;
      align-items: center;
      justify-content: center;
      font-size: 12px;
      border: 2px solid white;
    }
  }

  .info {
    flex: 1;
    min-width: 0;

    h3 {
      font-family: ${theme.fonts.heading};
      font-size: ${theme.fontSizes.lg};
      font-weight: 700;
      color: ${theme.colors.text};
      margin: 0;
      display: flex;
      align-items: center;
      gap: 6px;
    }

    .specialty {
      color: ${theme.colors.primary};
      font-size: ${theme.fontSizes.sm};
      font-weight: 500;
      margin-top: 2px;
    }

    .meta {
      display: flex;
      align-items: center;
      gap: ${theme.spacing.base};
      margin-top: 6px;
      font-size: ${theme.fontSizes.xs};
      color: ${theme.colors.textSecondary};

      span {
        display: flex;
        align-items: center;
        gap: 4px;
      }
    }
  }

  .rating {
    display: flex;
    align-items: center;
    gap: 4px;
    color: ${theme.colors.star};
    font-weight: 700;
    font-size: ${theme.fontSizes.sm};

    .count {
      color: ${theme.colors.textMuted};
      font-weight: 400;
      font-size: ${theme.fontSizes.xs};
    }
  }

  .card-bottom {
    display: flex;
    align-items: center;
    justify-content: space-between;
    margin-top: ${theme.spacing.base};
    padding-top: ${theme.spacing.base};
    border-top: 1px solid ${theme.colors.borderLight};
  }

  .modes {
    display: flex;
    gap: 6px;

    .mode-tag {
      font-size: 11px;
      font-weight: 600;
      padding: 3px 10px;
      border-radius: ${theme.radii.full};
      text-transform: uppercase;
      letter-spacing: 0.3px;

      &.online {
        background: ${theme.colors.successBg};
        color: ${theme.colors.success};
      }

      &.offline {
        background: ${theme.colors.bgTertiary};
        color: ${theme.colors.textSecondary};
      }
    }
  }

  .fee {
    font-family: ${theme.fonts.heading};
    font-size: ${theme.fontSizes.lg};
    font-weight: 700;
    color: ${theme.colors.text};

    small {
      font-size: ${theme.fontSizes.xs};
      font-weight: 400;
      color: ${theme.colors.textMuted};
    }
  }

  .clinic-info {
    margin-top: ${theme.spacing.md};
    font-size: ${theme.fontSizes.xs};
    color: ${theme.colors.textSecondary};
    display: flex;
    align-items: flex-start;
    gap: 6px;
    line-height: 1.4;
  }

  .book-btn {
    margin-top: ${theme.spacing.base};
    width: 100%;
    background: ${theme.colors.primary};
    color: white;
    border: none;
    border-radius: ${theme.radii.md};
    padding: 12px;
    font-size: ${theme.fontSizes.sm};
    font-weight: 600;
    cursor: pointer;
    transition: all ${theme.transitions.fast};

    &:hover {
      background: ${theme.colors.primaryDark};
    }
  }
`;

interface DoctorCardProps {
  doctor: DoctorProfile;
  showBookButton?: boolean;
}

export default function DoctorCard({ doctor, showBookButton = true }: DoctorCardProps) {
  const router = useRouter();

  const initials = doctor.profile.name
    .split(' ')
    .map((n) => n[0])
    .join('')
    .slice(0, 2)
    .toUpperCase();

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
            <span>🎓 {doctor.profile.experience} yrs exp</span>
            <span className="rating">
              ⭐ {doctor.rating.toFixed(1)}
              <span className="count">({doctor.totalReviews})</span>
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
              {mode === 'online' ? '💻 Online' : '🏥 In-clinic'}
            </span>
          ))}
        </div>

        <div className="fee">
          {formatCurrency(doctor.consultation.fee)}
          <small> / consult</small>
        </div>
      </div>

      {showBookButton && (
        <button
          className="book-btn"
          onClick={(e) => {
            e.stopPropagation();
            router.push(`/doctors/${doctor.uid}`);
          }}
        >
          Book Appointment
        </button>
      )}
    </div>
  );
}
