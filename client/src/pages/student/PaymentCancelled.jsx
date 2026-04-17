import { Link, useParams } from 'react-router-dom';
import { XCircle } from 'lucide-react';
import AppLayout from '../../components/layout/AppLayout';

export default function PaymentCancelled() {
  const { id } = useParams();
  return (
    <AppLayout>
      <div className="max-w-md mx-auto card text-center py-12">
        <XCircle size={56} className="text-red-500 mx-auto mb-4" />
        <h2 className="text-xl font-bold text-gray-800 mb-2">Payment Cancelled</h2>
        <p className="text-gray-500 text-sm mb-6">Your payment was cancelled. Your application is saved as submitted. You can retry payment from your dashboard.</p>
        <div className="flex gap-3 justify-center">
          <Link to={`/student/apply/${id}`} className="btn-primary">Retry Payment</Link>
          <Link to="/student/dashboard" className="btn-secondary">Dashboard</Link>
        </div>
      </div>
    </AppLayout>
  );
}
