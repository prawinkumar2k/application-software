import { useDispatch, useSelector } from 'react-redux';
import { Link, useNavigate } from 'react-router-dom';
import { LogOut, Menu, User } from 'lucide-react';
import { logoutUser } from '../../store/slices/authSlice';
import { toggleSidebar } from '../../store/slices/uiSlice';

export default function Navbar({ title = 'DOTE Admission Management System' }) {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const { student, user, role } = useSelector((s) => s.auth);
  const displayName = student?.name || user?.name || 'User';

  const handleLogout = async () => {
    await dispatch(logoutUser());
    navigate('/login');
  };

  return (
    <nav className="bg-primary text-white h-16 flex items-center px-4 shadow-md z-40 fixed top-0 left-0 right-0">
      <button onClick={() => dispatch(toggleSidebar())} className="p-2 rounded hover:bg-primary-light mr-3">
        <Menu size={20} />
      </button>
      <div className="flex items-center gap-2 flex-1">
        <img src="/logo.svg" alt="TN Govt" className="h-8 w-8 object-contain" onError={(e) => e.target.style.display='none'} />
        <div>
          <p className="font-semibold text-sm leading-tight">DOTE Admission Management System</p>
          <p className="text-xs text-blue-200 leading-tight">Government of Tamil Nadu – Directorate of Technical Education</p>
        </div>
      </div>
      <div className="flex items-center gap-3">
        <div className="flex items-center gap-2 text-sm">
          <User size={16} />
          <span>{displayName}</span>
          {role && <span className="text-xs bg-blue-700 px-2 py-0.5 rounded-full">{role === 'student' ? 'Student' : role?.replace('_', ' ')}</span>}
        </div>
        <button onClick={handleLogout} className="flex items-center gap-1 text-sm hover:text-blue-200 transition-colors ml-2">
          <LogOut size={16} />
          <span className="hidden sm:inline">Logout</span>
        </button>
      </div>
    </nav>
  );
}
