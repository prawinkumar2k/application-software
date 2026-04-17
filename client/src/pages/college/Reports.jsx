import { useState } from 'react';
import { useDispatch } from 'react-redux';
import { addToast } from '../../store/slices/uiSlice';
import AppLayout from '../../components/layout/AppLayout';
import api from '../../services/api';
import { Download, FileText } from 'lucide-react';
import Spinner from '../../components/common/Spinner';

const REPORT_TYPES = [
  { value: 'all', label: 'All Applications' },
  { value: 'gender', label: 'Gender-wise' },
  { value: 'community', label: 'Community-wise' },
  { value: 'hostel', label: 'Hostel-required' },
  { value: 'date', label: 'Date-wise' },
];

export default function CollegeReports() {
  const dispatch = useDispatch();
  const [form, setForm] = useState({ type: 'all', start_date: '', end_date: '', gender: '', hostel: '' });
  const [loading, setLoading] = useState(false);

  const upd = (k, v) => setForm((p) => ({ ...p, [k]: v }));

  const download = async () => {
    setLoading(true);
    try {
      const params = Object.fromEntries(Object.entries(form).filter(([, v]) => v));
      const res = await api.get('/college/reports/pdf', { params, responseType: 'blob' });
      const url = window.URL.createObjectURL(new Blob([res.data]));
      const a = document.createElement('a');
      a.href = url;
      a.download = `report_${form.type}_${Date.now()}.pdf`;
      a.click();
      window.URL.revokeObjectURL(url);
    } catch {
      dispatch(addToast({ type: 'error', message: 'Failed to generate report' }));
    }
    setLoading(false);
  };

  return (
    <AppLayout>
      <div className="max-w-2xl mx-auto space-y-6">
        <h1 className="text-xl font-bold text-gray-900">Generate Reports</h1>

        <div className="card space-y-4">
          <div>
            <label className="form-label">Report Type *</label>
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
              {REPORT_TYPES.map(({ value, label }) => (
                <label key={value} className={`flex items-center gap-2 p-3 border rounded-lg cursor-pointer transition-colors ${form.type === value ? 'border-primary bg-primary/5' : 'border-gray-200 hover:bg-gray-50'}`}>
                  <input type="radio" name="type" value={value} checked={form.type === value} onChange={(e) => upd('type', e.target.value)} className="text-primary" />
                  <span className="text-sm font-medium">{label}</span>
                </label>
              ))}
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="form-label">Start Date</label>
              <input className="form-input" type="date" value={form.start_date} onChange={(e) => upd('start_date', e.target.value)} />
            </div>
            <div>
              <label className="form-label">End Date</label>
              <input className="form-input" type="date" value={form.end_date} onChange={(e) => upd('end_date', e.target.value)} />
            </div>
          </div>

          {form.type === 'gender' && (
            <div>
              <label className="form-label">Gender Filter</label>
              <select className="form-select" value={form.gender} onChange={(e) => upd('gender', e.target.value)}>
                <option value="">All Genders</option>
                {['MALE','FEMALE','OTHER'].map((g) => <option key={g} value={g}>{g}</option>)}
              </select>
            </div>
          )}

          <button onClick={download} disabled={loading} className="btn-primary w-full flex items-center justify-center gap-2">
            {loading ? <Spinner size="sm" /> : <Download size={16} />}
            Download PDF Report
          </button>
        </div>

        <div className="card bg-blue-50 border-blue-200">
          <div className="flex items-start gap-3">
            <FileText size={20} className="text-blue-600 mt-0.5 flex-shrink-0" />
            <div className="text-sm text-blue-800">
              <p className="font-medium mb-1">Report includes:</p>
              <ul className="list-disc pl-4 space-y-0.5 text-xs">
                <li>Applicant name, gender, community, district</li>
                <li>Admission type and hostel requirement</li>
                <li>Application status and submission date</li>
                <li>Total count summary</li>
              </ul>
            </div>
          </div>
        </div>
      </div>
    </AppLayout>
  );
}
