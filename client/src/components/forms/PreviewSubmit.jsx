import { useEffect, useRef, useState } from 'react';
import { useSelector } from 'react-redux';
import { Upload, CheckCircle, AlertCircle, Image, FileText, X } from 'lucide-react';
import api from '../../services/api';

function DocUploadSlot({ docType, label, accept, maxMB, icon: Icon, doc, uploading, onUpload, onRemovePreview }) {
  const inputRef = useRef(null);
  const isPhoto = docType === 'photo';

  const handleChange = (e) => {
    const file = e.target.files?.[0];
    if (file) onUpload(docType, file);
    e.target.value = '';
  };

  return (
    <div className={`border rounded-lg p-3 ${doc ? 'border-green-300 bg-green-50' : 'border-gray-200 bg-gray-50'}`}>
      <div className="flex items-start gap-3">
        <div className={`w-9 h-9 rounded-lg flex items-center justify-center flex-shrink-0 ${doc ? 'bg-green-100' : 'bg-gray-200'}`}>
          <Icon size={18} className={doc ? 'text-green-600' : 'text-gray-500'} />
        </div>
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-1 mb-0.5">
            <span className="text-sm font-medium text-gray-800">{label}</span>
            {isPhoto && <span className="text-red-500 text-xs">*</span>}
          </div>
          <p className="text-xs text-gray-500 mb-2">{accept.toUpperCase()} only · Max {maxMB}MB</p>

          {/* Photo preview */}
          {isPhoto && doc?.preview && (
            <img
              src={doc.preview}
              alt="Photo preview"
              className="w-20 h-24 object-cover rounded border border-gray-300 mb-2"
            />
          )}

          {/* File name for TC/Marksheet */}
          {!isPhoto && doc && (
            <p className="text-xs text-green-700 font-medium mb-2 truncate">{doc.original_name || 'Uploaded'}</p>
          )}

          {doc ? (
            <div className="flex items-center gap-2">
              <span className="text-xs text-green-700 flex items-center gap-1">
                <CheckCircle size={12} /> Uploaded
              </span>
              <button
                onClick={() => inputRef.current?.click()}
                className="text-xs text-primary underline"
              >
                Replace
              </button>
            </div>
          ) : (
            <button
              onClick={() => inputRef.current?.click()}
              disabled={uploading}
              className="flex items-center gap-1.5 text-xs bg-white border border-gray-300 hover:border-primary text-gray-700 hover:text-primary px-3 py-1.5 rounded transition-colors disabled:opacity-60"
            >
              {uploading ? (
                <span className="animate-spin inline-block w-3 h-3 border border-primary border-t-transparent rounded-full" />
              ) : (
                <Upload size={12} />
              )}
              {uploading ? 'Uploading...' : 'Choose File'}
            </button>
          )}
        </div>
      </div>
      <input ref={inputRef} type="file" accept={isPhoto ? 'image/jpeg,image/png' : 'image/jpeg,image/png,application/pdf'} className="hidden" onChange={handleChange} />
    </div>
  );
}

