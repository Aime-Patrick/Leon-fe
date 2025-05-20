import React from 'react';
import Sidebar from '../Sidebar/Sidebar';
import { Outlet } from 'react-router-dom';


const Layout: React.FC = () => {
  return (
    <div className="flex">
      <Sidebar />
      <main className="flex-1 bg-gray-100">
          <Outlet />
      </main>
    </div>
  );
};

export default Layout;