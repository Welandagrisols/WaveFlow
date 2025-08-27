
import type { AppProps } from 'next/app'
import { QueryClientProvider } from "@tanstack/react-query";
import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";
import { queryClient } from "@/lib/queryClient";
import { PWAInstallPrompt } from "../client/src/components/PWAInstallPrompt";
import "../styles/globals.css";

export default function App({ Component, pageProps }: AppProps) {
  return (
    <QueryClientProvider client={queryClient}>
      <TooltipProvider>
        <Toaster />
        <Component {...pageProps} />
        <PWAInstallPrompt />
      </TooltipProvider>
    </QueryClientProvider>
  )
}
