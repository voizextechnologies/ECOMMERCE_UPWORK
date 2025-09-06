import React from 'react';
import { BrowserRouter, Routes, Route, Navigate, useLocation } from 'react-router-dom'; // Import useLocation
import { AppProvider } from './contexts/AppContext';
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
import { useAuth } from './hooks/useSupabase';

// Placeholder for Admin Dashboard Page
function AdminDashboardPage() {
  return (
    <div className="p-6">
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
  const { user, loading } = useAuth();

  if (loading) {
    return <div className="min-h-screen flex items-center justify-center">Loading...</div>;
  }

  if (!user) {
    // Not logged in, redirect to admin login page
    return <Navigate to="/admin/login" replace />;
  }

  if (adminOnly && user.role !== 'admin') {
    // Logged in but not an admin, redirect to home or show access denied
    return <Navigate to="/" replace />;
  }

  return <>{children}</>;
}


function App() {
  const location = useLocation(); // Get current location
  const isAdminRoute = location.pathname.startsWith('/admin'); // Check if it's an admin route

  return (
    <AppProvider>
      <BrowserRouter>
        <div className="min-h-screen bg-brown-300">
          {!isAdminRoute && <Header />} {/* Conditionally render Header */}
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
                        {/* Placeholder for future admin routes */}
                        {/* <Route path="products" element={<AdminProductListPage />} /> */}
                        {/* <Route path="categories" element={<AdminCategoryListPage />} /> */}
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
          {!isAdminRoute && <Footer />} {/* Conditionally render Footer */}
          <MiniCart />
        </div>
      </BrowserRouter>
    </AppProvider>
  );
}

export default App;
