# DoctorHub — Hyperlocal Healthcare Booking Platform

A production-grade doctor booking marketplace built with **Next.js 16**, **TypeScript**, **Firebase**, **Emotion CSS**, and **React Query**.

## Quick Start

```bash
npm install
npm run dev
# Open http://localhost:3000
```

Runs in **demo mode** by default — no Firebase project needed. All features work end-to-end with in-memory data and 8 seed doctors.

## Phase 1: Customer Journey ✅

- Home page with hero, specialty browse, top-rated doctors
- Doctor search with filters (specialty, mode, fee, rating, sort)
- Doctor profile with bio, education, reviews, clinic info
- Slot selection with 7-day calendar and morning/afternoon/evening groups
- Cart with slot locking (10-min countdown timer)
- Checkout with patient info form + simulated payment
- Order tracking with status timeline
- Booking history with all/upcoming/past tabs
- Auth (email/password + Google + demo mode)
- Zod validation on all forms
- Firestore security rules (production-grade)
- Payment abstraction layer (mock + Razorpay-ready interface)

## Connect Firebase (Optional)

1. Create project at https://console.firebase.google.com
2. Enable Auth (Email/Password + Google)
3. Create Firestore database
4. Update `.env.local` with your config
5. `firebase deploy --only firestore:rules`

## Next: Phase 2 (Doctor Portal) → Phase 3 (Admin Panel)
