// src/AppRoutes.tsx
import React from 'react';
import { Button } from './components/ui/Button';
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
import { AccountDashboardPage } from './pages/AccountDashboardPage';
import { CartPage } from './pages/CartPage';
import { LoginPage } from './pages/LoginPage';
import { CheckoutPage } from './pages/CheckoutPage'; // Import CheckoutPage
import { OrderConfirmationPage } from './pages/OrderConfirmationPage'; // Import OrderConfirmationPage

// Import new admin pages for Categories & Departments
import { AdminCategoryDepartmentListPage } from './pages/AdminCategoryDepartmentListPage';
import { AdminAddDepartmentPage } from './pages/AdminAddDepartmentPage';
import { AdminEditDepartmentPage } from './pages/AdminEditDepartmentPage';
import { AdminAddCategoryPage } from './pages/AdminAddCategoryPage';
import { AdminEditCategoryPage } from './pages/AdminEditCategoryPage';

// Import new admin pages for Orders
import { AdminOrderListPage } from './pages/AdminOrderListPage';
import { AdminOrderDetailPage } from './pages/AdminOrderDetailPage';

// Import new admin pages for Users
import { AdminUserListPage } from './pages/AdminUserListPage';
import { AdminEditUserPage } from './pages/AdminEditUserPage';

// Import new admin pages for DIY Articles
import { AdminDIYArticleListPage } from './pages/AdminDIYArticleListPage';
import { AdminAddDIYArticlePage } from './pages/AdminAddDIYArticlePage';
import { AdminEditDIYArticlePage } from './pages/AdminEditDIYArticlePage';

// Import new admin pages for Services
import { AdminServiceListPage } from './pages/AdminServiceListPage';
import { AdminAddServicePage } from './pages/AdminAddServicePage';
import { AdminEditServicePage } from './pages/AdminEditServicePage';

// Import new public pages for Services and DIY Advice
import { ServicesPage } from './pages/ServicesPage';
import { DIYAdvicePage } from './pages/DIYAdvicePage';


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
    console.log('ProtectedRoute: No user found, redirecting to /login');
    return <Navigate to="/login" replace />; // Changed redirect target to /login
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
  const isAuthRoute = location.pathname === '/register' || location.pathname === '/login';

  return (
    <div className="min-h-screen bg-brown-300">
      {!isAdminRoute && !isAuthRoute && <Header />}
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
          <Route path="/login" element={<LoginPage />} />
          <Route path="/cart" element={<CartPage />} />
          <Route path="/services" element={<ServicesPage />} /> {/* New Services Page Route */}
          <Route path="/diy-advice" element={<DIYAdvicePage />} /> {/* New DIY Advice Page Route */}

          {/* Protected User Routes */}
          <Route
            path="/account"
            element={
              <ProtectedRoute>
                <AccountDashboardPage />
              </ProtectedRoute>
            }
          />
          <Route
            path="/checkout"
            element={
              <ProtectedRoute>
                <CheckoutPage />
              </ProtectedRoute>
            }
          />
          <Route path="/order-confirmation" element={<OrderConfirmationPage />} />


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
                    
                    {/* Admin Categories & Departments Routes */}
                    <Route path="categories" element={<AdminCategoryDepartmentListPage />} />
                    <Route path="categories/new-department" element={<AdminAddDepartmentPage />} />
                    <Route path="categories/departments/:id/edit" element={<AdminEditDepartmentPage />} />
                    <Route path="categories/new-category" element={<AdminAddCategoryPage />} />
                    <Route path="categories/categories/:id/edit" element={<AdminEditCategoryPage />} />

                    {/* Admin Orders Routes */}
                    <Route path="orders" element={<AdminOrderListPage />} />
                    <Route path="orders/:id" element={<AdminOrderDetailPage />} />

                    {/* Admin Users Routes */}
                    <Route path="users" element={<AdminUserListPage />} />
                    <Route path="users/:id/edit" element={<AdminEditUserPage />} />

                    {/* Admin DIY Articles Routes */}
                    <Route path="articles" element={<AdminDIYArticleListPage />} />
                    <Route path="articles/new" element={<AdminAddDIYArticlePage />} />
                    <Route path="articles/:id/edit" element={<AdminEditDIYArticlePage />} />

                    {/* Admin Services Routes */}
                    <Route path="services" element={<AdminServiceListPage />} />
                    <Route path="services/new" element={<AdminAddServicePage />} />
                    <Route path="services/:id/edit" element={<AdminEditServicePage />} />

                  </Routes>
                </AdminLayout>
              </ProtectedRoute>
            }
          />
        </Routes>
      </main>
      {!isAdminRoute && !isAuthRoute && <Footer />}
      <MiniCart />
    </div>
  );
}
