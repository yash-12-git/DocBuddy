import { DoctorProfile, Review, SearchFilters } from '@/types';
import { getClientDb } from '@/lib/firebase/client';
import {
  collection,
  query,
  where,
  orderBy,
  limit as firestoreLimit,
  getDocs,
  getDoc,
  doc,
} from 'firebase/firestore';

// ─── Search Doctors ─────────────────────────────────────────────────
export async function searchDoctors(filters: SearchFilters): Promise<DoctorProfile[]> {
  const db = getClientDb();
  const doctorsRef = collection(db, 'doctors');

  console.log(db , doctorsRef, "line19");
  

  // Firestore only allows one range/inequality filter per query.
  // We filter by status + any equality filters in Firestore,
  // then do the remaining filters client-side.
  let q = query(doctorsRef, where('status', '==', 'approved'));

  if (filters.city) {
    q = query(q, where('clinic.city', '==', filters.city));
  }

  if (filters.mode) {
    q = query(q, where('consultation.modes', 'array-contains', filters.mode));
  }

  const snapshot = await getDocs(q);
  let doctors: DoctorProfile[] = snapshot.docs.map((d) => ({
    ...d.data(),
    uid: d.id,
  })) as DoctorProfile[];

  // Client-side filtering
  if (filters.specialty) {
    const specLower = filters.specialty.toLowerCase();
    doctors = doctors.filter((d) =>
      d.profile.specialty.some((s) => s.toLowerCase().includes(specLower))
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
  const db = getClientDb();
  const docRef = doc(db, 'doctors', doctorId);
  const docSnap = await getDoc(docRef);

  if (!docSnap.exists()) return null;

  return { ...docSnap.data(), uid: docSnap.id } as DoctorProfile;
}

// ─── Get Doctor Reviews ─────────────────────────────────────────────
export async function getDoctorReviews(
  doctorId: string,
  limitCount = 10
): Promise<Review[]> {
  const db = getClientDb();
  const reviewsRef = collection(db, 'reviews');

  // Simple query — composite index (doctorId + isVisible + createdAt) required
  // If the index isn't created yet, fall back to a simpler query
  try {
    const q = query(
      reviewsRef,
      where('doctorId', '==', doctorId),
      where('isVisible', '==', true),
      orderBy('createdAt', 'desc'),
      firestoreLimit(limitCount)
    );
    const snapshot = await getDocs(q);
    return snapshot.docs.map((d) => ({ ...d.data(), id: d.id })) as Review[];
  } catch (err) {
    // Fallback: without ordering (no index needed)
    const q = query(
      reviewsRef,
      where('doctorId', '==', doctorId),
      where('isVisible', '==', true),
      firestoreLimit(limitCount)
    );
    const snapshot = await getDocs(q);
    const reviews = snapshot.docs.map((d) => ({ ...d.data(), id: d.id })) as Review[];
    return reviews.sort((a, b) => b.createdAt - a.createdAt);
  }
}

// ─── Get All Specialties ────────────────────────────────────────────
export async function getSpecialties(): Promise<string[]> {
  const db = getClientDb();
  const doctorsRef = collection(db, 'doctors');
  const q = query(doctorsRef, where('status', '==', 'approved'));
  const snapshot = await getDocs(q);

  const specialties = new Set<string>();
  snapshot.docs.forEach((d) => {
    const data = d.data();
    if (data.profile?.specialty) {
      data.profile.specialty.forEach((s: string) => specialties.add(s));
    }
  });
  return Array.from(specialties).sort();
}
