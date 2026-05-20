/** @jsxImportSource @emotion/react */
'use client';

import { css } from '@emotion/react';
import { theme } from '@/lib/theme';
import { useDoctorSearch, useSpecialties } from '@/hooks';
import { SearchFilters, ConsultationMode } from '@/types';
import DoctorCard from '@/components/doctors/DoctorCard';
import { useSearchParams, useRouter } from 'next/navigation';
import { useState, useMemo, Suspense } from 'react';

const pageStyles = css`
  max-width: 1200px;
  margin: 0 auto;
  padding: ${theme.spacing.lg} ${theme.spacing.base};

  @media (min-width: 768px) { padding: ${theme.spacing.xl} ${theme.spacing.lg}; }

  .search-header {
    margin-bottom: ${theme.spacing.xl};

    h1 {
      font-family: ${theme.fonts.heading};
      font-size: ${theme.fontSizes['2xl']};
      font-weight: 700;
    }

    .result-count {
      color: ${theme.colors.textSecondary};
      font-size: ${theme.fontSizes.sm};
      margin-top: 4px;
    }
  }

  .search-bar {
    display: flex;
    gap: 8px;
    margin-bottom: ${theme.spacing.lg};

    input {
      flex: 1;
      padding: 12px 16px;
      border: 1.5px solid ${theme.colors.border};
      border-radius: ${theme.radii.md};
      font-size: ${theme.fontSizes.base};
      outline: none;
      transition: border-color ${theme.transitions.fast};

      &:focus {
        border-color: ${theme.colors.primary};
      }
    }
  }

  .filters {
    display: flex;
    gap: 8px;
    margin-bottom: ${theme.spacing.lg};
    overflow-x: auto;
    padding-bottom: 8px;
    -webkit-overflow-scrolling: touch;
    scrollbar-width: none;
    &::-webkit-scrollbar { display: none; }

    @media (min-width: 768px) {
      gap: ${theme.spacing.md};
      margin-bottom: ${theme.spacing.xl};
      flex-wrap: wrap;
      overflow-x: visible;
      padding-bottom: 0;
    }

    select, .filter-btn {
      padding: 9px 16px;
      border: 1.5px solid ${theme.colors.border};
      border-radius: 100px;
      background: white;
      font-size: 13px;
      font-weight: 500;
      color: ${theme.colors.text};
      cursor: pointer;
      transition: all 0.15s ease;
      outline: none;
      white-space: nowrap;
      flex-shrink: 0;

      &:hover, &:focus {
        border-color: ${theme.colors.primary};
        background: ${theme.colors.primaryBg};
      }

      &.active {
        background: ${theme.colors.primary};
        border-color: ${theme.colors.primary};
        color: white;
        font-weight: 600;
      }
    }

    select {
      appearance: none;
      background-image: url("data:image/svg+xml,%3Csvg width='10' height='6' viewBox='0 0 10 6' fill='none' xmlns='http://www.w3.org/2000/svg'%3E%3Cpath d='M1 1L5 5L9 1' stroke='%2364748B' stroke-width='1.5' stroke-linecap='round'/%3E%3C/svg%3E");
      background-repeat: no-repeat;
      background-position: right 12px center;
      padding-right: 32px;
    }

    .clear-btn {
      background: white;
      border: 1.5px solid ${theme.colors.borderLight};
      border-radius: 100px;
      color: ${theme.colors.error};
      font-size: 13px;
      font-weight: 500;
      cursor: pointer;
      padding: 9px 16px;
      white-space: nowrap;
      flex-shrink: 0;
      transition: all 0.15s ease;
      &:hover {
        background: ${theme.colors.errorBg};
        border-color: ${theme.colors.error};
      }

      &:hover { text-decoration: underline; }
    }
  }

  .results {
    display: grid;
    grid-template-columns: 1fr;
    gap: ${theme.spacing.base};

    @media (min-width: 640px) { grid-template-columns: repeat(auto-fill, minmax(320px, 1fr)); gap: ${theme.spacing.lg}; }
  }

  .no-results {
    text-align: center;
    padding: ${theme.spacing['3xl']};
    color: ${theme.colors.textMuted};

    .emoji { font-size: 48px; margin-bottom: ${theme.spacing.base}; }
    h3 { font-size: ${theme.fontSizes.lg}; color: ${theme.colors.text}; }
    p { margin-top: 8px; font-size: ${theme.fontSizes.sm}; }
  }

  .sort-bar {
    display: flex;
    justify-content: flex-end;
    margin-bottom: ${theme.spacing.base};

    select {
      padding: 6px 12px;
      border: 1px solid ${theme.colors.border};
      border-radius: ${theme.radii.sm};
      font-size: ${theme.fontSizes.xs};
      background: white;
      outline: none;
    }
  }
`;

