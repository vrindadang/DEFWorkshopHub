
import React from 'react';
import { Link, useLocation } from 'react-router-dom';

interface LayoutProps {
  children: React.ReactNode;
}

const Layout: React.FC<LayoutProps> = ({ children }) => {
  const location = useLocation();

  const navItems = [
    { path: '/', label: 'Dashboard', icon: '📊' },
    { path: '/inventory', label: 'Workshops', icon: '🏫' },
    { path: '/add', label: 'Add Workshop', icon: '➕' },
    { path: '/process', label: 'Process Report', icon: '📝' },
    { path: '/compare', label: 'Compare Data', icon: '⚖️' },
  ];

  return (
    <div className="flex h-screen overflow-hidden">
      {/* Sidebar */}
      <aside className="w-64 bg-indigo-900 text-white flex-shrink-0 flex flex-col">
        <div className="p-6 border-b border-indigo-800">
          <h1 className="text-xl font-bold font-serif">Darshan Hub</h1>
          <p className="text-xs text-indigo-300 mt-1 uppercase tracking-widest">Workshop Management</p>
        </div>
        <nav className="flex-1 p-4 space-y-2 mt-4">
          {navItems.map((item) => (
            <Link
              key={item.path}
              to={item.path}
              className={`flex items-center space-x-3 px-4 py-3 rounded-lg transition-colors ${
                location.pathname === item.path
                  ? 'bg-indigo-700 text-white'
                  : 'text-indigo-200 hover:bg-indigo-800'
              }`}
            >
              <span>{item.icon}</span>
              <span className="font-medium">{item.label}</span>
            </Link>
          ))}
        </nav>
        <div className="p-4 border-t border-indigo-800">
          <div className="flex items-center space-x-3 text-indigo-300 text-sm">
            <div className="w-8 h-8 rounded-full bg-indigo-500 flex items-center justify-center text-white font-bold">DA</div>
            <div>
              <p className="font-semibold text-white">Lead Architect</p>
              <p className="text-xs">Darshan Academy</p>
            </div>
          </div>
        </div>
      </aside>

      {/* Main Content */}
      <main className="flex-1 overflow-y-auto bg-slate-50 relative">
        <header className="sticky top-0 z-10 bg-white/80 backdrop-blur-md border-b border-slate-200 px-8 py-4 flex justify-between items-center">
          <div className="flex items-center space-x-4">
            <h2 className="text-lg font-semibold text-slate-800">
              {navItems.find(n => n.path === location.pathname)?.label || 'Detail View'}
            </h2>
          </div>
          <div className="flex space-x-4">
            <button className="px-4 py-2 bg-indigo-600 text-white rounded-lg text-sm font-semibold hover:bg-indigo-700 shadow-sm transition-all">
              Export All Data
            </button>
          </div>
        </header>
        <div className="p-8">
          {children}
        </div>
      </main>
    </div>
  );
};

export default Layout;
