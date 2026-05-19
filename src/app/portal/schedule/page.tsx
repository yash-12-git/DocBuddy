/** @jsxImportSource @emotion/react */
'use client';

import { css } from '@emotion/react';
import { theme } from '@/lib/theme';
import { useAuth } from '@/contexts/AuthContext';
import { getDoctorSchedules, saveDoctorSchedule, deleteDoctorSchedule } from '@/services/portal.service';
import { getClientDb } from '@/lib/firebase/client';
import { collection, doc, setDoc, writeBatch, Timestamp } from 'firebase/firestore';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import { useState } from 'react';
import { getNextNDates } from '@/lib/utils';

const pageStyles = css`
  h1 { font-family: ${theme.fonts.heading}; font-size: ${theme.fontSizes['2xl']}; font-weight: 700; margin-bottom: ${theme.spacing.xl}; }

  .card {
    background: white; border: 1px solid ${theme.colors.border}; border-radius: ${theme.radii.xl};
    padding: ${theme.spacing.xl}; margin-bottom: ${theme.spacing.lg};
    h2 { font-family: ${theme.fonts.heading}; font-size: ${theme.fontSizes.lg}; font-weight: 700; margin: 0 0 ${theme.spacing.lg}; }
  }

  .schedule-grid {
    display: grid; gap: ${theme.spacing.md};
  }

  .schedule-row {
    display: flex; align-items: center; gap: ${theme.spacing.md}; padding: ${theme.spacing.base};
    background: ${theme.colors.bgSecondary}; border-radius: ${theme.radii.md};

    .day { font-weight: 600; font-size: ${theme.fontSizes.sm}; width: 100px; }
    .time { font-size: ${theme.fontSizes.sm}; color: ${theme.colors.textSecondary}; }
    .actions { margin-left: auto; display: flex; gap: 6px; }

    .del-btn {
      padding: 6px 12px; border: 1px solid ${theme.colors.error}30; background: white;
      color: ${theme.colors.error}; border-radius: ${theme.radii.sm}; cursor: pointer;
      font-size: 12px;
      &:hover { background: ${theme.colors.errorBg}; }
    }
  }

  .add-form {
    display: flex; flex-wrap: wrap; gap: ${theme.spacing.md}; align-items: flex-end;
    padding: ${theme.spacing.lg}; background: ${theme.colors.bgSecondary}; border-radius: ${theme.radii.md};

    .form-group {
      label { display: block; font-size: 12px; font-weight: 500; margin-bottom: 4px; color: ${theme.colors.textSecondary}; }
      select, input { padding: 8px 12px; border: 1px solid ${theme.colors.border}; border-radius: ${theme.radii.sm}; font-size: ${theme.fontSizes.sm}; outline: none; }
    }

    .add-btn {
      padding: 8px 20px; background: ${theme.colors.primary}; color: white; border: none;
      border-radius: ${theme.radii.md}; font-weight: 600; cursor: pointer; font-size: ${theme.fontSizes.sm};
      &:hover { background: ${theme.colors.primaryDark}; }
    }
  }

  .generate-section {
    margin-top: ${theme.spacing.lg}; padding: ${theme.spacing.lg}; background: ${theme.colors.infoBg};
    border-radius: ${theme.radii.md}; border: 1px solid ${theme.colors.info}20;

    h3 { font-size: ${theme.fontSizes.base}; font-weight: 700; margin-bottom: ${theme.spacing.md}; }
    p { font-size: ${theme.fontSizes.sm}; color: ${theme.colors.textSecondary}; margin-bottom: ${theme.spacing.md}; }

    .gen-btn {
      padding: 10px 24px; background: ${theme.colors.info}; color: white; border: none;
      border-radius: ${theme.radii.md}; font-weight: 600; cursor: pointer;
      &:hover { opacity: 0.9; }
      &:disabled { opacity: 0.5; cursor: not-allowed; }
    }
  }

  .toast {
    position: fixed; bottom: 24px; right: 24px; padding: 12px 24px;
    background: ${theme.colors.success}; color: white; border-radius: ${theme.radii.md};
    font-weight: 600; font-size: ${theme.fontSizes.sm}; z-index: 1000;
  }
`;

const DAYS = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];

