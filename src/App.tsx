import React from 'react';
import { BrowserRouter, Routes, Route } from 'react-router-dom';
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
import { ProductDetailPage } from './pages/ProductDetailPage'; // Import the new ProductDetailPage

function App() {
  return (
    <AppProvider>
      <BrowserRouter>
        <div className="min-h-screen bg-brown-300">
          <Header />
          <main>
            <Routes>
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
              <Route path="/products/:slug" element={<ProductDetailPage />} /> {/* New route for product details */}
            </Routes>
          </main>
          <Footer />
          <MiniCart />
        </div>
      </BrowserRouter>
    </AppProvider>
  );
}

export default App;
