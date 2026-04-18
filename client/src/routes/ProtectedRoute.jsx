import { useSelector } from 'react-redux';
import { Navigate, useLocation } from 'react-router-dom';

export function ProtectedRoute({ children, requiredRole }) {
  const { token, role } = useSelector((s) => s.auth);
  const location = useLocation();

  if (!token) return <Navigate to="/login" state={{ from: location }} replace />;
  
  // Handle role matching - normalize role comparison
  const roleMatches = () => {
    if (!requiredRole) return true;
    // For student: requiredRole will be 'student', role from auth will be 'student'
    // For admin: requiredRole will be 'SUPER_ADMIN', role from auth will be 'SUPER_ADMIN'
    // For college: requiredRole will be 'COLLEGE_STAFF', role from auth will be 'COLLEGE_STAFF'
    return role === requiredRole;
  };

  if (!roleMatches()) {
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