export default function SchedulePage() {
  const { user } = useAuth();
  const userId = (user as any)?.uid;
  const queryClient = useQueryClient();

  const { data: schedules, isLoading } = useQuery({
    queryKey: ['doctor-schedules', userId],
    queryFn: () => getDoctorSchedules(userId),
    enabled: !!userId,
  });

  const [newDay, setNewDay] = useState('1');
  const [newStart, setNewStart] = useState('09:00');
  const [newEnd, setNewEnd] = useState('13:00');
  const [newDuration, setNewDuration] = useState('30');
  const [generating, setGenerating] = useState(false);
  const [showToast, setShowToast] = useState('');

  const handleAdd = async () => {
    if (!userId) return;
    await saveDoctorSchedule(userId, {
      doctorId: userId,
      dayOfWeek: Number(newDay) as any,
      startTime: newStart,
      endTime: newEnd,
      slotDuration: Number(newDuration),
      isActive: true,
      effectiveFrom: Timestamp.now(),
      effectiveTo: null,
    });
    queryClient.invalidateQueries({ queryKey: ['doctor-schedules'] });
    setShowToast('Schedule added');
    setTimeout(() => setShowToast(''), 3000);
  };

  const handleDelete = async (scheduleId: string) => {
    if (!userId) return;
    await deleteDoctorSchedule(userId, scheduleId);
    queryClient.invalidateQueries({ queryKey: ['doctor-schedules'] });
  };

  const generateSlots = async () => {
    if (!userId || !schedules?.length) return;
    setGenerating(true);

    const db = getClientDb();
    const dates = getNextNDates(7);
    let totalSlots = 0;

    for (const dateStr of dates) {
      const dayOfWeek = new Date(dateStr + 'T00:00:00').getDay();
      const daySchedules = schedules.filter((s) => s.dayOfWeek === dayOfWeek && s.isActive);

      for (const schedule of daySchedules) {
        const [startH, startM] = schedule.startTime.split(':').map(Number);
        const [endH, endM] = schedule.endTime.split(':').map(Number);
        let current = startH * 60 + startM;
        const end = endH * 60 + endM;
        const batch = writeBatch(db);

        while (current + schedule.slotDuration <= end) {
          const sH = Math.floor(current / 60);
          const sM = current % 60;
          current += schedule.slotDuration;
          const eH = Math.floor(current / 60);
          const eM = current % 60;

          const startTime = `${String(sH).padStart(2, '0')}:${String(sM).padStart(2, '0')}`;
          const endTime = `${String(eH).padStart(2, '0')}:${String(eM).padStart(2, '0')}`;
          const slotId = `slot_${userId}_${dateStr}_${startTime.replace(':', '')}`;

          const slotRef = doc(db, 'doctorSlots', slotId);
          batch.set(slotRef, {
            id: slotId,
            doctorId: userId,
            date: dateStr,
            startTime,
            endTime,
            status: 'available',
            lockExpiry: null,
            lockedBy: null,
            bookedBy: null,
            orderId: null,
            createdAt: Timestamp.now(),
          }, { merge: true });
          totalSlots++;
        }

        await batch.commit();
      }
    }

    setGenerating(false);
    setShowToast(`Generated ${totalSlots} slots for next 7 days`);
    setTimeout(() => setShowToast(''), 4000);
  };

  return (
    <div css={pageStyles}>
      <h1>Schedule Management</h1>

      <div className="card">
        <h2>Weekly Schedule</h2>

        {isLoading ? (
          <p>Loading...</p>
        ) : !schedules?.length ? (
          <p style={{ color: theme.colors.textMuted, fontSize: theme.fontSizes.sm }}>No schedules configured yet. Add your weekly availability below.</p>
        ) : (
          <div className="schedule-grid">
            {schedules.map((s) => (
              <div key={s.id} className="schedule-row">
                <span className="day">{DAYS[s.dayOfWeek]}</span>
                <span className="time">{s.startTime} – {s.endTime} ({s.slotDuration}min slots)</span>
                <div className="actions">
                  <button className="del-btn" onClick={() => handleDelete(s.id)}>Delete</button>
                </div>
              </div>
            ))}
          </div>
        )}

        <div className="add-form" style={{ marginTop: theme.spacing.lg }}>
          <div className="form-group">
            <label>Day</label>
            <select value={newDay} onChange={(e) => setNewDay(e.target.value)}>
              {DAYS.map((d, i) => <option key={i} value={i}>{d}</option>)}
            </select>
          </div>
          <div className="form-group"><label>Start</label><input type="time" value={newStart} onChange={(e) => setNewStart(e.target.value)} /></div>
          <div className="form-group"><label>End</label><input type="time" value={newEnd} onChange={(e) => setNewEnd(e.target.value)} /></div>
          <div className="form-group">
            <label>Duration</label>
            <select value={newDuration} onChange={(e) => setNewDuration(e.target.value)}>
              <option value="15">15 min</option><option value="20">20 min</option><option value="30">30 min</option><option value="45">45 min</option>
            </select>
          </div>
          <button className="add-btn" onClick={handleAdd}>+ Add</button>
        </div>
      </div>

      <div className="card">
        <div className="generate-section">
          <h3>🗓 Generate Appointment Slots</h3>
          <p>Generate available appointment slots for the next 7 days based on your weekly schedule above.</p>
          <button className="gen-btn" onClick={generateSlots} disabled={generating || !schedules?.length}>
            {generating ? 'Generating...' : 'Generate Slots (Next 7 Days)'}
          </button>
        </div>
      </div>

      {showToast && <div className="toast">✓ {showToast}</div>}
    </div>
  );
}
