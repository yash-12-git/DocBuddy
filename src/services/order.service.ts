import { Order, OrderStatus, OrderPricing, StatusEvent } from '@/types';
import { generateId, calculatePricing } from '@/lib/utils';
import { getPaymentProvider } from '@/lib/payment';
import { bookSlot, releaseSlot } from './slot.service';

// ─── In-memory order store ──────────────────────────────────────────
const ordersStore = new Map<string, Order>();

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
  const pricing = calculatePricing(params.fee);
  const now = Date.now();
  const id = generateId();

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

  ordersStore.set(id, order);
  return order;
}

// ─── Update Patient Info ────────────────────────────────────────────
export async function updateOrderPatient(
  orderId: string,
  userId: string,
  patient: Order['patient']
): Promise<Order | null> {
  const order = ordersStore.get(orderId);
  if (!order || order.userId !== userId || order.status !== 'pending') return null;

  order.patient = patient;
  order.updatedAt = Date.now();
  ordersStore.set(orderId, order);
  return order;
}

// ─── Process Payment ────────────────────────────────────────────────
export async function processPayment(
  orderId: string,
  userId: string,
  method = 'mock'
): Promise<{ success: boolean; paymentId?: string; error?: string }> {
  const order = ordersStore.get(orderId);
  if (!order) return { success: false, error: 'ORDER_NOT_FOUND' };
  if (order.userId !== userId) return { success: false, error: 'FORBIDDEN' };
  if (order.status !== 'pending') return { success: false, error: 'INVALID_STATE' };

  const provider = getPaymentProvider();

  // Initiate payment
  const transaction = await provider.initiate({
    amount: order.pricing.total,
    currency: 'INR',
    orderId,
    userId,
    method,
  });

  // Verify payment (mock always succeeds)
  const verified = await provider.verify(transaction.id, { amount: order.pricing.total });

  if (!verified.success) {
    // Transition to failed
    order.status = 'failed';
    order.statusHistory.push({
      status: 'failed',
      timestamp: Date.now(),
      actor: 'system',
      reason: 'Payment failed',
    });
    order.updatedAt = Date.now();
    ordersStore.set(orderId, order);

    // Release slot lock
    await releaseSlot(order.slotId, userId);

    return { success: false, error: 'PAYMENT_FAILED' };
  }

  // Payment succeeded → confirm booking
  order.status = 'confirmed';
  order.paymentId = transaction.id;
  order.statusHistory.push({
    status: 'confirmed',
    timestamp: Date.now(),
    actor: userId,
    reason: null,
  });
  order.updatedAt = Date.now();
  ordersStore.set(orderId, order);

  // Book the slot
  await bookSlot(order.slotId, userId, orderId);

  return { success: true, paymentId: transaction.id };
}

// ─── Cancel Order ───────────────────────────────────────────────────
export async function cancelOrder(
  orderId: string,
  userId: string,
  reason: string
): Promise<{ success: boolean; refundEligible: boolean; error?: string }> {
  const order = ordersStore.get(orderId);
  if (!order) return { success: false, refundEligible: false, error: 'ORDER_NOT_FOUND' };
  if (order.userId !== userId) return { success: false, refundEligible: false, error: 'FORBIDDEN' };

  if (!['pending', 'confirmed', 'scheduled'].includes(order.status)) {
    return { success: false, refundEligible: false, error: 'CANNOT_CANCEL' };
  }

  const wasConfirmed = order.status === 'confirmed' || order.status === 'scheduled';

  order.status = 'cancelled';
  order.cancellationReason = reason;
  order.cancelledBy = 'user';
  order.statusHistory.push({
    status: 'cancelled',
    timestamp: Date.now(),
    actor: userId,
    reason,
  });
  order.updatedAt = Date.now();
  ordersStore.set(orderId, order);

  // Release slot
  await releaseSlot(order.slotId, userId);

  return { success: true, refundEligible: wasConfirmed };
}

// ─── Get User Orders ────────────────────────────────────────────────
export async function getUserOrders(userId: string): Promise<Order[]> {
  const orders: Order[] = [];
  ordersStore.forEach((order) => {
    if (order.userId === userId) orders.push(order);
  });
  return orders.sort((a, b) => b.createdAt - a.createdAt);
}

// ─── Get Order By ID ────────────────────────────────────────────────
export async function getOrderById(
  orderId: string,
  userId: string
): Promise<Order | null> {
  const order = ordersStore.get(orderId);
  if (!order || order.userId !== userId) return null;
  return order;
}

// ─── Complete Order (for demo) ──────────────────────────────────────
export async function completeOrder(orderId: string): Promise<boolean> {
  const order = ordersStore.get(orderId);
  if (!order) return false;

  order.status = 'completed';
  order.completedAt = Date.now();
  order.statusHistory.push({
    status: 'completed',
    timestamp: Date.now(),
    actor: 'system',
    reason: 'Appointment completed',
  });
  order.updatedAt = Date.now();
  ordersStore.set(orderId, order);
  return true;
}
