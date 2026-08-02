import React from 'react';
import { Link, useLocation } from 'react-router';
import { 
  LayoutDashboard, 
  Package, 
  Tags, 
  Archive, 
  Users, 
  ShoppingCart, 
  Globe, 
  Image as ImageIcon, 
  BarChart3, 
  Settings, 
  LogOut,
  ChevronLeft,
  ChevronRight,
  Database,
  Building2
} from 'lucide-react';
import { useAdminAuth } from '../../../contexts/AdminAuthContext';
import { cn } from '../../../lib/utils'; // wait, do we have cn? I'll use simple template strings if not.

// Reverting to template string for conditional classes just in case cn is not there.
export function AdminSidebar({ isCollapsed, setIsCollapsed, mobileOpen, setMobileOpen }: { 
  isCollapsed: boolean, 
  setIsCollapsed: (v: boolean) => void,
  mobileOpen: boolean,
  setMobileOpen: (v: boolean) => void
}) {
  const location = useLocation();
  const { logout } = useAdminAuth();

  const navItems = [
    { label: 'Dashboard', icon: LayoutDashboard, path: '/admin/dashboard' },
    { label: 'Products', icon: Package, path: '/admin/products' },
    { label: 'Categories', icon: Tags, path: '/admin/categories' },
    { label: 'Master Data', icon: Database, path: '/admin/master-data' },
    { label: 'Business Profile', icon: Building2, path: '/admin/business-profile' },
    { label: 'Inventory', icon: Archive, path: '/admin/inventory' },
    { label: 'Retailers', icon: Users, path: '/admin/retailers' },
    { label: 'Orders', icon: ShoppingCart, path: '/admin/orders' },
    { label: 'Website Content', icon: Globe, path: '/admin/content' },
    { label: 'Promotional Media', icon: ImageIcon, path: '/admin/promotions' },
    { label: 'Media Library', icon: ImageIcon, path: '/admin/media' },
    { label: 'Reports', icon: BarChart3, path: '/admin/reports' },
  ];

  return (
    <>
      {/* Mobile Backdrop */}
      {mobileOpen && (
        <div 
          className="fixed inset-0 bg-neutral-900/50 z-40 lg:hidden backdrop-blur-sm"
          onClick={() => setMobileOpen(false)}
        />
      )}

      <aside 
        className={`fixed top-0 left-0 z-50 h-screen bg-white border-r border-neutral-200 transition-all duration-300 flex flex-col
          ${isCollapsed ? 'w-20' : 'w-64'}
          ${mobileOpen ? 'translate-x-0' : '-translate-x-full lg:translate-x-0'}
        `}
      >
        <div className="h-16 flex items-center justify-between px-4 border-b border-neutral-200">
          <div className="flex items-center gap-3 overflow-hidden whitespace-nowrap">
            <div className="w-8 h-8 bg-neutral-900 rounded flex items-center justify-center flex-shrink-0">
              <span className="text-white font-serif font-bold text-sm leading-none">M.</span>
            </div>
            {!isCollapsed && <span className="font-semibold text-neutral-900 tracking-tight text-sm">Business Portal</span>}
          </div>
        </div>

        <div className="flex-1 overflow-y-auto py-4 flex flex-col gap-1 px-3">
          {navItems.map((item) => {
            const isActive = location.pathname === item.path || location.pathname.startsWith(`${item.path}/`);
            return (
              <Link 
                key={item.path} 
                to={item.path}
                onClick={() => setMobileOpen(false)}
                className={`flex items-center gap-3 px-3 py-2.5 rounded-lg transition-colors group relative
                  ${isActive ? 'bg-neutral-100 text-neutral-900 font-medium' : 'text-neutral-600 hover:bg-neutral-50 hover:text-neutral-900'}
                  ${isCollapsed ? 'justify-center' : ''}
                `}
              >
                <item.icon className={`w-5 h-5 flex-shrink-0 ${isActive ? 'text-neutral-900' : 'text-neutral-500 group-hover:text-neutral-700'}`} />
                {!isCollapsed && <span className="text-sm truncate">{item.label}</span>}
                {isCollapsed && (
                  <div className="absolute left-full ml-2 px-2 py-1 bg-neutral-800 text-white text-xs rounded opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all whitespace-nowrap z-50 pointer-events-none">
                    {item.label}
                  </div>
                )}
              </Link>
            );
          })}
        </div>

        <div className="p-3 border-t border-neutral-200 flex flex-col gap-1">
          <Link 
            to="/admin/settings"
            onClick={() => setMobileOpen(false)}
            className={`flex items-center gap-3 px-3 py-2.5 rounded-lg transition-colors group relative
              ${location.pathname === '/admin/settings' ? 'bg-neutral-100 text-neutral-900 font-medium' : 'text-neutral-600 hover:bg-neutral-50 hover:text-neutral-900'}
              ${isCollapsed ? 'justify-center' : ''}
            `}
          >
            <Settings className={`w-5 h-5 flex-shrink-0 ${location.pathname === '/admin/settings' ? 'text-neutral-900' : 'text-neutral-500 group-hover:text-neutral-700'}`} />
            {!isCollapsed && <span className="text-sm truncate">Settings</span>}
            {isCollapsed && (
              <div className="absolute left-full ml-2 px-2 py-1 bg-neutral-800 text-white text-xs rounded opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all whitespace-nowrap z-50 pointer-events-none">
                Settings
              </div>
            )}
          </Link>
          
          <button 
            onClick={() => {
              logout();
              setMobileOpen(false);
            }}
            className={`flex items-center gap-3 px-3 py-2.5 rounded-lg transition-colors group relative text-red-600 hover:bg-red-50 w-full
              ${isCollapsed ? 'justify-center' : ''}
            `}
          >
            <LogOut className="w-5 h-5 flex-shrink-0 text-red-500" />
            {!isCollapsed && <span className="text-sm truncate">Logout</span>}
            {isCollapsed && (
              <div className="absolute left-full ml-2 px-2 py-1 bg-neutral-800 text-white text-xs rounded opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all whitespace-nowrap z-50 pointer-events-none">
                Logout
              </div>
            )}
          </button>
        </div>
        
        {/* Collapse toggle (desktop only) */}
        <button 
          onClick={() => setIsCollapsed(!isCollapsed)}
          className="hidden lg:flex absolute -right-3 top-20 w-6 h-6 bg-white border border-neutral-200 rounded-full items-center justify-center text-neutral-500 hover:text-neutral-900 shadow-sm"
        >
          {isCollapsed ? <ChevronRight className="w-3 h-3" /> : <ChevronLeft className="w-3 h-3" />}
        </button>
      </aside>
    </>
  );
}
