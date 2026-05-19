import { DoctorSlot } from '@/types';
import { getClientDb } from '@/lib/firebase/client';
import { getTimeCategory } from '@/lib/utils';
import {
  collection,
  query,
  where,
  getDocs,
  doc,
  getDoc,
  runTransaction,
  Timestamp,
  updateDoc,
} from 'firebase/firestore';

export interface GroupedSlots {
  morning: DoctorSlot[];
  afternoon: DoctorSlot[];
  evening: DoctorSlot[];
}

// ─── Get Available Slots ────────────────────────────────────────────
export async function getAvailableSlots(
  doctorId: string,
  date: string
): Promise<DoctorSlot[]> {
  const db = getClientDb();
  const slotsRef = collection(db, 'doctorSlots');
  const now = Timestamp.now();

  // Query all slots for this doctor + date
  const q = query(
    slotsRef,
    where('doctorId', '==', doctorId),
    where('date', '==', date)
  );

  const snapshot = await getDocs(q);
  const slots: DoctorSlot[] = [];

  snapshot.docs.forEach((d) => {
    const data = d.data();
    const slot = { ...data, id: d.id } as DoctorSlot;

    // Available if:
    // 1. status === 'available', OR
    // 2. status === 'locked' but lock has expired
    const lockExpiry = data.lockExpiry as Timestamp | null;
    const isExpiredLock =
      slot.status === 'locked' &&
      lockExpiry &&
      lockExpiry.toMillis() < Date.now();

    if (slot.status === 'available' || isExpiredLock) {
      slots.push(slot);
    }
  });

  // Sort by time
  slots.sort((a, b) => {
    const aMin = parseInt(a.startTime.replace(':', ''), 10);
    const bMin = parseInt(b.startTime.replace(':', ''), 10);
    return aMin - bMin;
  });

  return slots;
}

// ─── Get Grouped Slots ─────────────────────────────────────────────
export async function getGroupedSlots(
  doctorId: string,
  date: string
): Promise<GroupedSlots> {
  const slots = await getAvailableSlots(doctorId, date);
  const grouped: GroupedSlots = { morning: [], afternoon: [], evening: [] };

  slots.forEach((slot) => {
    const category = getTimeCategory(slot.startTime);
    grouped[category].push(slot);
  });

  return grouped;
}

// ─── Get Slot Count ─────────────────────────────────────────────────
export async function getSlotCount(doctorId: string, date: string): Promise<number> {
  const slots = await getAvailableSlots(doctorId, date);
  return slots.length;
}

// ─── Lock Slot (Firestore Transaction — atomic) ─────────────────────
// This is the critical race-condition prevention logic.
// runTransaction guarantees that the read + write is atomic:
// if another user modifies the slot between our read and write,
// the transaction retries automatically.
export async function lockSlot(
  slotId: string,
  userId: string
): Promise<{ success: boolean; lockExpiry: number; error?: string }> {
  const db = getClientDb();
  const slotRef = doc(db, 'doctorSlots', slotId);

  try {
    const result = await runTransaction(db, async (transaction) => {
      const slotDoc = await transaction.get(slotRef);

      if (!slotDoc.exists()) {
        throw new Error('SLOT_NOT_FOUND');
      }

      const data = slotDoc.data();
      const now = Date.now();
      const lockExpiryTs = data.lockExpiry as Timestamp | null;

      // Already booked → reject
      if (data.status === 'booked') {
        throw new Error('SLOT_ALREADY_BOOKED');
      }

      // Currently locked by someone else and lock hasn't expired → reject
      if (
        data.status === 'locked' &&
        lockExpiryTs &&
        lockExpiryTs.toMillis() > now
      ) {
        if (data.lockedBy === userId) {
          // Same user → extend lock
          const newExpiry = Timestamp.fromMillis(now + 10 * 60 * 1000);
          transaction.update(slotRef, { lockExpiry: newExpiry });
          return { lockExpiry: newExpiry.toMillis() };
        }
        throw new Error('SLOT_LOCKED_BY_ANOTHER');
      }

      // Available (or expired lock) → lock it
      const lockExpiry = Timestamp.fromMillis(now + 10 * 60 * 1000);

      transaction.update(slotRef, {
        status: 'locked',
        lockExpiry,
        lockedBy: userId,
      });

      return { lockExpiry: lockExpiry.toMillis() };
    });

    return { success: true, lockExpiry: result.lockExpiry };
  } catch (err: any) {
    const message = err.message || 'UNKNOWN_ERROR';
    return { success: false, lockExpiry: 0, error: message };
  }
}

// ─── Book Slot (after payment confirmation) ─────────────────────────
export async function bookSlot(
  slotId: string,
  userId: string,
  orderId: string
): Promise<boolean> {
  const db = getClientDb();
  const slotRef = doc(db, 'doctorSlots', slotId);

  try {
    await runTransaction(db, async (transaction) => {
      const slotDoc = await transaction.get(slotRef);
      if (!slotDoc.exists()) throw new Error('SLOT_NOT_FOUND');

      const data = slotDoc.data();

      // Must be locked by this user
      if (data.lockedBy !== userId) {
        throw new Error('NOT_LOCKED_BY_USER');
      }

      transaction.update(slotRef, {
        status: 'booked',
        bookedBy: userId,
        orderId,
        lockExpiry: null,
      });
    });
    return true;
  } catch (err) {
    console.error('bookSlot error:', err);
    return false;
  }
}

// ─── Release Slot Lock ──────────────────────────────────────────────
export async function releaseSlot(
  slotId: string,
  userId: string
): Promise<boolean> {
  const db = getClientDb();
  const slotRef = doc(db, 'doctorSlots', slotId);

  try {
    await runTransaction(db, async (transaction) => {
      const slotDoc = await transaction.get(slotRef);
      if (!slotDoc.exists()) return;

      const data = slotDoc.data();

      // Only release if locked by this user
      if (data.lockedBy !== userId) return;
      if (data.status !== 'locked') return;

      transaction.update(slotRef, {
        status: 'available',
        lockedBy: null,
        lockExpiry: null,
      });
    });
    return true;
  } catch (err) {
    console.error('releaseSlot error:', err);
    return false;
  }
}

// ─── Get Slot By ID ─────────────────────────────────────────────────
export async function getSlotById(slotId: string): Promise<DoctorSlot | null> {
  const db = getClientDb();
  const slotRef = doc(db, 'doctorSlots', slotId);
  const slotDoc = await getDoc(slotRef);

  if (!slotDoc.exists()) return null;
  return { ...slotDoc.data(), id: slotDoc.id } as DoctorSlot;
}
