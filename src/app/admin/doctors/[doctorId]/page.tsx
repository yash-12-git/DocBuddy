/** @jsxImportSource @emotion/react */
'use client';

import { css } from '@emotion/react';
import { theme } from '@/lib/theme';
import { getClientDb } from '@/lib/firebase/client';
import { doc, getDoc, updateDoc, Timestamp } from 'firebase/firestore';
import { SPECIALTIES } from '@/lib/seed-data';
import { encodeGeohash } from '@/lib/geo';
import { useParams, useRouter } from 'next/navigation';
import { useState, useEffect } from 'react';

const S = css`
  max-width: 900px;
  margin: 0 auto;

  .back-link {
    display: inline-flex;
    align-items: center;
    gap: 6px;
    color: ${theme.colors.textSecondary};
    font-size: ${theme.fontSizes.sm};
    margin-bottom: ${theme.spacing.base};
    cursor: pointer;
    &:hover {
      color: ${theme.colors.primary};
    }
  }

  h1 {
    font-family: ${theme.fonts.heading};
    font-size: ${theme.fontSizes['2xl']};
    font-weight: 700;
    margin-bottom: ${theme.spacing.sm};
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
    }
  }

  .submit-section {
    display: flex;
    gap: ${theme.spacing.md};

    button {
      padding: 14px 32px;
      border-radius: ${theme.radii.md};
      font-weight: 600;
      font-size: ${theme.fontSizes.base};
      cursor: pointer;
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
        }
      }

      &.secondary {
        background: ${theme.colors.bgSecondary};
        color: ${theme.colors.text};
      }
    }
  }
`;

