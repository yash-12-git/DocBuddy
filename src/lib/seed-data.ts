import { DoctorProfile, DoctorSlot } from '@/types';
import { encodeGeohash } from '@/lib/geo';
import { getNextNDates } from '@/lib/utils';

// ─── Pune doctors seed data ─────────────────────────────────────────
// Realistic data for hyperlocal marketplace development

export const SPECIALTIES = [
  'General Physician',
  'Cardiologist',
  'Dermatologist',
  'Orthopedic',
  'Pediatrician',
  'Gynecologist',
  'ENT Specialist',
  'Ophthalmologist',
  'Neurologist',
  'Dentist',
  'Psychiatrist',
  'Urologist',
];

export const SEED_DOCTORS: Omit<DoctorProfile, 'createdAt' | 'updatedAt'>[] = [
  {
    uid: 'doc_001',
    status: 'approved',
    isVerified: true,
    profile: {
      name: 'Priya Sharma',
      specialty: ['General Physician', 'Diabetologist'],
      experience: 12,
      education: [
        { degree: 'MBBS', institution: 'AIIMS Delhi', year: 2010 },
        { degree: 'MD (Medicine)', institution: 'PGIMER Chandigarh', year: 2014 },
      ],
      languages: ['English', 'Hindi', 'Marathi'],
      bio: 'Dr. Priya Sharma is a highly experienced general physician with special interest in diabetes management and preventive healthcare. She believes in a patient-centric approach combining evidence-based medicine with lifestyle modifications.',
      photoURL: '',
      registrationNumber: 'MH-12345',
    },
    clinic: {
      name: 'Shree Wellness Clinic',
      address: '204, Kumar Plaza, Baner Road, Baner',
      city: 'Pune',
      state: 'Maharashtra',
      pincode: '411045',
      lat: 18.5596,
      lng: 73.7871,
      geohash: encodeGeohash(18.5596, 73.7871),
    },
    consultation: {
      fee: 500,
      currency: 'INR',
      modes: ['offline', 'online'],
      duration: 30,
    },
    rating: 4.6,
    totalReviews: 342,
    approvedBy: 'admin_001',
    approvedAt: null,
  },
  {
    uid: 'doc_002',
    status: 'approved',
    isVerified: true,
    profile: {
      name: 'Rajesh Kulkarni',
      specialty: ['Cardiologist'],
      experience: 18,
      education: [
        { degree: 'MBBS', institution: 'Grant Medical College, Mumbai', year: 2004 },
        { degree: 'MD (Cardiology)', institution: 'KEM Hospital Mumbai', year: 2008 },
        { degree: 'DM (Cardiology)', institution: 'AIIMS Delhi', year: 2011 },
      ],
      languages: ['English', 'Hindi', 'Marathi'],
      bio: 'Dr. Rajesh Kulkarni is a senior interventional cardiologist specializing in complex angioplasty and preventive cardiology. He has performed over 3000 successful cardiac procedures.',
      photoURL: '',
      registrationNumber: 'MH-23456',
    },
    clinic: {
      name: 'Heart Care Centre',
      address: '15, Sahyadri Complex, Deccan Gymkhana',
      city: 'Pune',
      state: 'Maharashtra',
      pincode: '411004',
      lat: 18.5178,
      lng: 73.8400,
      geohash: encodeGeohash(18.5178, 73.8400),
    },
    consultation: {
      fee: 1200,
      currency: 'INR',
      modes: ['offline'],
      duration: 30,
    },
    rating: 4.8,
    totalReviews: 521,
    approvedBy: 'admin_001',
    approvedAt: null,
  },
  {
    uid: 'doc_003',
    status: 'approved',
    isVerified: true,
    profile: {
      name: 'Sneha Patel',
      specialty: ['Dermatologist', 'Cosmetologist'],
      experience: 8,
      education: [
        { degree: 'MBBS', institution: 'BJ Medical College, Pune', year: 2014 },
        { degree: 'MD (Dermatology)', institution: 'Sassoon Hospital, Pune', year: 2018 },
      ],
      languages: ['English', 'Hindi', 'Gujarati', 'Marathi'],
      bio: 'Dr. Sneha Patel is a board-certified dermatologist specializing in acne treatment, hair loss management, and cosmetic procedures. She combines advanced dermatological treatments with a holistic approach to skin health.',
      photoURL: '',
      registrationNumber: 'MH-34567',
    },
    clinic: {
      name: 'Glow Skin & Hair Clinic',
      address: '301, Amanora Mall Road, Hadapsar',
      city: 'Pune',
      state: 'Maharashtra',
      pincode: '411028',
      lat: 18.5089,
      lng: 73.9260,
      geohash: encodeGeohash(18.5089, 73.9260),
    },
    consultation: {
      fee: 700,
      currency: 'INR',
      modes: ['offline', 'online'],
      duration: 20,
    },
    rating: 4.5,
    totalReviews: 187,
    approvedBy: 'admin_001',
    approvedAt: null,
  },
  {
    uid: 'doc_004',
    status: 'approved',
    isVerified: false,
    profile: {
      name: 'Amit Deshmukh',
      specialty: ['Orthopedic', 'Sports Medicine'],
      experience: 15,
      education: [
        { degree: 'MBBS', institution: 'Lokmanya Tilak Municipal MC, Mumbai', year: 2008 },
        { degree: 'MS (Ortho)', institution: 'JJ Hospital Mumbai', year: 2012 },
      ],
      languages: ['English', 'Hindi', 'Marathi'],
      bio: 'Dr. Amit Deshmukh is an orthopedic surgeon with expertise in joint replacement, sports injuries, and minimally invasive spine surgery. Consultant for multiple sports teams in Maharashtra.',
      photoURL: '',
      registrationNumber: 'MH-45678',
    },
    clinic: {
      name: 'OrthoPlus Hospital',
      address: '78, MG Road, Camp',
      city: 'Pune',
      state: 'Maharashtra',
      pincode: '411001',
      lat: 18.5204,
      lng: 73.8567,
      geohash: encodeGeohash(18.5204, 73.8567),
    },
    consultation: {
      fee: 900,
      currency: 'INR',
      modes: ['offline'],
      duration: 30,
    },
    rating: 4.3,
    totalReviews: 256,
    approvedBy: 'admin_001',
    approvedAt: null,
  },
  {
    uid: 'doc_005',
    status: 'approved',
    isVerified: true,
    profile: {
      name: 'Meera Joshi',
      specialty: ['Pediatrician', 'Neonatologist'],
      experience: 10,
      education: [
        { degree: 'MBBS', institution: 'Armed Forces Medical College, Pune', year: 2013 },
        { degree: 'MD (Pediatrics)', institution: 'AFMC Pune', year: 2017 },
      ],
      languages: ['English', 'Hindi', 'Marathi', 'Kannada'],
      bio: 'Dr. Meera Joshi is a compassionate pediatrician providing comprehensive child healthcare from newborn to adolescent. Special interest in developmental pediatrics and childhood nutrition.',
      photoURL: '',
      registrationNumber: 'MH-56789',
    },
    clinic: {
      name: 'Little Stars Clinic',
      address: '42, Prabhat Road, Erandwane',
      city: 'Pune',
      state: 'Maharashtra',
      pincode: '411004',
      lat: 18.5105,
      lng: 73.8326,
      geohash: encodeGeohash(18.5105, 73.8326),
    },
    consultation: {
      fee: 600,
      currency: 'INR',
      modes: ['offline', 'online'],
      duration: 30,
    },
    rating: 4.9,
    totalReviews: 412,
    approvedBy: 'admin_001',
    approvedAt: null,
  },
  {
    uid: 'doc_006',
    status: 'approved',
    isVerified: true,
    profile: {
      name: 'Vikram Nair',
      specialty: ['ENT Specialist'],
      experience: 14,
      education: [
        { degree: 'MBBS', institution: 'Government Medical College, Nagpur', year: 2009 },
        { degree: 'MS (ENT)', institution: 'Sion Hospital Mumbai', year: 2013 },
      ],
      languages: ['English', 'Hindi', 'Marathi', 'Malayalam'],
      bio: 'Dr. Vikram Nair is an experienced ENT specialist with expertise in endoscopic sinus surgery, hearing disorders, and voice disorders. Pioneer in minimally invasive ENT procedures in Pune.',
      photoURL: '',
      registrationNumber: 'MH-67890',
    },
    clinic: {
      name: 'ENT & Allergy Centre',
      address: '56, FC Road, Shivajinagar',
      city: 'Pune',
      state: 'Maharashtra',
      pincode: '411005',
      lat: 18.5314,
      lng: 73.8446,
      geohash: encodeGeohash(18.5314, 73.8446),
    },
    consultation: {
      fee: 800,
      currency: 'INR',
      modes: ['offline', 'online'],
      duration: 20,
    },
    rating: 4.4,
    totalReviews: 198,
    approvedBy: 'admin_001',
    approvedAt: null,
  },
  {
    uid: 'doc_007',
    status: 'approved',
    isVerified: true,
    profile: {
      name: 'Ananya Bhatt',
      specialty: ['Gynecologist', 'Obstetrician'],
      experience: 16,
      education: [
        { degree: 'MBBS', institution: 'Seth GS Medical College, Mumbai', year: 2006 },
        { degree: 'MS (OB/GYN)', institution: 'KEM Hospital Mumbai', year: 2010 },
      ],
      languages: ['English', 'Hindi', 'Marathi'],
      bio: 'Dr. Ananya Bhatt is a senior gynecologist specializing in high-risk pregnancy management, laparoscopic gynecological surgery, and infertility treatment. Known for her empathetic patient care approach.',
      photoURL: '',
      registrationNumber: 'MH-78901',
    },
    clinic: {
      name: 'Motherhood Clinic',
      address: '22, Senapati Bapat Road, Shivajinagar',
      city: 'Pune',
      state: 'Maharashtra',
      pincode: '411016',
      lat: 18.5362,
      lng: 73.8302,
      geohash: encodeGeohash(18.5362, 73.8302),
    },
    consultation: {
      fee: 1000,
      currency: 'INR',
      modes: ['offline', 'online'],
      duration: 30,
    },
    rating: 4.7,
    totalReviews: 367,
    approvedBy: 'admin_001',
    approvedAt: null,
  },
  {
    uid: 'doc_008',
    status: 'approved',
    isVerified: false,
    profile: {
      name: 'Rohan Mehta',
      specialty: ['Psychiatrist'],
      experience: 9,
      education: [
        { degree: 'MBBS', institution: 'BJMC Pune', year: 2013 },
        { degree: 'MD (Psychiatry)', institution: 'NIMHANS Bangalore', year: 2017 },
      ],
      languages: ['English', 'Hindi', 'Marathi', 'Gujarati'],
      bio: 'Dr. Rohan Mehta practices integrative psychiatry combining evidence-based medication management with psychotherapy. Special focus on anxiety disorders, depression, and workplace mental health.',
      photoURL: '',
      registrationNumber: 'MH-89012',
    },
    clinic: {
      name: 'Mind Matters Clinic',
      address: '108, Koregaon Park, Lane 5',
      city: 'Pune',
      state: 'Maharashtra',
      pincode: '411001',
      lat: 18.5362,
      lng: 73.8934,
      geohash: encodeGeohash(18.5362, 73.8934),
    },
    consultation: {
      fee: 1500,
      currency: 'INR',
      modes: ['offline', 'online'],
      duration: 45,
    },
    rating: 4.6,
    totalReviews: 145,
    approvedBy: 'admin_001',
    approvedAt: null,
  },
];

