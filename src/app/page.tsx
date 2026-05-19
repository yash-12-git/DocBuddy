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
    padding: ${theme.spacing.xl} ${theme.spacing.base};
    text-align: center;
    position: relative; overflow: hidden;

    @media (min-width: 768px) { padding: ${theme.spacing['3xl']} ${theme.spacing.lg}; }

    h1 {
      font-family: ${theme.fonts.heading};
      font-size: clamp(1.5rem, 5vw, ${theme.fontSizes['4xl']});
      font-weight: 700; color: ${theme.colors.text};
      line-height: 1.2; max-width: 600px; margin: 0 auto;
      span { color: ${theme.colors.primary}; }
    }

    p {
      color: ${theme.colors.textSecondary}; font-size: ${theme.fontSizes.sm};
      max-width: 500px; margin: ${theme.spacing.sm} auto 0;
      @media (min-width: 768px) { font-size: ${theme.fontSizes.md}; margin-top: ${theme.spacing.base}; }
    }
  }

  .search-box {
    max-width: 600px; margin: ${theme.spacing.lg} auto 0;
    display: flex; gap: 8px;
    background: white; border-radius: ${theme.radii.xl}; padding: 4px;
    box-shadow: ${theme.shadows.lg}; border: 1px solid ${theme.colors.border};

    input {
      flex: 1; border: none; outline: none;
      padding: 12px 14px; font-size: 16px;
      border-radius: ${theme.radii.lg}; background: transparent;
      min-width: 0;
      &::placeholder { color: ${theme.colors.textMuted}; }
    }

    button {
      background: ${theme.colors.primary}; color: white; border: none;
      border-radius: ${theme.radii.lg}; padding: 12px 20px;
      font-size: ${theme.fontSizes.sm}; font-weight: 600;
      white-space: nowrap; flex-shrink: 0;
      &:hover { background: ${theme.colors.primaryDark}; }
    }
  }

  .stats {
    display: flex; justify-content: center; gap: ${theme.spacing.lg};
    margin-top: ${theme.spacing.lg}; flex-wrap: wrap;
    @media (min-width: 768px) { gap: ${theme.spacing['2xl']}; margin-top: ${theme.spacing.xl}; }
    .stat {
      text-align: center;
      .num { font-family: ${theme.fonts.heading}; font-size: ${theme.fontSizes.xl}; font-weight: 700; color: ${theme.colors.primary}; }
      .label { font-size: ${theme.fontSizes.xs}; color: ${theme.colors.textMuted}; text-transform: uppercase; letter-spacing: 0.5px; }
      @media (min-width: 768px) { .num { font-size: ${theme.fontSizes['2xl']}; } }
    }
  }

  .specialties {
    max-width: 1200px; margin: 0 auto;
    padding: ${theme.spacing.xl} ${theme.spacing.base};
    @media (min-width: 768px) { padding: ${theme.spacing['2xl']} ${theme.spacing.lg}; }

    h2 { font-family: ${theme.fonts.heading}; font-size: ${theme.fontSizes.xl}; font-weight: 700; margin-bottom: ${theme.spacing.base};
      @media (min-width: 768px) { font-size: ${theme.fontSizes['2xl']}; margin-bottom: ${theme.spacing.lg}; }
    }

    .spec-grid {
      display: grid; grid-template-columns: repeat(3, 1fr); gap: ${theme.spacing.sm};
      @media (min-width: 480px) { grid-template-columns: repeat(4, 1fr); gap: ${theme.spacing.md}; }
      @media (min-width: 768px) { grid-template-columns: repeat(auto-fill, minmax(160px, 1fr)); }
    }

    .spec-card {
      background: white; border: 1.5px solid ${theme.colors.border};
      border-radius: ${theme.radii.lg}; padding: ${theme.spacing.sm};
      text-align: center; font-size: ${theme.fontSizes.xs}; font-weight: 500;
      color: ${theme.colors.text}; transition: all var(--transition-fast);
      @media (min-width: 768px) { padding: ${theme.spacing.base} ${theme.spacing.md}; font-size: ${theme.fontSizes.sm}; }
      &:hover { border-color: ${theme.colors.primary}; background: ${theme.colors.primaryBg}; color: ${theme.colors.primary}; transform: translateY(-2px); }
      .icon { font-size: 24px; margin-bottom: 4px;
        @media (min-width: 768px) { font-size: 28px; margin-bottom: 6px; }
      }
    }
  }

  .top-doctors {
    max-width: 1200px; margin: 0 auto;
    padding: 0 ${theme.spacing.base} ${theme.spacing['2xl']};
    @media (min-width: 768px) { padding: 0 ${theme.spacing.lg} ${theme.spacing['3xl']}; }

    h2 { font-family: ${theme.fonts.heading}; font-size: ${theme.fontSizes.xl}; font-weight: 700; margin-bottom: ${theme.spacing.base};
      @media (min-width: 768px) { font-size: ${theme.fontSizes['2xl']}; margin-bottom: ${theme.spacing.lg}; }
    }

    .doctor-grid {
      display: grid; grid-template-columns: 1fr; gap: ${theme.spacing.base};
      @media (min-width: 640px) { grid-template-columns: repeat(2, 1fr); }
      @media (min-width: 1024px) { grid-template-columns: repeat(3, 1fr); gap: ${theme.spacing.lg}; }
    }
  }
`;

const SPECIALTY_ICONS: Record<string, string> = {
  'General Physician': '🩺', Cardiologist: '❤️', Dermatologist: '✨',
  Orthopedic: '🦴', Pediatrician: '👶', Gynecologist: '🌸',
  'ENT Specialist': '👂', Ophthalmologist: '👁', Neurologist: '🧠',
  Dentist: '🦷', Psychiatrist: '🧘', Urologist: '🏥',
};

export default function HomePage() {
  const router = useRouter();
  const [searchQuery, setSearchQuery] = useState('');
  const { data: topDoctors } = useDoctorSearch({ sortBy: 'rating', sortOrder: 'desc' });

  const handleSearch = () => {
    router.push(searchQuery.trim() ? `/search?q=${encodeURIComponent(searchQuery)}` : '/search');
  };

  return (
    <div css={pageStyles}>
      <section className="hero">
        <h1>Find & Book <span>Trusted Doctors</span> Near You</h1>
        <p>Discover top-rated doctors, check real-time availability, and book appointments instantly.</p>
        <div className="search-box">
          <input type="text" placeholder="Search specialty or doctor..." value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            onKeyDown={(e) => e.key === 'Enter' && handleSearch()} />
          <button onClick={handleSearch}>Search</button>
        </div>
        <div className="stats">
          <div className="stat"><div className="num">500+</div><div className="label">Verified Doctors</div></div>
          <div className="stat"><div className="num">50K+</div><div className="label">Appointments</div></div>
          <div className="stat"><div className="num">4.8</div><div className="label">Avg Rating</div></div>
        </div>
      </section>

      <section className="specialties">
        <h2>Browse by Specialty</h2>
        <div className="spec-grid">
          {SPECIALTIES.map((spec) => (
            <div key={spec} className="spec-card" onClick={() => router.push(`/search?specialty=${encodeURIComponent(spec)}`)}>
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
