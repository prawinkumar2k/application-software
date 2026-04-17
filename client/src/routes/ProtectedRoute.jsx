import { useSelector } from 'react-redux';
import { Navigate, useLocation } from 'react-router-dom';

export function ProtectedRoute({ children, requiredRole }) {
  const { token, role } = useSelector((s) => s.auth);
  const location = useLocation();

  if (!token) return <Navigate to="/login" state={{ from: location }} replace />;
  if (requiredRole && role !== requiredRole) {
    if (role === 'student') return <Navigate to="/student/dashboard" replace />;
    if (role === 'SUPER_ADMIN') return <Navigate to="/admin/dashboard" replace />;
    if (role === 'COLLEGE_STAFF') return <Navigate to="/college/dashboard" replace />;
    return <Navigate to="/login" replace />;
  }
  return children;
}

export function PublicRoute({ children }) {
  const { token, role } = useSelector((s) => s.auth);
  if (token) {
    if (role === 'student') return <Navigate to="/student/dashboard" replace />;
    if (role === 'SUPER_ADMIN') return <Navigate to="/admin/dashboard" replace />;
    if (role === 'COLLEGE_STAFF') return <Navigate to="/college/dashboard" replace />;
  }
  return children;
}
