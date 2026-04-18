import { useEffect, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { updateFormData } from '../../store/slices/applicationSlice';
import api from '../../services/api';

export default function PersonalDetails() {
  const dispatch = useDispatch();
  const form = useSelector((s) => s.application.formData);
  const [communities, setCommunities] = useState([]);
  const [castes, setCastes] = useState([]);

  useEffect(() => {
    api.get('/communities').then((r) => setCommunities(r.data.data || [])).catch((err) => {
      console.error('Failed to fetch communities:', err);
    });
  }, []);

  useEffect(() => {
    if (form.community_id) {
      const comm = communities.find((c) => c.community_id == form.community_id);
      setCastes(comm?.castes || []);
    }
  }, [form.community_id, communities]);

  const update = (k, v) => dispatch(updateFormData({ [k]: v }));

  return (
    <div className="space-y-4">
      <h3 className="font-semibold text-gray-800 text-base border-b pb-2">Personal Details</h3>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div className="md:col-span-2">
          <label className="form-label">Full Name *</label>
          <input className="form-input" value={form.name} onChange={(e) => update('name', e.target.value)} placeholder="As per school records" required />
        </div>
        <div>
          <label className="form-label">Date of Birth *</label>
          <input className="form-input" type="date" value={form.dob} onChange={(e) => update('dob', e.target.value)} required />
        </div>
        <div>
          <label className="form-label">Gender *</label>
          <select className="form-select" value={form.gender} onChange={(e) => update('gender', e.target.value)} required>
            <option value="">Select Gender</option>
            <option value="MALE">Male</option>
            <option value="FEMALE">Female</option>
            <option value="OTHER">Other</option>
          </select>
        </div>
        <div>
          <label className="form-label">Aadhaar Number *</label>
          <input
            className={`form-input ${form.aadhaar && !/^\d{12}$/.test(form.aadhaar) ? 'border-red-400' : ''}`}
            maxLength={12}
            inputMode="numeric"
            pattern="\d{12}"
            value={form.aadhaar}
            onChange={(e) => update('aadhaar', e.target.value.replace(/\D/g, ''))}
            placeholder="12-digit Aadhaar number"
          />
          {form.aadhaar && !/^\d{12}$/.test(form.aadhaar) && (
            <p className="text-xs text-red-500 mt-1">Must be exactly 12 digits</p>
          )}
        </div>
        <div>
          <label className="form-label">Religion</label>
          <select className="form-select" value={form.religion} onChange={(e) => update('religion', e.target.value)}>
            <option value="">Select Religion</option>
            {['Hindu','Christian','Muslim','Others'].map((r) => <option key={r} value={r}>{r}</option>)}
          </select>
        </div>
        <div>
          <label className="form-label">Community *</label>
          <select className="form-select" value={form.community_id} onChange={(e) => update('community_id', e.target.value)} required>
            <option value="">Select Community</option>
            {communities.map((c) => <option key={c.community_id} value={c.community_id}>{c.community_name} ({c.community_code})</option>)}
          </select>
        </div>
        <div>
          <label className="form-label">Caste</label>
          <select className="form-select" value={form.caste_id} onChange={(e) => update('caste_id', e.target.value)}>
            <option value="">Select Caste</option>
            {castes.map((c) => <option key={c.caste_id} value={c.caste_id}>{c.caste_name}</option>)}
          </select>
        </div>
        <div>
          <label className="form-label">Admission Type *</label>
          <select className="form-select" value={form.admission_type} onChange={(e) => update('admission_type', e.target.value)} required>
            <option value="FIRST_YEAR">First Year</option>
            <option value="LATERAL">Lateral Entry (2nd Year)</option>
            <option value="PART_TIME">Part-Time</option>
          </select>
        </div>
      </div>
    </div>
  );
}
