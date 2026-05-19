import { DoctorProfile, Order, UserProfile, AppNotification } from '@/types';
import { getClientDb } from '@/lib/firebase/client';
import {
  collection, query, where, orderBy, getDocs, getDoc, setDoc,
  updateDoc, doc, Timestamp, arrayUnion, deleteDoc,
  limit as firestoreLimit,
} from 'firebase/firestore';

// ─── Doctor Management ──────────────────────────────────────────────
export async function getAllDoctors(statusFilter?: string): Promise<DoctorProfile[]> {
  const db = getClientDb();
  const doctorsRef = collection(db, 'doctors');

  let q;
  if (statusFilter && statusFilter !== 'all') {
    q = query(doctorsRef, where('status', '==', statusFilter));
  } else {
    q = query(doctorsRef);
  }

  const snapshot = await getDocs(q);
  return snapshot.docs.map((d) => ({ ...d.data(), uid: d.id })) as DoctorProfile[];
}

export async function approveDoctor(
  doctorId: string,
  adminId: string
): Promise<void> {
  const db = getClientDb();
  const docRef = doc(db, 'doctors', doctorId);
  await updateDoc(docRef, {
    status: 'approved',
    isVerified: true,
    approvedBy: adminId,
    approvedAt: Timestamp.now(),
    updatedAt: Timestamp.now(),
  });

  // Audit
  await setDoc(doc(collection(db, 'auditLogs')), {
    action: 'DOCTOR_APPROVED',
    actor: adminId,
    actorRole: 'admin',
    targetId: doctorId,
    targetType: 'doctor',
    before: { status: 'pending' },
    after: { status: 'approved' },
    timestamp: Timestamp.now(),
  });
}

export async function suspendDoctor(
  doctorId: string,
  adminId: string,
  reason: string
): Promise<void> {
  const db = getClientDb();
  const docRef = doc(db, 'doctors', doctorId);
  await updateDoc(docRef, {
    status: 'suspended',
    updatedAt: Timestamp.now(),
  });

  await setDoc(doc(collection(db, 'auditLogs')), {
    action: 'DOCTOR_SUSPENDED',
    actor: adminId,
    actorRole: 'admin',
    targetId: doctorId,
    targetType: 'doctor',
    before: { status: 'approved' },
    after: { status: 'suspended', reason },
    timestamp: Timestamp.now(),
  });
}

// ─── Order Management ───────────────────────────────────────────────
export async function getAllOrders(statusFilter?: string): Promise<Order[]> {
  const db = getClientDb();
  const ordersRef = collection(db, 'orders');

  let q;
  if (statusFilter && statusFilter !== 'all') {
    q = query(ordersRef, where('status', '==', statusFilter));
  } else {
    q = query(ordersRef);
  }

  const snapshot = await getDocs(q);
  const orders = snapshot.docs.map((d) => ({ ...d.data(), id: d.id })) as Order[];
  return orders.sort((a, b) => b.createdAt - a.createdAt);
}

export async function adminCancelOrder(
  orderId: string,
  adminId: string,
  reason: string
): Promise<void> {
  const db = getClientDb();
  const orderRef = doc(db, 'orders', orderId);
  await updateDoc(orderRef, {
    status: 'cancelled',
    cancelledBy: 'admin',
    cancellationReason: reason,
    updatedAt: Date.now(),
    statusHistory: arrayUnion({
      status: 'cancelled',
      timestamp: Date.now(),
      actor: adminId,
      reason,
    }),
  });
}

// ─── User Management ────────────────────────────────────────────────
export async function getAllUsers(): Promise<any[]> {
  const db = getClientDb();
  // Since we may not have a users collection populated, we extract unique users from orders
  const ordersSnap = await getDocs(collection(db, 'orders'));
  const userMap = new Map<string, any>();

  ordersSnap.docs.forEach((d) => {
    const data = d.data();
    if (!userMap.has(data.userId)) {
      userMap.set(data.userId, {
        uid: data.userId,
        email: data.userId,
        totalOrders: 0,
        totalSpent: 0,
      });
    }
    const user = userMap.get(data.userId)!;
    user.totalOrders++;
    if (['confirmed', 'completed', 'scheduled'].includes(data.status)) {
      user.totalSpent += data.pricing?.total || 0;
    }
  });

  return Array.from(userMap.values());
}

// ─── Admin Dashboard Stats ──────────────────────────────────────────
export async function getAdminStats() {
  const db = getClientDb();

  const [doctorsSnap, ordersSnap, slotsSnap] = await Promise.all([
    getDocs(collection(db, 'doctors')),
    getDocs(collection(db, 'orders')),
    getDocs(query(collection(db, 'doctorSlots'), where('status', '==', 'booked'))),
  ]);

  const doctors = doctorsSnap.docs.map((d) => d.data());
  const orders = ordersSnap.docs.map((d) => d.data()) as Order[];
  const today = new Date().toISOString().split('T')[0];

  const totalRevenue = orders
    .filter((o) => ['confirmed', 'completed', 'scheduled'].includes(o.status))
    .reduce((sum, o) => sum + (o.pricing?.total || 0), 0);

  const platformRevenue = orders
    .filter((o) => ['confirmed', 'completed', 'scheduled'].includes(o.status))
    .reduce((sum, o) => sum + (o.pricing?.platformFee || 0) + (o.pricing?.gst || 0), 0);

  return {
    totalDoctors: doctors.length,
    approvedDoctors: doctors.filter((d) => d.status === 'approved').length,
    pendingDoctors: doctors.filter((d) => d.status === 'pending').length,
    totalOrders: orders.length,
    confirmedOrders: orders.filter((o) => o.status === 'confirmed').length,
    completedOrders: orders.filter((o) => o.status === 'completed').length,
    cancelledOrders: orders.filter((o) => o.status === 'cancelled').length,
    todayOrders: orders.filter((o) => o.slot?.date === today).length,
    totalRevenue,
    platformRevenue,
    bookedSlots: slotsSnap.size,
    recentOrders: orders.slice(0, 10),
  };
}

// ─── Audit Logs ─────────────────────────────────────────────────────
export async function getAuditLogs(limitCount = 50): Promise<any[]> {
  const db = getClientDb();
  // Try with ordering, fallback without
  try {
    const q = query(
      collection(db, 'auditLogs'),
      orderBy('timestamp', 'desc'),
      firestoreLimit(limitCount)
    );
    const snapshot = await getDocs(q);
    return snapshot.docs.map((d) => ({ ...d.data(), id: d.id }));
  } catch {
    const snapshot = await getDocs(collection(db, 'auditLogs'));
    return snapshot.docs.map((d) => ({ ...d.data(), id: d.id }));
  }
}
