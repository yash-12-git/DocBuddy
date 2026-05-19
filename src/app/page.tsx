/** @jsxImportSource @emotion/react */
'use client';

import { css } from '@emotion/react';
import { theme } from '@/lib/theme';
import { useRouter } from 'next/navigation';
import { useState } from 'react';
import { SPECIALTIES } from '@/lib/seed-data';
import { useDoctorSearch } from '@/hooks';
import DoctorCard from '@/components/doctors/DoctorCard';

const pageStyles = css`
  .hero {
    background: linear-gradient(135deg, ${theme.colors.primaryBg} 0%, white 50%, #f0fdf4 100%);
    padding: ${theme.spacing['3xl']} ${theme.spacing.lg};
    text-align: center;
    position: relative;
    overflow: hidden;

    &::before {
      content: '';
      position: absolute;
      top: -50%;
      right: -30%;
      width: 600px;
      height: 600px;
      border-radius: 50%;
      background: ${theme.colors.primary}08;
    }

    h1 {
      font-family: ${theme.fonts.heading};
      font-size: clamp(2rem, 5vw, ${theme.fontSizes['4xl']});
      font-weight: 700;
      color: ${theme.colors.text};
      line-height: 1.2;
      max-width: 600px;
      margin: 0 auto;

      span {
        color: ${theme.colors.primary};
      }
    }

    p {
      color: ${theme.colors.textSecondary};
      font-size: ${theme.fontSizes.md};
      max-width: 500px;
      margin: ${theme.spacing.base} auto 0;
    }
  }

  .search-box {
    max-width: 600px;
    margin: ${theme.spacing.xl} auto 0;
    display: flex;
    gap: 8px;
    background: white;
    border-radius: ${theme.radii.xl};
    padding: 6px;
    box-shadow: ${theme.shadows.lg};
    border: 1px solid ${theme.colors.border};

    input {
      flex: 1;
      border: none;
      outline: none;
      padding: 12px 16px;
      font-size: ${theme.fontSizes.base};
      border-radius: ${theme.radii.lg};
      background: transparent;

      &::placeholder {
        color: ${theme.colors.textMuted};
      }
    }

    button {
      background: ${theme.colors.primary};
      color: white;
      border: none;
      border-radius: ${theme.radii.lg};
      padding: 12px 28px;
      font-size: ${theme.fontSizes.sm};
      font-weight: 600;
      cursor: pointer;
      transition: all ${theme.transitions.fast};
      white-space: nowrap;

      &:hover {
        background: ${theme.colors.primaryDark};
      }
    }
  }

  .stats {
    display: flex;
    justify-content: center;
    gap: ${theme.spacing['2xl']};
    margin-top: ${theme.spacing.xl};
    flex-wrap: wrap;

    .stat {
      text-align: center;

      .num {
        font-family: ${theme.fonts.heading};
        font-size: ${theme.fontSizes['2xl']};
        font-weight: 700;
        color: ${theme.colors.primary};
      }

      .label {
        font-size: ${theme.fontSizes.xs};
        color: ${theme.colors.textMuted};
        text-transform: uppercase;
        letter-spacing: 0.5px;
      }
    }
  }

  .specialties {
    max-width: 1200px;
    margin: 0 auto;
    padding: ${theme.spacing['2xl']} ${theme.spacing.lg};

    h2 {
      font-family: ${theme.fonts.heading};
      font-size: ${theme.fontSizes['2xl']};
      font-weight: 700;
      margin-bottom: ${theme.spacing.lg};
      color: ${theme.colors.text};
    }

    .spec-grid {
      display: grid;
      grid-template-columns: repeat(auto-fill, minmax(160px, 1fr));
      gap: ${theme.spacing.md};
    }

    .spec-card {
      background: white;
      border: 1.5px solid ${theme.colors.border};
      border-radius: ${theme.radii.lg};
      padding: ${theme.spacing.base} ${theme.spacing.md};
      text-align: center;
      cursor: pointer;
      transition: all ${theme.transitions.fast};
      font-size: ${theme.fontSizes.sm};
      font-weight: 500;
      color: ${theme.colors.text};

      &:hover {
        border-color: ${theme.colors.primary};
        background: ${theme.colors.primaryBg};
        color: ${theme.colors.primary};
        transform: translateY(-2px);
        box-shadow: ${theme.shadows.md};
      }

      .icon {
        font-size: 28px;
        margin-bottom: 6px;
      }
    }
  }

  .top-doctors {
    max-width: 1200px;
    margin: 0 auto;
    padding: 0 ${theme.spacing.lg} ${theme.spacing['3xl']};

    h2 {
      font-family: ${theme.fonts.heading};
      font-size: ${theme.fontSizes['2xl']};
      font-weight: 700;
      margin-bottom: ${theme.spacing.lg};
    }

    .doctor-grid {
      display: grid;
      grid-template-columns: repeat(auto-fill, minmax(340px, 1fr));
      gap: ${theme.spacing.lg};
    }
  }
`;

const SPECIALTY_ICONS: Record<string, string> = {
  'General Physician': '🩺',
  Cardiologist: '❤️',
  Dermatologist: '✨',
  Orthopedic: '🦴',
  Pediatrician: '👶',
  Gynecologist: '🌸',
  'ENT Specialist': '👂',
  Ophthalmologist: '👁',
  Neurologist: '🧠',
  Dentist: '🦷',
  Psychiatrist: '🧘',
  Urologist: '🏥',
};

export default function HomePage() {
  const router = useRouter();
  const [searchQuery, setSearchQuery] = useState('');
  const { data: topDoctors } = useDoctorSearch({ sortBy: 'rating', sortOrder: 'desc' });

  const handleSearch = () => {
    if (searchQuery.trim()) {
      router.push(`/search?q=${encodeURIComponent(searchQuery)}`);
    } else {
      router.push('/search');
    }
  };

  return (
    <div css={pageStyles}>
      <section className="hero">
        <h1>
          Find & Book <span>Trusted Doctors</span> Near You
        </h1>
        <p>
          Discover top-rated doctors, check real-time availability, and book appointments instantly.
        </p>

        <div className="search-box">
          <input
            type="text"
            placeholder="Search by doctor, specialty, or clinic..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            onKeyDown={(e) => e.key === 'Enter' && handleSearch()}
          />
          <button onClick={handleSearch}>Search</button>
        </div>

        <div className="stats">
          <div className="stat">
            <div className="num">500+</div>
            <div className="label">Verified Doctors</div>
          </div>
          <div className="stat">
            <div className="num">50K+</div>
            <div className="label">Appointments Booked</div>
          </div>
          <div className="stat">
            <div className="num">4.8</div>
            <div className="label">Average Rating</div>
          </div>
        </div>
      </section>

      <section className="specialties">
        <h2>Browse by Specialty</h2>
        <div className="spec-grid">
          {SPECIALTIES.map((spec) => (
            <div
              key={spec}
              className="spec-card"
              onClick={() => router.push(`/search?specialty=${encodeURIComponent(spec)}`)}
            >
              <div className="icon">{SPECIALTY_ICONS[spec] || '🏥'}</div>
              {spec}
            </div>
          ))}
        </div>
      </section>

      <section className="top-doctors">
        <h2>Top Rated Doctors</h2>
        <div className="doctor-grid">
          {topDoctors?.slice(0, 6).map((doctor) => (
            <DoctorCard key={doctor.uid} doctor={doctor} />
          ))}
        </div>
      </section>
    </div>
  );
}
