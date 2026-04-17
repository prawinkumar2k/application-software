import { Routes, Route, Navigate } from 'react-router-dom';
import { ProtectedRoute, PublicRoute } from './routes/ProtectedRoute';
import Toast from './components/common/Toast';

// Public
import Home from './pages/public/Home';
import Login from './pages/public/Login';
import Register from './pages/public/Register';
import AdminLogin from './pages/public/AdminLogin';

// Student
import StudentDashboard from './pages/student/Dashboard';
import ApplicationForm from './pages/student/ApplicationForm';
import ApplicationStatus from './pages/student/ApplicationStatus';
import PaymentSuccess from './pages/student/PaymentSuccess';
import PaymentCancelled from './pages/student/PaymentCancelled';

// Admin
import AdminDashboard from './pages/admin/Dashboard';
import AdminColleges from './pages/admin/Colleges';
import AdminUsers from './pages/admin/Users';
import AdminReports from './pages/admin/Reports';
import AdminMasterData from './pages/admin/MasterData';

// College
import CollegeDashboard from './pages/college/Dashboard';
import CollegeApplications from './pages/college/Applications';
import CollegeReports from './pages/college/Reports';

export default function App() {
  return (
    <>
      <Toast />
      <Routes>
        {/* Public */}
        <Route path="/" element={<Home />} />
        <Route path="/login" element={<PublicRoute><Login /></PublicRoute>} />
        <Route path="/register" element={<PublicRoute><Register /></PublicRoute>} />
        <Route path="/admin/login" element={<PublicRoute><AdminLogin /></PublicRoute>} />

        {/* Student */}
        <Route path="/student/dashboard" element={<ProtectedRoute requiredRole="student"><StudentDashboard /></ProtectedRoute>} />
        <Route path="/student/apply" element={<ProtectedRoute requiredRole="student"><ApplicationForm /></ProtectedRoute>} />
        <Route path="/student/apply/:id" element={<ProtectedRoute requiredRole="student"><ApplicationForm /></ProtectedRoute>} />
        <Route path="/student/status" element={<ProtectedRoute requiredRole="student"><ApplicationStatus /></ProtectedRoute>} />
        <Route path="/application/:id/payment-success" element={<ProtectedRoute requiredRole="student"><PaymentSuccess /></ProtectedRoute>} />
        <Route path="/application/:id/payment-cancelled" element={<ProtectedRoute requiredRole="student"><PaymentCancelled /></ProtectedRoute>} />

        {/* Admin */}
        <Route path="/admin/dashboard" element={<ProtectedRoute requiredRole="SUPER_ADMIN"><AdminDashboard /></ProtectedRoute>} />
        <Route path="/admin/colleges" element={<ProtectedRoute requiredRole="SUPER_ADMIN"><AdminColleges /></ProtectedRoute>} />
        <Route path="/admin/users" element={<ProtectedRoute requiredRole="SUPER_ADMIN"><AdminUsers /></ProtectedRoute>} />
        <Route path="/admin/reports" element={<ProtectedRoute requiredRole="SUPER_ADMIN"><AdminReports /></ProtectedRoute>} />
        <Route path="/admin/master-data" element={<ProtectedRoute requiredRole="SUPER_ADMIN"><AdminMasterData /></ProtectedRoute>} />

        {/* College */}
        <Route path="/college/dashboard" element={<ProtectedRoute requiredRole="COLLEGE_STAFF"><CollegeDashboard /></ProtectedRoute>} />
        <Route path="/college/applications" element={<ProtectedRoute requiredRole="COLLEGE_STAFF"><CollegeApplications /></ProtectedRoute>} />
        <Route path="/college/reports" element={<ProtectedRoute requiredRole="COLLEGE_STAFF"><CollegeReports /></ProtectedRoute>} />

        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </>
  );
}
