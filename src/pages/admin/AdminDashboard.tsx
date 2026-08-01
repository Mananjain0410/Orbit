import React, { useState, useEffect } from 'react';
import { SEO } from '../../components/SEO';
import { useAdminAuth } from '../../contexts/AdminAuthContext';
import { productService } from '../../services/productService';
import { categoryService } from '../../services/categoryService';
import { retailerService } from '../../services/retailerService';
import { orderService } from '../../services/orderService';
import { Product, Category, Retailer, Order } from '../../types';
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
  ArrowRight,
  Activity
} from 'lucide-react';
import { Link } from 'react-router';

// Reusable Stat Card
function StatCard({ title, value, icon: Icon, trendLabel }: any) {
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
      {trendLabel && (
        <p className="text-xs text-neutral-500 mt-2 flex items-center gap-1">
          {trendLabel}
        </p>
      )}
    </div>
  );
}

interface ActivityItem {
  id: string;
  title: string;
  description: string;
  timestamp: Date;
  type: 'retailer' | 'order' | 'product';
}

export function AdminDashboard() {
  const { user } = useAdminAuth();
  
  const [products, setProducts] = useState<Product[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [retailers, setRetailers] = useState<Retailer[]>([]);
  const [orders, setOrders] = useState<Order[]>([]);

  useEffect(() => {
    const unsubProducts = productService.subscribeToAllProducts(true, (data) => {
      setProducts(data);
    });
    
    const unsubCategories = categoryService.subscribeToAllCategories(true, (data) => {
      setCategories(data);
    });
    
    const unsubRetailers = retailerService.subscribeToAllRetailers((data) => {
      setRetailers(data);
    });
    
    const unsubOrders = orderService.subscribeToAllOrders((data) => {
      setOrders(data);
    });

    return () => {
      unsubProducts();
      unsubCategories();
      unsubRetailers();
      unsubOrders();
    };
  }, []);

  const totalProducts = products.length;
  const totalCategories = categories.length;
  const totalRetailers = retailers.length;
  const pendingOrders = orders.filter(o => o.status === 'Pending').length;

  const publishedProducts = products.filter(p => p.status === 'Published').length;
  const draftProducts = products.filter(p => p.status === 'Draft' || !p.status).length;
  const lowStockProducts = products.filter(p => p.inStock && p.colors && p.colors.some(c => c.stock > 0 && c.stock < 50)).length;
  const outOfStockProducts = products.filter(p => !p.inStock || (p.colors && p.colors.every(c => c.stock === 0))).length;

  // Build real dynamic recent activity from Firestore data
  const activities: ActivityItem[] = [];

  retailers.forEach(r => {
    if (r.createdAt) {
      activities.push({
        id: `ret-${r.uid}`,
        title: 'New Retailer Registered',
        description: `${r.firmName || r.ownerName} created an account.`,
        timestamp: new Date(r.createdAt),
        type: 'retailer'
      });
    }
  });

  orders.forEach(o => {
    if (o.createdAt) {
      activities.push({
        id: `ord-${o.id}`,
        title: `Order ${o.orderNumber || ''} ${o.status}`,
        description: `${o.retailerFirmName || 'Retailer'} placed order worth ₹${o.estimatedValue?.toLocaleString() || 0}.`,
        timestamp: new Date(o.createdAt),
        type: 'order'
      });
    }
  });

  products.forEach(p => {
    if (p.createdAt) {
      activities.push({
        id: `prod-${p.id}`,
        title: 'Product Added',
        description: `${p.fabric} (${p.patternNumber})`,
        timestamp: new Date(p.createdAt),
        type: 'product'
      });
    }
  });

  activities.sort((a, b) => b.timestamp.getTime() - a.timestamp.getTime());
  const recentActivities = activities.slice(0, 5);

  const formatTimeAgo = (date: Date) => {
    const seconds = Math.floor((new Date().getTime() - date.getTime()) / 1000);
    if (seconds < 60) return 'Just now';
    const minutes = Math.floor(seconds / 60);
    if (minutes < 60) return `${minutes}m ago`;
    const hours = Math.floor(minutes / 60);
    if (hours < 24) return `${hours}h ago`;
    const days = Math.floor(hours / 24);
    return `${days}d ago`;
  };

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
        <StatCard title="Total Products" value={totalProducts} icon={Package} />
        <StatCard title="Total Categories" value={totalCategories} icon={Tags} />
        <StatCard title="Total Retailers" value={totalRetailers} icon={Users} />
        <StatCard title="Pending Orders" value={pendingOrders} icon={ShoppingCart} trendLabel="requires action" />
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
                  <p className="text-xl font-semibold">{publishedProducts}</p>
                </div>
                <div>
                  <p className="text-xs text-neutral-500 mb-1">Draft Products</p>
                  <p className="text-xl font-semibold">{draftProducts}</p>
                </div>
                <Link to="/admin/inventory?status=low" className="block hover:bg-neutral-50 p-2 -m-2 rounded-lg transition-colors cursor-pointer">
                  <p className="text-xs text-neutral-500 mb-1">Low Stock</p>
                  <p className="text-xl font-semibold text-amber-600">{lowStockProducts}</p>
                </Link>
                <Link to="/admin/inventory?status=out" className="block hover:bg-neutral-50 p-2 -m-2 rounded-lg transition-colors cursor-pointer">
                  <p className="text-xs text-neutral-500 mb-1">Out of Stock</p>
                  <p className="text-xl font-semibold text-red-600">{outOfStockProducts}</p>
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
            {recentActivities.length > 0 ? (
              <div className="space-y-6">
                {recentActivities.map((act, index) => (
                  <div key={act.id} className="relative flex items-start gap-4">
                    <div className={`w-2 h-2 rounded-full mt-2 flex-shrink-0 z-10 ${index === 0 ? 'bg-neutral-900' : 'bg-neutral-300'}`}></div>
                    <div>
                      <p className="text-sm font-medium">{act.title}</p>
                      <p className="text-xs text-neutral-500 mt-1">{act.description}</p>
                      <span className="text-[10px] text-neutral-400 mt-1 flex items-center gap-1">
                        <Clock className="w-3 h-3" /> {formatTimeAgo(act.timestamp)}
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="text-center py-12 text-neutral-400 text-sm flex flex-col items-center">
                <Activity className="w-8 h-8 mb-2 opacity-50" />
                <p>No recent activity logged</p>
              </div>
            )}
          </div>
          <div className="p-4 border-t border-neutral-100 bg-neutral-50">
            <Link to="/admin/orders" className="text-sm text-neutral-600 font-medium hover:text-neutral-900 flex items-center gap-1 w-full justify-center">
              View all orders <ArrowRight className="w-4 h-4" />
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
