import type { ComponentType } from 'react';
import {
  Eye,
  FileText,
  FolderTree,
  HelpCircle,
  House,
  ImagePlus,
  Images,
  Package,
  Palette,
  ShoppingCart,
  Zap,
} from 'lucide-react';

export type NavItem = {
  title: string;
  href: string;
  icon: ComponentType<{ className?: string }>;
};

export type NavSection = {
  /** Omitted for the first, main section. */
  title?: string;
  items: NavItem[];
};

export const navigation: NavSection[] = [
  {
    items: [
      { title: 'Inicio', href: '/', icon: House },
      { title: 'Catálogo', href: '/products', icon: Package },
      { title: 'Estado de publicación', href: '/publicacion', icon: Eye },
      { title: 'Categorías', href: '/categories', icon: FolderTree },
      { title: 'Carruseles', href: '/carousels', icon: Images },
      { title: 'Órdenes', href: '/orders', icon: ShoppingCart },
    ],
  },
  {
    title: 'Tienda',
    items: [
      { title: 'Apariencia', href: '/storefront', icon: Palette },
      { title: 'Preguntas frecuentes', href: '/content/faq', icon: HelpCircle },
      { title: 'Términos y condiciones', href: '/content/terms', icon: FileText },
    ],
  },
  {
    title: 'Herramientas',
    items: [
      { title: 'Importación en 1 Click', href: '/herramientas/importacion-1-click', icon: Zap },
      { title: 'Banco de imágenes', href: '/herramientas/imagenes', icon: ImagePlus },
    ],
  },
];

export function isNavItemActive(href: string, pathname: string): boolean {
  if (href === '/') return pathname === '/';
  return pathname === href || pathname.startsWith(`${href}/`);
}
