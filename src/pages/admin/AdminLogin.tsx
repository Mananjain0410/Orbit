import React, { useState } from 'react';
import { useNavigate, Navigate } from 'react-router';
import { useAdminAuth } from '../../contexts/AdminAuthContext';
import { Button } from '../../components/ui/Button';
import { Input } from '../../components/ui/Input';
import { SEO } from '../../components/SEO';
import { ShieldAlert, Loader2 } from 'lucide-react';

import { auditLogService } from '../../services/auditLogService';

export function AdminLogin() {
  const { login, isAuthenticated } = useAdminAuth();
  const navigate = useNavigate();
  
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  if (isAuthenticated) {
    return <Navigate to="/admin/dashboard" replace />;
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setIsLoading(true);

    try {
      await login(email, password);
      await auditLogService.logAction('admin_login', `Admin user logged in: ${email}`);
      navigate('/admin/dashboard');
    } catch (err: any) {
      setError(err.message || 'Authentication failed');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-neutral-50 flex items-center justify-center p-4 font-sans">
      <SEO title="Business Portal Login" />
      
      <div className="max-w-md w-full bg-white border border-neutral-200 rounded-xl shadow-sm overflow-hidden">
        <div className="p-8 text-center border-b border-neutral-100 bg-neutral-50/50">
          <div className="w-12 h-12 bg-neutral-900 rounded-lg flex items-center justify-center mx-auto mb-4 shadow-sm">
            <span className="text-white font-serif font-bold text-xl leading-none">B.</span>
          </div>
          <h1 className="text-xl font-semibold text-neutral-900 tracking-tight">Business Portal</h1>
          <p className="text-sm text-neutral-500 mt-1">Sign in to manage your wholesale operations</p>
        </div>
        
        <div className="p-8">
          <form onSubmit={handleSubmit} className="space-y-5">
            {error && (
              <div className="bg-red-50 border border-red-100 text-red-600 px-4 py-3 rounded-lg text-sm flex items-start gap-3">
                <ShieldAlert className="w-5 h-5 flex-shrink-0 mt-0.5" />
                <p>{error}</p>
              </div>
            )}
            
            <div className="space-y-1.5">
              <label className="text-sm font-medium text-neutral-700" htmlFor="email">Email Address</label>
              <Input 
                id="email"
                type="email" 
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="admin@wholesale.com"
                className="w-full h-11 rounded-lg border-neutral-200 focus:border-neutral-900 focus:ring-neutral-900 bg-neutral-50/50 focus:bg-white transition-colors"
              />
            </div>
            
            <div className="space-y-1.5">
              <label className="text-sm font-medium text-neutral-700" htmlFor="password">Password</label>
              <Input 
                id="password"
                type="password" 
                required
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="••••••••"
                className="w-full h-11 rounded-lg border-neutral-200 focus:border-neutral-900 focus:ring-neutral-900 bg-neutral-50/50 focus:bg-white transition-colors"
              />
            </div>

            <Button 
              type="submit" 
              disabled={isLoading}
              className="w-full h-11 rounded-lg bg-neutral-900 hover:bg-neutral-800 text-white font-medium mt-2 transition-all shadow-sm"
            >
              {isLoading ? (
                <span className="flex items-center gap-2">
                  <Loader2 className="w-4 h-4 animate-spin" /> Authenticating...
                </span>
              ) : (
                'Sign In to Dashboard'
              )}
            </Button>
          </form>
          
          <div className="mt-8 text-center text-xs text-neutral-400">
            <p>Secure Business Portal &copy; {new Date().getFullYear()}</p>
            <p className="mt-1">For authorized personnel only.</p>
          </div>
        </div>
      </div>
    </div>
  );
}