// ─── Generate slots for each doctor ─────────────────────────────────
export function generateSeedSlots(doctorId: string, duration: number): Omit<DoctorSlot, 'createdAt'>[] {
  const dates = getNextNDates(7);
  const slots: Omit<DoctorSlot, 'createdAt'>[] = [];
  const schedules = [
    { start: '09:00', end: '13:00' },
    { start: '16:00', end: '20:00' },
  ];

  for (const date of dates) {
    for (const schedule of schedules) {
      const [startH, startM] = schedule.start.split(':').map(Number);
      const [endH, endM] = schedule.end.split(':').map(Number);
      let current = startH * 60 + startM;
      const end = endH * 60 + endM;

      while (current + duration <= end) {
        const sH = Math.floor(current / 60);
        const sM = current % 60;
        current += duration;
        const eH = Math.floor(current / 60);
        const eM = current % 60;

        const startTime = `${String(sH).padStart(2, '0')}:${String(sM).padStart(2, '0')}`;
        const endTime = `${String(eH).padStart(2, '0')}:${String(eM).padStart(2, '0')}`;

        // Randomly mark some slots as booked for realism
        const rand = Math.random();
        const isBooked = rand < 0.25;
        const isAvailable = !isBooked;

        slots.push({
          id: `slot_${doctorId}_${date}_${startTime.replace(':', '')}`,
          doctorId,
          date,
          startTime,
          endTime,
          status: isAvailable ? 'available' : 'booked',
          lockExpiry: null,
          lockedBy: null,
          bookedBy: isBooked ? 'user_random' : null,
          orderId: null,
        });
      }
    }
  }

  return slots;
}

