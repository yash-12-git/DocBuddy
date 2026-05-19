import { Timestamp } from 'firebase/firestore';

// ─── Auth & Users ───────────────────────────────────────────────────
export type UserRole = 'guest' | 'user' | 'doctor' | 'admin';

export interface Address {
  id: string;
  label: string;
  line1: string;
  line2?: string;
  city: string;
  state: string;
  pincode: string;
  isDefault: boolean;
}

export interface UserProfile {
  uid: string;
  email: string;
  displayName: string;
  photoURL: string | null;
  role: UserRole;
  phone: string | null;
  dateOfBirth: string | null;
  gender: 'male' | 'female' | 'other' | null;
  addresses: Address[];
  preferences: {
    language: string;
    notifications: { email: boolean; sms: boolean; push: boolean };
  };
  createdAt: Timestamp;
  updatedAt: Timestamp;
  isActive: boolean;
}

// ─── Doctors ────────────────────────────────────────────────────────
export interface Education {
  degree: string;
  institution: string;
  year: number;
}

export interface DoctorProfile {
  uid: string;
  status: 'pending' | 'approved' | 'suspended';
  isVerified: boolean;
  profile: {
    name: string;
    specialty: string[];
    experience: number;
    education: Education[];
    languages: string[];
    bio: string;
    photoURL: string;
    registrationNumber: string;
  };
  clinic: {
    name: string;
    address: string;
    city: string;
    state: string;
    pincode: string;
    lat: number;
    lng: number;
    geohash: string;
  };
  consultation: {
    fee: number;
    currency: 'INR';
    modes: ConsultationMode[];
    duration: number;
  };
  rating: number;
  totalReviews: number;
  createdAt: Timestamp;
  updatedAt: Timestamp;
  approvedBy: string | null;
  approvedAt: Timestamp | null;
}

export type ConsultationMode = 'offline' | 'online';

// ─── Schedules & Slots ─────────────────────────────────────────────
export interface DoctorSchedule {
  id: string;
  doctorId: string;
  dayOfWeek: 0 | 1 | 2 | 3 | 4 | 5 | 6;
  startTime: string;
  endTime: string;
  slotDuration: number;
  isActive: boolean;
  effectiveFrom: Timestamp;
  effectiveTo: Timestamp | null;
}

export type SlotStatus = 'available' | 'locked' | 'booked' | 'cancelled';

export interface DoctorSlot {
  id: string;
  doctorId: string;
  date: string;
  startTime: string;
  endTime: string;
  status: SlotStatus;
  lockExpiry: Timestamp | null;
  lockedBy: string | null;
  bookedBy: string | null;
  orderId: string | null;
  createdAt: Timestamp;
}

// ─── Cart ───────────────────────────────────────────────────────────
export interface CartItem {
  id: string;
  slotId: string;
  doctorId: string;
  doctorName: string;
  specialty: string;
  date: string;
  startTime: string;
  endTime: string;
  fee: number;
  mode: ConsultationMode;
  addedAt: number;
  lockExpiry: number;
}

export interface Cart {
  userId: string;
  items: CartItem[];
  updatedAt: Timestamp;
}

// ─── Orders ─────────────────────────────────────────────────────────
export type OrderStatus =
  | 'draft'
  | 'pending'
  | 'confirmed'
  | 'scheduled'
  | 'completed'
  | 'cancelled'
  | 'failed'
  | 'refunded';

export interface StatusEvent {
  status: OrderStatus;
  timestamp: number;
  actor: string;
  reason: string | null;
}

export interface OrderPricing {
  consultationFee: number;
  platformFee: number;
  gst: number;
  total: number;
}

export interface Order {
  id: string;
  userId: string;
  doctorId: string;
  slotId: string;
  status: OrderStatus;
  patient: {
    name: string;
    age: number;
    gender: string;
    symptoms: string;
  };
  doctor: {
    name: string;
    specialty: string;
    clinicName: string;
    fee: number;
  };
  slot: {
    date: string;
    startTime: string;
    endTime: string;
    mode: string;
  };
  pricing: OrderPricing;
  paymentId: string | null;
  cancellationReason: string | null;
  cancelledBy: 'user' | 'doctor' | 'admin' | null;
  rescheduledFrom: string | null;
  statusHistory: StatusEvent[];
  createdAt: number;
  updatedAt: number;
  completedAt: number | null;
}

// ─── Payments ───────────────────────────────────────────────────────
export type PaymentStatus = 'initiated' | 'success' | 'failed' | 'refunded';
export type PaymentMethod = 'card' | 'upi' | 'netbanking' | 'mock';

export interface Payment {
  id: string;
  orderId: string;
  userId: string;
  provider: 'mock' | 'razorpay' | 'stripe';
  providerTransactionId: string;
  amount: number;
  currency: 'INR';
  status: PaymentStatus;
  method: PaymentMethod;
  metadata: Record<string, unknown>;
  initiatedAt: number;
  completedAt: number | null;
  refundedAt: number | null;
  refundAmount: number | null;
}

// ─── Reviews ────────────────────────────────────────────────────────
export interface Review {
  id: string;
  orderId: string;
  userId: string;
  doctorId: string;
  rating: 1 | 2 | 3 | 4 | 5;
  title: string;
  body: string;
  userName: string;
  isVerified: boolean;
  isVisible: boolean;
  createdAt: number;
}

// ─── Notifications ──────────────────────────────────────────────────
export type NotificationType =
  | 'booking_confirmed'
  | 'reminder'
  | 'cancellation'
  | 'reschedule'
  | 'review_request'
  | 'system';

export interface AppNotification {
  id: string;
  userId: string;
  type: NotificationType;
  title: string;
  body: string;
  data: Record<string, string>;
  isRead: boolean;
  createdAt: number;
}

// ─── API ────────────────────────────────────────────────────────────
export type ApiResponse<T> =
  | { success: true; data: T; meta?: Record<string, unknown> }
  | { success: false; error: { code: string; message: string; details?: unknown } };

// ─── Search ─────────────────────────────────────────────────────────
export interface SearchFilters {
  city?: string;
  specialty?: string;
  date?: string;
  mode?: ConsultationMode;
  minRating?: number;
  maxFee?: number;
  sortBy?: 'rating' | 'fee' | 'experience';
  sortOrder?: 'asc' | 'desc';
}
