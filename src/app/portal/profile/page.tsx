/** @jsxImportSource @emotion/react */
'use client';

import { css } from '@emotion/react';
import { theme } from '@/lib/theme';
import { useAuth } from '@/contexts/AuthContext';
import { getMyDoctorProfile, createDoctorProfile, updateDoctorProfile } from '@/services/portal.service';
import { SPECIALTIES } from '@/lib/seed-data';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import { useState, useEffect } from 'react';

const S = css`
  h1 { font-family: ${theme.fonts.heading}; font-size: ${theme.fontSizes.xl}; font-weight: 700; margin-bottom: ${theme.spacing.lg};
    @media (min-width: 768px) { font-size: ${theme.fontSizes['2xl']}; margin-bottom: ${theme.spacing.xl}; } }

  .card { background: white; border: 1px solid ${theme.colors.border}; border-radius: ${theme.radii.xl};
    padding: ${theme.spacing.base}; margin-bottom: ${theme.spacing.base};
    @media (min-width: 768px) { padding: ${theme.spacing.xl}; margin-bottom: ${theme.spacing.lg}; }
    h2 { font-family: ${theme.fonts.heading}; font-size: ${theme.fontSizes.base}; font-weight: 700; margin: 0 0 ${theme.spacing.base};
      @media (min-width: 768px) { font-size: ${theme.fontSizes.lg}; margin-bottom: ${theme.spacing.lg}; } }
  }

  .form-row { display: grid; grid-template-columns: 1fr; gap: ${theme.spacing.md};
    @media (min-width: 480px) { grid-template-columns: 1fr 1fr; } }

  .form-group { margin-bottom: ${theme.spacing.base};
    label { display: block; font-size: ${theme.fontSizes.sm}; font-weight: 500; margin-bottom: 6px; }
    input, select, textarea { width: 100%; padding: 10px 14px; border: 1.5px solid ${theme.colors.border};
      border-radius: ${theme.radii.md}; font-size: 16px; outline: none; background: white;
      &:focus { border-color: ${theme.colors.primary}; } }
    textarea { resize: vertical; min-height: 70px; }
  }

  .chip-input { display: flex; flex-wrap: wrap; gap: 6px; margin-top: 6px;
    .chip { display: inline-flex; align-items: center; gap: 4px; padding: 4px 10px;
      border-radius: ${theme.radii.full}; font-size: 12px; font-weight: 500; cursor: pointer;
      .remove { font-size: 14px; &:hover { color: var(--color-error); } }
    }
  }

  .save-btn { padding: 12px 28px; background: ${theme.colors.primary}; color: white; border: none;
    border-radius: ${theme.radii.md}; font-weight: 600; margin-top: ${theme.spacing.base}; width: 100%;
    @media (min-width: 480px) { width: auto; }
    &:hover { background: ${theme.colors.primaryDark}; }
    &:disabled { opacity: 0.5; cursor: not-allowed; } }

  .status-badge { display: inline-flex; padding: 6px 14px; border-radius: ${theme.radii.full};
    font-size: 12px; font-weight: 600; margin-bottom: ${theme.spacing.base};
    &.pending { background: ${theme.colors.warningBg}; color: ${theme.colors.warning}; }
    &.approved { background: ${theme.colors.successBg}; color: ${theme.colors.success}; }
    &.suspended { background: ${theme.colors.errorBg}; color: ${theme.colors.error}; }
  }

  .toast { position: fixed; bottom: 20px; left: 50%; transform: translateX(-50%); padding: 12px 24px;
    background: ${theme.colors.success}; color: white; border-radius: ${theme.radii.md};
    font-weight: 600; font-size: ${theme.fontSizes.sm}; z-index: 1000; box-shadow: ${theme.shadows.lg}; }
`;

