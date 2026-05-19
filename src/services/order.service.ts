import { Order, OrderStatus, OrderPricing, StatusEvent } from '@/types';
import { getClientDb } from '@/lib/firebase/client';
import { calculatePricing } from '@/lib/utils';
import { getPaymentProvider } from '@/lib/payment';
import { bookSlot, releaseSlot } from './slot.service';
import {
  collection,
  query,
  where,
  orderBy,
  getDocs,
  getDoc,
  setDoc,
  updateDoc,
  doc,
  Timestamp,
  arrayUnion,
} from 'firebase/firestore';

// ─── Create Order ───────────────────────────────────────────────────
export async function createOrder(params: {
  userId: string;
  doctorId: string;
  slotId: string;
  doctorName: string;
  specialty: string;
  clinicName: string;
  fee: number;
  date: string;
  startTime: string;
  endTime: string;
  mode: string;
}): Promise<Order> {
  const db = getClientDb();
  const pricing = calculatePricing(params.fee);
  const now = Date.now();

  // Generate a new document reference (auto-ID)
  const orderRef = doc(collection(db, 'orders'));
  const id = orderRef.id;

  const order: Order = {
    id,
    userId: params.userId,
    doctorId: params.doctorId,
    slotId: params.slotId,
    status: 'pending',
    patient: { name: '', age: 0, gender: '', symptoms: '' },
    doctor: {
      name: params.doctorName,
      specialty: params.specialty,
      clinicName: params.clinicName,
      fee: params.fee,
    },
    slot: {
      date: params.date,
      startTime: params.startTime,
      endTime: params.endTime,
      mode: params.mode,
    },
    pricing,
    paymentId: null,
    cancellationReason: null,
    cancelledBy: null,
    rescheduledFrom: null,
    statusHistory: [
      { status: 'pending', timestamp: now, actor: params.userId, reason: null },
    ],
    createdAt: now,
    updatedAt: now,
    completedAt: null,
  };

  await setDoc(orderRef, order);

  // Write audit log
  try {
    const auditRef = doc(collection(db, 'auditLogs'));
    await setDoc(auditRef, {
      action: 'ORDER_CREATED',
      actor: params.userId,
      actorRole: 'user',
      targetId: id,
      targetType: 'order',
      before: null,
      after: { status: 'pending', total: pricing.total },
      timestamp: Timestamp.now(),
    });
  } catch (e) {
    // Audit log failure should not block the order
    console.warn('Audit log write failed:', e);
  }

  return order;
}

// ─── Update Patient Info ────────────────────────────────────────────
export async function updateOrderPatient(
  orderId: string,
  userId: string,
  patient: Order['patient']
): Promise<Order | null> {
  const db = getClientDb();
  const orderRef = doc(db, 'orders', orderId);
  const orderSnap = await getDoc(orderRef);

  if (!orderSnap.exists()) return null;
  const orderData = orderSnap.data() as Order;

  if (orderData.userId !== userId || orderData.status !== 'pending') return null;

  await updateDoc(orderRef, {
    patient,
    updatedAt: Date.now(),
  });

  return { ...orderData, patient, updatedAt: Date.now() };
}

// ─── Process Payment ────────────────────────────────────────────────
export async function processPayment(
  orderId: string,
  userId: string,
  method = 'mock'
): Promise<{ success: boolean; paymentId?: string; error?: string }> {
  const db = getClientDb();
  const orderRef = doc(db, 'orders', orderId);
  const orderSnap = await getDoc(orderRef);

  if (!orderSnap.exists()) return { success: false, error: 'ORDER_NOT_FOUND' };
  const order = orderSnap.data() as Order;

  if (order.userId !== userId) return { success: false, error: 'FORBIDDEN' };
  if (order.status !== 'pending') return { success: false, error: 'INVALID_STATE' };

  const provider = getPaymentProvider();

  // 1. Initiate payment
  const transaction = await provider.initiate({
    amount: order.pricing.total,
    currency: 'INR',
    orderId,
    userId,
    method,
  });

  // 2. Write payment record (initiated)
  const paymentRef = doc(collection(db, 'payments'));
  await setDoc(paymentRef, {
    id: paymentRef.id,
    orderId,
    userId,
    provider: provider.name,
    providerTransactionId: transaction.id,
    amount: order.pricing.total,
    currency: 'INR',
    status: 'initiated',
    method,
    metadata: {},
    initiatedAt: Date.now(),
    completedAt: null,
    refundedAt: null,
    refundAmount: null,
  });

  // 3. Verify payment (mock always succeeds)
  const verified = await provider.verify(transaction.id, { amount: order.pricing.total });

  if (!verified.success) {
    // ── Payment failed ──
    await updateDoc(orderRef, {
      status: 'failed',
      updatedAt: Date.now(),
      statusHistory: arrayUnion({
        status: 'failed',
        timestamp: Date.now(),
        actor: 'system',
        reason: 'Payment failed',
      }),
    });

    await updateDoc(paymentRef, {
      status: 'failed',
      completedAt: Date.now(),
    });

    // Release slot lock
    await releaseSlot(order.slotId, userId);

    return { success: false, error: 'PAYMENT_FAILED' };
  }

  // ── Payment succeeded ──
  // 4. Update order → confirmed
  await updateDoc(orderRef, {
    status: 'confirmed',
    paymentId: paymentRef.id,
    updatedAt: Date.now(),
    statusHistory: arrayUnion({
      status: 'confirmed',
      timestamp: Date.now(),
      actor: userId,
      reason: null,
    }),
  });

  // 5. Update payment → success
  await updateDoc(paymentRef, {
    status: 'success',
    completedAt: Date.now(),
  });

  // 6. Book the slot (locked → booked)
  await bookSlot(order.slotId, userId, orderId);

  // 7. Audit log
  try {
    const auditRef = doc(collection(db, 'auditLogs'));
    await setDoc(auditRef, {
      action: 'PAYMENT_CONFIRMED',
      actor: userId,
      actorRole: 'user',
      targetId: orderId,
      targetType: 'order',
      before: { status: 'pending' },
      after: { status: 'confirmed', paymentId: paymentRef.id },
      timestamp: Timestamp.now(),
    });
  } catch (e) {
    console.warn('Audit log write failed:', e);
  }

  // 8. Create notification
  try {
    const notifRef = doc(collection(db, 'notifications'));
    await setDoc(notifRef, {
      id: notifRef.id,
      userId,
      type: 'booking_confirmed',
      title: 'Booking Confirmed!',
      body: `Your appointment with Dr. ${order.doctor.name} on ${order.slot.date} at ${order.slot.startTime} is confirmed.`,
      data: { orderId },
      isRead: false,
      createdAt: Date.now(),
    });
  } catch (e) {
    console.warn('Notification write failed:', e);
  }

  return { success: true, paymentId: paymentRef.id };
}

