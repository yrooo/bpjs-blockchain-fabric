import { useState } from 'react';
import { Outlet, Link, useLocation } from 'react-router-dom';
import { Menu, X, Activity } from 'lucide-react';

const MainLayout = () => {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const location = useLocation();
  const isAdmin = location.pathname.startsWith('/admin');

  const toggleMenu = () => setIsMenuOpen(!isMenuOpen);

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col">
      {/* Navbar */}
      <nav className="bg-bpjs-primary text-white shadow-lg">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            <div className="flex items-center">
              <Link to="/" className="flex items-center space-x-2">
                <Activity className="h-8 w-8" />
                <span className="font-bold text-xl tracking-tight">HealthLink</span>
              </Link>
            </div>
            
            {/* Desktop Menu */}
            <div className="hidden md:block">
              <div className="ml-10 flex items-baseline space-x-4">
                <Link to="/" className={`px-3 py-2 rounded-md text-sm font-medium hover:bg-bpjs-dark ${!isAdmin ? 'bg-bpjs-dark' : ''}`}>
                  Patient Portal
                </Link>
                <Link to="/admin" className={`px-3 py-2 rounded-md text-sm font-medium hover:bg-bpjs-dark ${isAdmin ? 'bg-bpjs-dark' : ''}`}>
                  Provider Portal
                </Link>
              </div>
            </div>

            {/* Mobile menu button */}
            <div className="md:hidden">
              <button
                onClick={toggleMenu}
                className="inline-flex items-center justify-center p-2 rounded-md hover:bg-bpjs-dark focus:outline-none"
              >
                {isMenuOpen ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
              </button>
            </div>
          </div>
        </div>

        {/* Mobile Menu */}
        {isMenuOpen && (
          <div className="md:hidden">
            <div className="px-2 pt-2 pb-3 space-y-1 sm:px-3">
              <Link 
                to="/" 
                className="block px-3 py-2 rounded-md text-base font-medium hover:bg-bpjs-dark"
                onClick={() => setIsMenuOpen(false)}
              >
                Patient Portal
              </Link>
              <Link 
                to="/admin" 
                className="block px-3 py-2 rounded-md text-base font-medium hover:bg-bpjs-dark"
                onClick={() => setIsMenuOpen(false)}
              >
                Provider Portal
              </Link>
            </div>
          </div>
        )}
      </nav>

      {/* Main Content */}
      <main className="flex-grow max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <Outlet />
      </main>

      {/* Footer */}
      <footer className="bg-white border-t border-gray-200 mt-auto">
        <div className="max-w-7xl mx-auto py-6 px-4 sm:px-6 lg:px-8">
          <p className="text-center text-gray-500 text-sm">
            © 2025 HealthLink - BPJS Blockchain System. All rights reserved.
          </p>
        </div>
      </footer>
    </div>
  );
};

export default MainLayout;