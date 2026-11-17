import { Link } from 'react-router-dom';
import { Monitor, Moon, SwatchBook, Sun } from 'lucide-react';
import { Button } from '@/components/ui/button';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuRadioGroup,
  DropdownMenuRadioItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { Tooltip, TooltipContent, TooltipTrigger } from '@/components/ui/tooltip';
import { useBrand } from '../hooks';
import { DEFAULT_PREFERENCES, usePanelThemeStore } from '../store';
import type { AccentSource, SidebarStyle, ThemeMode } from '../theme';

const modes: { value: ThemeMode; label: string; icon: typeof Sun }[] = [
  { value: 'light', label: 'Claro', icon: Sun },
  { value: 'dark', label: 'Oscuro', icon: Moon },
  { value: 'system', label: 'Igual que el sistema', icon: Monitor },
];

const accents: { value: AccentSource; label: string }[] = [
  { value: 'primary', label: 'Primario' },
  { value: 'secondary', label: 'Secundario' },
  { value: 'accent', label: 'Acento' },
];

const sidebars: { value: SidebarStyle; label: string }[] = [
  { value: 'neutral', label: 'Neutra' },
  { value: 'brand', label: 'Con el color de la marca' },
];

// Keep the menu open so each change previews on the live panel.
const stayOpen = (event: Event) => event.preventDefault();

const groupLabel = 'px-2 pb-1 pt-2 text-xs font-medium text-muted-foreground';

export function PanelThemeMenu() {
  const { palette } = useBrand();
  const { mode, accentSource, sidebarStyle, setMode, setAccentSource, setSidebarStyle, resetPreferences } =
    usePanelThemeStore();

  const isDefault =
    mode === DEFAULT_PREFERENCES.mode &&
    accentSource === DEFAULT_PREFERENCES.accentSource &&
    sidebarStyle === DEFAULT_PREFERENCES.sidebarStyle;

  return (
    <DropdownMenu>
      <Tooltip>
        <TooltipTrigger asChild>
          <DropdownMenuTrigger asChild>
            <Button variant="ghost" size="icon" aria-label="Personalizar panel">
              <SwatchBook className="h-[18px] w-[18px]" />
            </Button>
          </DropdownMenuTrigger>
        </TooltipTrigger>
        <TooltipContent>Personalizar panel</TooltipContent>
      </Tooltip>

      <DropdownMenuContent align="end" className="w-72">
        <DropdownMenuLabel className="pb-0">Personalizar panel</DropdownMenuLabel>
        <p className="px-2 pb-1 text-xs text-muted-foreground">Solo cambia en este dispositivo.</p>

        <DropdownMenuLabel className={groupLabel}>Tema</DropdownMenuLabel>
        <DropdownMenuRadioGroup value={mode} onValueChange={(v) => setMode(v as ThemeMode)}>
          {modes.map(({ value, label, icon: Icon }) => (
            <DropdownMenuRadioItem key={value} value={value} onSelect={stayOpen} className="gap-2">
              <Icon className="h-4 w-4 text-muted-foreground" />
              {label}
            </DropdownMenuRadioItem>
          ))}
        </DropdownMenuRadioGroup>

        <DropdownMenuSeparator />
        <DropdownMenuLabel className={groupLabel}>Color del panel</DropdownMenuLabel>
        <DropdownMenuRadioGroup
          value={accentSource}
          onValueChange={(v) => setAccentSource(v as AccentSource)}
        >
          {accents.map(({ value, label }) => (
            <DropdownMenuRadioItem key={value} value={value} onSelect={stayOpen} className="gap-2">
              <span
                className="h-4 w-4 shrink-0 rounded-full border border-foreground/15"
                style={{ backgroundColor: palette[value] }}
                aria-hidden
              />
              {label}
              <span className="ml-auto font-mono text-xs uppercase text-muted-foreground">
                {palette[value]}
              </span>
            </DropdownMenuRadioItem>
          ))}
        </DropdownMenuRadioGroup>

        <DropdownMenuSeparator />
        <DropdownMenuLabel className={groupLabel}>Barra lateral</DropdownMenuLabel>
        <DropdownMenuRadioGroup
          value={sidebarStyle}
          onValueChange={(v) => setSidebarStyle(v as SidebarStyle)}
        >
          {sidebars.map(({ value, label }) => (
            <DropdownMenuRadioItem key={value} value={value} onSelect={stayOpen}>
              {label}
            </DropdownMenuRadioItem>
          ))}
        </DropdownMenuRadioGroup>

        <DropdownMenuSeparator />
        <DropdownMenuItem asChild>
          <Link to="/storefront?tab=colors">Cambiar la paleta de la tienda</Link>
        </DropdownMenuItem>
        <DropdownMenuItem disabled={isDefault} onSelect={(event) => {
          stayOpen(event);
          resetPreferences();
        }}>
          Volver a los valores iniciales
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
