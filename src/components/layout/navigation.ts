import type { ComponentType } from 'react';
import {
  FileText,
  FolderTree,
  HelpCircle,
  House,
  Images,
  Package,
  Palette,
  ShoppingCart,
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
];

export function isNavItemActive(href: string, pathname: string): boolean {
  if (href === '/') return pathname === '/';
  return pathname === href || pathname.startsWith(`${href}/`);
}
