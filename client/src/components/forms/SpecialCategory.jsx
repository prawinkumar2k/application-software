import { useDispatch, useSelector } from 'react-redux';
import { updateFormData } from '../../store/slices/applicationSlice';

const categories = [
  { key: 'is_differently_abled', label: 'Differently Abled', desc: 'Applicant has a certified physical/visual/hearing disability' },
  { key: 'is_ex_servicemen', label: "Ex-Servicemen's Ward", desc: "Ward of Ex-Servicemen / Defence personnel" },
  { key: 'is_sports_person', label: 'Sports Person', desc: 'Represented District / State / National level in sports' },
  { key: 'is_govt_school', label: 'Government School Student', desc: 'Studied in Government / Government-Aided school' },
];

export default function SpecialCategory() {
  const dispatch = useDispatch();
  const form = useSelector((s) => s.application.formData);
  const update = (k, v) => dispatch(updateFormData({ [k]: v }));

  return (
    <div className="space-y-4">
      <h3 className="font-semibold text-gray-800 text-base border-b pb-2">Special Category / Reservation</h3>
      <p className="text-sm text-gray-500">Select all applicable categories. Supporting documents must be uploaded.</p>
      <div className="space-y-3">
        {categories.map(({ key, label, desc }) => (
          <label key={key} className="flex items-start gap-3 p-4 border rounded-lg cursor-pointer hover:bg-gray-50 transition-colors">
            <input type="checkbox" className="mt-1 h-4 w-4 text-primary rounded" checked={!!form[key]}
              onChange={(e) => update(key, e.target.checked ? 1 : 0)} />
            <div>
              <p className="font-medium text-gray-800 text-sm">{label}</p>
              <p className="text-xs text-gray-500 mt-0.5">{desc}</p>
            </div>
          </label>
        ))}
      </div>
    </div>
  );
}
