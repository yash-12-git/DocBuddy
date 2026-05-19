import { DoctorProfile, Review, SearchFilters } from '@/types';
import { SEED_DOCTORS, generateSeedReviews } from '@/lib/seed-data';

// ─── In-memory store (use Firestore in production) ──────────────────
// This approach lets us build the full UI without a live Firebase instance
// Swap to Firestore queries when ready to deploy
const doctorsStore = new Map<string, DoctorProfile>();

// Initialize with seed data
SEED_DOCTORS.forEach((doc) => {
  doctorsStore.set(doc.uid, {
    ...doc,
    createdAt: { toMillis: () => Date.now() } as any,
    updatedAt: { toMillis: () => Date.now() } as any,
  } as DoctorProfile);
});

// ─── Search Doctors ─────────────────────────────────────────────────
export async function searchDoctors(filters: SearchFilters): Promise<DoctorProfile[]> {
  let doctors = Array.from(doctorsStore.values()).filter(
    (d) => d.status === 'approved'
  );

  if (filters.specialty) {
    doctors = doctors.filter((d) =>
      d.profile.specialty.some((s) =>
        s.toLowerCase().includes(filters.specialty!.toLowerCase())
      )
    );
  }

  if (filters.city) {
    doctors = doctors.filter(
      (d) => d.clinic.city.toLowerCase() === filters.city!.toLowerCase()
    );
  }

  if (filters.mode) {
    doctors = doctors.filter((d) =>
      d.consultation.modes.includes(filters.mode!)
    );
  }

  if (filters.minRating) {
    doctors = doctors.filter((d) => d.rating >= filters.minRating!);
  }

  if (filters.maxFee) {
    doctors = doctors.filter((d) => d.consultation.fee <= filters.maxFee!);
  }

  // Sort
  const sortBy = filters.sortBy || 'rating';
  const sortOrder = filters.sortOrder || 'desc';
  doctors.sort((a, b) => {
    let valA: number, valB: number;
    switch (sortBy) {
      case 'fee':
        valA = a.consultation.fee;
        valB = b.consultation.fee;
        break;
      case 'experience':
        valA = a.profile.experience;
        valB = b.profile.experience;
        break;
      default:
        valA = a.rating;
        valB = b.rating;
    }
    return sortOrder === 'asc' ? valA - valB : valB - valA;
  });

  return doctors;
}

// ─── Get Doctor Profile ─────────────────────────────────────────────
export async function getDoctorById(doctorId: string): Promise<DoctorProfile | null> {
  return doctorsStore.get(doctorId) || null;
}

// ─── Get Doctor Reviews ─────────────────────────────────────────────
export async function getDoctorReviews(
  doctorId: string,
  limit = 10
): Promise<Review[]> {
  const reviews = generateSeedReviews(doctorId, limit);
  return reviews as Review[];
}

// ─── Get All Specialties ────────────────────────────────────────────
export async function getSpecialties(): Promise<string[]> {
  const specialties = new Set<string>();
  doctorsStore.forEach((d) => {
    d.profile.specialty.forEach((s) => specialties.add(s));
  });
  return Array.from(specialties).sort();
}
