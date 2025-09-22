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
import { useApp } from './contexts/AppContext';

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

// NEW IMPORTS FOR SELLER DASHBOARD
import { SellerProtectedRoute } from './components/auth/SellerProtectedRoute'; // NEW
import { SellerLayout } from './components/layout/SellerLayout'; // NEW
import { SellerDashboardPage } from './pages/SellerDashboardPage'; // NEW
import { SellerProductListPage } from './pages/SellerProductListPage'; // NEW
import { SellerAddProductPage } from './pages/SellerAddProductPage'; // NEW
import { SellerEditProductPage } from './pages/SellerEditProductPage'; // NEW
import { SellerCategoryDepartmentListPage } from './pages/SellerCategoryDepartmentListPage'; // NEW
import { SellerAddDepartmentPage } => {
  const [query, setQuery] = useState('');
  const [results, setResults] = useState([]);

  const handleSearch = async () => {
    const response = await fetch(`/api/search?q=${query}`);
    const data = await response.json();
    setResults(data);
  };

  return (
    <div>
      <input type="text" value={query} onChange={(e) => setQuery(e.target.value)} />
      <button onClick={handleSearch}>Search</button>
      <ul>
        {results.map((result) => (
          <li key={result.id}>{result.name}</li>
        ))}
      </ul>
    </div>
  );
};
