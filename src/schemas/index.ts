import { z } from 'zod';

// ─── Auth ───────────────────────────────────────────────────────────
export const RegisterSchema = z.object({
  email: z.string().email('Invalid email address'),
  password: z.string().min(8, 'Password must be at least 8 characters')
    .regex(/[A-Z]/, 'Must contain an uppercase letter')
    .regex(/[0-9]/, 'Must contain a number'),
  displayName: z.string().min(2, 'Name must be at least 2 characters').max(50),
});

export const LoginSchema = z.object({
  email: z.string().email('Invalid email address'),
  password: z.string().min(1, 'Password is required'),
});

// ─── User Profile ───────────────────────────────────────────────────
export const UpdateProfileSchema = z.object({
  displayName: z.string().min(2).max(50).optional(),
  phone: z.string().regex(/^[6-9]\d{9}$/, 'Invalid Indian phone number').nullable().optional(),
  dateOfBirth: z.string().optional().nullable(),
  gender: z.enum(['male', 'female', 'other']).nullable().optional(),
});

export const AddressSchema = z.object({
  label: z.string().min(1).max(30),
  line1: z.string().min(3).max(200),
  line2: z.string().max(200).optional(),
  city: z.string().min(2).max(50),
  state: z.string().min(2).max(50),
  pincode: z.string().regex(/^\d{6}$/, 'Invalid pincode'),
  isDefault: z.boolean().default(false),
});

// ─── Search ─────────────────────────────────────────────────────────
export const SearchFiltersSchema = z.object({
  city: z.string().optional(),
  specialty: z.string().optional(),
  date: z.string().regex(/^\d{4}-\d{2}-\d{2}$/).optional(),
  mode: z.enum(['offline', 'online']).optional(),
  minRating: z.number().min(0).max(5).optional(),
  maxFee: z.number().min(0).optional(),
  sortBy: z.enum(['rating', 'fee', 'experience']).optional(),
  sortOrder: z.enum(['asc', 'desc']).optional(),
});

// ─── Booking ────────────────────────────────────────────────────────
export const LockSlotSchema = z.object({
  slotId: z.string().min(1).max(128),
  doctorId: z.string().min(1).max(128),
  mode: z.enum(['offline', 'online']),
});

export const PatientInfoSchema = z.object({
  name: z.string().min(2, 'Name is required').max(100),
  age: z.number().int().min(0, 'Invalid age').max(150),
  gender: z.enum(['male', 'female', 'other']),
  symptoms: z.string().max(500).optional().default(''),
});

export const CreateBookingSchema = z.object({
  orderId: z.string().min(1),
  patient: PatientInfoSchema,
});

// ─── Review ─────────────────────────────────────────────────────────
export const CreateReviewSchema = z.object({
  orderId: z.string().min(1),
  doctorId: z.string().min(1),
  rating: z.number().int().min(1).max(5),
  title: z.string().min(3).max(100),
  body: z.string().min(10).max(1000),
});

// ─── Payment ────────────────────────────────────────────────────────
export const InitiatePaymentSchema = z.object({
  orderId: z.string().min(1),
  method: z.enum(['card', 'upi', 'netbanking', 'mock']).default('mock'),
});

export const ConfirmPaymentSchema = z.object({
  paymentId: z.string().min(1),
  providerResponse: z.record(z.string(), z.unknown()).optional().default({}),
});

// ─── Cancel / Reschedule ────────────────────────────────────────────
export const CancelOrderSchema = z.object({
  orderId: z.string().min(1),
  reason: z.string().min(5, 'Please provide a reason').max(500),
});

// Infer types
export type RegisterInput = z.infer<typeof RegisterSchema>;
export type LoginInput = z.infer<typeof LoginSchema>;
export type PatientInfoInput = z.infer<typeof PatientInfoSchema>;
export type CreateBookingInput = z.infer<typeof CreateBookingSchema>;
export type CreateReviewInput = z.infer<typeof CreateReviewSchema>;
