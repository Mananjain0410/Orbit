import React, { useState } from 'react';
import { Outlet, Navigate } from 'react-router';
import { useAdminAuth } from '../../../contexts/AdminAuthContext';
import { AdminSidebar } from './AdminSidebar';
import { AdminHeader } from './AdminHeader';

export function AdminLayout() {
  const { isAuthenticated } = useAdminAuth();
  const [isCollapsed, setIsCollapsed] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);

  // Protect admin routes
  if (!isAuthenticated) {
    return <Navigate to="/admin/login" replace />;
  }

  return (
    <div className="min-h-screen bg-neutral-50 font-sans text-neutral-900 flex">
      <AdminSidebar 
        isCollapsed={isCollapsed} 
        setIsCollapsed={setIsCollapsed} 
        mobileOpen={mobileOpen}
        setMobileOpen={setMobileOpen}
      />
      
      <div 
        className={`flex-1 flex flex-col min-h-screen transition-all duration-300
          ${isCollapsed ? 'lg:ml-20' : 'lg:ml-64'}
        `}
      >
        <AdminHeader setMobileOpen={setMobileOpen} />
        
        <main className="flex-1 p-4 md:p-8 overflow-x-hidden">
          <Outlet />
        </main>
      </div>
    </div>
  );
}
