import { useDispatch, useSelector } from 'react-redux';
import { updateFormData } from '../../store/slices/applicationSlice';

export default function ParentDetails() {
  const dispatch = useDispatch();
  const form = useSelector((s) => s.application.formData);
  const update = (k, v) => dispatch(updateFormData({ [k]: v }));

  return (
    <div className="space-y-4">
      <h3 className="font-semibold text-gray-800 text-base border-b pb-2">Parent / Guardian Details</h3>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div>
          <label className="form-label">Father's Name *</label>
          <input className="form-input" value={form.father_name} onChange={(e) => update('father_name', e.target.value)} required />
        </div>
        <div>
          <label className="form-label">Mother's Name *</label>
          <input className="form-input" value={form.mother_name} onChange={(e) => update('mother_name', e.target.value)} required />
        </div>
        <div>
          <label className="form-label">Parent Occupation</label>
          <input className="form-input" value={form.parent_occupation} onChange={(e) => update('parent_occupation', e.target.value)} placeholder="e.g. Farmer, Business, Government Employee" />
        </div>
        <div>
          <label className="form-label">Annual Income (₹)</label>
          <input className="form-input" type="number" min={0} value={form.annual_income} onChange={(e) => update('annual_income', e.target.value)} placeholder="0" />
        </div>
      </div>
    </div>
  );
}
