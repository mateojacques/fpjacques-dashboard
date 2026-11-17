import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { ReactQueryDevtools } from '@tanstack/react-query-devtools';
import { BrowserRouter } from 'react-router-dom';
import axios from 'axios';
import { Toaster } from '@/components/ui/sonner';
import { TooltipProvider } from '@/components/ui/tooltip';
import { PanelThemeSync } from '@/features/branding/components/PanelThemeSync';
import { useIsDark } from '@/features/branding/hooks';

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 1000 * 60 * 5, // 5 minutes
      retry: (failureCount, error) => {
        // Never retry on 401 - the axios interceptor handles session cleanup
        if (axios.isAxiosError(error) && error.response?.status === 401) {
          return false;
        }
        return failureCount < 1;
      },
      refetchOnWindowFocus: false,
    },
  },
});

function ThemedToaster() {
  const isDark = useIsDark();
  return <Toaster position="top-right" richColors closeButton theme={isDark ? 'dark' : 'light'} />;
}

type ProvidersProps = {
  children: React.ReactNode;
};

export function Providers({ children }: ProvidersProps) {
  return (
    <QueryClientProvider client={queryClient}>
      <PanelThemeSync />
      <BrowserRouter>
        <TooltipProvider delayDuration={0}>
          {children}
          <ThemedToaster />
        </TooltipProvider>
      </BrowserRouter>
      <ReactQueryDevtools initialIsOpen={false} />
    </QueryClientProvider>
  );
}
