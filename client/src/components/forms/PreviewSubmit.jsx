import { useSelector } from 'react-redux';

export default function PreviewSubmit({ onDeclarationChange, declarationChecked }) {
  const form = useSelector((s) => s.application.formData);
  const prefs = form.college_preferences || [];
  const marks = form.marks || [];
  const total = marks.reduce((s, m) => s + parseFloat(m.marks_obtained || 0), 0);
  const maxTotal = marks.reduce((s, m) => s + parseFloat(m.max_marks || 100), 0);
  const pct = maxTotal > 0 ? ((total / maxTotal) * 100).toFixed(2) : '0.00';

  const Row = ({ label, value }) => (
    <tr className="border-b last:border-0">
      <td className="py-2 pr-4 text-sm font-medium text-gray-600 w-1/3">{label}</td>
      <td className="py-2 text-sm text-gray-800">{value || <span className="text-gray-400 italic">Not provided</span>}</td>
    </tr>
  );

  return (
    <div className="space-y-5">
      <h3 className="font-semibold text-gray-800 text-base border-b pb-2">Preview & Submit</h3>

      <div className="bg-amber-50 border border-amber-200 rounded p-3 text-sm text-amber-800">
        Please review all details carefully. Once submitted, the application cannot be edited.
      </div>

      {[
        {
          title: 'Personal Details',
          rows: [
            ['Name', form.name], ['Date of Birth', form.dob], ['Gender', form.gender],
            ['Aadhaar', form.aadhaar], ['Religion', form.religion], ['Admission Type', form.admission_type],
          ],
        },
        {
          title: 'Contact Details',
          rows: [
            ['Mobile', '(from profile)'], ['Email', form.email], ['Alternate Mobile', form.alt_mobile],
            ['Communication Address', [form.comm_address, form.comm_city, form.comm_pincode].filter(Boolean).join(', ')],
          ],
        },
        {
          title: 'Parent / Guardian',
          rows: [
            ["Father's Name", form.father_name], ["Mother's Name", form.mother_name],
            ['Occupation', form.parent_occupation], ['Annual Income', form.annual_income ? `₹${form.annual_income}` : ''],
          ],
        },
        {
          title: 'Academic',
          rows: [
            ['Board', form.board], ['Register No.', form.register_no], ['Last School', form.last_school],
          ],
        },
      ].map(({ title, rows }) => (
        <div key={title} className="card !p-4">
          <h4 className="font-medium text-primary mb-3 text-sm">{title}</h4>
          <table className="w-full"><tbody>{rows.map(([l, v]) => <Row key={l} label={l} value={v} />)}</tbody></table>
        </div>
      ))}

      {/* Marks */}
      <div className="card !p-4">
        <h4 className="font-medium text-primary mb-3 text-sm">Marks</h4>
        <table className="w-full text-sm">
          <thead><tr className="bg-gray-50"><th className="text-left py-1 font-medium text-gray-600">Subject</th><th className="text-left py-1 font-medium text-gray-600">Obtained</th><th className="text-left py-1 font-medium text-gray-600">Max</th></tr></thead>
          <tbody>
            {marks.map((m, i) => <tr key={i} className="border-b"><td className="py-1">{m.subject_name}</td><td className="py-1">{m.marks_obtained}</td><td className="py-1">{m.max_marks}</td></tr>)}
            <tr className="font-semibold bg-gray-50"><td>Total</td><td>{total}</td><td>{maxTotal} ({pct}%)</td></tr>
          </tbody>
        </table>
      </div>

      {/* College preferences */}
      <div className="card !p-4">
        <h4 className="font-medium text-primary mb-3 text-sm">College Preferences ({prefs.length})</h4>
        {prefs.length === 0 ? <p className="text-sm text-red-600">No colleges selected. Please go back and add at least one college.</p> : (
          <ol className="space-y-1 text-sm">
            {[...prefs].sort((a, b) => a.preference_order - b.preference_order).map((p, i) => (
              <li key={i} className="flex items-center gap-2">
                <span className="font-bold text-primary w-6">{i + 1}.</span>
                <span>{p.college?.college_name || `College ID: ${p.college_id}`}</span>
              </li>
            ))}
          </ol>
        )}
      </div>

      {/* Special category */}
      <div className="card !p-4">
        <h4 className="font-medium text-primary mb-3 text-sm">Special Category</h4>
        <div className="grid grid-cols-2 gap-2 text-sm">
          {[['Differently Abled', form.is_differently_abled], ["Ex-Servicemen's Ward", form.is_ex_servicemen], ['Sports Person', form.is_sports_person], ['Govt. School', form.is_govt_school], ['Hostel Required', form.hostel_required]].map(([l, v]) => (
            <div key={l} className="flex items-center gap-2">
              <span className={`w-4 h-4 rounded border flex items-center justify-center text-xs ${v ? 'bg-green-500 border-green-500 text-white' : 'border-gray-300'}`}>{v ? '✓' : ''}</span>
              <span className="text-gray-700">{l}</span>
            </div>
          ))}
        </div>
      </div>

      {/* Declaration */}
      <label className="flex items-start gap-3 p-4 border-2 border-primary/30 rounded-lg cursor-pointer bg-primary/5">
        <input type="checkbox" className="mt-1 h-4 w-4 text-primary" checked={declarationChecked}
          onChange={(e) => onDeclarationChange(e.target.checked)} />
        <p className="text-sm text-gray-700">
          I hereby declare that all the information furnished in this application is true, complete, and correct to the best of my knowledge and belief.
          I understand that any false information will lead to cancellation of my application.
        </p>
      </label>
    </div>
  );
}
