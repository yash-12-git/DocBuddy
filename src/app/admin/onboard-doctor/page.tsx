/** @jsxImportSource @emotion/react */
'use client';

import { css } from '@emotion/react';
import { theme } from '@/lib/theme';
import { useAuth } from '@/contexts/AuthContext';
import { getClientDb } from '@/lib/firebase/client';
import { doc, setDoc, writeBatch, Timestamp } from 'firebase/firestore';
import { SPECIALTIES } from '@/lib/seed-data';
import { encodeGeohash } from '@/lib/geo';
import { getNextNDates } from '@/lib/utils';
import { useState } from 'react';
import { useRouter } from 'next/navigation';

const S = css`
  max-width: 900px;
  margin: 0 auto;

  h1 {
    font-family: ${theme.fonts.heading};
    font-size: ${theme.fontSizes['2xl']};
    font-weight: 700;
    margin-bottom: ${theme.spacing.sm};
  }

  .subtitle {
    color: ${theme.colors.textSecondary};
    font-size: ${theme.fontSizes.sm};
    margin-bottom: ${theme.spacing.xl};
  }

  .form-section {
    background: white;
    border-radius: ${theme.radii.xl};
    border: 1px solid ${theme.colors.border};
    padding: ${theme.spacing.lg};
    margin-bottom: ${theme.spacing.lg};

    h2 {
      font-family: ${theme.fonts.heading};
      font-size: ${theme.fontSizes.lg};
      font-weight: 700;
      margin: 0 0 ${theme.spacing.lg};
    }
  }

  .form-row {
    display: grid;
    grid-template-columns: 1fr;
    gap: ${theme.spacing.md};
    @media (min-width: 640px) {
      grid-template-columns: 1fr 1fr;
    }
  }

  .form-group {
    margin-bottom: ${theme.spacing.base};

    label {
      display: block;
      font-size: ${theme.fontSizes.sm};
      font-weight: 500;
      margin-bottom: 6px;
    }

    input,
    select,
    textarea {
      width: 100%;
      padding: 11px 14px;
      border: 1.5px solid ${theme.colors.border};
      border-radius: ${theme.radii.md};
      font-size: 16px;
      outline: none;
      background: white;
      &:focus {
        border-color: ${theme.colors.primary};
      }
    }

    textarea {
      resize: vertical;
      min-height: 100px;
    }

    .helper {
      font-size: 12px;
      color: ${theme.colors.textMuted};
      margin-top: 4px;
    }
  }

  .specialty-chips {
    display: flex;
    flex-wrap: wrap;
    gap: 8px;
    margin-top: 8px;

    .chip {
      padding: 6px 14px;
      border-radius: 100px;
      font-size: 13px;
      font-weight: 500;
      cursor: pointer;
      transition: all 0.15s ease;
      border: 1.5px solid ${theme.colors.border};
      background: white;

      &.selected {
        background: ${theme.colors.primary};
        border-color: ${theme.colors.primary};
        color: white;
      }

      &:hover:not(.selected) {
        background: ${theme.colors.primaryBg};
        border-color: ${theme.colors.primary};
      }
    }
  }

  .education-list {
    .edu-item {
      background: ${theme.colors.bgSecondary};
      border-radius: ${theme.radii.md};
      padding: ${theme.spacing.md};
      margin-bottom: ${theme.spacing.sm};
      display: flex;
      gap: 12px;
      align-items: center;
      flex-wrap: wrap;

      .edu-inputs {
        flex: 1;
        min-width: 0;
        display: grid;
        grid-template-columns: 1fr 1fr 100px;
        gap: 8px;

        input {
          padding: 8px;
          border-radius: 6px;
          border: 1px solid ${theme.colors.border};
          font-size: 14px;
        }
      }

      .remove-btn {
        background: ${theme.colors.error};
        color: white;
        border: none;
        border-radius: ${theme.radii.sm};
        padding: 6px 14px;
        font-size: 12px;
        font-weight: 600;
        cursor: pointer;
        white-space: nowrap;
      }
    }

    .add-edu-btn {
      margin-top: ${theme.spacing.sm};
      padding: 8px 16px;
      background: ${theme.colors.bgSecondary};
      border: 1.5px solid ${theme.colors.border};
      border-radius: ${theme.radii.md};
      font-size: 13px;
      font-weight: 600;
      cursor: pointer;
      &:hover {
        background: ${theme.colors.bgTertiary};
      }
    }
  }

  .submit-section {
    display: flex;
    gap: ${theme.spacing.md};
    padding-top: ${theme.spacing.lg};
    border-top: 1px solid ${theme.colors.border};

    button {
      padding: 14px 32px;
      border-radius: ${theme.radii.md};
      font-weight: 600;
      font-size: ${theme.fontSizes.base};
      cursor: pointer;
      transition: all 0.15s ease;
      border: none;

      &.primary {
        background: ${theme.colors.primary};
        color: white;
        flex: 1;
        &:hover {
          background: ${theme.colors.primaryDark};
        }
        &:disabled {
          opacity: 0.5;
          cursor: not-allowed;
        }
      }

      &.secondary {
        background: ${theme.colors.bgSecondary};
        color: ${theme.colors.text};
        &:hover {
          background: ${theme.colors.bgTertiary};
        }
      }
    }
  }

  .success-banner {
    background: ${theme.colors.successBg};
    border: 1px solid rgba(16, 185, 129, 0.2);
    border-radius: ${theme.radii.xl};
    padding: ${theme.spacing.xl};
    margin-bottom: ${theme.spacing.lg};
    text-align: center;

    .icon {
      font-size: 56px;
      margin-bottom: ${theme.spacing.base};
    }

    h3 {
      font-family: ${theme.fonts.heading};
      font-size: ${theme.fontSizes.xl};
      font-weight: 700;
      color: ${theme.colors.success};
      margin-bottom: ${theme.spacing.sm};
    }

    .credentials {
      background: white;
      border-radius: ${theme.radii.lg};
      padding: ${theme.spacing.lg};
      margin: ${theme.spacing.lg} auto;
      max-width: 500px;
      text-align: left;

      .cred-row {
        display: flex;
        justify-content: space-between;
        padding: ${theme.spacing.sm} 0;
        border-bottom: 1px solid ${theme.colors.borderLight};
        &:last-child {
          border-bottom: none;
        }

        .label {
          font-weight: 600;
          color: ${theme.colors.textSecondary};
        }
        .value {
          font-family: ${theme.fonts.mono};
          font-size: 13px;
          color: ${theme.colors.text};
        }
      }
    }

    .note {
      margin-top: ${theme.spacing.base};
      font-size: 13px;
      color: ${theme.colors.textSecondary};
      line-height: 1.6;
    }

    .btn-group {
      margin-top: ${theme.spacing.xl};
      display: flex;
      gap: ${theme.spacing.sm};
      justify-content: center;
      flex-wrap: wrap;

      button {
        padding: 12px 24px;
        border: none;
        border-radius: ${theme.radii.md};
        font-weight: 600;
        cursor: pointer;
        &.primary {
          background: ${theme.colors.primary};
          color: white;
        }
        &.secondary {
          background: ${theme.colors.bgTertiary};
          color: ${theme.colors.text};
        }
      }
    }
  }
`;

