import React, { useState, useEffect } from 'react';
import { SEO } from '../../components/SEO';
import { useAdminAuth } from '../../contexts/AdminAuthContext';
import { productService } from '../../services/productService';
import { categoryService } from '../../services/categoryService';
import { retailerService } from '../../services/retailerService';
import { orderService } from '../../services/orderService';
import { 
  Package, 
  Tags, 
  Users, 
  ShoppingCart, 
  Plus, 
  LayoutTemplate, 
  Image as ImageIcon,
  ExternalLink,
  Clock,
  ArrowRight
} from 'lucide-react';
import { Link } from 'react-router';

// Reusable Stat Card
function StatCard({ title, value, icon: Icon, trend, trendLabel }: any) {
  return (
    <div className="bg-white p-6 rounded-xl border border-neutral-200 shadow-sm">
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-sm font-medium text-neutral-500">{title}</h3>
        <div className="w-10 h-10 rounded-lg bg-neutral-50 flex items-center justify-center text-neutral-700">
          <Icon className="w-5 h-5" />
        </div>
      </div>
      <div className="flex items-baseline gap-2">
        <span className="text-3xl font-semibold tracking-tight">{value}</span>
      </div>
      {trend !== undefined && (
        <p className="text-xs text-neutral-500 mt-2 flex items-center gap-1">
          <span className={trend > 0 ? 'text-green-600' : 'text-neutral-500'}>
            {trend > 0 ? '+' : ''}{trend}
          </span>
          {' '}{trendLabel}
        </p>
      )}
    </div>
  );
}

