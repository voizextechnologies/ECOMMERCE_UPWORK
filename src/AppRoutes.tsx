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
import { useApp } from './contexts/AppContext';
import { SellerRegisterPage } from './pages/SellerRegisterPage';
// Import new admin product pages
import { AdminProductListPage } from './pages/AdminProductListPage';
import { AdminAddProductPage } from './pages/AdminAddProductPage';
import { AdminEditProductPage } from './pages/AdminEditProductPage';
import { RegisterPage } from './pages/RegisterPage';
import { AccountDashboardPage } from './pages/AccountDashboardPage';
import { CartPage } from './pages/CartPage';
import { LoginPage } from './pages/LoginPage';
import { CheckoutPage } from './pages/CheckoutPage';
import { OrderConfirmationPage } from './pages/OrderConfirmationPage';
import { WishlistPage } from './pages/WishlistPage';
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
import { DIYArticleDetailPage } from './pages/DIYArticleDetailPage';
import { ServiceDetailPage } from './pages/ServiceDetailPage';
// Import the new AdminDashboardPage
import { AdminDashboardPage } from './pages/AdminDashboardPage';
// Import AdminGlobalSettingsPage
import { AdminGlobalSettingsPage } from './pages/AdminGlobalSettingsPage';
// NEW IMPORTS FOR SELLER DASHBOARD
import { SellerProtectedRoute } from './components/auth/SellerProtectedRoute';
import { SellerLayout } from './components/layout/SellerLayout';
import { SellerDashboardPage } from './pages/SellerDashboardPage';
import { SellerProductListPage } from './pages/SellerProductListPage';
import { SellerAddProductPage } from './pages/SellerAddProductPage';
import { SellerEditProductPage } from './pages/SellerEditProductPage';
import { SellerCategoryDepartmentListPage } from './pages/SellerCategoryDepartmentListPage';
import { SellerAddCategoryPage } from './pages/SellerAddCategoryPage';
import { SellerEditCategoryPage } from './pages/SellerEditCategoryPage';
import { SellerSettingsPage } from './pages/SellerSettingsPage';
import { SellerOrderListPage } from './pages/SellerOrderListPage';
import { SellerOrderDetailPage } from './pages/SellerOrderDetailPage';
import { OrderTrackingPage } from './pages/OrderTrackingPage';

// ProtectedRoute component to guard routes based on authentication
interface ProtectedRouteProps {
  children: React.ReactNode;
  requiredRole?: 'admin' | 'seller' | 'customer';
}

function ProtectedRoute({ children, requiredRole }: ProtectedRouteProps) {
  const { state: { user, authLoading } } = useApp();

  if (authLoading) {
    return <div className="min-h-screen flex items-center justify-center">Loading...</div>;
  }

  if (!user) {
    return <Navigate to="/login" replace />;
  }

  if (requiredRole) {
    // Allow admins to access customer and seller routes
    if (user.role === 'admin' && (requiredRole === 'customer' || requiredRole === 'seller')) {
      return <>{children}</>;
    }
    // Allow sellers to access customer routes (e.g., /account)
    if (requiredRole === 'customer' && user.role === 'seller') {
      return <>{children}</>;
    }
    // Restrict access if role doesn't match
    if (user.role !== requiredRole) {
      return <Navigate to="/" replace />;
    }
  }

  return <>{children}</>;
}

export function AppRoutes() {
  const location = useLocation();
  const isAdminRoute = location.pathname.startsWith('/admin');
  const isSellerRoute = location.pathname.startsWith('/seller');
  const isAuthRoute = location.pathname === '/register' || location.pathname === '/login' || location.pathname === '/seller-register';

  return (
    <div className="min-h-screen bg-brown-300 overflow-x-hidden">
      {!isAdminRoute && !isSellerRoute && !isAuthRoute && <Header />}
      <main className={!isAdminRoute && !isSellerRoute && !isAuthRoute ? "pt-36" : ""}>
        <Routes>
          {/* Public Routes */}
          <Route path="/" element={
            <>
              <HeroSlider />
              <ShopByCategory />
              <FeaturedDepartments />
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
          <Route path="/services" element={<ServicesPage />} />
          <Route path="/services/:slug" element={<ServiceDetailPage />} />
          <Route path="/diy-advice" element={<DIYAdvicePage />} />
          <Route path="/diy-advice/:slug" element={<DIYArticleDetailPage />} />
          <Route path="/wishlist" element={<WishlistPage />} />
          <Route path="/seller-register" element={<SellerRegisterPage />} />
          {/* Protected User Routes (Customer/General User) */}
          <Route
            path="/account"
            element={
              <ProtectedRoute requiredRole="customer">
                <AccountDashboardPage />
              </ProtectedRoute>
            }
          />
          <Route
            path="/checkout"
            element={
              <ProtectedRoute requiredRole="customer">
                <CheckoutPage />
              </ProtectedRoute>
            }
          />
          <Route path="/order-confirmation" element={<OrderConfirmationPage />} />
          <Route
            path="/orders/:id/track"
            element={
              <ProtectedRoute requiredRole="customer">
                <OrderTrackingPage />
              </ProtectedRoute>
            }
          />
          {/* Admin Login Route */}
          <Route path="/admin/login" element={<AdminLoginPage />} />
          {/* Admin Protected Routes */}
          <Route
            path="/admin/*"
            element={
              <ProtectedRoute requiredRole="admin">
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
                    {/* Admin Global Settings Route */}
                    <Route path="settings" element={<AdminGlobalSettingsPage />} />
                  </Routes>
                </AdminLayout>
              </ProtectedRoute>
            }
          />
          {/* Seller Protected Routes */}
          <Route
            path="/seller/*"
            element={
              <SellerProtectedRoute>
                <SellerLayout>
                  <Routes>
                    <Route index element={<SellerDashboardPage />} />
                    <Route path="products" element={<SellerProductListPage />} />
                    <Route path="products/new" element={<SellerAddProductPage />} />
                    <Route path="products/:id/edit" element={<SellerEditProductPage />} />
                    <Route path="categories" element={<SellerCategoryDepartmentListPage />} />
                    <Route path="categories/new-category" element={<SellerAddCategoryPage />} />
                    <Route path="categories/categories/:id/edit" element={<SellerEditCategoryPage />} />
                    <Route path="orders" element={<SellerOrderListPage />} />
                    <Route path="orders/:id" element={<SellerOrderDetailPage />} />
                    <Route path="settings" element={<SellerSettingsPage />} />
                  </Routes>
                </SellerLayout>
              </SellerProtectedRoute>
            }
          />
        </Routes>
      </main>
      {!isAdminRoute && !isSellerRoute && !isAuthRoute && <Footer />}
      <MiniCart />
    </div>
  );
}