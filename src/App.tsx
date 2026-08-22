/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React from 'react';
import { BrowserRouter, Routes, Route } from 'react-router';
import { HelmetProvider } from 'react-helmet-async';
import { Layout } from './components/layout/Layout';
import { Home } from './pages/Home';
import { Login } from './pages/Login';
import { Profile } from './pages/Profile';
import { CategoryPage } from './pages/CategoryPage';
import { Cart } from './pages/Cart';
import { ProductPage } from './pages/ProductPage';
import { Checkout } from './pages/Checkout';
import { OrderConfirmation } from './pages/OrderConfirmation';
import { OrderDetails } from './pages/OrderDetails';
import { AdminOrders } from './pages/admin/AdminOrders';
import { AdminOrderDetails } from './pages/admin/AdminOrderDetails';
import { CartProvider } from './contexts/CartContext';
import { FavoritesProvider } from './contexts/FavoritesContext';
import { RecentViewProvider } from './contexts/RecentViewContext';
import { SettingsProvider } from './contexts/SettingsContext';
import { AdminAuthProvider } from './contexts/AdminAuthContext';
import { AdminDataProvider } from './contexts/AdminDataContext';
import { RetailerAuthProvider } from './contexts/RetailerAuthContext';

// Admin Imports
import { AdminLayout } from './components/admin/layout/AdminLayout';
import { AdminLogin } from './pages/admin/AdminLogin';
import { AdminDashboard } from './pages/admin/AdminDashboard';
import { AdminProfile } from './pages/admin/AdminProfile';
import { AdminProducts } from './pages/admin/AdminProducts';
import { AdminProductEdit } from './pages/admin/AdminProductEdit';
import { AdminCategories } from './pages/admin/AdminCategories';
import { AdminInventory } from './pages/admin/AdminInventory';
import { AdminRetailers } from './pages/admin/AdminRetailers';
import { AdminRetailerProfile } from './pages/admin/AdminRetailerProfile';
import { AdminContent } from './pages/admin/AdminContent';
import { AdminMasterData } from './pages/admin/AdminMasterData';
import { AdminBusinessProfile } from './pages/admin/AdminBusinessProfile';
import { AdminPromotions } from './pages/admin/AdminPromotions';
import { AdminMediaLibrary } from './pages/admin/AdminMediaLibrary';
import { AdminSettings } from './pages/admin/AdminSettings';
import { ToastProvider } from './components/ui/Toast';

import { Register } from './pages/Register';

import { StoreProvider } from './contexts/StoreContext';
import { MasterDataProvider } from './contexts/MasterDataContext';

export default function App() {
  return (
    <HelmetProvider>
      <ToastProvider>
        <StoreProvider>
        <MasterDataProvider>
        <RetailerAuthProvider>
        <AdminAuthProvider>
          <SettingsProvider>
            <FavoritesProvider>
              <RecentViewProvider>
                <CartProvider>
                <BrowserRouter>
                  <Routes>
                    {/* Retailer App Routes */}
                    <Route path="/" element={<Layout />}>
                      <Route index element={<Home />} />
                      <Route path="login" element={<Login />} />
                      <Route path="register" element={<Register />} />
                      <Route path="profile" element={<Profile />} />
                      <Route path="category/:slug" element={<CategoryPage />} />
                      <Route path="product/:id" element={<ProductPage />} />
                      <Route path="cart" element={<Cart />} />
                      <Route path="checkout" element={<Checkout />} />
                      <Route path="order-confirmation/:id" element={<OrderConfirmation />} />
                      <Route path="order/:id" element={<OrderDetails />} />
                      <Route path="*" element={<div className="p-20 text-center text-muted-foreground">Page not found</div>} />
                    </Route>

                    {/* Admin Business Portal Routes */}
                    <Route path="/admin/login" element={<AdminLogin />} />
                    <Route path="/admin" element={
                      <AdminDataProvider>
                        <AdminLayout />
                      </AdminDataProvider>
                    }>
                      <Route index element={<AdminDashboard />} />
                      <Route path="dashboard" element={<AdminDashboard />} />
                      <Route path="profile" element={<AdminProfile />} />
                      <Route path="products" element={<AdminProducts />} />
                      <Route path="products/:id" element={<AdminProductEdit />} />
                      <Route path="products/:id/edit" element={<AdminProductEdit />} />
                      <Route path="categories" element={<AdminCategories />} />
                      {/* Placeholders for future pages */}
                      <Route path="inventory" element={<AdminInventory />} />
                      <Route path="retailers" element={<AdminRetailers />} />
                      <Route path="retailers/:id" element={<AdminRetailerProfile />} />
                      <Route path="orders" element={<AdminOrders />} />
                      <Route path="orders/:id" element={<AdminOrderDetails />} />
                      <Route path="content" element={<AdminContent />} />
                      <Route path="master-data" element={<AdminMasterData />} />
                      <Route path="business-profile" element={<AdminBusinessProfile />} />
                      <Route path="promotions" element={<AdminPromotions />} />
                      <Route path="media" element={<AdminMediaLibrary />} />
                      <Route path="reports" element={<div className="p-8"><h1 className="text-2xl font-semibold">Reports</h1><p className="text-neutral-500 mt-2">Analytics and exports workspace.</p></div>} />
                      <Route path="settings" element={<AdminSettings />} />
                    </Route>
                  </Routes>
                </BrowserRouter>
              </CartProvider>
            </RecentViewProvider>
          </FavoritesProvider>
        </SettingsProvider>
      </AdminAuthProvider>
      </RetailerAuthProvider>
      </MasterDataProvider>
      </StoreProvider>
      </ToastProvider>
    </HelmetProvider>
  );
}




