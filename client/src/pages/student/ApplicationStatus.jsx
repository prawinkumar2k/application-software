import { useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { fetchMyApplications } from '../../store/slices/applicationSlice';
import AppLayout from '../../components/layout/AppLayout';
import StatusBadge from '../../components/common/StatusBadge';
import { CheckCircle, Clock, XCircle, FileText } from 'lucide-react';

const statusSteps = ['DRAFT', 'SUBMITTED', 'PAID', 'VERIFIED', 'ALLOCATED'];
const statusIcons = { DRAFT: Clock, SUBMITTED: FileText, PAID: CheckCircle, VERIFIED: CheckCircle, ALLOCATED: CheckCircle, REJECTED: XCircle };

export default function ApplicationStatus() {
  const dispatch = useDispatch();
  const { list } = useSelector((s) => s.application);

  useEffect(() => { dispatch(fetchMyApplications()); }, [dispatch]);

  if (!list.length) return (
    <AppLayout>
      <div className="max-w-2xl mx-auto card text-center py-16">
        <p className="text-gray-500">No applications found.</p>
      </div>
    </AppLayout>
  );

  return (
    <AppLayout>
      <div className="max-w-2xl mx-auto space-y-6">
        <h1 className="text-xl font-bold text-gray-900">Application Status</h1>
        {list.map((app) => {
          const currentIdx = statusSteps.indexOf(app.status);
          return (
            <div key={app.application_id} className="card">
              <div className="flex items-center justify-between mb-6">
                <div>
                  <h3 className="font-semibold text-gray-800">{app.application_no}</h3>
                  <p className="text-sm text-gray-500">{app.academicYear?.year_label}</p>
                </div>
                <StatusBadge status={app.status} />
              </div>

              {/* Progress timeline */}
              <div className="relative">
                {statusSteps.map((step, i) => {
                  const done = i <= currentIdx;
                  const active = i === currentIdx;
                  const Icon = statusIcons[step] || Clock;
                  return (
                    <div key={step} className="flex items-start gap-4 mb-4 last:mb-0">
                      <div className="flex flex-col items-center">
                        <div className={`w-8 h-8 rounded-full flex items-center justify-center flex-shrink-0 ${done ? 'bg-green-500 text-white' : 'bg-gray-200 text-gray-400'} ${active ? 'ring-2 ring-green-400 ring-offset-1' : ''}`}>
                          <Icon size={16} />
                        </div>
                        {i < statusSteps.length - 1 && <div className={`w-0.5 h-6 mt-1 ${done && i < currentIdx ? 'bg-green-400' : 'bg-gray-200'}`} />}
                      </div>
                      <div className="pt-1">
                        <p className={`text-sm font-medium ${done ? 'text-gray-800' : 'text-gray-400'}`}>{step.replace('_', ' ')}</p>
                        {active && <p className="text-xs text-green-600 mt-0.5">Current status</p>}
                      </div>
                    </div>
                  );
                })}
              </div>

              {app.status === 'ALLOCATED' && (
                <div className="mt-4 p-4 bg-green-50 border border-green-200 rounded-lg">
                  <p className="text-green-800 font-medium text-sm">Congratulations! You have been allocated a seat.</p>
                  <p className="text-green-700 text-xs mt-1">Please visit the allotted college with original documents for verification.</p>
                </div>
              )}

              {app.status === 'REJECTED' && (
                <div className="mt-4 p-4 bg-red-50 border border-red-200 rounded-lg">
                  <p className="text-red-800 font-medium text-sm">Your application has been rejected.</p>
                </div>
              )}
            </div>
          );
        })}
      </div>
    </AppLayout>
  );
}
