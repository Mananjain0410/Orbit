import React from 'react';
import { Menu, Search, Plus, ExternalLink } from 'lucide-react';
import { useAdminAuth } from '../../../contexts/AdminAuthContext';
import { Link } from 'react-router';
import { NotificationBell } from '../../notifications/NotificationBell';

export function AdminHeader({ setMobileOpen }: { setMobileOpen: (v: boolean) => void }) {
  const { user } = useAdminAuth();

  return (
    <header className="h-16 bg-white border-b border-neutral-200 sticky top-0 z-30 flex items-center justify-between px-4 lg:px-8">
      <div className="flex items-center gap-4">
        <button 
          onClick={() => setMobileOpen(true)}
          className="lg:hidden p-2 -ml-2 text-neutral-600 hover:text-neutral-900 rounded-lg hover:bg-neutral-100"
        >
          <Menu className="w-5 h-5" />
        </button>
        
        {/* Global Search */}
        <div className="hidden md:flex items-center relative">
          <Search className="w-4 h-4 text-neutral-400 absolute left-3" />
          <input 
            type="text" 
            placeholder="Search products, retailers, orders..." 
            className="pl-9 pr-4 py-2 w-72 lg:w-96 bg-neutral-100 border-transparent rounded-lg text-sm focus:bg-white focus:border-neutral-300 focus:ring-2 focus:ring-neutral-200 transition-all outline-none"
          />
          <div className="absolute right-3 hidden lg:flex items-center gap-1">
            <kbd className="font-sans text-[10px] font-medium text-neutral-400 bg-white border border-neutral-200 px-1.5 py-0.5 rounded">⌘</kbd>
            <kbd className="font-sans text-[10px] font-medium text-neutral-400 bg-white border border-neutral-200 px-1.5 py-0.5 rounded">K</kbd>
          </div>
        </div>
      </div>

      <div className="flex items-center gap-2 sm:gap-4">
        <a 
          href="/" 
          target="_blank" 
          rel="noopener noreferrer"
          className="hidden sm:flex items-center gap-2 text-sm text-neutral-600 hover:text-neutral-900 px-3 py-1.5 rounded-lg hover:bg-neutral-100 transition-colors"
        >
          <ExternalLink className="w-4 h-4" />
          <span className="hidden lg:inline">View Store</span>
        </a>
        
        <div className="w-px h-6 bg-neutral-200 hidden sm:block mx-1"></div>

        <NotificationBell userId="Admin" />
        
        <Link to="/admin/profile" className="flex items-center gap-3 pl-2 sm:pl-4">
          <div className="w-8 h-8 rounded-full bg-neutral-200 overflow-hidden flex items-center justify-center border border-neutral-300">
            {user?.profilePicture ? (
              <img src={user.profilePicture} alt={user.name} className="w-full h-full object-cover" />
            ) : (
              <span className="text-xs font-medium text-neutral-600">
                {user?.name.charAt(0) || 'A'}
              </span>
            )}
          </div>
          <div className="hidden md:block text-left">
            <p className="text-sm font-medium text-neutral-900 leading-tight">{user?.name}</p>
            <p className="text-xs text-neutral-500 leading-tight">{user?.role}</p>
          </div>
        </Link>
      </div>
    </header>
  );
}
