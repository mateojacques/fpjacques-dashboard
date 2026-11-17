import { Routes, Route, Navigate } from 'react-router-dom';
import { ROUTES } from '@/lib/constants';
import { useAuth } from '@/hooks/useAuth';

// Layouts
import { MainLayout } from '@/components/layout/MainLayout';

// Auth pages
import { LoginPage } from '@/features/auth/pages/LoginPage';

// Common pages
import { NotFoundPage } from '@/components/common/NotFoundPage';

// Home
import { DashboardPage } from '@/features/dashboard/pages/DashboardPage';

// Product pages
import { ProductsListPage } from '@/features/products/pages/ProductsListPage';
import { ProductCreatePage } from '@/features/products/pages/ProductCreatePage';
import { ProductEditPage } from '@/features/products/pages/ProductEditPage';
import { ProductDetailPage } from '@/features/products/pages/ProductDetailPage';

// Category pages
import { CategoriesPage } from '@/features/categories/pages/CategoriesPage';

// Carousel pages
import { CarouselsPage } from '@/features/carousels/pages/CarouselsPage';
import { CarouselEditPage } from '@/features/carousels/pages/CarouselEditPage';

// Storefront config pages
import { StorefrontConfigPage } from '@/features/storefront-config/pages/StorefrontConfigPage';

// Content pages
import { FaqPage } from '@/features/content/pages/FaqPage';
import { TermsPage } from '@/features/content/pages/TermsPage';

// Tools pages
import { ImportDetailPage } from '@/features/tools/pages/ImportDetailPage';
import { BulkImagesPage } from '@/features/tools/pages/BulkImagesPage';
import { CatalogPage } from '@/features/catalog/pages/CatalogPage';
import { OneClickImportPage } from '@/features/tools/pages/OneClickImportPage';

// Order pages
import { OrdersListPage } from '@/features/orders/pages/OrdersListPage';
import { OrderDetailPage } from '@/features/orders/pages/OrderDetailPage';

// Protected Route wrapper
function ProtectedRoute({ children }: { children: React.ReactNode }) {
  const { isAuthenticated } = useAuth();

  if (!isAuthenticated) {
    return <Navigate to={ROUTES.LOGIN} replace />;
  }

  return <>{children}</>;
}

// Public Route wrapper (redirects to home if already logged in)
function PublicRoute({ children }: { children: React.ReactNode }) {
  const { isAuthenticated } = useAuth();

  if (isAuthenticated) {
    return <Navigate to={ROUTES.HOME} replace />;
  }

  return <>{children}</>;
}

export function AppRoutes() {
  return (
    <Routes>
      {/* Public routes */}
      <Route
        path={ROUTES.LOGIN}
        element={
          <PublicRoute>
            <LoginPage />
          </PublicRoute>
        }
      />

      {/* Protected routes */}
      <Route
        path="/"
        element={
          <ProtectedRoute>
            <MainLayout />
          </ProtectedRoute>
        }
      >
        <Route index element={<DashboardPage />} />

        {/* Catalogue (products) */}
        <Route path="products" element={<ProductsListPage />} />
        <Route path="products/new" element={<ProductCreatePage />} />
        <Route path="products/:id" element={<ProductDetailPage />} />
        <Route path="products/:id/edit" element={<ProductEditPage />} />

        {/* Publication status */}
        <Route path="publicacion" element={<CatalogPage />} />
        <Route path="catalogo" element={<Navigate to={ROUTES.PUBLICATION} replace />} />
        
        {/* Categories */}
        <Route path="categories" element={<CategoriesPage />} />
        
        {/* Carousels */}
        <Route path="carousels" element={<CarouselsPage />} />
        <Route path="carousels/:id" element={<CarouselEditPage />} />
        
        {/* Storefront Config */}
        <Route path="storefront" element={<StorefrontConfigPage />} />
        
        {/* Content */}
        <Route path="content/faq" element={<FaqPage />} />
        <Route path="content/terms" element={<TermsPage />} />
        <Route path="content/contact" element={<div className="p-6">Contact Page (Coming Soon)</div>} />
        
        {/* Tools */}
        <Route path="herramientas/importacion-1-click" element={<OneClickImportPage />} />
        <Route path="herramientas/importaciones/:id" element={<ImportDetailPage />} />
        <Route path="herramientas/imagenes" element={<BulkImagesPage />} />
        {/* Retired: the tools index, CSV import and DBF to CSV. 1-click import replaces them. */}
        {['herramientas', 'herramientas/importaciones', 'herramientas/importaciones/nueva', 'herramientas/convertir-dbf'].map(
          (path) => (
            <Route key={path} path={path} element={<Navigate to={ROUTES.IMPORT_ONE_CLICK} replace />} />
          )
        )}
        
        {/* Orders */}
        <Route path="orders" element={<OrdersListPage />} />
        <Route path="orders/:id" element={<OrderDetailPage />} />
      </Route>

      {/* 404 */}
      <Route path="*" element={<NotFoundPage />} />
    </Routes>
  );
}