export default function DoctorProfilePage() {
  const { user } = useAuth();
  const userId = (user as any)?.uid;
  const qc = useQueryClient();
  const { data: profile, isLoading } = useQuery({ queryKey: ['my-doctor-profile', userId], queryFn: () => getMyDoctorProfile(userId), enabled: !!userId });

  const [name, setName] = useState('');
  const [specialties, setSpecialties] = useState<string[]>([]);
  const [experience, setExperience] = useState('');
  const [bio, setBio] = useState('');
  const [regNumber, setRegNumber] = useState('');
  const [languages, setLanguages] = useState<string[]>([]);
  const [langInput, setLangInput] = useState('');
  const [clinicName, setClinicName] = useState('');
  const [clinicAddress, setClinicAddress] = useState('');
  const [city, setCity] = useState('');
  const [state, setState] = useState('');
  const [pincode, setPincode] = useState('');
  const [fee, setFee] = useState('');
  const [duration, setDuration] = useState('30');
  const [modes, setModes] = useState<string[]>(['offline']);
  const [saving, setSaving] = useState(false);
  const [showToast, setShowToast] = useState(false);

  useEffect(() => {
    if (profile) {
      setName(profile.profile.name); setSpecialties(profile.profile.specialty);
      setExperience(String(profile.profile.experience)); setBio(profile.profile.bio);
      setRegNumber(profile.profile.registrationNumber); setLanguages(profile.profile.languages);
      setClinicName(profile.clinic.name); setClinicAddress(profile.clinic.address);
      setCity(profile.clinic.city); setState(profile.clinic.state); setPincode(profile.clinic.pincode);
      setFee(String(profile.consultation.fee)); setDuration(String(profile.consultation.duration));
      setModes(profile.consultation.modes);
    }
  }, [profile]);

  const handleSave = async () => {
    if (!userId) return; setSaving(true);
    const data = {
      profile: { name, specialty: specialties, experience: Number(experience), bio, registrationNumber: regNumber, languages, education: profile?.profile.education || [], photoURL: '' },
      clinic: { name: clinicName, address: clinicAddress, city, state, pincode, lat: 0, lng: 0, geohash: '' },
      consultation: { fee: Number(fee), currency: 'INR' as const, modes: modes as any, duration: Number(duration) },
    };
    try {
      if (profile) await updateDoctorProfile(userId, { profile: data.profile, clinic: data.clinic, consultation: data.consultation });
      else await createDoctorProfile(userId, data as any);
      qc.invalidateQueries({ queryKey: ['my-doctor-profile'] });
      setShowToast(true); setTimeout(() => setShowToast(false), 3000);
    } catch (err) { console.error(err); }
    setSaving(false);
  };

  const addLang = () => { if (langInput.trim() && !languages.includes(langInput.trim())) { setLanguages([...languages, langInput.trim()]); setLangInput(''); } };
  const toggleSpec = (s: string) => setSpecialties(p => p.includes(s) ? p.filter(x => x !== s) : [...p, s]);
  const toggleMode = (m: string) => setModes(p => p.includes(m) ? p.filter(x => x !== m) : [...p, m]);

  if (isLoading) return <div css={S}><h1>My Profile</h1><p>Loading...</p></div>;

  return (
    <div css={S}>
      <h1>My Profile</h1>
      {profile && <span className={`status-badge ${profile.status}`}>Status: {profile.status}</span>}
      {!profile && <p style={{ color: 'var(--color-info)', marginBottom: 'var(--space-lg)', fontSize: 'var(--text-sm)' }}>Create your doctor profile to start receiving appointments</p>}

      <div className="card">
        <h2>Personal Information</h2>
        <div className="form-row">
          <div className="form-group"><label>Full Name *</label><input value={name} onChange={e => setName(e.target.value)} placeholder="Dr. Full Name" /></div>
          <div className="form-group"><label>Registration Number *</label><input value={regNumber} onChange={e => setRegNumber(e.target.value)} placeholder="MH-XXXXX" /></div>
        </div>
        <div className="form-row">
          <div className="form-group"><label>Experience (years)</label><input type="number" value={experience} onChange={e => setExperience(e.target.value)} /></div>
          <div className="form-group"><label>Languages</label>
            <input value={langInput} onChange={e => setLangInput(e.target.value)} onKeyDown={e => e.key === 'Enter' && (e.preventDefault(), addLang())} placeholder="Type & Enter" />
            <div className="chip-input">{languages.map(l => <span key={l} className="chip" style={{ background: 'var(--color-primary-bg)', color: 'var(--color-primary)' }}>{l} <span className="remove" onClick={() => setLanguages(languages.filter(x => x !== l))}>×</span></span>)}</div>
          </div>
        </div>
        <div className="form-group"><label>Bio</label><textarea value={bio} onChange={e => setBio(e.target.value)} placeholder="About your experience..." /></div>
        <div className="form-group"><label>Specialties *</label>
          <div className="chip-input" style={{ marginTop: 0 }}>
            {SPECIALTIES.map(s => <span key={s} className="chip" onClick={() => toggleSpec(s)} style={{ background: specialties.includes(s) ? 'var(--color-primary)' : 'var(--color-bg-tertiary)', color: specialties.includes(s) ? 'white' : 'var(--color-text-secondary)' }}>{s}</span>)}
          </div>
        </div>
      </div>

      <div className="card">
        <h2>Clinic Details</h2>
        <div className="form-row">
          <div className="form-group"><label>Clinic Name</label><input value={clinicName} onChange={e => setClinicName(e.target.value)} /></div>
          <div className="form-group"><label>City</label><input value={city} onChange={e => setCity(e.target.value)} /></div>
        </div>
        <div className="form-group"><label>Address</label><input value={clinicAddress} onChange={e => setClinicAddress(e.target.value)} /></div>
        <div className="form-row">
          <div className="form-group"><label>State</label><input value={state} onChange={e => setState(e.target.value)} /></div>
          <div className="form-group"><label>Pincode</label><input value={pincode} onChange={e => setPincode(e.target.value)} /></div>
        </div>
      </div>

      <div className="card">
        <h2>Consultation</h2>
        <div className="form-row">
          <div className="form-group"><label>Fee (₹)</label><input type="number" value={fee} onChange={e => setFee(e.target.value)} /></div>
          <div className="form-group"><label>Duration</label><select value={duration} onChange={e => setDuration(e.target.value)}>
            <option value="15">15 min</option><option value="20">20 min</option><option value="30">30 min</option><option value="45">45 min</option><option value="60">60 min</option></select></div>
        </div>
        <div className="form-group"><label>Modes</label>
          <div style={{ display: 'flex', gap: 8 }}>
            {['offline', 'online'].map(m => <button key={m} onClick={() => toggleMode(m)} style={{ padding: '8px 16px', borderRadius: 'var(--radius-md)', border: `1.5px solid ${modes.includes(m) ? 'var(--color-primary)' : 'var(--color-border)'}`, background: modes.includes(m) ? 'var(--color-primary-bg)' : 'white', color: modes.includes(m) ? 'var(--color-primary)' : 'var(--color-text-secondary)', fontSize: 13, fontWeight: 500 }}>
              {m === 'online' ? '💻 Online' : '🏥 In-Clinic'}</button>)}
          </div>
        </div>
      </div>

      <button className="save-btn" onClick={handleSave} disabled={saving || !name}>{saving ? 'Saving...' : profile ? 'Update Profile' : 'Create Doctor Profile'}</button>
      {showToast && <div className="toast">✓ Profile saved</div>}
    </div>
  );
}
