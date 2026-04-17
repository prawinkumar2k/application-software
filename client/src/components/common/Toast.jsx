import { useDispatch, useSelector } from 'react-redux';
import { useEffect } from 'react';
import { X, CheckCircle, AlertCircle, Info } from 'lucide-react';
import { removeToast } from '../../store/slices/uiSlice';

const icons = { success: CheckCircle, error: AlertCircle, info: Info };
const colors = {
  success: 'bg-green-50 border-green-400 text-green-800',
  error: 'bg-red-50 border-red-400 text-red-800',
  info: 'bg-blue-50 border-blue-400 text-blue-800',
};

function ToastItem({ id, type = 'info', message }) {
  const dispatch = useDispatch();
  const Icon = icons[type] || Info;

  useEffect(() => {
    const t = setTimeout(() => dispatch(removeToast(id)), 4000);
    return () => clearTimeout(t);
  }, [id, dispatch]);

  return (
    <div className={`flex items-start gap-3 p-4 rounded-lg border shadow-md mb-2 min-w-72 max-w-sm ${colors[type]}`}>
      <Icon size={18} className="mt-0.5 flex-shrink-0" />
      <p className="text-sm flex-1">{message}</p>
      <button onClick={() => dispatch(removeToast(id))} className="opacity-60 hover:opacity-100">
        <X size={14} />
      </button>
    </div>
  );
}

export default function Toast() {
  const { toasts } = useSelector((s) => s.ui);
  if (!toasts.length) return null;
  return (
    <div className="fixed top-20 right-4 z-50">
      {toasts.map((t) => <ToastItem key={t.id} {...t} />)}
    </div>
  );
}
