import { useEffect, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { updateFormData } from '../../store/slices/applicationSlice';
import { Plus, Trash2, ChevronDown } from 'lucide-react';

// Education sections configuration
const EDUCATION_SECTIONS = [
  { id: 'sslc', label: 'SSLC (10th Standard)', value: 'sslc' },
  { id: 'hsc', label: 'HSC (12th Standard)', value: 'hsc' },
  { id: 'iti', label: 'ITI', value: 'iti' },
  { id: 'vocational', label: 'Vocational', value: 'vocational' },
];

// SSLC Subjects
const SSLC_SUBJECTS_INITIAL = [
  { subject: 'Tamil', max: 100, marks: '' },
  { subject: 'English', max: 100, marks: '' },
  { subject: 'Mathematics', max: 100, marks: '' },
  { subject: 'Science', max: 100, marks: '' },
  { subject: 'Social Science', max: 100, marks: '' },
];

// ITI Subjects
const ITI_SUBJECTS_INITIAL = [
  { subject: 'Trade Practical', max: 400, marks: '' },
  { subject: 'Trade Theory', max: 120, marks: '' },
  { subject: 'Workshop', max: 60, marks: '' },
  { subject: 'Drawing', max: 70, marks: '' },
  { subject: 'Social', max: 50, marks: '' },
];

// Vocational Subjects
const VOCATIONAL_SUBJECTS_INITIAL = [
  { subject: 'Language', max: 200, marks: '' },
  { subject: 'English', max: 200, marks: '' },
  { subject: 'Maths', max: 200, marks: '' },
  { subject: 'Theory', max: 200, marks: '' },
  { subject: 'Practical-I', max: 200, marks: '' },
  { subject: 'Practical-II', max: 200, marks: '' },
];

// HSC Subjects by Major
const HSC_MAJORS = [
  { value: '', label: 'Select Major/Stream' },
  { value: 'biology', label: 'Biology (Bio/2 + Phy/4 + Chem/4)' },
  { value: 'mathematics', label: 'Mathematics (Maths/2 + Phy/4 + Chem/4)' },
  { value: 'commerce', label: 'Commerce' },
  { value: 'humanities', label: 'Humanities' },
  { value: 'general', label: 'General' },
];

const HSC_SUBJECTS_BY_MAJOR = {
  biology: [
    { subject: 'Tamil', max: 100, marks: '' },
    { subject: 'English', max: 100, marks: '' },
    { subject: 'Physics', max: 100, marks: '' },
    { subject: 'Chemistry', max: 100, marks: '' },
    { subject: 'Biology', max: 100, marks: '' },
    { subject: 'Mathematics', max: 100, marks: '' },
  ],
  mathematics: [
    { subject: 'Tamil', max: 100, marks: '' },
    { subject: 'English', max: 100, marks: '' },
    { subject: 'Physics', max: 100, marks: '' },
    { subject: 'Chemistry', max: 100, marks: '' },
    { subject: 'Mathematics', max: 100, marks: '' },
    { subject: 'Computer Science', max: 100, marks: '' },
  ],
  commerce: [
    { subject: 'Tamil', max: 100, marks: '' },
    { subject: 'English', max: 100, marks: '' },
    { subject: 'Accountancy', max: 100, marks: '' },
    { subject: 'Economics', max: 100, marks: '' },
    { subject: 'Business Studies', max: 100, marks: '' },
    { subject: 'Mathematics', max: 100, marks: '' },
  ],
  humanities: [
    { subject: 'Tamil', max: 100, marks: '' },
    { subject: 'English', max: 100, marks: '' },
    { subject: 'History', max: 100, marks: '' },
    { subject: 'Geography', max: 100, marks: '' },
    { subject: 'Economics', max: 100, marks: '' },
    { subject: 'Political Science', max: 100, marks: '' },
  ],
  general: [
    { subject: 'Tamil', max: 100, marks: '' },
    { subject: 'English', max: 100, marks: '' },
    { subject: 'Physics', max: 100, marks: '' },
    { subject: 'Chemistry', max: 100, marks: '' },
    { subject: 'Biology', max: 100, marks: '' },
    { subject: 'Mathematics', max: 100, marks: '' },
  ],
};

// Cutoff calculation helper
const calculateCutoff = (major, subjects) => {
  if (!subjects || subjects.length === 0) return null;
  
  const getMarksBySubject = (subjectName) => {
    const subject = subjects.find(s => s.subject === subjectName);
    return subject ? parseFloat(subject.marks) || 0 : 0;
  };

  if (major === 'biology') {
    const biology = getMarksBySubject('Biology');
    const physics = getMarksBySubject('Physics');
    const chemistry = getMarksBySubject('Chemistry');
    return (biology / 2 + physics / 4 + chemistry / 4).toFixed(2);
  } else if (major === 'mathematics') {
    const math = getMarksBySubject('Mathematics');
    const physics = getMarksBySubject('Physics');
    const chemistry = getMarksBySubject('Chemistry');
    return (math / 2 + physics / 4 + chemistry / 4).toFixed(2);
  }
  return null;
};

// Marks Table Component
function MarksTable({ subjects, onMarkChange, title = 'Marks' }) {
  const total = subjects.reduce((s, m) => s + parseFloat(m.marks || 0), 0);
  const maxTotal = subjects.reduce((s, m) => s + (m.max || 0), 0);
  const pct = maxTotal > 0 ? ((total / maxTotal) * 100).toFixed(2) : '0.00';

  return (
    <div className="space-y-2">
      <h4 className="font-medium text-gray-700 text-sm">{title}</h4>
      <div className="overflow-x-auto border border-gray-200 rounded">
        <table className="w-full text-sm">
          <thead>
            <tr className="bg-gray-50 border-b">
              <th className="text-left p-2 font-medium text-gray-700">Subject</th>
              <th className="text-left p-2 font-medium text-gray-700">Max Marks</th>
              <th className="text-left p-2 font-medium text-gray-700">Marks Obtained</th>
            </tr>
          </thead>
          <tbody>
            {subjects.map((s, i) => (
              <tr key={i} className="border-b hover:bg-gray-50">
                <td className="p-2">{s.subject}</td>
                <td className="p-2">{s.max}</td>
                <td className="p-2">
                  <input
                    type="number"
                    min={0}
                    max={s.max}
                    value={s.marks}
                    onChange={(e) => onMarkChange(i, e.target.value)}
                    className="form-input text-sm w-24"
                    placeholder="0"
                  />
                </td>
              </tr>
            ))}
          </tbody>
          <tfoot>
            <tr className="bg-primary/5 font-semibold">
              <td className="p-2 text-gray-700">TOTAL</td>
              <td className="p-2">{maxTotal}</td>
              <td className="p-2 text-primary">{total.toFixed(2)}</td>
            </tr>
            <tr className="bg-primary/5 font-semibold">
              <td className="p-2 text-gray-700">Percentage</td>
              <td className="p-2"></td>
              <td className="p-2 text-primary">{pct}%</td>
            </tr>
          </tfoot>
        </table>
      </div>
    </div>
  );
}

// SSLC Section Component
function SSLCSection({ data, onChange }) {
  return (
    <div className="card !p-5 space-y-4">
      <h3 className="font-semibold text-gray-800">SSLC (10th Standard)</h3>
      
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div>
          <label className="form-label">School Name *</label>
          <input
            type="text"
            className="form-input"
            value={data.school_name || ''}
            onChange={(e) => onChange('sslc', { ...data, school_name: e.target.value })}
            placeholder="Enter school name"
          />
        </div>
        <div>
          <label className="form-label">Board *</label>
          <select
            className="form-select"
            value={data.board || ''}
            onChange={(e) => onChange('sslc', { ...data, board: e.target.value })}
          >
            <option value="">Select Board</option>
            <option value="Tamil Nadu State Board">Tamil Nadu State Board</option>
            <option value="CBSE">CBSE</option>
            <option value="ICSE">ICSE</option>
          </select>
        </div>
        <div>
          <label className="form-label">Year of Passing *</label>
          <input
            type="number"
            className="form-input"
            value={data.year || ''}
            onChange={(e) => onChange('sslc', { ...data, year: e.target.value })}
            placeholder="YYYY"
            min="2000"
            max={new Date().getFullYear()}
          />
        </div>
        <div>
          <label className="form-label">Register Number</label>
          <input
            type="text"
            className="form-input"
            value={data.register_no || ''}
            onChange={(e) => onChange('sslc', { ...data, register_no: e.target.value })}
            placeholder="Register number"
          />
        </div>
        <div>
          <label className="form-label">Marksheet Number</label>
          <input
            type="text"
            className="form-input"
            value={data.marksheet_no || ''}
            onChange={(e) => onChange('sslc', { ...data, marksheet_no: e.target.value })}
            placeholder="Marksheet number"
          />
        </div>
      </div>

      <MarksTable
        subjects={data.subjects || SSLC_SUBJECTS_INITIAL}
        onMarkChange={(idx, val) => {
          const updated = [...(data.subjects || SSLC_SUBJECTS_INITIAL)];
          updated[idx] = { ...updated[idx], marks: val };
          onChange('sslc', { ...data, subjects: updated });
        }}
        title="SSLC Marks"
      />
    </div>
  );
}

// HSC Section Component
function HSCSection({ data, onChange }) {
  const hscSubjects = data.major && HSC_SUBJECTS_BY_MAJOR[data.major] ? HSC_SUBJECTS_BY_MAJOR[data.major] : [];
  const cutoffScore = calculateCutoff(data.major, data.subjects);

  return (
    <div className="card !p-5 space-y-4">
      <h3 className="font-semibold text-gray-800">HSC (12th Standard)</h3>
      
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div>
          <label className="form-label">School Name *</label>
          <input
            type="text"
            className="form-input"
            value={data.school_name || ''}
            onChange={(e) => onChange('hsc', { ...data, school_name: e.target.value })}
            placeholder="Enter school name"
          />
        </div>
        <div>
          <label className="form-label">Board *</label>
          <select
            className="form-select"
            value={data.board || ''}
            onChange={(e) => onChange('hsc', { ...data, board: e.target.value })}
          >
            <option value="">Select Board</option>
            <option value="Tamil Nadu State Board">Tamil Nadu State Board</option>
            <option value="CBSE">CBSE</option>
            <option value="ICSE">ICSE</option>
          </select>
        </div>
        <div>
          <label className="form-label">Major/Stream *</label>
          <select
            className="form-select"
            value={data.major || ''}
            onChange={(e) => {
              const major = e.target.value;
              const newSubjects = HSC_SUBJECTS_BY_MAJOR[major] || [];
              onChange('hsc', { ...data, major, subjects: newSubjects });
            }}
          >
            {HSC_MAJORS.map(m => (
              <option key={m.value} value={m.value}>{m.label}</option>
            ))}
          </select>
        </div>
        <div>
          <label className="form-label">Exam Type</label>
          <select
            className="form-select"
            value={data.exam_type || 600}
            onChange={(e) => onChange('hsc', { ...data, exam_type: parseInt(e.target.value) })}
          >
            <option value={600}>600 Marks (Modern)</option>
            <option value={1200}>1200 Marks (Legacy)</option>
          </select>
        </div>
        <div>
          <label className="form-label">Year of Passing *</label>
          <input
            type="number"
            className="form-input"
            value={data.year || ''}
            onChange={(e) => onChange('hsc', { ...data, year: e.target.value })}
            placeholder="YYYY"
            min="2000"
            max={new Date().getFullYear()}
          />
        </div>
        <div>
          <label className="form-label">Register Number</label>
          <input
            type="text"
            className="form-input"
            value={data.register_no || ''}
            onChange={(e) => onChange('hsc', { ...data, register_no: e.target.value })}
            placeholder="Register number"
          />
        </div>
      </div>

      {data.major && (
        <>
          <MarksTable
            subjects={data.subjects || hscSubjects}
            onMarkChange={(idx, val) => {
              const updated = [...(data.subjects || hscSubjects)];
              updated[idx] = { ...updated[idx], marks: val };
              onChange('hsc', { ...data, subjects: updated });
            }}
            title="HSC Marks (For Cutoff Calculation)"
          />

          {(data.major === 'biology' || data.major === 'mathematics') && (
            <div className="bg-blue-50 border border-blue-200 rounded p-4 text-sm text-blue-700">
              <div className="font-semibold mb-2">
                Cutoff Score: <span className="text-lg text-blue-900">{cutoffScore || 'N/A'}</span>
              </div>
              <div className="text-xs">
                Formula Used: {data.major === 'biology' ? '(Biology ÷ 2) + (Physics ÷ 4) + (Chemistry ÷ 4)' : '(Mathematics ÷ 2) + (Physics ÷ 4) + (Chemistry ÷ 4)'}
              </div>
            </div>
          )}
        </>
      )}
    </div>
  );
}

// ITI Section Component
function ITISection({ data, onChange }) {
  return (
    <div className="card !p-5 space-y-4">
      <h3 className="font-semibold text-gray-800">ITI</h3>
      
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div>
          <label className="form-label">ITI Name *</label>
          <input
            type="text"
            className="form-input"
            value={data.iti_name || ''}
            onChange={(e) => onChange('iti', { ...data, iti_name: e.target.value })}
            placeholder="Enter ITI name"
          />
        </div>
        <div>
          <label className="form-label">Trade</label>
          <input
            type="text"
            className="form-input"
            value={data.trade || ''}
            onChange={(e) => onChange('iti', { ...data, trade: e.target.value })}
            placeholder="Trade/Course name"
          />
        </div>
        <div>
          <label className="form-label">Year of Passing *</label>
          <input
            type="number"
            className="form-input"
            value={data.year || ''}
            onChange={(e) => onChange('iti', { ...data, year: e.target.value })}
            placeholder="YYYY"
          />
        </div>
        <div>
          <label className="form-label">Register Number</label>
          <input
            type="text"
            className="form-input"
            value={data.register_no || ''}
            onChange={(e) => onChange('iti', { ...data, register_no: e.target.value })}
            placeholder="Register number"
          />
        </div>
      </div>

      <MarksTable
        subjects={data.subjects || ITI_SUBJECTS_INITIAL}
        onMarkChange={(idx, val) => {
          const updated = [...(data.subjects || ITI_SUBJECTS_INITIAL)];
          updated[idx] = { ...updated[idx], marks: val };
          onChange('iti', { ...data, subjects: updated });
        }}
        title="ITI Marks"
      />
    </div>
  );
}

// Vocational Section Component
function VocationalSection({ data, onChange }) {
  return (
    <div className="card !p-5 space-y-4">
      <h3 className="font-semibold text-gray-800">Vocational</h3>
      
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div>
          <label className="form-label">Institution Name *</label>
          <input
            type="text"
            className="form-input"
            value={data.institution || ''}
            onChange={(e) => onChange('vocational', { ...data, institution: e.target.value })}
            placeholder="Enter institution name"
          />
        </div>
        <div>
          <label className="form-label">Stream/Course</label>
          <input
            type="text"
            className="form-input"
            value={data.stream || ''}
            onChange={(e) => onChange('vocational', { ...data, stream: e.target.value })}
            placeholder="Stream or course name"
          />
        </div>
        <div>
          <label className="form-label">Year of Passing *</label>
          <input
            type="number"
            className="form-input"
            value={data.year || ''}
            onChange={(e) => onChange('vocational', { ...data, year: e.target.value })}
            placeholder="YYYY"
          />
        </div>
        <div>
          <label className="form-label">Register Number</label>
          <input
            type="text"
            className="form-input"
            value={data.register_no || ''}
            onChange={(e) => onChange('vocational', { ...data, register_no: e.target.value })}
            placeholder="Register number"
          />
        </div>
      </div>

      <MarksTable
        subjects={data.subjects || VOCATIONAL_SUBJECTS_INITIAL}
        onMarkChange={(idx, val) => {
          const updated = [...(data.subjects || VOCATIONAL_SUBJECTS_INITIAL)];
          updated[idx] = { ...updated[idx], marks: val };
          onChange('vocational', { ...data, subjects: updated });
        }}
        title="Vocational Marks"
      />
    </div>
  );
}

// Main Component
export default function EducationalHistory() {
  const dispatch = useDispatch();
  const form = useSelector((s) => s.application.formData);
  const [expandedSections, setExpandedSections] = useState({});

  const educationData = form.education || {
    sections: [],
    sslc: {},
    hsc: {},
    iti: {},
    vocational: {},
  };

  const toggleSection = (id) => {
    setExpandedSections(prev => ({ ...prev, [id]: !prev[id] }));
  };

  const toggleEducationSection = (id) => {
    const current = educationData.sections || [];
    const updated = current.includes(id)
      ? current.filter(s => s !== id)
      : [...current, id];
    dispatch(updateFormData({ education: { ...educationData, sections: updated } }));
  };

  const handleSectionData = (type, data) => {
    dispatch(updateFormData({ education: { ...educationData, [type]: data } }));
  };

  return (
    <div className="space-y-5">
      <h3 className="font-semibold text-gray-800 text-base border-b pb-2">Educational History</h3>

      <div className="bg-blue-50 border border-blue-200 rounded p-4">
        <h4 className="font-medium text-blue-900 mb-3">Select Education Sections</h4>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
          {EDUCATION_SECTIONS.map(section => (
            <label key={section.id} className="flex items-center gap-2 cursor-pointer p-2 rounded hover:bg-blue-100">
              <input
                type="checkbox"
                checked={educationData.sections?.includes(section.value) || false}
                onChange={() => toggleEducationSection(section.value)}
                className="h-4 w-4 rounded"
              />
              <span className="text-sm text-gray-700">{section.label}</span>
            </label>
          ))}
        </div>
      </div>

      <div className="space-y-4">
        {educationData.sections?.includes('sslc') && (
          <SSLCSection
            data={educationData.sslc || {}}
            onChange={handleSectionData}
          />
        )}

        {educationData.sections?.includes('hsc') && (
          <HSCSection
            data={educationData.hsc || {}}
            onChange={handleSectionData}
          />
        )}

        {educationData.sections?.includes('iti') && (
          <ITISection
            data={educationData.iti || {}}
            onChange={handleSectionData}
          />
        )}

        {educationData.sections?.includes('vocational') && (
          <VocationalSection
            data={educationData.vocational || {}}
            onChange={handleSectionData}
          />
        )}
      </div>
    </div>
  );
}
