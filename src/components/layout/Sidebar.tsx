import { Link, NavLink, useLocation } from 'react-router-dom';
import { cn } from '@/lib/utils';
import { ScrollArea } from '@/components/ui/scroll-area';
import { StoreLogo } from '@/features/branding/components/StoreLogo';
import { useIsDark } from '@/features/branding/hooks';
import { usePanelThemeStore } from '@/features/branding/store';

import { isNavItemActive, navigation } from './navigation';

/** Whether the sidebar surface is dark, to pick the matching logo. */
function useSidebarIsDark(): boolean {
  const isDark = useIsDark();
  const sidebarStyle = usePanelThemeStore((s) => s.sidebarStyle);
  return isDark || sidebarStyle === 'brand';
}

export function SidebarBrand({ onNavigate }: { onNavigate?: () => void }) {
  const onDark = useSidebarIsDark();

  return (
    <Link
      to="/"
      onClick={onNavigate}
      aria-label="Ir al inicio"
      className="flex h-16 shrink-0 items-center px-4 text-sidebar-foreground outline-none focus-visible:ring-2 focus-visible:ring-inset focus-visible:ring-sidebar-ring"
    >
      <StoreLogo onDark={onDark} />
    </Link>
  );
}

export function SidebarNav({ onNavigate }: { onNavigate?: () => void }) {
  const { pathname } = useLocation();

  return (
    <nav aria-label="Principal" className="space-y-6 px-3 pb-6 pt-2">
      {navigation.map((section, index) => (
        <div key={section.title ?? index}>
          {section.title && (
            <h2 className="mb-1 px-2.5 text-xs font-medium text-sidebar-muted">{section.title}</h2>
          )}
          <ul className="space-y-0.5">
            {section.items.map((item) => {
              const isActive = isNavItemActive(item.href, pathname);

              return (
                <li key={item.href}>
                  <NavLink
                    to={item.href}
                    end={item.href === '/'}
                    onClick={onNavigate}
                    aria-current={isActive ? 'page' : undefined}
                    className={cn(
                      'flex h-9 items-center gap-2.5 rounded-md px-2.5 text-sm outline-none transition-colors duration-150',
                      'focus-visible:ring-2 focus-visible:ring-sidebar-ring',
                      isActive
                        ? 'bg-sidebar-accent font-medium text-sidebar-accent-foreground'
                        : 'text-sidebar-foreground hover:bg-sidebar-hover'
                    )}
                  >
                    <item.icon
                      className={cn('h-4 w-4 shrink-0', !isActive && 'text-sidebar-muted')}
                    />
                    <span className="truncate">{item.title}</span>
                  </NavLink>
                </li>
              );
            })}
          </ul>
        </div>
      ))}
    </nav>
  );
}

export function Sidebar() {
  return (
    <aside className="hidden w-64 shrink-0 border-r border-sidebar-border bg-sidebar md:flex md:flex-col">
      <SidebarBrand />
      <ScrollArea className="flex-1">
        <SidebarNav />
      </ScrollArea>
    </aside>
  );
}