// ─── Seed reviews ───────────────────────────────────────────────────
const REVIEW_BODIES = [
  'Very thorough consultation. The doctor listened patiently and explained everything clearly.',
  'Excellent experience. Short waiting time and very professional approach.',
  'Highly recommended! The doctor is very knowledgeable and makes you feel comfortable.',
  'Good doctor but had to wait a bit longer than expected. Treatment was effective though.',
  'Best doctor I have visited. Very detailed examination and clear treatment plan.',
  'The clinic is well-maintained and the staff is very courteous. Doctor is experienced.',
  'Very satisfied with the consultation. The doctor answered all my questions patiently.',
  'Professional and caring. Follow-up was also prompt. Will visit again.',
];

export function generateSeedReviews(doctorId: string, count: number) {
  const reviews = [];
  const names = ['Arun K.', 'Priya M.', 'Rahul S.', 'Neha T.', 'Sanjay P.', 'Kavita D.', 'Vikash R.', 'Anjali N.'];

  for (let i = 0; i < count; i++) {
    reviews.push({
      id: `review_${doctorId}_${i}`,
      orderId: `order_past_${i}`,
      userId: `user_${i}`,
      doctorId,
      rating: Math.floor(Math.random() * 2) + 4 as 4 | 5,
      title: 'Great experience',
      body: REVIEW_BODIES[i % REVIEW_BODIES.length],
      userName: names[i % names.length],
      isVerified: true,
      isVisible: true,
      createdAt: Date.now() - Math.random() * 30 * 24 * 60 * 60 * 1000,
    });
  }

  return reviews;
}