function SearchContent() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const { data: specialties } = useSpecialties();

  const [query, setQuery] = useState(searchParams.get('q') || '');
  const [filters, setFilters] = useState<SearchFilters>({
    specialty: searchParams.get('specialty') || undefined,
    mode: (searchParams.get('mode') as ConsultationMode) || undefined,
    maxFee: searchParams.get('maxFee') ? Number(searchParams.get('maxFee')) : undefined,
    sortBy: 'rating',
    sortOrder: 'desc',
  });

  const searchFilters = useMemo(() => {
    const f: SearchFilters = { ...filters };
    if (query) {
      // Search query maps to specialty match
      f.specialty = query;
    }
    return f;
  }, [filters, query]);

  const { data: doctors, isLoading } = useDoctorSearch(searchFilters);

  const updateFilter = (key: keyof SearchFilters, value: any) => {
    setFilters((prev) => ({
      ...prev,
      [key]: prev[key] === value ? undefined : value,
    }));
  };

  const clearFilters = () => {
    setQuery('');
    setFilters({ sortBy: 'rating', sortOrder: 'desc' });
  };

  const hasActiveFilters = filters.specialty || filters.mode || filters.maxFee;

  return (
    <div css={pageStyles}>
      <div className="search-header">
        <h1>Find Doctors</h1>
        {doctors && (
          <p className="result-count">
            {doctors.length} doctor{doctors.length !== 1 ? 's' : ''} found
            {filters.specialty ? ` for "${filters.specialty}"` : ''}
          </p>
        )}
      </div>

      <div className="search-bar">
        <input
          type="text"
          placeholder="Search by specialty, doctor name..."
          value={query}
          onChange={(e) => setQuery(e.target.value)}
        />
      </div>

      <div className="filters">
        <select
          value={filters.specialty || ''}
          onChange={(e) => updateFilter('specialty', e.target.value || undefined)}
          className={filters.specialty ? 'active' : ''}
        >
          <option value="">All Specialties</option>
          {specialties?.map((s) => (
            <option key={s} value={s}>{s}</option>
          ))}
        </select>

        <button
          className={`filter-btn ${filters.mode === 'online' ? 'active' : ''}`}
          onClick={() => updateFilter('mode', 'online')}
        >
          💻 Online
        </button>

        <button
          className={`filter-btn ${filters.mode === 'offline' ? 'active' : ''}`}
          onClick={() => updateFilter('mode', 'offline')}
        >
          🏥 In-Clinic
        </button>

        <select
          value={filters.maxFee || ''}
          onChange={(e) =>
            updateFilter('maxFee', e.target.value ? Number(e.target.value) : undefined)
          }
          className={filters.maxFee ? 'active' : ''}
        >
          <option value="">Any Fee</option>
          <option value="500">Under ₹500</option>
          <option value="800">Under ₹800</option>
          <option value="1000">Under ₹1,000</option>
          <option value="1500">Under ₹1,500</option>
        </select>

        {hasActiveFilters && (
          <button className="clear-btn" onClick={clearFilters}>
            Clear filters
          </button>
        )}
      </div>

      <div className="sort-bar">
        <select
          value={`${filters.sortBy}-${filters.sortOrder}`}
          onChange={(e) => {
            const [by, order] = e.target.value.split('-');
            setFilters((f) => ({ ...f, sortBy: by as any, sortOrder: order as any }));
          }}
        >
          <option value="rating-desc">Highest Rated</option>
          <option value="fee-asc">Lowest Fee</option>
          <option value="fee-desc">Highest Fee</option>
          <option value="experience-desc">Most Experienced</option>
        </select>
      </div>

      {isLoading ? (
        <div style={{ textAlign: 'center', padding: '60px', color: theme.colors.textMuted }}>
          Finding doctors...
        </div>
      ) : doctors && doctors.length > 0 ? (
        <div className="results">
          {doctors.map((doc) => (
            <DoctorCard key={doc.uid} doctor={doc} />
          ))}
        </div>
      ) : (
        <div className="no-results">
          <div className="emoji">🔍</div>
          <h3>No doctors found</h3>
          <p>Try adjusting your filters or search for a different specialty</p>
        </div>
      )}
    </div>
  );
}

export default function SearchPage() {
  return (
    <Suspense fallback={<div style={{ padding: 40, textAlign: 'center' }}>Loading...</div>}>
      <SearchContent />
    </Suspense>
  );
}
