import { useEffect, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { updateFormData } from '../../store/slices/applicationSlice';
import api from '../../services/api';

export default function ContactDetails() {
  const dispatch = useDispatch();
  const form = useSelector((s) => s.application.formData);
  const [districts, setDistricts] = useState([]);
  const [sameAddress, setSameAddress] = useState(false);

  useEffect(() => {
    api.get('/admin/districts').then((r) => setDistricts(r.data.data || [])).catch(() => {});
  }, []);

  const update = (k, v) => dispatch(updateFormData({ [k]: v }));

  const copyAddress = () => {
    if (sameAddress) {
      dispatch(updateFormData({
        perm_address: form.comm_address, perm_city: form.comm_city,
        perm_district_id: form.comm_district_id, perm_pincode: form.comm_pincode,
      }));
    }
  };

  return (
    <div className="space-y-6">
      <h3 className="font-semibold text-gray-800 text-base border-b pb-2">Contact Information</h3>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div>
          <label className="form-label">Email Address</label>
          <input className="form-input" type="email" value={form.email} onChange={(e) => update('email', e.target.value)} placeholder="your@email.com" />
        </div>
        <div>
          <label className="form-label">Alternate Mobile</label>
          <input className="form-input" type="tel" maxLength={10} value={form.alt_mobile} onChange={(e) => update('alt_mobile', e.target.value)} />
        </div>
      </div>

      <div>
        <h4 className="font-medium text-gray-700 mb-3">Communication Address</h4>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="md:col-span-2">
            <label className="form-label">Address *</label>
            <textarea className="form-input" rows={2} value={form.comm_address} onChange={(e) => update('comm_address', e.target.value)} required />
          </div>
          <div>
            <label className="form-label">City / Town *</label>
            <input className="form-input" value={form.comm_city} onChange={(e) => update('comm_city', e.target.value)} required />
          </div>
          <div>
            <label className="form-label">District *</label>
            <select className="form-select" value={form.comm_district_id} onChange={(e) => update('comm_district_id', e.target.value)} required>
              <option value="">Select District</option>
              {districts.map((d) => <option key={d.district_id} value={d.district_id}>{d.district_name}</option>)}
            </select>
          </div>
          <div>
            <label className="form-label">PIN Code</label>
            <input className="form-input" maxLength={6} value={form.comm_pincode} onChange={(e) => update('comm_pincode', e.target.value)} />
          </div>
        </div>
      </div>

      <div>
        <div className="flex items-center gap-2 mb-3">
          <h4 className="font-medium text-gray-700">Permanent Address</h4>
          <label className="flex items-center gap-1.5 text-sm text-gray-600 cursor-pointer ml-auto">
            <input type="checkbox" checked={sameAddress} onChange={(e) => { setSameAddress(e.target.checked); if (e.target.checked) copyAddress(); }} />
            Same as communication address
          </label>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="md:col-span-2">
            <label className="form-label">Address</label>
            <textarea className="form-input" rows={2} value={form.perm_address} onChange={(e) => update('perm_address', e.target.value)} />
          </div>
          <div>
            <label className="form-label">City / Town</label>
            <input className="form-input" value={form.perm_city} onChange={(e) => update('perm_city', e.target.value)} />
          </div>
          <div>
            <label className="form-label">District</label>
            <select className="form-select" value={form.perm_district_id} onChange={(e) => update('perm_district_id', e.target.value)}>
              <option value="">Select District</option>
              {districts.map((d) => <option key={d.district_id} value={d.district_id}>{d.district_name}</option>)}
            </select>
          </div>
          <div>
            <label className="form-label">PIN Code</label>
            <input className="form-input" maxLength={6} value={form.perm_pincode} onChange={(e) => update('perm_pincode', e.target.value)} />
          </div>
        </div>
      </div>
    </div>
  );
}
