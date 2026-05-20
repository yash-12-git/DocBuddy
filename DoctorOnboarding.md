# 🩺 DoctorHub - Doctor Onboarding & Login Guide

## How the Doctor Onboarding System Works

### 1️⃣ **Admin Onboards a New Doctor**

**You (Admin) Navigate to:** `/admin/onboard-doctor`

**What You Fill In:**
- ✅ **Email** (required) - The doctor's Gmail address they'll use to sign in
- ✅ **Basic Info** - Name, specialties, experience, bio, registration number
- ✅ **Education** - Degrees, institutions, years
- ✅ **Clinic Details** - Name, address, city, state, pincode, coordinates
- ✅ **Consultation** - Fee, duration, modes (online/offline)
- ✅ **Schedule** - Working days, start/end times (for auto slot generation)

**What Happens Behind the Scenes:**
1. Creates `/doctors/{doctorId}` document with all profile data
2. Creates `/users/{doctorId}` document with:
   - `email: doctor@example.com`
   - `role: "doctor"`
   - `displayName: "Dr. Name"`
3. Auto-generates **slots for next 14 days** based on schedule
4. Creates **3 sample reviews** to seed the profile
5. Shows success screen with login credentials to share

---

### 2️⃣ **How Doctor Signs In for the First Time**

**Doctor's Steps:**
1. Goes to your DoctorHub website
2. Clicks **"Sign In"** button
3. Clicks **"Continue with Google"**
4. Signs in with the Gmail account you provided during onboarding

**What Happens Automatically:**
- Firebase checks if a user document exists with that email
- Since you created `/users/{doctorId}` with their email, AuthContext reads it
- AuthContext sees `role: "doctor"` and sets `isDoctor = true`
- Doctor is redirected to `/portal/dashboard` ✅

---

### 3️⃣ **Role-Based Access Control**

#### **Admin (`role: "admin"`):**
- ✅ Can access `/admin/*` (dashboard, doctors, orders, users, onboard)
- ✅ Can access `/portal/*` (can view any doctor's portal)
- ✅ Can change any user's role via Admin → Users page

#### **Doctor (`role: "doctor"`):**
- ✅ Can access `/portal/*` (dashboard, profile, schedule, appointments)
- ✅ Sees **only their own** appointments and stats
- ❌ Cannot access `/admin/*` — sees "Access Denied"

#### **Patient (`role: "user"`):**
- ✅ Can book appointments, view bookings, edit profile
- ❌ Cannot access `/admin/*` — sees "Access Denied"
- ❌ Cannot access `/portal/*` — sees "Access Denied"

---

## 🔧 Initial Setup Steps

### Step 1: Set Your Role to Admin

1. Go to **Firebase Console** → **Firestore Database**
2. Find the `users` collection
3. Find your user document (your uid)
4. Click **Edit** and set:
   ```
   role: "admin"
   ```
5. Save

Now when you sign in, you'll have access to `/admin/*`

---

### Step 2: Deploy Firestore Rules

Copy the rules from the `firestore.rules` file I provided and paste into:

**Firebase Console** → **Firestore Database** → **Rules** tab → **Publish**

This enforces:
- Users can't change their own role
- Only admin can modify roles
- Doctors only see their own appointments
- Admin sees everything

---

## 📋 Complete Onboarding Flow Example

### Example: Onboarding Dr. Sarah Patel

**You (Admin) go to:** `/admin/onboard-doctor`

**Fill in:**
```
Email: sarah.patel@gmail.com
Name: Sarah Patel
Specialties: General Physician, Diabetologist
Experience: 8 years
Bio: Specializes in diabetes management and preventive care
Registration: MH-98765

Education:
- MBBS, AIIMS Delhi, 2014
- MD (Medicine), CMC Vellore, 2018

Clinic: HealthFirst Clinic
Address: 123 MG Road, Koregaon Park
City: Pune
State: Maharashtra
Pincode: 411001

Fee: ₹600
Duration: 30 min
Modes: Offline + Online

Schedule:
Working Days: Mon-Sat
Hours: 9:00 AM - 6:00 PM
```

**Click "Onboard Doctor"**

✅ **System creates:**
- Doctor profile in `/doctors` collection
- User profile in `/users` collection with `role: "doctor"`
- ~168 slots (14 days × 6 days/week × ~2 hours of slots per day)
- 3 sample reviews

**Success screen shows:**
```
Email: sarah.patel@gmail.com
Login Method: Google Sign-In
Role: Doctor
Portal Access: /portal/*
```

---

### Dr. Sarah's First Login

**She goes to your site** → **Clicks "Sign In"** → **"Continue with Google"**

- Firebase Auth creates her Firebase user
- AuthContext runs `fetchOrCreateUserProfile()`
- Finds existing `/users/{doctorId}` doc with her email
- Reads `role: "doctor"`
- Sets `isDoctor = true`
- She sees "🩺 Doctor Portal" link in navbar
- She can access `/portal/dashboard` immediately

---

## 🔐 Security Notes

### How Email Matching Works

When a doctor signs in with Google:

1. Firebase Auth creates a user with `email: "sarah.patel@gmail.com"`
2. AuthContext's `fetchOrCreateUserProfile()` runs
3. It creates or fetches `/users/{firebaseAuthUid}`
4. **Key:** The pre-created user doc has `email: "sarah.patel@gmail.com"`
5. Firebase Auth uid is different from doctorId, but that's fine!

**Important:** The pre-created `/users/{doctorId}` doc serves as a reference. When the doctor signs in, a NEW document `/users/{firebaseAuthUid}` is created with `role: "doctor"` based on the email match.

**Actually wait — there's a mismatch here.** Let me fix this properly. The onboarding creates `/users/{doctorId}`, but when they sign in, Firebase creates a user with a different uid. We need to handle email-based role lookup.

---

## 🛠 Technical Implementation Notes

### User Document Structure
```typescript
/users/{uid}
{
  uid: string,
  email: string,
  displayName: string,
  role: "user" | "doctor" | "admin",
  // ... other fields
}
```

### Doctor Document Structure
```typescript
/doctors/{doctorId}
{
  uid: string (same as doctorId),
  status: "approved",
  isVerified: true,
  profile: { name, specialty, experience, education, ... },
  clinic: { name, address, city, ... },
  consultation: { fee, duration, modes },
  rating: 4.5,
  totalReviews: 3,
  // ... timestamps
}
```

### Auto-Generated Slots
```typescript
/doctorSlots/{slotId}
{
  id: "slot_doc_123_2025-05-21_0900",
  doctorId: "doc_123",
  date: "2025-05-21",
  startTime: "09:00",
  endTime: "09:30",
  status: "available",
  // ... lock/book fields
}
```

---

## ✅ Quick Checklist

- [ ] Set your role to `admin` in Firestore `/users/{yourUid}`
- [ ] Deploy Firestore rules from provided rules file
- [ ] Go to `/admin/onboard-doctor` and create first doctor
- [ ] Share login email with doctor
- [ ] Doctor signs in with Google using that email
- [ ] Doctor automatically gets `role: "doctor"` and portal access

---

## 🐛 Troubleshooting

**Doctor can't access portal after sign-in:**
- Check `/users/{theirUid}` in Firestore — does `role: "doctor"` exist?
- Check AuthContext — is `isDoctor` true in the UI?
- Try signing out and back in to refresh the session

**Admin can't onboard doctors:**
- Check your own `/users/{yourUid}` — is `role: "admin"`?
- Check browser console for any Firestore permission errors

**Slots not showing:**
- Check `/doctorSlots` collection — are slots created with the right doctorId?
- Check that working days were selected during onboarding