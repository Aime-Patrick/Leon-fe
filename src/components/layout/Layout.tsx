import { type ReactNode } from 'react';
import { useLocation } from 'react-router-dom';
import Sidebar from '../Sidebar/Sidebar';
import { useAuth } from '../../hooks/useAuth';

interface LayoutProps {
  children: ReactNode;
}

const Layout = ({ children }: LayoutProps) => {
  const location = useLocation();
  const { isAuthenticated } = useAuth();

  // Don't show layout for auth pages
  if (location.pathname === '/login' || 
      location.pathname === '/forgot-password' || 
      location.pathname === '/reset-password' ||
      location.pathname === '/auth/google/callback' ||
      location.pathname === '/auth/error') {
    return <>{children}</>;
  }

  // Don't show layout if not authenticated
  if (!isAuthenticated) {
    return <>{children}</>;
  }

  return (
    <div className="flex h-screen bg-gray-100">
      <Sidebar />
      <main className="flex-1 overflow-auto">
        {children}
      </main>
    </div>
  );
};

export default Layout;