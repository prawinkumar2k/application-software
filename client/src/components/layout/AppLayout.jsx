import { useSelector } from 'react-redux';
import Navbar from './Navbar';
import Sidebar from './Sidebar';

export default function AppLayout({ children }) {
  const { sidebarOpen } = useSelector((s) => s.ui);
  return (
    <div className="min-h-screen bg-gray-50">
      <Navbar />
      <Sidebar />
      <main className={`pt-16 transition-all duration-300 ${sidebarOpen ? 'ml-56' : 'ml-0'}`}>
        <div className="p-6">{children}</div>
      </main>
    </div>
  );
}
