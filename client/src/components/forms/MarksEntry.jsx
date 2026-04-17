import { useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { updateFormData } from '../../store/slices/applicationSlice';
import { Plus, Trash2 } from 'lucide-react';

const BOARD_SUBJECTS = {
  'Tamil Nadu State Board': ['Tamil', 'English', 'Mathematics', 'Science', 'Social Science'],
  'CBSE': ['Hindi', 'English', 'Mathematics', 'Science', 'Social Studies'],
  'ICSE': ['English', 'Hindi', 'Mathematics', 'Physics', 'Chemistry', 'Biology'],
  'Matriculation': ['Tamil', 'English', 'Mathematics', 'Science', 'Social Science'],
  'Anglo-Indian': ['English', 'Mathematics', 'Science', 'History', 'Geography'],
  'ITI': ['Theory', 'Practical', 'Workshop', 'Communication Skills'],
  'Others': [],
};

export default function MarksEntry() {
  const dispatch = useDispatch();
  const form = useSelector((s) => s.application.formData);
  const marks = form.marks || [];

  // Initialize default marks based on selected board
  useEffect(() => {
    const board = form.board;
    const subjects = BOARD_SUBJECTS[board] || [];
    
    if (marks.length === 0 && subjects.length > 0) {
      dispatch(updateFormData({
        marks: subjects.map((s) => ({ subject_name: s, marks_obtained: '', max_marks: 100, exam_year: '' })),
      }));
    }
  }, [form.board]);

  const updateMark = (i, key, val) => {
    const updated = marks.map((m, idx) => idx === i ? { ...m, [key]: val } : m);
    dispatch(updateFormData({ marks: updated }));
  };

  const addSubject = () => {
    dispatch(updateFormData({ marks: [...marks, { subject_name: '', marks_obtained: '', max_marks: 100, exam_year: '' }] }));
  };

  const removeSubject = (i) => {
    dispatch(updateFormData({ marks: marks.filter((_, idx) => idx !== i) }));
  };

  const total = marks.reduce((s, m) => s + parseFloat(m.marks_obtained || 0), 0);
  const maxTotal = marks.reduce((s, m) => s + parseFloat(m.max_marks || 100), 0);
  const pct = maxTotal > 0 ? ((total / maxTotal) * 100).toFixed(2) : '0.00';

  return (
    <div className="space-y-4">
      <h3 className="font-semibold text-gray-800 text-base border-b pb-2">Marks (Qualifying Examination)</h3>

      {!form.board ? (
        <div className="bg-amber-50 border border-amber-200 rounded p-4 text-sm text-amber-800">
          <strong>⚠️ Please select a board first</strong>
          <p className="mt-1">Go to the "Academic Details" section above and select your Qualifying Examination Board to see the required subjects.</p>
        </div>
      ) : (
        <>
          <div className="bg-blue-50 border border-blue-200 rounded p-3 text-sm text-blue-700">
            <strong>Board Selected:</strong> {form.board}
            <p className="mt-1">Enter marks for the subjects below as per your {form.board} examination.</p>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="bg-gray-50 border-b">
                  <th className="text-left p-2 font-medium text-gray-700">Subject</th>
                  <th className="text-left p-2 font-medium text-gray-700 w-28">Marks Obtained</th>
                  <th className="text-left p-2 font-medium text-gray-700 w-28">Max Marks</th>
                  <th className="text-left p-2 font-medium text-gray-700 w-24">Exam Year</th>
                  <th className="w-10"></th>
                </tr>
              </thead>
              <tbody>
                {marks.map((m, i) => (
                  <tr key={i} className="border-b hover:bg-gray-50">
                    <td className="p-2">
                      <input className="form-input text-sm" value={m.subject_name}
                        onChange={(e) => updateMark(i, 'subject_name', e.target.value)} placeholder="Subject name" required />
                    </td>
                    <td className="p-2">
                      <input className="form-input text-sm" type="number" min={0} max={m.max_marks}
                        value={m.marks_obtained} onChange={(e) => updateMark(i, 'marks_obtained', e.target.value)} />
                    </td>
                    <td className="p-2">
                      <input className="form-input text-sm" type="number" min={1}
                        value={m.max_marks} onChange={(e) => updateMark(i, 'max_marks', e.target.value)} />
                    </td>
                    <td className="p-2">
                      <input className="form-input text-sm" value={m.exam_year}
                        onChange={(e) => updateMark(i, 'exam_year', e.target.value)} placeholder="2024" maxLength={4} />
                    </td>
                    <td className="p-2">
                      <button type="button" onClick={() => removeSubject(i)} className="text-red-500 hover:text-red-700 p-1">
                        <Trash2 size={15} />
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
              <tfoot>
                <tr className="bg-primary/5 font-semibold">
                  <td className="p-2 text-gray-700">Total</td>
                  <td className="p-2 text-primary">{total}</td>
                  <td className="p-2 text-gray-700">{maxTotal}</td>
                  <td className="p-2 text-primary" colSpan={2}>{pct}%</td>
                </tr>
              </tfoot>
            </table>
          </div>

          {form.board === 'Others' && (
            <div className="bg-blue-50 border border-blue-200 rounded p-3 text-sm text-blue-700">
              <strong>Custom Board:</strong> You can add custom subjects using the "Add Subject" button below.
            </div>
          )}

          <button type="button" onClick={addSubject} className="btn-secondary text-sm flex items-center gap-2">
            <Plus size={15} /> Add Subject
          </button>
        </>
      )}
    </div>
  );
}
