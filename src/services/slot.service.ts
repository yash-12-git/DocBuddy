import { DoctorSlot, SlotStatus } from '@/types';
import { SEED_DOCTORS, generateSeedSlots } from '@/lib/seed-data';
import { getTimeCategory } from '@/lib/utils';

// ─── In-memory slot store ───────────────────────────────────────────
const slotsStore = new Map<string, DoctorSlot>();

// Initialize with seed data
SEED_DOCTORS.forEach((doc) => {
  const slots = generateSeedSlots(doc.uid, doc.consultation.duration);
  slots.forEach((slot) => {
    slotsStore.set(slot.id, {
      ...slot,
      createdAt: { toMillis: () => Date.now() } as any,
    } as DoctorSlot);
  });
});

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
  const now = Date.now();
  const slots: DoctorSlot[] = [];

  slotsStore.forEach((slot) => {
    if (slot.doctorId !== doctorId || slot.date !== date) return;

    // Consider slot available if:
    // 1. Status is 'available', OR
    // 2. Status is 'locked' but lock has expired
    if (
      slot.status === 'available' ||
      (slot.status === 'locked' && slot.lockExpiry && slot.lockExpiry.toMillis() < now)
    ) {
      slots.push(slot);
    }
  });

  slots.sort((a, b) => {
    const aMin = parseInt(a.startTime.replace(':', ''));
    const bMin = parseInt(b.startTime.replace(':', ''));
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

// ─── Lock Slot (Atomic in production via Firestore Transaction) ─────
export async function lockSlot(
  slotId: string,
  userId: string
): Promise<{ success: boolean; lockExpiry: number; error?: string }> {
  const slot = slotsStore.get(slotId);

  if (!slot) {
    return { success: false, lockExpiry: 0, error: 'SLOT_NOT_FOUND' };
  }

  const now = Date.now();

  // Check if slot is available (or lock expired)
  if (slot.status === 'booked') {
    return { success: false, lockExpiry: 0, error: 'SLOT_ALREADY_BOOKED' };
  }

  if (
    slot.status === 'locked' &&
    slot.lockExpiry &&
    slot.lockExpiry.toMillis() > now
  ) {
    if (slot.lockedBy === userId) {
      // Already locked by this user — extend
      const lockExpiry = now + 10 * 60 * 1000;
      slot.lockExpiry = { toMillis: () => lockExpiry } as any;
      return { success: true, lockExpiry };
    }
    return { success: false, lockExpiry: 0, error: 'SLOT_LOCKED_BY_ANOTHER' };
  }

  // Lock it
  const lockExpiry = now + 10 * 60 * 1000; // 10 minutes
  slot.status = 'locked';
  slot.lockExpiry = { toMillis: () => lockExpiry } as any;
  slot.lockedBy = userId;
  slotsStore.set(slotId, slot);

  return { success: true, lockExpiry };
}

// ─── Book Slot (after payment) ──────────────────────────────────────
export async function bookSlot(
  slotId: string,
  userId: string,
  orderId: string
): Promise<boolean> {
  const slot = slotsStore.get(slotId);
  if (!slot) return false;

  // Verify lock owner
  if (slot.lockedBy !== userId) return false;

  slot.status = 'booked';
  slot.bookedBy = userId;
  slot.orderId = orderId;
  slot.lockExpiry = null;
  slotsStore.set(slotId, slot);

  return true;
}

// ─── Release Slot Lock ──────────────────────────────────────────────
export async function releaseSlot(slotId: string, userId: string): Promise<boolean> {
  const slot = slotsStore.get(slotId);
  if (!slot || slot.lockedBy !== userId) return false;

  slot.status = 'available';
  slot.lockedBy = null;
  slot.lockExpiry = null;
  slotsStore.set(slotId, slot);

  return true;
}

// ─── Get Slot By ID ─────────────────────────────────────────────────
export async function getSlotById(slotId: string): Promise<DoctorSlot | null> {
  return slotsStore.get(slotId) || null;
}