export default function PreviewSubmit({ onDeclarationChange, declarationChecked, onPhotoUploaded }) {
  const form = useSelector((s) => s.application.formData);
  const { current } = useSelector((s) => s.application);
  const prefs = form.college_preferences || [];
  const marks = form.marks || [];
  const total = marks.reduce((s, m) => s + parseFloat(m.marks_obtained || 0), 0);
  const maxTotal = marks.reduce((s, m) => s + parseFloat(m.max_marks || 100), 0);
  const pct = maxTotal > 0 ? ((total / maxTotal) * 100).toFixed(2) : '0.00';

  const [docs, setDocs] = useState({ photo: null, tc: null, marksheet: null });
  const [uploading, setUploading] = useState({ photo: false, tc: false, marksheet: false });
  const [uploadError, setUploadError] = useState('');

  // Fetch existing documents on mount
  useEffect(() => {
    if (!current?.application_id) return;
    api.get(`/applications/${current.application_id}/documents`)
      .then((r) => {
        const docMap = {};
        (r.data.data || []).forEach((d) => { docMap[d.doc_type] = d; });
        setDocs((prev) => ({ ...prev, ...docMap }));
      })
      .catch(() => {});
  }, [current?.application_id]);

  // Notify parent when photo status changes
  useEffect(() => {
    onPhotoUploaded?.(!!docs.photo);
  }, [docs.photo]);

  const uploadDoc = async (docType, file) => {
    setUploadError('');
    setUploading((p) => ({ ...p, [docType]: true }));
    try {
      const fd = new FormData();
      fd.append('application_id', current.application_id);
      fd.append('doc_type', docType);
      fd.append('document', file);
      const res = await api.post('/applications/upload', fd, {
        headers: { 'Content-Type': 'multipart/form-data' },
      });
      const uploaded = res.data.data;
      setDocs((p) => ({
        ...p,
        [docType]: {
          ...uploaded,
          preview: docType === 'photo' ? URL.createObjectURL(file) : null,
        },
      }));
    } catch (err) {
      setUploadError(err.response?.data?.message || `Failed to upload ${docType}. Please try again.`);
    }
    setUploading((p) => ({ ...p, [docType]: false }));
  };

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

      {/* ── Document Upload ── */}
      <div className="card !p-4">
        <h4 className="font-medium text-primary mb-1 text-sm flex items-center gap-1">
          Required Documents
        </h4>
        <p className="text-xs text-gray-500 mb-3">Upload the required documents before submitting. Passport photo is mandatory.</p>

        {uploadError && (
          <div className="mb-3 flex items-center gap-2 bg-red-50 border border-red-200 rounded px-3 py-2 text-xs text-red-700">
            <AlertCircle size={13} /> {uploadError}
          </div>
        )}

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
          <DocUploadSlot
            docType="photo"
            label="Passport Photo"
            accept="jpeg/png"
            maxMB={2}
            icon={Image}
            doc={docs.photo}
            uploading={uploading.photo}
            onUpload={uploadDoc}
          />
          <DocUploadSlot
            docType="tc"
            label="Transfer Certificate"
            accept="pdf/jpeg/png"
            maxMB={5}
            icon={FileText}
            doc={docs.tc}
            uploading={uploading.tc}
            onUpload={uploadDoc}
          />
          <DocUploadSlot
            docType="marksheet"
            label="Marksheet"
            accept="pdf/jpeg/png"
            maxMB={5}
            icon={FileText}
            doc={docs.marksheet}
            uploading={uploading.marksheet}
            onUpload={uploadDoc}
          />
        </div>

        {!docs.photo && (
          <p className="mt-3 text-xs text-red-600 flex items-center gap-1">
            <AlertCircle size={12} /> Passport photo is required to submit the application.
          </p>
        )}
      </div>

      {/* ── Preview sections ── */}
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
            ['Email', form.email], ['Alternate Mobile', form.alt_mobile],
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
        {marks.length === 0 ? (
          <p className="text-sm text-red-500">No marks entered. Please go back to Step 5.</p>
        ) : (
          <table className="w-full text-sm">
            <thead><tr className="bg-gray-50">
              <th className="text-left py-1 font-medium text-gray-600">Subject</th>
              <th className="text-left py-1 font-medium text-gray-600">Obtained</th>
              <th className="text-left py-1 font-medium text-gray-600">Max</th>
            </tr></thead>
            <tbody>
              {marks.map((m, i) => <tr key={i} className="border-b"><td className="py-1">{m.subject_name}</td><td className="py-1">{m.marks_obtained}</td><td className="py-1">{m.max_marks}</td></tr>)}
              <tr className="font-semibold bg-gray-50"><td>Total</td><td>{total}</td><td>{maxTotal} ({pct}%)</td></tr>
            </tbody>
          </table>
        )}
      </div>

      {/* College preferences */}
      <div className="card !p-4">
        <h4 className="font-medium text-primary mb-3 text-sm">College Preferences ({prefs.length})</h4>
        {prefs.length === 0 ? (
          <p className="text-sm text-red-600">No colleges selected. Please go back to Step 8.</p>
        ) : (
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
          {[
            ['Differently Abled', form.is_differently_abled],
            ["Ex-Servicemen's Ward", form.is_ex_servicemen],
            ['Sports Person', form.is_sports_person],
            ['Govt. School', form.is_govt_school],
            ['Hostel Required', form.hostel_required],
          ].map(([l, v]) => (
            <div key={l} className="flex items-center gap-2">
              <span className={`w-4 h-4 rounded border flex items-center justify-center text-xs ${v ? 'bg-green-500 border-green-500 text-white' : 'border-gray-300'}`}>{v ? '✓' : ''}</span>
              <span className="text-gray-700">{l}</span>
            </div>
          ))}
        </div>
      </div>

      {/* Declaration */}
      <label className="flex items-start gap-3 p-4 border-2 border-primary/30 rounded-lg cursor-pointer bg-primary/5">
        <input
          type="checkbox"
          className="mt-1 h-4 w-4 text-primary"
          checked={declarationChecked}
          onChange={(e) => onDeclarationChange(e.target.checked)}
        />
        <p className="text-sm text-gray-700">
          I hereby declare that all the information furnished in this application is true, complete, and correct to the best of my knowledge and belief.
          I understand that any false information will lead to cancellation of my application.
        </p>
      </label>

      {/* Submit checklist */}
      <div className="bg-gray-50 border border-gray-200 rounded-lg p-4 text-xs space-y-1.5">
        <p className="font-medium text-gray-700 mb-2">Submission checklist:</p>
        {[
          { label: 'Passport photo uploaded', ok: !!docs.photo },
          { label: 'At least one college selected', ok: prefs.length > 0 },
          { label: 'Marks entered', ok: marks.length > 0 },
          { label: 'Declaration accepted', ok: declarationChecked },
        ].map(({ label, ok }) => (
          <div key={label} className="flex items-center gap-2">
            {ok ? <CheckCircle size={13} className="text-green-500" /> : <AlertCircle size={13} className="text-red-400" />}
            <span className={ok ? 'text-green-700' : 'text-red-500'}>{label}</span>
          </div>
        ))}
      </div>
    </div>
  );
}
