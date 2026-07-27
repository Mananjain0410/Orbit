import React from 'react';
import { Outlet, Link, useLocation } from 'react-router';
import { Header } from './Header';
import { Footer } from './Footer';
import { useRetailer } from '../../contexts/RetailerAuthContext';
import { ShieldAlert, Clock, ShoppingBag } from 'lucide-react';
import { Button } from '../ui/Button';

export function Layout() {
  const { retailer, loading } = useRetailer();
  const location = useLocation();

  const isProfilePage = location.pathname.includes('/profile');
  const isLoginPage = location.pathname.includes('/login') || location.pathname.includes('/register');

  const shouldBlock = !loading && retailer && (retailer.status === 'pending' || retailer.status === 'suspended') && !isProfilePage && !isLoginPage;

  return (
    <div className="relative flex min-h-screen flex-col">
      <Header />
      <main className="flex-1 flex flex-col">
        {shouldBlock ? (
          retailer.status === 'pending' ? (
            <div className="flex-1 flex flex-col items-center justify-center p-8 text-center max-w-md mx-auto my-20">
              <Clock className="w-16 h-16 text-amber-500 mb-6" />
              <h1 className="text-3xl font-serif mb-4">Account Pending</h1>
              <p className="text-muted-foreground mb-8">
                Your account is awaiting approval from the administrator. We will notify you once your account has been approved.
              </p>
              <Button asChild>
                <Link to="/profile">Go to Profile</Link>
              </Button>
            </div>
          ) : (
            <div className="flex-1 flex flex-col items-center justify-center p-8 text-center max-w-md mx-auto my-20">
              <ShieldAlert className="w-16 h-16 text-red-500 mb-6" />
              <h1 className="text-3xl font-serif mb-4">Account Suspended</h1>
              <p className="text-muted-foreground mb-8">
                Your account has been suspended. You cannot place orders at this time. Please contact support for more information.
              </p>
              <Button asChild>
                <Link to="/profile">Go to Profile</Link>
              </Button>
            </div>
          )
        ) : (
          <Outlet />
        )}
      </main>
      <Footer />
    </div>
  );
}
