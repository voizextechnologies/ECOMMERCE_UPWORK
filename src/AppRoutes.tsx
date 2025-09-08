// src/AppRoutes.tsx
import React from 'react';
import { Routes, Route, Navigate, useLocation } from 'react-router-dom';
import { Header } from './components/layout/Header';
import { Footer } from './components/layout/Footer';
import { HeroSlider } from './components/home/HeroSlider';
import { FeaturedDepartments } from './components/home/FeaturedDepartments';
import { ShopByCategory } from './components/home/ShopByCategory';
import { FeaturedCategoriesWeek } from './components/home/FeaturedCategoriesWeek';
import { InspiringIdeas } from './components/home/InspiringIdeas';
import { TrendingProducts } from './components/home/TrendingProducts';
import { PopularProducts } from './components/home/PopularProducts';
import { TrustBadges } from './components/home/TrustBadges';
import { MiniCart } from './components/cart/MiniCart';
import { ShopPage } from './pages/ShopPage';
import { ProductDetailPage } from './pages/ProductDetailPage';
import { AdminLayout } from './components/layout/AdminLayout';
import { AdminLoginPage } from './pages/AdminLoginPage';
import { useApp } from './contexts/AppContext'; // Import useApp instead of useAuth

// Import new admin product pages
import { AdminProductListPage } from './pages/AdminProductListPage';
import { AdminAddProductPage } from './pages/AdminAddProductPage';
import { AdminEditProductPage } from './pages/AdminEditProductPage';
import { RegisterPage } from './pages/RegisterPage';

// Placeholder for Admin Dashboard Page
function AdminDashboardPage() {
  return (
    <div> {/* Removed p-6 as padding is now handled by AdminLayout's inner div */}
      <h2 className="text-3xl font-bold text-brown-900 mb-6">Admin Dashboard</h2>
      <p className="text-brown-700">Welcome to the admin panel. Use the sidebar to navigate.</p>
    </div>
  );
}

// ProtectedRoute component to guard admin routes
interface ProtectedRouteProps {
  children: React.ReactNode;
  adminOnly?: boolean;
}

function ProtectedRoute({ children, adminOnly = false }: ProtectedRouteProps) {
  const { state: { user, authLoading } } = useApp(); // Get user and authLoading from AppContext

  console.log('ProtectedRoute rendering. User:', user, 'AuthLoading:', authLoading); // Updated log

  if (authLoading) { // Use authLoading from context
    console.log('ProtectedRoute: Still loading user session from AppContext...'); // Updated log
    return <div className="min-h-screen flex items-center justify-center">Loading...</div>;
  }

  if (!user) {
    console.log('ProtectedRoute: No user found, redirecting to /admin/login');
    return <Navigate to="/admin/login" replace />;
  }

  if (adminOnly && user.role !== 'admin') {
    console.log('ProtectedRoute: User is not admin, redirecting to /');
    return <Navigate to="/" replace />;
  }

  console.log('ProtectedRoute: User is authenticated and authorized. Rendering children.');
  return <>{children}</>;
}

export function AppRoutes() {
  const location = useLocation();
  const isAdminRoute = location.pathname.startsWith('/admin');

  return (
    <div className="min-h-screen bg-brown-300">
      {!isAdminRoute && <Header />}
      <main>
        <Routes>
          {/* Public Routes */}
          <Route path="/" element={
            <>
              <HeroSlider />
              <ShopByCategory />
              <FeaturedDepartments />
              <FeaturedCategoriesWeek />
              <InspiringIdeas />
              <TrendingProducts />
              <PopularProducts />
              <TrustBadges />
            </>
          } />
          <Route path="/shop" element={<ShopPage />} />
          <Route path="/products/:slug" element={<ProductDetailPage />} />
          <Route path="/register" element={<RegisterPage />} />

          {/* Admin Login Route */}
          <Route path="/admin/login" element={<AdminLoginPage />} />

          {/* Admin Protected Routes */}
          <Route
            path="/admin/*"
            element={
              <ProtectedRoute adminOnly>
                <AdminLayout>
                  <Routes>
                    <Route index element={<AdminDashboardPage />} />
                    {/* Admin Product Routes */}
                    <Route path="products" element={<AdminProductListPage />} />
                    <Route path="products/new" element={<AdminAddProductPage />} />
                    <Route path="products/:id/edit" element={<AdminEditProductPage />} />
                    {/* Placeholder for future admin routes */}
                    {/* <Route path="categories" element={<AdminCategoryListPage />} */}
                    {/* <Route path="orders" element={<AdminOrderListPage />} /> */}
                    {/* <Route path="users" element={<AdminUserListPage />} /> */}
                    {/* <Route path="articles" element={<AdminDIYArticleListPage />} /> */}
                    {/* <Route path="services" element={<AdminServiceListPage />} /> */}
                  </Routes>
                </AdminLayout>
              </ProtectedRoute>
            }
          />
        </Routes>
      </main>
      {!isAdminRoute && <Footer />}
      <MiniCart />
    </div>
  );
}

