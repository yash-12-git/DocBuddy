import { DoctorProfile, DoctorSchedule, Order } from '@/types';
import { getClientDb } from '@/lib/firebase/client';
import {
  collection, query, where, orderBy, getDocs, getDoc, setDoc,
  updateDoc, doc, Timestamp, deleteDoc, arrayUnion,
  limit as firestoreLimit,
} from 'firebase/firestore';

// ─── Get / Create Doctor Profile ────────────────────────────────────
export async function getMyDoctorProfile(userId: string): Promise<DoctorProfile | null> {
  const db = getClientDb();
  // Check if user has a doctor profile (doctorId == userId)
  const docRef = doc(db, 'doctors', userId);
  const docSnap = await getDoc(docRef);
  if (docSnap.exists()) return { ...docSnap.data(), uid: docSnap.id } as DoctorProfile;
  return null;
}

export async function createDoctorProfile(
  userId: string,
  data: Partial<DoctorProfile>
): Promise<DoctorProfile> {
  const db = getClientDb();
  const docRef = doc(db, 'doctors', userId);
  const now = Timestamp.now();

  const profile: any = {
    uid: userId,
    status: 'pending',
    isVerified: false,
    profile: {
      name: data.profile?.name || '',
      specialty: data.profile?.specialty || [],
      experience: data.profile?.experience || 0,
      education: data.profile?.education || [],
      languages: data.profile?.languages || [],
      bio: data.profile?.bio || '',
      photoURL: '',
      registrationNumber: data.profile?.registrationNumber || '',
    },
    clinic: {
      name: data.clinic?.name || '',
      address: data.clinic?.address || '',
      city: data.clinic?.city || '',
      state: data.clinic?.state || '',
      pincode: data.clinic?.pincode || '',
      lat: data.clinic?.lat || 0,
      lng: data.clinic?.lng || 0,
      geohash: '',
    },
    consultation: {
      fee: data.consultation?.fee || 500,
      currency: 'INR',
      modes: data.consultation?.modes || ['offline'],
      duration: data.consultation?.duration || 30,
    },
    rating: 0,
    totalReviews: 0,
    createdAt: now,
    updatedAt: now,
    approvedBy: null,
    approvedAt: null,
  };

  await setDoc(docRef, profile);
  return profile as DoctorProfile;
}

export async function updateDoctorProfile(
  doctorId: string,
  updates: Record<string, any>
): Promise<void> {
  const db = getClientDb();
  const docRef = doc(db, 'doctors', doctorId);
  await updateDoc(docRef, { ...updates, updatedAt: Timestamp.now() });
}

// ─── Schedule Management ────────────────────────────────────────────
export async function getDoctorSchedules(doctorId: string): Promise<DoctorSchedule[]> {
  const db = getClientDb();
  const schedulesRef = collection(db, 'doctorSchedules', doctorId, 'schedules');
  const snapshot = await getDocs(schedulesRef);
  return snapshot.docs.map((d) => ({ ...d.data(), id: d.id })) as DoctorSchedule[];
}

export async function saveDoctorSchedule(
  doctorId: string,
  schedule: Omit<DoctorSchedule, 'id'>
): Promise<string> {
  const db = getClientDb();
  const scheduleRef = doc(collection(db, 'doctorSchedules', doctorId, 'schedules'));
  await setDoc(scheduleRef, { ...schedule, id: scheduleRef.id });
  return scheduleRef.id;
}

export async function deleteDoctorSchedule(
  doctorId: string,
  scheduleId: string
): Promise<void> {
  const db = getClientDb();
  await deleteDoc(doc(db, 'doctorSchedules', doctorId, 'schedules', scheduleId));
}

// ─── Doctor's Appointments ──────────────────────────────────────────
export async function getDoctorAppointments(
  doctorId: string,
  statusFilter?: string
): Promise<Order[]> {
  const db = getClientDb();
  const ordersRef = collection(db, 'orders');

  let q;
  if (statusFilter && statusFilter !== 'all') {
    q = query(ordersRef, where('doctorId', '==', doctorId), where('status', '==', statusFilter));
  } else {
    q = query(ordersRef, where('doctorId', '==', doctorId));
  }

  const snapshot = await getDocs(q);
  const orders = snapshot.docs.map((d) => ({ ...d.data(), id: d.id })) as Order[];
  return orders.sort((a, b) => b.createdAt - a.createdAt);
}

export async function updateAppointmentStatus(
  orderId: string,
  status: string,
  actorId: string,
  reason?: string
): Promise<void> {
  const db = getClientDb();
  const orderRef = doc(db, 'orders', orderId);
  await updateDoc(orderRef, {
    status,
    updatedAt: Date.now(),
    statusHistory: arrayUnion({
      status,
      timestamp: Date.now(),
      actor: actorId,
      reason: reason || null,
    }),
  });
}

// ─── Doctor Dashboard Stats ─────────────────────────────────────────
export async function getDoctorStats(doctorId: string) {
  const db = getClientDb();
  const ordersRef = collection(db, 'orders');
  const q = query(ordersRef, where('doctorId', '==', doctorId));
  const snapshot = await getDocs(q);
  const orders = snapshot.docs.map((d) => d.data()) as Order[];

  const today = new Date().toISOString().split('T')[0];

  return {
    totalAppointments: orders.length,
    confirmedToday: orders.filter(
      (o) => o.slot.date === today && ['confirmed', 'scheduled'].includes(o.status)
    ).length,
    completed: orders.filter((o) => o.status === 'completed').length,
    cancelled: orders.filter((o) => o.status === 'cancelled').length,
    pending: orders.filter((o) => o.status === 'confirmed').length,
    totalRevenue: orders
      .filter((o) => ['confirmed', 'scheduled', 'completed'].includes(o.status))
      .reduce((sum, o) => sum + o.pricing.consultationFee, 0),
    recentOrders: orders.slice(0, 5),
  };
}