// ─── Cancel Order ───────────────────────────────────────────────────
export async function cancelOrder(
  orderId: string,
  userId: string,
  reason: string
): Promise<{ success: boolean; refundEligible: boolean; error?: string }> {
  const db = getClientDb();
  const orderRef = doc(db, 'orders', orderId);
  const orderSnap = await getDoc(orderRef);

  if (!orderSnap.exists()) return { success: false, refundEligible: false, error: 'ORDER_NOT_FOUND' };
  const order = orderSnap.data() as Order;

  if (order.userId !== userId) return { success: false, refundEligible: false, error: 'FORBIDDEN' };

  if (!['pending', 'confirmed', 'scheduled'].includes(order.status)) {
    return { success: false, refundEligible: false, error: 'CANNOT_CANCEL' };
  }

  const wasConfirmed = order.status === 'confirmed' || order.status === 'scheduled';

  await updateDoc(orderRef, {
    status: 'cancelled',
    cancellationReason: reason,
    cancelledBy: 'user',
    updatedAt: Date.now(),
    statusHistory: arrayUnion({
      status: 'cancelled',
      timestamp: Date.now(),
      actor: userId,
      reason,
    }),
  });

  // Release slot
  await releaseSlot(order.slotId, userId);

  // Notification
  try {
    const notifRef = doc(collection(db, 'notifications'));
    await setDoc(notifRef, {
      id: notifRef.id,
      userId,
      type: 'cancellation',
      title: 'Booking Cancelled',
      body: `Your appointment with Dr. ${order.doctor.name} has been cancelled.`,
      data: { orderId },
      isRead: false,
      createdAt: Date.now(),
    });
  } catch (e) {
    console.warn('Notification write failed:', e);
  }

  return { success: true, refundEligible: wasConfirmed };
}

// ─── Get User Orders ────────────────────────────────────────────────
export async function getUserOrders(userId: string): Promise<Order[]> {
  const db = getClientDb();
  const ordersRef = collection(db, 'orders');

  // Try with ordering (needs composite index: userId + createdAt desc)
  try {
    const q = query(
      ordersRef,
      where('userId', '==', userId),
      orderBy('createdAt', 'desc')
    );
    const snapshot = await getDocs(q);
    return snapshot.docs.map((d) => ({ ...d.data(), id: d.id })) as Order[];
  } catch (err) {
    // Fallback: without ordering if index doesn't exist yet
    const q = query(ordersRef, where('userId', '==', userId));
    const snapshot = await getDocs(q);
    const orders = snapshot.docs.map((d) => ({ ...d.data(), id: d.id })) as Order[];
    return orders.sort((a, b) => b.createdAt - a.createdAt);
  }
}

// ─── Get Order By ID ────────────────────────────────────────────────
export async function getOrderById(
  orderId: string,
  userId: string
): Promise<Order | null> {
  const db = getClientDb();
  const orderRef = doc(db, 'orders', orderId);
  const orderSnap = await getDoc(orderRef);

  if (!orderSnap.exists()) return null;
  const order = orderSnap.data() as Order;

  // Only return if user owns this order
  if (order.userId !== userId) return null;
  return { ...order, id: orderSnap.id };
}

// ─── Complete Order (for demo/admin) ────────────────────────────────
export async function completeOrder(orderId: string): Promise<boolean> {
  const db = getClientDb();
  const orderRef = doc(db, 'orders', orderId);

  try {
    await updateDoc(orderRef, {
      status: 'completed',
      completedAt: Date.now(),
      updatedAt: Date.now(),
      statusHistory: arrayUnion({
        status: 'completed',
        timestamp: Date.now(),
        actor: 'system',
        reason: 'Appointment completed',
      }),
    });
    return true;
  } catch (err) {
    console.error('completeOrder error:', err);
    return false;
  }
}
