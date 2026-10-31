import React, { useState } from 'react';
import { StoreProvider, useStore } from './context/StoreContext';
import { Navbar } from './components/layout/Navbar';
import { AnnouncementBar } from './components/layout/AnnouncementBar';
import { Footer } from './components/layout/Footer';
import { HeroSection } from './components/home/HeroSection';
import { ProductGrid } from './components/home/ProductGrid';
import { ProductDetailModal } from './components/products/ProductDetailModal';
import { CheckoutModal } from './components/checkout/CheckoutModal';
import { OrdersView } from './components/orders/OrdersView';
import { AdminDashboard } from './components/admin/AdminDashboard';
import { FloatingSupport } from './components/common/FloatingSupport';
import { Product } from './types';

const MainLayout: React.FC = () => {
  const { products, user, loading } = useStore();
  const [currentView, setCurrentView] = useState<'home' | 'orders' | 'admin'>('home');

  // Modal States
  const [selectedProduct, setSelectedProduct] = useState<Product | null>(null);
  const [checkoutProduct, setCheckoutProduct] = useState<Product | null>(null);
  const [isCheckoutOpen, setIsCheckoutOpen] = useState(false);

  const handleSelectProduct = (product: Product) => {
    setSelectedProduct(product);
  };

  const handleBuyNow = (product: Product) => {
    setSelectedProduct(null);
    setCheckoutProduct(product);
    setIsCheckoutOpen(true);
  };

  const scrollToProducts = () => {
    const el = document.getElementById('products-catalog');
    if (el) {
      el.scrollIntoView({ behavior: 'smooth' });
    }
  };

  return (
    <div className="min-h-screen flex flex-col justify-between selection:bg-accent/20 selection:text-accent">
      <div>
        {/* Top Announcement Bar */}
        <AnnouncementBar />

        {/* Apple-style Glassmorphism Navbar */}
        <Navbar currentView={currentView} setCurrentView={setCurrentView} />

        {/* Main Content Area */}
        <main className="w-full">
          {currentView === 'home' && (
            <>
              <HeroSection onExploreClick={scrollToProducts} />
              <ProductGrid
                products={products}
                onSelectProduct={handleSelectProduct}
                onBuyNow={handleBuyNow}
              />
            </>
          )}

          {currentView === 'orders' && (
            <OrdersView onGoShopping={() => setCurrentView('home')} />
          )}

          {currentView === 'admin' && (
            <AdminDashboard onBackToHome={() => setCurrentView('home')} />
          )}
        </main>
      </div>

      {/* Footer */}
      <Footer />

      {/* Floating Support Button & Popover */}
      <FloatingSupport />

      {/* Modals */}
      <ProductDetailModal
        product={selectedProduct}
        onClose={() => setSelectedProduct(null)}
        onBuyNow={handleBuyNow}
      />

      <CheckoutModal
        product={checkoutProduct}
        isOpen={isCheckoutOpen}
        onClose={() => {
          setIsCheckoutOpen(false);
          setCheckoutProduct(null);
        }}
        onViewOrders={() => setCurrentView('orders')}
      />
    </div>
  );
};

export function App() {
  return (
    <StoreProvider>
      <MainLayout />
    </StoreProvider>
  );
}

export default App;