export function AdminDashboard() {
  const { user } = useAdminAuth();
  
  const [stats, setStats] = useState({
    products: 0,
    categories: 0,
    retailers: 0,
    orders: 0
  });

  useEffect(() => {
    const unsubProducts = productService.subscribeToAllProducts(true, (data) => {
      setStats(s => ({ ...s, products: data.length }));
    });
    
    const unsubCategories = categoryService.subscribeToAllCategories(true, (data) => {
      setStats(s => ({ ...s, categories: data.length }));
    });
    
    const unsubRetailers = retailerService.subscribeToAllRetailers((data) => {
      setStats(s => ({ ...s, retailers: data.length }));
    });
    
    const unsubOrders = orderService.subscribeToAllOrders((data) => {
      setStats(s => ({ ...s, orders: data.filter(o => o.status === 'Pending').length }));
    });

    return () => {
      unsubProducts();
      unsubCategories();
      unsubRetailers();
      unsubOrders();
    };
  }, []);

  return (
    <div className="max-w-6xl mx-auto space-y-8">
      <SEO title="Dashboard - Business Portal" />
      
      {/* Welcome Section */}
      <div>
        <h1 className="text-2xl font-semibold tracking-tight mb-1">Welcome back, {user?.name.split(' ')[0] || 'Admin'}</h1>
        <p className="text-neutral-500">Manage your wholesale business from one place.</p>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 md:gap-6">
        <StatCard title="Total Products" value={stats.products} icon={Package} />
        <StatCard title="Total Categories" value={stats.categories} icon={Tags} />
        <StatCard title="Total Retailers" value={stats.retailers} icon={Users} />
        <StatCard title="Pending Orders" value={stats.orders} icon={ShoppingCart} trendLabel="requires action" />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 md:gap-8">
        {/* Quick Actions */}
        <div className="lg:col-span-2 space-y-6">
          <div className="bg-white rounded-xl border border-neutral-200 shadow-sm overflow-hidden">
            <div className="px-6 py-5 border-b border-neutral-100 flex items-center justify-between">
              <h2 className="font-medium">Quick Actions</h2>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 p-3 gap-3">
              <Link to="/admin/products/new" className="flex items-center gap-4 p-4 rounded-lg hover:bg-neutral-50 border border-transparent hover:border-neutral-100 transition-colors group">
                <div className="w-10 h-10 rounded-full bg-neutral-100 flex items-center justify-center text-neutral-900 group-hover:bg-neutral-900 group-hover:text-white transition-colors">
                  <Plus className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="font-medium text-sm">Add Product</h3>
                  <p className="text-xs text-neutral-500 mt-0.5">Create a new wholesale listing</p>
                </div>
              </Link>

              <Link to="/admin/categories" className="flex items-center gap-4 p-4 rounded-lg hover:bg-neutral-50 border border-transparent hover:border-neutral-100 transition-colors group">
                <div className="w-10 h-10 rounded-full bg-neutral-100 flex items-center justify-center text-neutral-900 group-hover:bg-neutral-900 group-hover:text-white transition-colors">
                  <LayoutTemplate className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="font-medium text-sm">Manage Categories</h3>
                  <p className="text-xs text-neutral-500 mt-0.5">Organize your catalog</p>
                </div>
              </Link>

              <Link to="/admin/promotions" className="flex items-center gap-4 p-4 rounded-lg hover:bg-neutral-50 border border-transparent hover:border-neutral-100 transition-colors group">
                <div className="w-10 h-10 rounded-full bg-neutral-100 flex items-center justify-center text-neutral-900 group-hover:bg-neutral-900 group-hover:text-white transition-colors">
                  <ImageIcon className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="font-medium text-sm">Upload Banners</h3>
                  <p className="text-xs text-neutral-500 mt-0.5">Update homepage promotions</p>
                </div>
              </Link>

              <a href="/" target="_blank" rel="noopener noreferrer" className="flex items-center gap-4 p-4 rounded-lg hover:bg-neutral-50 border border-transparent hover:border-neutral-100 transition-colors group">
                <div className="w-10 h-10 rounded-full bg-neutral-100 flex items-center justify-center text-neutral-900 group-hover:bg-neutral-900 group-hover:text-white transition-colors">
                  <ExternalLink className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="font-medium text-sm">Preview Website</h3>
                  <p className="text-xs text-neutral-500 mt-0.5">See what retailers see</p>
                </div>
              </a>
            </div>
          </div>

          {/* Business Health */}
          <div className="bg-white rounded-xl border border-neutral-200 shadow-sm overflow-hidden">
            <div className="px-6 py-5 border-b border-neutral-100">
              <h2 className="font-medium">Business Health</h2>
            </div>
            <div className="p-6">
              <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
                <div>
                  <p className="text-xs text-neutral-500 mb-1">Published</p>
                  <p className="text-xl font-semibold">118</p>
                </div>
                <div>
                  <p className="text-xs text-neutral-500 mb-1">Draft Products</p>
                  <p className="text-xl font-semibold">6</p>
                </div>
                <Link to="/admin/inventory?status=low" className="block hover:bg-neutral-50 p-2 -m-2 rounded-lg transition-colors cursor-pointer">
                  <p className="text-xs text-neutral-500 mb-1">Low Stock</p>
                  <p className="text-xl font-semibold text-amber-600">3</p>
                </Link>
                <Link to="/admin/inventory?status=out" className="block hover:bg-neutral-50 p-2 -m-2 rounded-lg transition-colors cursor-pointer">
                  <p className="text-xs text-neutral-500 mb-1">Out of Stock</p>
                  <p className="text-xl font-semibold text-red-600">1</p>
                </Link>
              </div>
            </div>
          </div>
        </div>

        {/* Recent Activity */}
        <div className="bg-white rounded-xl border border-neutral-200 shadow-sm overflow-hidden flex flex-col">
          <div className="px-6 py-5 border-b border-neutral-100 flex items-center justify-between">
            <h2 className="font-medium">Recent Activity</h2>
          </div>
          <div className="flex-1 p-6">
            <div className="space-y-6">
              {/* Timeline Items */}
              <div className="relative flex items-start gap-4">
                <div className="w-2 h-2 rounded-full bg-neutral-900 mt-2 flex-shrink-0 z-10"></div>
                <div>
                  <p className="text-sm font-medium">New Retailer Registered</p>
                  <p className="text-xs text-neutral-500 mt-1">Sharma Textiles created an account.</p>
                  <span className="text-[10px] text-neutral-400 mt-1 flex items-center gap-1"><Clock className="w-3 h-3" /> 2 hours ago</span>
                </div>
              </div>
              <div className="relative flex items-start gap-4">
                <div className="w-2 h-2 rounded-full bg-neutral-300 mt-2 flex-shrink-0 z-10"></div>
                <div>
                  <p className="text-sm font-medium">Product Added</p>
                  <p className="text-xs text-neutral-500 mt-1">Linen Blend Kurta Set (MNFR-234)</p>
                  <span className="text-[10px] text-neutral-400 mt-1 flex items-center gap-1"><Clock className="w-3 h-3" /> 5 hours ago</span>
                </div>
              </div>
              <div className="relative flex items-start gap-4">
                <div className="w-2 h-2 rounded-full bg-neutral-300 mt-2 flex-shrink-0 z-10"></div>
                <div>
                  <p className="text-sm font-medium">Homepage Banner Updated</p>
                  <p className="text-xs text-neutral-500 mt-1">Summer Collection hero image updated.</p>
                  <span className="text-[10px] text-neutral-400 mt-1 flex items-center gap-1"><Clock className="w-3 h-3" /> Yesterday</span>
                </div>
              </div>
            </div>
          </div>
          <div className="p-4 border-t border-neutral-100 bg-neutral-50">
            <button className="text-sm text-neutral-600 font-medium hover:text-neutral-900 flex items-center gap-1 w-full justify-center">
              View all activity <ArrowRight className="w-4 h-4" />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