export default function EditDoctorPage() {
  const params = useParams();
  const router = useRouter();
  const doctorId = params.doctorId as string;

  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  const [name, setName] = useState('');
  const [specialties, setSpecialties] = useState<string[]>([]);
  const [experience, setExperience] = useState('');
  const [bio, setBio] = useState('');
  const [regNumber, setRegNumber] = useState('');
  const [languages, setLanguages] = useState('');

  const [clinicName, setClinicName] = useState('');
  const [clinicAddress, setClinicAddress] = useState('');
  const [city, setCity] = useState('');
  const [state, setState] = useState('');
  const [pincode, setPincode] = useState('');
  const [latitude, setLatitude] = useState('');
  const [longitude, setLongitude] = useState('');

  const [fee, setFee] = useState('');
  const [duration, setDuration] = useState('');
  const [modes, setModes] = useState<string[]>([]);

  const [status, setStatus] = useState('approved');
  const [isVerified, setIsVerified] = useState(true);

  useEffect(() => {
    loadDoctor();
  }, []);

  const loadDoctor = async () => {
    try {
      const db = getClientDb();
      const docSnap = await getDoc(doc(db, 'doctors', doctorId));
      if (!docSnap.exists()) {
        alert('Doctor not found');
        router.push('/admin/doctors');
        return;
      }

      const data = docSnap.data();
      setName(data.profile.name);
      setSpecialties(data.profile.specialty);
      setExperience(String(data.profile.experience));
      setBio(data.profile.bio || '');
      setRegNumber(data.profile.registrationNumber || '');
      setLanguages(data.profile.languages.join(', '));

      setClinicName(data.clinic.name || '');
      setClinicAddress(data.clinic.address || '');
      setCity(data.clinic.city || '');
      setState(data.clinic.state || '');
      setPincode(data.clinic.pincode || '');
      setLatitude(String(data.clinic.lat || ''));
      setLongitude(String(data.clinic.lng || ''));

      setFee(String(data.consultation.fee));
      setDuration(String(data.consultation.duration));
      setModes(data.consultation.modes);

      setStatus(data.status);
      setIsVerified(data.isVerified);

      setLoading(false);
    } catch (err: any) {
      console.error(err);
      alert('Failed to load doctor: ' + err.message);
    }
  };

  const handleSave = async () => {
    setSaving(true);
    try {
      const db = getClientDb();
      const lat = parseFloat(latitude);
      const lng = parseFloat(longitude);

      const updates = {
        profile: {
          name,
          specialty: specialties,
          experience: Number(experience),
          education: [],
          languages: languages.split(',').map((l) => l.trim()),
          bio,
          registrationNumber: regNumber,
          photoURL: '',
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
        status,
        isVerified,
        updatedAt: Timestamp.now(),
      };

      await updateDoc(doc(db, 'doctors', doctorId), updates);
      alert('✅ Doctor profile updated');
      router.push('/admin/doctors');
    } catch (err: any) {
      alert('Failed: ' + err.message);
    }
    setSaving(false);
  };

  const toggleSpecialty = (spec: string) => {
    setSpecialties((prev) =>
      prev.includes(spec) ? prev.filter((s) => s !== spec) : [...prev, spec]
    );
  };

  const toggleMode = (mode: string) => {
    setModes((prev) => (prev.includes(mode) ? prev.filter((m) => m !== mode) : [...prev, mode]));
  };

  if (loading) return <div css={S}><p>Loading...</p></div>;

  return (
    <div css={S}>
      <div className="back-link" onClick={() => router.push('/admin/doctors')}>
        ← Back to Doctors
      </div>
      <h1>Edit Doctor Profile</h1>

      <div className="form-section">
        <h2>👤 Basic Info</h2>
        <div className="form-row">
          <div className="form-group">
            <label>Name</label>
            <input type="text" value={name} onChange={(e) => setName(e.target.value)} />
          </div>
          <div className="form-group">
            <label>Experience (years)</label>
            <input type="number" value={experience} onChange={(e) => setExperience(e.target.value)} />
          </div>
        </div>
        <div className="form-row">
          <div className="form-group">
            <label>Registration Number</label>
            <input type="text" value={regNumber} onChange={(e) => setRegNumber(e.target.value)} />
          </div>
          <div className="form-group">
            <label>Languages</label>
            <input type="text" value={languages} onChange={(e) => setLanguages(e.target.value)} />
          </div>
        </div>
        <div className="form-group">
          <label>Specialties</label>
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
          <textarea value={bio} onChange={(e) => setBio(e.target.value)} />
        </div>
      </div>

      <div className="form-section">
        <h2>🏥 Clinic</h2>
        <div className="form-group">
          <label>Name</label>
          <input type="text" value={clinicName} onChange={(e) => setClinicName(e.target.value)} />
        </div>
        <div className="form-group">
          <label>Address</label>
          <input type="text" value={clinicAddress} onChange={(e) => setClinicAddress(e.target.value)} />
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
      </div>

      <div className="form-section">
        <h2>💰 Consultation</h2>
        <div className="form-row">
          <div className="form-group">
            <label>Fee (₹)</label>
            <input type="number" value={fee} onChange={(e) => setFee(e.target.value)} />
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
          <div style={{ display: 'flex', gap: 12 }}>
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
        <h2>⚙️ Admin Settings</h2>
        <div className="form-row">
          <div className="form-group">
            <label>Status</label>
            <select value={status} onChange={(e) => setStatus(e.target.value)}>
              <option value="pending">Pending</option>
              <option value="approved">Approved</option>
              <option value="suspended">Suspended</option>
            </select>
          </div>
          <div className="form-group">
            <label>Verified</label>
            <select value={isVerified ? 'true' : 'false'} onChange={(e) => setIsVerified(e.target.value === 'true')}>
              <option value="true">Yes</option>
              <option value="false">No</option>
            </select>
          </div>
        </div>
      </div>

      <div className="form-section">
        <div className="submit-section">
          <button className="secondary" onClick={() => router.push('/admin/doctors')}>
            Cancel
          </button>
          <button className="primary" onClick={handleSave} disabled={saving}>
            {saving ? 'Saving...' : 'Save Changes'}
          </button>
        </div>
      </div>
    </div>
  );
}
