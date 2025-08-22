import { createRoot } from "react-dom/client";
import App from "./App";
import "./index.css";

// Register Service Worker for PWA
if ('serviceWorker' in navigator) {
  window.addEventListener('load', () => {
    navigator.serviceWorker
      .register('/sw.js')
      .then((registration) => {
        console.log('SW registered: ', registration);
        
        // Check for updates
        registration.addEventListener('updatefound', () => {
          console.log('New service worker found');
          const newWorker = registration.installing;
          if (newWorker) {
            newWorker.addEventListener('statechange', () => {
              if (newWorker.state === 'installed' && navigator.serviceWorker.controller) {
                console.log('New content available, reload required');
                // Could show update available notification here
                if (confirm('New version available! Reload to update?')) {
                  window.location.reload();
                }
              }
            });
          }
        });
      })
      .catch((registrationError) => {
        console.log('SW registration failed: ', registrationError);
      });
  });
}

// Register background sync for offline capabilities
if ('serviceWorker' in navigator && 'sync' in window.ServiceWorkerRegistration.prototype) {
  window.addEventListener('online', () => {
    navigator.serviceWorker.ready.then((registration: any) => {
      return registration.sync.register('sync-transactions');
    }).catch((error) => {
      console.log('Background sync registration failed:', error);
    });
  });
}

createRoot(document.getElementById("root")!).render(<App />);
