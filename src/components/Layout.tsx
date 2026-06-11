import React from 'react';
import { Outlet, useLocation } from 'react-router-dom';
import Navbar from './Navbar';
import Footer from './Footer';

const Layout = () => {
  const location = useLocation();
  const hideNavbar = location.pathname.startsWith('/pasien/');

  return (
    <div className="flex flex-col min-h-screen bg-gray-50">
      {!hideNavbar && <Navbar />}
      <main className="flex-grow w-full">
        <Outlet />
      </main>
      <Footer />
    </div>
  );
};

export default Layout;