interface Education {
  degree: string;
  institution: string;
  year: number;
}

export default function OnboardDoctorPage() {
  const { user } = useAuth();
  const router = useRouter();
  const adminId = (user as any)?.uid;

  const [email, setEmail] = useState('');
  const [name, setName] = useState('');
  const [specialties, setSpecialties] = useState<string[]>([]);
  const [experience, setExperience] = useState('');
  const [bio, setBio] = useState('');
  const [regNumber, setRegNumber] = useState('');
  const [languages, setLanguages] = useState('English, Hindi');
  const [education, setEducation] = useState<Education[]>([
    { degree: 'MBBS', institution: '', year: new Date().getFullYear() - 5 },
  ]);

  const [clinicName, setClinicName] = useState('');
  const [clinicAddress, setClinicAddress] = useState('');
  const [city, setCity] = useState('Pune');
  const [state, setState] = useState('Maharashtra');
  const [pincode, setPincode] = useState('');
  const [latitude, setLatitude] = useState('18.5204');
  const [longitude, setLongitude] = useState('73.8567');

  const [fee, setFee] = useState('500');
  const [duration, setDuration] = useState('30');
  const [modes, setModes] = useState<string[]>(['offline']);

  const [workingDays, setWorkingDays] = useState<number[]>([1, 2, 3, 4, 5]);
  const [startTime, setStartTime] = useState('09:00');
  const [endTime, setEndTime] = useState('17:00');

  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  const [onboardedEmail, setOnboardedEmail] = useState('');

  const toggleSpecialty = (spec: string) => {
    setSpecialties((prev) =>
      prev.includes(spec) ? prev.filter((s) => s !== spec) : [...prev, spec]
    );
  };

  const addEducation = () => {
    setEducation([...education, { degree: '', institution: '', year: new Date().getFullYear() }]);
  };

  const removeEducation = (index: number) => {
    setEducation(education.filter((_, i) => i !== index));
  };

  const updateEducation = (index: number, field: keyof Education, value: string | number) => {
    const updated = [...education];
    updated[index] = { ...updated[index], [field]: value };
    setEducation(updated);
  };

  const toggleMode = (mode: string) => {
    setModes((prev) => (prev.includes(mode) ? prev.filter((m) => m !== mode) : [...prev, mode]));
  };

  const toggleWorkingDay = (day: number) => {
    setWorkingDays((prev) => (prev.includes(day) ? prev.filter((d) => d !== day) : [...prev, day]));
  };

  const handleSubmit = async () => {
    if (!email || !name || specialties.length === 0 || !experience) {
      alert('Please fill all required fields (Email, Name, Specialty, Experience)');
      return;
    }

    setLoading(true);

    try {
      const db = getClientDb();
      const doctorId = `doc_${Date.now()}`;
      const now = Timestamp.now();
      const lat = parseFloat(latitude);
      const lng = parseFloat(longitude);

      // 1. Create doctor profile in /doctors collection
      const doctorData = {
        uid: doctorId,
        status: 'approved',
        isVerified: true,
        profile: {
          name,
          specialty: specialties,
          experience: Number(experience),
          education: education.filter((e) => e.degree && e.institution),
          languages: languages.split(',').map((l) => l.trim()),
          bio,
          photoURL: '',
          registrationNumber: regNumber,
        },
        clinic: {
          name: clinicName,
          address: clinicAddress,
          city,
          state,
          pincode,
          lat,
          lng,
          geohash: encodeGeohash(lat, lng),
        },
        consultation: {
          fee: Number(fee),
          currency: 'INR' as const,
          modes: modes as any,
          duration: Number(duration),
        },
        rating: 4.5,
        totalReviews: 0,
        approvedBy: adminId,
        approvedAt: now,
        createdAt: now,
        updatedAt: now,
      };

      await setDoc(doc(db, 'doctors', doctorId), doctorData);

      // 2. Create user profile in /users collection
      // This allows doctor to sign in with Google using this email
      const userData = {
        uid: doctorId,
        email: email,
        displayName: name,
        photoURL: null,
        role: 'doctor',
        phone: null,
        dateOfBirth: null,
        gender: null,
        addresses: [],
        preferences: {
          language: 'en',
          notifications: { email: true, sms: false, push: true },
        },
        createdAt: now,
        updatedAt: now,
        isActive: true,
      };

      await setDoc(doc(db, 'users', doctorId), userData);

      // 3. Generate slots for next 14 days based on schedule
      const dates = getNextNDates(14);
      const batch = writeBatch(db);
      let slotCount = 0;

      for (const dateStr of dates) {
        const dow = new Date(dateStr + 'T00:00:00').getDay();
        if (!workingDays.includes(dow)) continue;

        const [sH, sM] = startTime.split(':').map(Number);
        const [eH, eM] = endTime.split(':').map(Number);
        let cur = sH * 60 + sM;
        const end = eH * 60 + eM;
        const slotDuration = Number(duration);

        while (cur + slotDuration <= end) {
          const sh = Math.floor(cur / 60);
          const sm = cur % 60;
          cur += slotDuration;
          const eh = Math.floor(cur / 60);
          const em = cur % 60;

          const st = `${String(sh).padStart(2, '0')}:${String(sm).padStart(2, '0')}`;
          const et = `${String(eh).padStart(2, '0')}:${String(em).padStart(2, '0')}`;
          const slotId = `slot_${doctorId}_${dateStr}_${st.replace(':', '')}`;

          batch.set(doc(db, 'doctorSlots', slotId), {
            id: slotId,
            doctorId,
            date: dateStr,
            startTime: st,
            endTime: et,
            status: 'available',
            lockExpiry: null,
            lockedBy: null,
            bookedBy: null,
            orderId: null,
            createdAt: now,
          });
          slotCount++;
        }
      }

      await batch.commit();

      // 4. Create sample reviews
      const reviewBatch = writeBatch(db);
      const sampleReviews = [
        {
          userName: 'Raj Patel',
          rating: 5,
          body: 'Excellent doctor! Very thorough examination and clear explanations.',
        },
        {
          userName: 'Sneha Desai',
          rating: 4,
          body: 'Good experience overall. Doctor was patient and understanding.',
        },
        { userName: 'Amit Kumar', rating: 5, body: 'Highly recommended! Professional approach.' },
      ];

      sampleReviews.forEach((review, i) => {
        const reviewId = `review_${doctorId}_${i}`;
        reviewBatch.set(doc(db, 'reviews', reviewId), {
          id: reviewId,
          doctorId,
          userId: `seed_user_${i}`,
          userName: review.userName,
          rating: review.rating,
          body: review.body,
          isVerified: true,
          createdAt: now,
        });
      });

      await reviewBatch.commit();

      // Update doctor's totalReviews
      await setDoc(
        doc(db, 'doctors', doctorId),
        { totalReviews: sampleReviews.length, rating: 4.7 },
        { merge: true }
      );

      setOnboardedEmail(email);
      setSuccess(true);
      setLoading(false);
    } catch (err: any) {
      console.error('Onboarding failed:', err);
      alert('Failed to onboard doctor: ' + err.message);
      setLoading(false);
    }
  };

  if (success) {
    return (
      <div css={S}>
        <div className="success-banner">
          <div className="icon">✅</div>
          <h3>Doctor Onboarded Successfully!</h3>
          <div className="credentials">
            <div className="cred-row">
              <span className="label">Email:</span>
              <span className="value">{onboardedEmail}</span>
            </div>
            <div className="cred-row">
              <span className="label">Login Method:</span>
              <span className="value">Google Sign-In</span>
            </div>
            <div className="cred-row">
              <span className="label">Role:</span>
              <span className="value">Doctor</span>
            </div>
            <div className="cred-row">
              <span className="label">Portal Access:</span>
              <span className="value">/portal/*</span>
            </div>
          </div>
          <div className="note">
            <strong>📧 Share these credentials with the doctor:</strong>
            <br />
            When they visit DoctorHub and click "Sign In", they should use "Continue with Google"
            with the email <strong>{onboardedEmail}</strong>. Their account has been pre-configured
            with doctor role, so they'll automatically have access to the Doctor Portal upon first
            sign-in.
          </div>
          <div className="btn-group">
            <button className="primary" onClick={() => router.push('/admin/doctors')}>
              View All Doctors
            </button>
            <button
              className="secondary"
              onClick={() => {
                setSuccess(false);
                setEmail('');
                setName('');
                setSpecialties([]);
                setExperience('');
                setBio('');
              }}
            >
              Onboard Another Doctor
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div css={S}>
      <h1>Onboard New Doctor</h1>
      <p className="subtitle">
        Create a complete doctor profile with slots and reviews. Doctor will sign in via Google.
      </p>

      <div className="form-section">
        <h2>👤 Basic Information</h2>
        <div className="form-row">
          <div className="form-group">
            <label>
              Email Address <span style={{ color: 'red' }}>*</span>
            </label>
            <input
              type="email"
              placeholder="doctor@example.com"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
            />
            <div className="helper">Doctor will use Google Sign-In with this email</div>
          </div>
          <div className="form-group">
            <label>
              Full Name <span style={{ color: 'red' }}>*</span>
            </label>
            <input
              type="text"
              placeholder="Dr. John Doe"
              value={name}
              onChange={(e) => setName(e.target.value)}
            />
          </div>
        </div>

        <div className="form-row">
          <div className="form-group">
            <label>
              Experience (years) <span style={{ color: 'red' }}>*</span>
            </label>
            <input
              type="number"
              placeholder="10"
              value={experience}
              onChange={(e) => setExperience(e.target.value)}
            />
          </div>
          <div className="form-group">
            <label>Registration Number</label>
            <input
              type="text"
              placeholder="MH-12345"
              value={regNumber}
              onChange={(e) => setRegNumber(e.target.value)}
            />
          </div>
        </div>

        <div className="form-group">
          <label>Languages</label>
          <input
            type="text"
            placeholder="English, Hindi, Marathi"
            value={languages}
            onChange={(e) => setLanguages(e.target.value)}
          />
        </div>

        <div className="form-group">
          <label>
            Specialties <span style={{ color: 'red' }}>*</span>
          </label>
          <div className="specialty-chips">
            {SPECIALTIES.map((spec) => (
              <div
                key={spec}
                className={`chip ${specialties.includes(spec) ? 'selected' : ''}`}
                onClick={() => toggleSpecialty(spec)}
              >
                {spec}
              </div>
            ))}
          </div>
        </div>

        <div className="form-group">
          <label>Bio</label>
          <textarea
            placeholder="Professional background and approach..."
            value={bio}
            onChange={(e) => setBio(e.target.value)}
          />
        </div>
      </div>

      <div className="form-section">
        <h2>🎓 Education</h2>
        <div className="education-list">
          {education.map((edu, i) => (
            <div key={i} className="edu-item">
              <div className="edu-inputs">
                <input
                  type="text"
                  placeholder="Degree"
                  value={edu.degree}
                  onChange={(e) => updateEducation(i, 'degree', e.target.value)}
                />
                <input
                  type="text"
                  placeholder="Institution"
                  value={edu.institution}
                  onChange={(e) => updateEducation(i, 'institution', e.target.value)}
                />
                <input
                  type="number"
                  placeholder="Year"
                  value={edu.year}
                  onChange={(e) => updateEducation(i, 'year', parseInt(e.target.value) || 2020)}
                />
              </div>
              {education.length > 1 && (
                <button className="remove-btn" onClick={() => removeEducation(i)}>
                  Remove
                </button>
              )}
            </div>
          ))}
          <button className="add-edu-btn" onClick={addEducation}>
            + Add Education
          </button>
        </div>
      </div>

      <div className="form-section">
        <h2>🏥 Clinic Details</h2>
        <div className="form-group">
          <label>Clinic Name</label>
          <input
            type="text"
            placeholder="Health Clinic"
            value={clinicName}
            onChange={(e) => setClinicName(e.target.value)}
          />
        </div>
        <div className="form-group">
          <label>Address</label>
          <input
            type="text"
            placeholder="123 Main Street"
            value={clinicAddress}
            onChange={(e) => setClinicAddress(e.target.value)}
          />
        </div>
        <div className="form-row">
          <div className="form-group">
            <label>City</label>
            <input type="text" value={city} onChange={(e) => setCity(e.target.value)} />
          </div>
          <div className="form-group">
            <label>State</label>
            <input type="text" value={state} onChange={(e) => setState(e.target.value)} />
          </div>
        </div>
        <div className="form-group">
          <label>Pincode</label>
          <input
            type="text"
            placeholder="411001"
            value={pincode}
            onChange={(e) => setPincode(e.target.value)}
          />
        </div>
        <div className="form-row">
          <div className="form-group">
            <label>Latitude</label>
            <input type="text" value={latitude} onChange={(e) => setLatitude(e.target.value)} />
          </div>
          <div className="form-group">
            <label>Longitude</label>
            <input type="text" value={longitude} onChange={(e) => setLongitude(e.target.value)} />
          </div>
        </div>
      </div>

      <div className="form-section">
        <h2>💰 Consultation</h2>
        <div className="form-row">
          <div className="form-group">
            <label>Fee (₹)</label>
            <input
              type="number"
              placeholder="500"
              value={fee}
              onChange={(e) => setFee(e.target.value)}
            />
          </div>
          <div className="form-group">
            <label>Duration</label>
            <select value={duration} onChange={(e) => setDuration(e.target.value)}>
              <option value="15">15 min</option>
              <option value="20">20 min</option>
              <option value="30">30 min</option>
              <option value="45">45 min</option>
              <option value="60">60 min</option>
            </select>
          </div>
        </div>
        <div className="form-group">
          <label>Modes</label>
          <div style={{ display: 'flex', gap: 12, marginTop: 8 }}>
            {['offline', 'online'].map((mode) => (
              <button
                key={mode}
                type="button"
                onClick={() => toggleMode(mode)}
                style={{
                  padding: '8px 16px',
                  borderRadius: 100,
                  border: `1.5px solid ${modes.includes(mode) ? '#0D9488' : '#E2E8F0'}`,
                  background: modes.includes(mode) ? '#F0FDFA' : 'white',
                  color: modes.includes(mode) ? '#0D9488' : '#64748B',
                  fontWeight: 500,
                  cursor: 'pointer',
                }}
              >
                {mode === 'online' ? '💻 Online' : '🏥 Clinic'}
              </button>
            ))}
          </div>
        </div>
      </div>

      <div className="form-section">
        <h2>📅 Schedule (for auto slot generation)</h2>
        <div className="form-group">
          <label>Working Days</label>
          <div style={{ display: 'flex', gap: 8, marginTop: 8, flexWrap: 'wrap' }}>
            {[
              { day: 0, label: 'Sun' },
              { day: 1, label: 'Mon' },
              { day: 2, label: 'Tue' },
              { day: 3, label: 'Wed' },
              { day: 4, label: 'Thu' },
              { day: 5, label: 'Fri' },
              { day: 6, label: 'Sat' },
            ].map(({ day, label }) => (
              <button
                key={day}
                type="button"
                onClick={() => toggleWorkingDay(day)}
                style={{
                  padding: '8px 16px',
                  borderRadius: 8,
                  border: `1.5px solid ${workingDays.includes(day) ? '#0D9488' : '#E2E8F0'}`,
                  background: workingDays.includes(day) ? '#0D9488' : 'white',
                  color: workingDays.includes(day) ? 'white' : '#64748B',
                  fontWeight: 600,
                  cursor: 'pointer',
                }}
              >
                {label}
              </button>
            ))}
          </div>
        </div>
        <div className="form-row">
          <div className="form-group">
            <label>Start Time</label>
            <input type="time" value={startTime} onChange={(e) => setStartTime(e.target.value)} />
          </div>
          <div className="form-group">
            <label>End Time</label>
            <input type="time" value={endTime} onChange={(e) => setEndTime(e.target.value)} />
          </div>
        </div>
        <div className="helper" style={{ marginTop: 8 }}>
          Slots for the next 14 days will be auto-generated based on this schedule
        </div>
      </div>

      <div className="form-section">
        <div className="submit-section">
          <button className="secondary" type="button" onClick={() => router.push('/admin/doctors')}>
            Cancel
          </button>
          <button className="primary" type="button" onClick={handleSubmit} disabled={loading}>
            {loading ? 'Creating Profile...' : 'Onboard Doctor'}
          </button>
        </div>
      </div>
    </div>
  );
}
