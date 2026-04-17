import { Link, useParams } from 'react-router-dom';
import { CheckCircle } from 'lucide-react';
import AppLayout from '../../components/layout/AppLayout';

export default function PaymentSuccess() {
  const { id } = useParams();
  return (
    <AppLayout>
      <div className="max-w-md mx-auto card text-center py-12">
        <CheckCircle size={56} className="text-green-500 mx-auto mb-4" />
        <h2 className="text-xl font-bold text-gray-800 mb-2">Payment Successful!</h2>
        <p className="text-gray-500 text-sm mb-6">Your application has been submitted and payment confirmed. A confirmation email has been sent to your registered email.</p>
        <div className="flex gap-3 justify-center">
          <Link to="/student/status" className="btn-primary">View Status</Link>
          <Link to="/student/dashboard" className="btn-secondary">Dashboard</Link>
        </div>
      </div>
    </AppLayout>
  );
}
