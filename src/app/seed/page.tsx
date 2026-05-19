/** @jsxImportSource @emotion/react */
'use client';

import { css } from '@emotion/react';
import { theme } from '@/lib/theme';
import { getClientDb } from '@/lib/firebase/client';
import { SEED_DOCTORS, generateSeedSlots, generateSeedReviews } from '@/lib/seed-data';
import {
  doc,
  setDoc,
  collection,
  getDocs,
  query,
  where,
  writeBatch,
  Timestamp,
} from 'firebase/firestore';
import { useState } from 'react';

const pageStyles = css`
  max-width: 700px;
  margin: 0 auto;
  padding: ${theme.spacing['2xl']} ${theme.spacing.lg};

  h1 {
    font-family: ${theme.fonts.heading};
    font-size: ${theme.fontSizes['2xl']};
    font-weight: 700;
    margin-bottom: ${theme.spacing.base};
  }

  .warning {
    background: ${theme.colors.warningBg};
    border: 1px solid ${theme.colors.warning}30;
    border-radius: ${theme.radii.lg};
    padding: ${theme.spacing.lg};
    margin-bottom: ${theme.spacing.xl};
    font-size: ${theme.fontSizes.sm};
    color: ${theme.colors.text};
    line-height: 1.6;
  }

  .card {
    background: white;
    border: 1px solid ${theme.colors.border};
    border-radius: ${theme.radii.xl};
    padding: ${theme.spacing.xl};
    margin-bottom: ${theme.spacing.lg};

    h2 {
      font-family: ${theme.fonts.heading};
      font-size: ${theme.fontSizes.lg};
      font-weight: 700;
      margin: 0 0 ${theme.spacing.md};
    }

    p {
      color: ${theme.colors.textSecondary};
      font-size: ${theme.fontSizes.sm};
      margin-bottom: ${theme.spacing.lg};
    }
  }

  .seed-btn {
    padding: 12px 28px;
    border-radius: ${theme.radii.md};
    font-size: ${theme.fontSizes.sm};
    font-weight: 600;
    cursor: pointer;
    border: none;
    transition: all ${theme.transitions.fast};
    margin-right: ${theme.spacing.md};
    margin-bottom: ${theme.spacing.md};

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

    &:disabled {
      opacity: 0.5;
      cursor: not-allowed;
    }
  }

  .log {
    margin-top: ${theme.spacing.lg};
    background: ${theme.colors.bgTertiary};
    border-radius: ${theme.radii.md};
    padding: ${theme.spacing.base};
    max-height: 400px;
    overflow-y: auto;
    font-family: ${theme.fonts.mono};
    font-size: 12px;
    line-height: 1.8;

    .log-entry {
      &.success { color: ${theme.colors.success}; }
      &.error { color: ${theme.colors.error}; }
      &.info { color: ${theme.colors.info}; }
    }
  }

  .stats {
    display: grid;
    grid-template-columns: repeat(3, 1fr);
    gap: ${theme.spacing.md};
    margin-bottom: ${theme.spacing.lg};

    .stat {
      background: ${theme.colors.bgSecondary};
      padding: ${theme.spacing.base};
      border-radius: ${theme.radii.md};
      text-align: center;

      .num {
        font-size: ${theme.fontSizes.xl};
        font-weight: 700;
        color: ${theme.colors.primary};
      }
      .label {
        font-size: 11px;
        color: ${theme.colors.textMuted};
        text-transform: uppercase;
      }
    }
  }
`;

type LogEntry = { message: string; type: 'success' | 'error' | 'info' };

