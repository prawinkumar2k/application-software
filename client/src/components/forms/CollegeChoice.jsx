import { useEffect, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { updateFormData } from '../../store/slices/applicationSlice';
import { fetchAvailableColleges } from '../../store/slices/collegeSlice';
import { Plus, Trash2, GripVertical, Search } from 'lucide-react';

export default function CollegeChoice() {
  const dispatch = useDispatch();
  const form = useSelector((s) => s.application.formData);
  const { available, loading } = useSelector((s) => s.colleges);
  const [search, setSearch] = useState('');
  const [dragging, setDragging] = useState(null);

  useEffect(() => {
    if (form.gender) {
      dispatch(fetchAvailableColleges({ gender: form.gender, hostel: form.hostel_required ? 'true' : 'false' }));
    }
  }, [form.gender, form.hostel_required, dispatch]);

  const prefs = form.college_preferences || [];

  const addCollege = (college) => {
    if (prefs.find((p) => p.college_id === college.college_id)) return;
    const newPrefs = [...prefs, { college_id: college.college_id, course_id: null, preference_order: prefs.length + 1, college }];
    dispatch(updateFormData({ college_preferences: newPrefs }));
  };

  const removeCollege = (idx) => {
    const updated = prefs.filter((_, i) => i !== idx).map((p, i) => ({ ...p, preference_order: i + 1 }));
    dispatch(updateFormData({ college_preferences: updated }));
  };

  const setCourse = (idx, courseId) => {
    const updated = prefs.map((p, i) => i === idx ? { ...p, course_id: courseId ? parseInt(courseId) : null } : p);
    dispatch(updateFormData({ college_preferences: updated }));
  };

  const moveUp = (idx) => {
    if (idx === 0) return;
    const updated = [...prefs];
    [updated[idx - 1], updated[idx]] = [updated[idx], updated[idx - 1]];
    dispatch(updateFormData({ college_preferences: updated.map((p, i) => ({ ...p, preference_order: i + 1 })) }));
  };

  const moveDown = (idx) => {
    if (idx === prefs.length - 1) return;
    const updated = [...prefs];
    [updated[idx], updated[idx + 1]] = [updated[idx + 1], updated[idx]];
    dispatch(updateFormData({ college_preferences: updated.map((p, i) => ({ ...p, preference_order: i + 1 })) }));
  };

  const filtered = available.filter((c) =>
    c.college_name?.toLowerCase().includes(search.toLowerCase()) ||
    c.college_code?.toLowerCase().includes(search.toLowerCase()) ||
    c.district?.district_name?.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div className="space-y-5">
      <h3 className="font-semibold text-gray-800 text-base border-b pb-2">College Preferences</h3>

      {/* Hostel toggle */}
      <label className="flex items-center gap-3 p-4 bg-blue-50 border border-blue-200 rounded-lg cursor-pointer">
        <input type="checkbox" className="h-5 w-5 text-primary rounded" checked={!!form.hostel_required}
          onChange={(e) => dispatch(updateFormData({ hostel_required: e.target.checked ? 1 : 0, college_preferences: [] }))} />
        <div>
          <p className="font-medium text-blue-800">I require Hostel accommodation</p>
          <p className="text-xs text-blue-600">Enabling this will show only hostel-available colleges</p>
        </div>
      </label>

      {!form.gender && (
        <p className="text-amber-700 bg-amber-50 border border-amber-200 rounded p-3 text-sm">
          Please fill in your gender in Step 1 to see available colleges.
        </p>
      )}

      {/* Selected preferences */}
      {prefs.length > 0 && (
        <div>
          <h4 className="font-medium text-gray-700 text-sm mb-2">Your Preferences (in order of priority)</h4>
          <div className="space-y-2">
            {prefs.map((pref, idx) => {
              const college = pref.college || available.find((c) => c.college_id === pref.college_id);
              return (
                <div key={pref.college_id} className="flex items-center gap-2 p-3 bg-white border border-primary/30 rounded-lg">
                  <span className="w-7 h-7 flex-shrink-0 bg-primary text-white rounded-full flex items-center justify-center text-xs font-bold">{idx + 1}</span>
                  <div className="flex-1 min-w-0">
                    <p className="font-medium text-sm text-gray-800 truncate">{college?.college_name}</p>
                    <p className="text-xs text-gray-500">{college?.district?.district_name} • {college?.gender_type} {college?.hostel_available ? '• Hostel' : ''}</p>
                  </div>
                  {college?.courses && college.courses.length > 0 && (
                    <select className="form-select text-xs w-40" value={pref.course_id || ''} onChange={(e) => setCourse(idx, e.target.value)}>
                      <option value="">Any course</option>
                      {college.courses.map((c) => <option key={c.course_id} value={c.course_id}>{c.course_name}</option>)}
                    </select>
                  )}
                  <div className="flex gap-1">
                    <button type="button" onClick={() => moveUp(idx)} className="p-1 text-gray-400 hover:text-gray-700 disabled:opacity-30" disabled={idx === 0}>↑</button>
                    <button type="button" onClick={() => moveDown(idx)} className="p-1 text-gray-400 hover:text-gray-700 disabled:opacity-30" disabled={idx === prefs.length - 1}>↓</button>
                    <button type="button" onClick={() => removeCollege(idx)} className="p-1 text-red-400 hover:text-red-600"><Trash2 size={14} /></button>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* College search & list */}
      <div>
        <h4 className="font-medium text-gray-700 text-sm mb-2">Available Colleges {loading && <span className="text-xs text-gray-400">(loading...)</span>}</h4>
        <div className="relative mb-3">
          <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
          <input className="form-input pl-9" placeholder="Search colleges by name, code, or district..." value={search}
            onChange={(e) => setSearch(e.target.value)} />
        </div>
        <div className="max-h-72 overflow-y-auto border border-gray-200 rounded-lg divide-y">
          {filtered.length === 0 ? (
            <p className="p-4 text-center text-gray-500 text-sm">{loading ? 'Loading colleges...' : 'No colleges found'}</p>
          ) : filtered.map((college) => {
            const added = prefs.some((p) => p.college_id === college.college_id);
            return (
              <div key={college.college_id} className={`flex items-center gap-3 p-3 hover:bg-gray-50 ${added ? 'opacity-50' : ''}`}>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium text-gray-800 truncate">{college.college_name}</p>
                  <p className="text-xs text-gray-500">{college.college_code} • {college.district?.district_name} • {college.gender_type}
                    {college.hostel_available ? ' • Hostel ✓' : ''}
                  </p>
                </div>
                <button type="button" disabled={added} onClick={() => addCollege(college)}
                  className={`flex items-center gap-1 text-xs px-3 py-1.5 rounded ${added ? 'bg-gray-100 text-gray-400 cursor-not-allowed' : 'bg-primary text-white hover:bg-primary-light'}`}>
                  <Plus size={12} /> {added ? 'Added' : 'Add'}
                </button>
              </div>
            );
          })}
        </div>
        <p className="text-xs text-gray-500 mt-2">Showing {filtered.length} colleges filtered for your gender{form.hostel_required ? ' and hostel preference' : ''}</p>
      </div>
    </div>
  );
}
