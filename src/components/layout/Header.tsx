import { useState } from 'react';
import { LogOut, Menu } from 'lucide-react';
import { useAuth } from '@/hooks/useAuth';
import { Button } from '@/components/ui/button';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { Sheet, SheetContent, SheetTitle, SheetTrigger } from '@/components/ui/sheet';
import { ScrollArea } from '@/components/ui/scroll-area';
import { PanelThemeMenu } from '@/features/branding/components/PanelThemeMenu';
import { StoreLogo } from '@/features/branding/components/StoreLogo';
import { useIsDark } from '@/features/branding/hooks';

import { SidebarBrand, SidebarNav } from './Sidebar';

export function Header() {
  const { user, logout } = useAuth();
  const isDark = useIsDark();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const closeMenu = () => setMobileMenuOpen(false);

  const initials =
    user?.fullName
      ?.split(' ')
      .map((n) => n[0])
      .join('')
      .toUpperCase()
      .slice(0, 2) ?? 'U';

  return (
    <header className="flex h-16 shrink-0 items-center gap-2 border-b bg-background px-4 md:px-6">
      {/* Mobile: menu + logo */}
      <Sheet open={mobileMenuOpen} onOpenChange={setMobileMenuOpen}>
        <SheetTrigger asChild>
          <Button variant="ghost" size="icon" className="-ml-2 md:hidden" aria-label="Abrir menú">
            <Menu className="h-5 w-5" />
          </Button>
        </SheetTrigger>
        <SheetContent side="left" className="flex w-72 flex-col gap-0 border-sidebar-border bg-sidebar p-0">
          <SheetTitle className="sr-only">Menú</SheetTitle>
          <SidebarBrand onNavigate={closeMenu} />
          <ScrollArea className="flex-1">
            <SidebarNav onNavigate={closeMenu} />
          </ScrollArea>
        </SheetContent>
      </Sheet>
      <div className="min-w-0 md:hidden">
        <StoreLogo onDark={isDark} size="sm" />
      </div>

      <div className="ml-auto flex items-center gap-1">
        <PanelThemeMenu />

        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="ghost" className="h-9 gap-2 rounded-full pl-1 pr-1 sm:pr-3" aria-label="Cuenta">
              <Avatar className="h-7 w-7">
                <AvatarFallback className="bg-selection text-xs font-medium text-selection-foreground">
                  {initials}
                </AvatarFallback>
              </Avatar>
              <span className="hidden max-w-[12rem] truncate text-sm font-medium sm:inline">
                {user?.fullName}
              </span>
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent className="w-60" align="end">
            <DropdownMenuLabel className="font-normal">
              <p className="truncate text-sm font-medium">{user?.fullName}</p>
              <p className="truncate text-xs text-muted-foreground">{user?.email}</p>
            </DropdownMenuLabel>
            <DropdownMenuSeparator />
            <DropdownMenuItem onClick={logout}>
              <LogOut className="h-4 w-4" />
              Cerrar sesión
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>
    </header>
  );
}
