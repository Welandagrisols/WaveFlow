import { createRoot } from "react-dom/client";
import App from "./App";
import "./index.css";

// Remove existing service worker to fix caching issues
if ('serviceWorker' in navigator) {
  window.addEventListener('load', () => {
    navigator.serviceWorker.getRegistrations().then((registrations) => {
      registrations.forEach((registration) => {
        registration.unregister();
        console.log('Service worker unregistered');
      });
    });
  });
}

createRoot(document.getElementById("root")!).render(<App />);
