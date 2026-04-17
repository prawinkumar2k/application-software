import { useDispatch, useSelector } from 'react-redux';
import { updateFormData } from '../../store/slices/applicationSlice';

const BOARDS = ['Tamil Nadu State Board', 'CBSE', 'ICSE', 'Matriculation', 'Anglo-Indian', 'ITI', 'Others'];

export default function AcademicHistory() {
  const dispatch = useDispatch();
  const form = useSelector((s) => s.application.formData);
  const update = (k, v) => dispatch(updateFormData({ [k]: v }));

  return (
    <div className="space-y-4">
      <h3 className="font-semibold text-gray-800 text-base border-b pb-2">Academic Details</h3>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div>
          <label className="form-label">Qualifying Examination Board *</label>
          <select className="form-select" value={form.board} onChange={(e) => update('board', e.target.value)} required>
            <option value="">Select Board</option>
            {BOARDS.map((b) => <option key={b} value={b}>{b}</option>)}
          </select>
        </div>
        <div>
          <label className="form-label">Register Number *</label>
          <input className="form-input" value={form.register_no} onChange={(e) => update('register_no', e.target.value)} placeholder="Exam register number" required />
        </div>
        <div className="md:col-span-2">
          <label className="form-label">Name of Last School / Institute *</label>
          <input className="form-input" value={form.last_school} onChange={(e) => update('last_school', e.target.value)} placeholder="Full name of your school / ITI" required />
        </div>
      </div>

      <div className="bg-blue-50 border border-blue-200 rounded p-3 text-sm text-blue-700">
        <strong>Note:</strong> Qualifying examination is based on your admission type:
        <ul className="list-disc pl-4 mt-1 space-y-0.5">
          <li>First Year: 10th Pass / 12th Pass / ITI</li>
          <li>Lateral Entry: 12th Pass / ITI (Direct 2nd year)</li>
          <li>Part-Time: 10th Pass / 12th Pass / ITI</li>
        </ul>
      </div>
    </div>
  );
}
