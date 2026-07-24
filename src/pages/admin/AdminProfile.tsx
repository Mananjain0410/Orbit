import React from 'react';
import { SEO } from '../../components/SEO';
import { useAdminAuth } from '../../contexts/AdminAuthContext';
import { Button } from '../../components/ui/Button';
import { Input } from '../../components/ui/Input';
import { ShieldCheck, Mail, User, Clock, KeyRound } from 'lucide-react';

export function AdminProfile() {
  const { user } = useAdminAuth();

  return (
    <div className="max-w-4xl mx-auto space-y-8">
      <SEO title="Admin Profile - Business Portal" />
      
      <div>
        <h1 className="text-2xl font-semibold tracking-tight mb-1">Your Profile</h1>
        <p className="text-neutral-500">Manage your administrative account settings.</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 md:gap-8">
        
        {/* Profile Card */}
        <div className="md:col-span-1 space-y-6">
          <div className="bg-white rounded-xl border border-neutral-200 shadow-sm p-6 text-center">
            <div className="w-24 h-24 rounded-full bg-neutral-100 flex items-center justify-center border-4 border-white shadow-sm mx-auto mb-4 overflow-hidden">
              {user?.profilePicture ? (
                <img src={user.profilePicture} alt={user.name} className="w-full h-full object-cover" />
              ) : (
                <User className="w-10 h-10 text-neutral-400" />
              )}
            </div>
            <h2 className="text-lg font-medium text-neutral-900">{user?.name}</h2>
            <p className="text-sm text-neutral-500 mb-4">{user?.role}</p>
            
            <div className="flex items-center justify-center gap-1 text-xs font-medium text-green-700 bg-green-50 py-1.5 px-3 rounded-full inline-flex mx-auto">
              <ShieldCheck className="w-3.5 h-3.5" />
              Active Admin
            </div>
          </div>
          
          <div className="bg-white rounded-xl border border-neutral-200 shadow-sm p-5 space-y-4">
            <div>
              <p className="text-xs text-neutral-500 flex items-center gap-1.5 mb-1"><Mail className="w-3.5 h-3.5" /> Email</p>
              <p className="text-sm font-medium">{user?.email}</p>
            </div>
            <div>
              <p className="text-xs text-neutral-500 flex items-center gap-1.5 mb-1"><Clock className="w-3.5 h-3.5" /> Last Login</p>
              <p className="text-sm font-medium">
                {user?.lastLogin ? new Date(user.lastLogin).toLocaleString() : 'N/A'}
              </p>
            </div>
          </div>
        </div>

        {/* Change Password / Settings */}
        <div className="md:col-span-2 space-y-6">
          <div className="bg-white rounded-xl border border-neutral-200 shadow-sm overflow-hidden">
            <div className="px-6 py-5 border-b border-neutral-100">
              <h2 className="font-medium flex items-center gap-2"><User className="w-4 h-4" /> Personal Information</h2>
            </div>
            <div className="p-6 space-y-5">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
                <div className="space-y-1.5">
                  <label className="text-sm font-medium text-neutral-700">Full Name</label>
                  <Input defaultValue={user?.name} disabled className="bg-neutral-50" />
                </div>
                <div className="space-y-1.5">
                  <label className="text-sm font-medium text-neutral-700">Email Address</label>
                  <Input defaultValue={user?.email} disabled className="bg-neutral-50" />
                </div>
              </div>
              <p className="text-xs text-neutral-500">
                Administrative account details are managed through Firestore. Please contact the super admin to change these details.
              </p>
            </div>
          </div>

          <div className="bg-white rounded-xl border border-neutral-200 shadow-sm overflow-hidden">
            <div className="px-6 py-5 border-b border-neutral-100">
              <h2 className="font-medium flex items-center gap-2"><KeyRound className="w-4 h-4" /> Security Settings</h2>
            </div>
            <div className="p-6 space-y-5">
              <div className="space-y-1.5">
                <label className="text-sm font-medium text-neutral-700">Current Password</label>
                <Input type="password" placeholder="••••••••" />
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
                <div className="space-y-1.5">
                  <label className="text-sm font-medium text-neutral-700">New Password</label>
                  <Input type="password" placeholder="••••••••" />
                </div>
                <div className="space-y-1.5">
                  <label className="text-sm font-medium text-neutral-700">Confirm Password</label>
                  <Input type="password" placeholder="••••••••" />
                </div>
              </div>
              <Button className="bg-neutral-900 hover:bg-neutral-800 text-white rounded-lg">
                Update Password
              </Button>
            </div>
          </div>
        </div>
        
      </div>
    </div>
  );
}