export default function SeedPage() {
  const [logs, setLogs] = useState<LogEntry[]>([]);
  const [isSeeding, setIsSeeding] = useState(false);
  const [stats, setStats] = useState({ doctors: 0, slots: 0, reviews: 0 });

  const addLog = (message: string, type: LogEntry['type'] = 'info') => {
    setLogs((prev) => [...prev, { message, type }]);
  };

  // ─── Seed Doctors ───────────────────────────────────────────────
  const seedDoctors = async () => {
    const db = getClientDb();
    let count = 0;

    addLog('📝 Starting doctor seed...');

    for (const doctorData of SEED_DOCTORS) {
      try {
        const docRef = doc(db, 'doctors', doctorData.uid);
        await setDoc(docRef, {
          ...doctorData,
          createdAt: Timestamp.now(),
          updatedAt: Timestamp.now(),
          approvedAt: Timestamp.now(),
        });
        count++;
        addLog(`  ✓ Dr. ${doctorData.profile.name} (${doctorData.uid})`, 'success');
      } catch (err: any) {
        addLog(`  ✗ Failed: ${doctorData.profile.name} — ${err.message}`, 'error');
      }
    }

    addLog(`✅ Seeded ${count} doctors`, 'success');
    return count;
  };

  // ─── Seed Slots ─────────────────────────────────────────────────
  const seedSlots = async () => {
    const db = getClientDb();
    let totalSlots = 0;

    addLog('📝 Starting slot seed...');

    for (const doctorData of SEED_DOCTORS) {
      const slots = generateSeedSlots(doctorData.uid, doctorData.consultation.duration);
      addLog(`  Generating ${slots.length} slots for Dr. ${doctorData.profile.name}...`);

      // Write in batches of 500 (Firestore batch limit)
      const batchSize = 450;
      for (let i = 0; i < slots.length; i += batchSize) {
        const batch = writeBatch(db);
        const chunk = slots.slice(i, i + batchSize);

        for (const slot of chunk) {
          const slotRef = doc(db, 'doctorSlots', slot.id);
          batch.set(slotRef, {
            ...slot,
            createdAt: Timestamp.now(),
          });
        }

        try {
          await batch.commit();
          totalSlots += chunk.length;
        } catch (err: any) {
          addLog(`  ✗ Batch failed for ${doctorData.profile.name}: ${err.message}`, 'error');
        }
      }

      addLog(`  ✓ ${slots.length} slots for Dr. ${doctorData.profile.name}`, 'success');
    }

    addLog(`✅ Seeded ${totalSlots} total slots`, 'success');
    return totalSlots;
  };

  // ─── Seed Reviews ───────────────────────────────────────────────
  const seedReviews = async () => {
    const db = getClientDb();
    let totalReviews = 0;

    addLog('📝 Starting review seed...');

    for (const doctorData of SEED_DOCTORS) {
      const reviews = generateSeedReviews(doctorData.uid, 5);
      const batch = writeBatch(db);

      for (const review of reviews) {
        const reviewRef = doc(db, 'reviews', review.id);
        batch.set(reviewRef, review);
      }

      try {
        await batch.commit();
        totalReviews += reviews.length;
        addLog(`  ✓ ${reviews.length} reviews for Dr. ${doctorData.profile.name}`, 'success');
      } catch (err: any) {
        addLog(`  ✗ Reviews failed for ${doctorData.profile.name}: ${err.message}`, 'error');
      }
    }

    addLog(`✅ Seeded ${totalReviews} total reviews`, 'success');
    return totalReviews;
  };

  // ─── Run Full Seed ──────────────────────────────────────────────
  const runFullSeed = async () => {
    setIsSeeding(true);
    setLogs([]);
    setStats({ doctors: 0, slots: 0, reviews: 0 });

    addLog('🚀 Starting full database seed...');
    addLog('');

    try {
      const doctorCount = await seedDoctors();
      addLog('');
      const slotCount = await seedSlots();
      addLog('');
      const reviewCount = await seedReviews();

      setStats({ doctors: doctorCount, slots: slotCount, reviews: reviewCount });

      addLog('');
      addLog('🎉 Database seed complete!', 'success');
      addLog(`   ${doctorCount} doctors | ${slotCount} slots | ${reviewCount} reviews`, 'success');
    } catch (err: any) {
      addLog(`💥 Seed failed: ${err.message}`, 'error');
    }

    setIsSeeding(false);
  };

  // ─── Check Current Data ─────────────────────────────────────────
  const checkData = async () => {
    const db = getClientDb();
    setLogs([]);
    addLog('🔍 Checking current Firestore data...');

    try {
      const doctorsSnap = await getDocs(collection(db, 'doctors'));
      addLog(`  Doctors: ${doctorsSnap.size} documents`);

      const slotsSnap = await getDocs(collection(db, 'doctorSlots'));
      addLog(`  Slots: ${slotsSnap.size} documents`);

      const ordersSnap = await getDocs(collection(db, 'orders'));
      addLog(`  Orders: ${ordersSnap.size} documents`);

      const reviewsSnap = await getDocs(collection(db, 'reviews'));
      addLog(`  Reviews: ${reviewsSnap.size} documents`);

      const paymentsSnap = await getDocs(collection(db, 'payments'));
      addLog(`  Payments: ${paymentsSnap.size} documents`);

      setStats({
        doctors: doctorsSnap.size,
        slots: slotsSnap.size,
        reviews: reviewsSnap.size,
      });

      addLog('', 'info');
      if (doctorsSnap.size === 0) {
        addLog('⚠️  No doctors found — run "Seed All Data" to populate', 'error');
      } else {
        addLog('✅ Database has data', 'success');
      }
    } catch (err: any) {
      addLog(`✗ Error reading Firestore: ${err.message}`, 'error');
      addLog('  Check your Firebase config and security rules.', 'error');
    }
  };

  return (
    <div css={pageStyles}>
      <h1>🌱 Database Seed</h1>

      <div className="warning">
        <strong>⚠️ Development tool</strong> — This page populates your Firestore database
        with sample doctors, appointment slots (7 days ahead), and reviews.
        Run this once after connecting Firebase, then remove the page in production.
      </div>

      <div className="stats">
        <div className="stat">
          <div className="num">{stats.doctors}</div>
          <div className="label">Doctors</div>
        </div>
        <div className="stat">
          <div className="num">{stats.slots}</div>
          <div className="label">Slots</div>
        </div>
        <div className="stat">
          <div className="num">{stats.reviews}</div>
          <div className="label">Reviews</div>
        </div>
      </div>

      <div className="card">
        <h2>Actions</h2>
        <p>
          Seed populates 8 doctors in Pune with realistic profiles, 7 days of appointment
          slots (morning + evening sessions), and sample patient reviews.
        </p>

        <button
          className="seed-btn primary"
          onClick={runFullSeed}
          disabled={isSeeding}
        >
          {isSeeding ? '⏳ Seeding...' : '🌱 Seed All Data'}
        </button>

        <button
          className="seed-btn primary"
          onClick={checkData}
          disabled={isSeeding}
          style={{ background: theme.colors.info }}
        >
          🔍 Check Database
        </button>
      </div>

      {logs.length > 0 && (
        <div className="log">
          {logs.map((entry, i) => (
            <div key={i} className={`log-entry ${entry.type}`}>
              {entry.message}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
