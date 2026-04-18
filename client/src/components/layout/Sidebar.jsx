import { useSelector } from 'react-redux';
import { NavLink } from 'react-router-dom';
import { LayoutDashboard, FileText, Building2, Users, BarChart3, Database, GraduationCap, ClipboardList } from 'lucide-react';

const studentLinks = [
  { to: '/student/dashboard', icon: LayoutDashboard, label: 'Dashboard' },
  { to: '/student/apply', icon: FileText, label: 'Apply Now' },
];

const adminLinks = [
  { to: '/admin/dashboard', icon: LayoutDashboard, label: 'Dashboard' },
  { to: '/admin/applications', icon: ClipboardList, label: 'Applications' },
  { to: '/admin/colleges', icon: Building2, label: 'Colleges & Courses' },
  { to: '/admin/users', icon: Users, label: 'User Management' },
  { to: '/admin/master-data', icon: Database, label: 'Master Data' },
  { to: '/admin/reports', icon: BarChart3, label: 'Reports' },
];

const collegeLinks = [
  { to: '/college/dashboard', icon: LayoutDashboard, label: 'Dashboard' },
  { to: '/college/applications', icon: ClipboardList, label: 'Applications' },
  { to: '/college/reports', icon: BarChart3, label: 'Reports' },
];

export default function Sidebar() {
  const { role } = useSelector((s) => s.auth);
  const { sidebarOpen } = useSelector((s) => s.ui);

  const links = role === 'student' ? studentLinks : role === 'SUPER_ADMIN' ? adminLinks : collegeLinks;

  return (
    <aside className={`fixed left-0 top-16 bottom-0 bg-white border-r border-gray-200 transition-all duration-300 z-30 ${sidebarOpen ? 'w-56' : 'w-0 overflow-hidden'}`}>
      <div className="p-3 pt-4">
        {links.map(({ to, icon: Icon, label }) => (
          <NavLink
            key={to}
            to={to}
            className={({ isActive }) =>
              `flex items-center gap-3 px-3 py-2.5 rounded-md text-sm font-medium mb-1 transition-colors ${
                isActive ? 'bg-primary text-white' : 'text-gray-700 hover:bg-gray-100'
              }`
            }
          >
            <Icon size={18} />
            <span>{label}</span>
          </NavLink>
        ))}
      </div>
    </aside>
  );
}
