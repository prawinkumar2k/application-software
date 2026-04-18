import { useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { Link } from 'react-router-dom';
import { fetchMyApplications } from '../../store/slices/applicationSlice';
import AppLayout from '../../components/layout/AppLayout';
import StatusBadge from '../../components/common/StatusBadge';
import { FileText, Plus, Download } from 'lucide-react';
import api from '../../services/api';
import { addToast } from '../../store/slices/uiSlice';

export default function StudentDashboard() {
  const dispatch = useDispatch();
  const { list } = useSelector((s) => s.application);
  const { student } = useSelector((s) => s.auth);

  useEffect(() => { dispatch(fetchMyApplications()); }, [dispatch]);

  const hasSubmitted = list.some((app) => ['SUBMITTED', 'PAID', 'VERIFIED', 'ALLOCATED', 'REJECTED'].includes(app.status));

  const downloadPDF = async (appId) => {
    try {
      const res = await api.get(`/applications/${appId}/pdf`, { responseType: 'blob' });
      const url = window.URL.createObjectURL(new Blob([res.data]));
      const a = document.createElement('a'); a.href = url; a.download = `application_${appId}.pdf`; a.click();
    } catch {
      dispatch(addToast({ type: 'error', message: 'Failed to download PDF' }));
    }
  };

  return (
    <AppLayout>
      <div className="max-w-4xl mx-auto">
        <div className="mb-6">
          <h1 className="text-xl font-bold text-gray-900">Welcome, {student?.name || 'Student'}</h1>
          <p className="text-gray-500 text-sm">Manage your polytechnic college applications</p>
        </div>

        {list.length === 0 ? (
          <div className="card text-center py-16">
            <FileText size={48} className="text-gray-300 mx-auto mb-4" />
            <h3 className="text-lg font-medium text-gray-700 mb-2">No Applications Yet</h3>
            <p className="text-gray-500 text-sm mb-6">Start your admission application for Government Polytechnic Colleges</p>
            <Link to="/student/apply" className="btn-primary inline-flex items-center gap-2">
              <Plus size={16} /> Start New Application
            </Link>
          </div>
        ) : (
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <h2 className="font-semibold text-gray-800">My Applications</h2>
              {hasSubmitted ? (
                <span className="text-sm text-amber-600 font-medium px-3 py-1 bg-amber-50 rounded-full">
                  You have already applied
                </span>
              ) : (
                <Link to="/student/apply" className="btn-primary flex items-center gap-2 text-sm">
                  <Plus size={15} /> New Application
                </Link>
              )}
            </div>
            {list.map((app) => (
              <div key={app.application_id} className="card hover:shadow-md transition-shadow">
                <div className="flex items-start justify-between gap-4">
                  <div>
                    <div className="flex items-center gap-2 mb-1">
                      <span className="font-semibold text-gray-800">{app.application_no || 'Draft'}</span>
                      <StatusBadge status={app.status} />
                    </div>
                    <p className="text-sm text-gray-500">Academic Year: {app.academicYear?.year_label}</p>
                    <p className="text-sm text-gray-500">Created: {new Date(app.created_at).toLocaleDateString('en-IN')}</p>
                    {app.payments?.[0] && (
                      <p className="text-sm text-gray-500">Payment: <StatusBadge status={app.payments[0].status} /></p>
                    )}
                  </div>
                  <div className="flex gap-2 flex-shrink-0">
                    {app.status === 'DRAFT' && (
                      <Link to={`/student/apply/${app.application_id}`} className="btn-primary text-sm">Continue</Link>
                    )}
                    {['SUBMITTED','PAID','VERIFIED','ALLOCATED'].includes(app.status) && (
                      <button onClick={() => downloadPDF(app.application_id)} className="btn-secondary flex items-center gap-1 text-sm">
                        <Download size={14} /> PDF
                      </button>
                    )}
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </AppLayout>
  );
}
