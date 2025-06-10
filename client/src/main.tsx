import { createRoot } from "react-dom/client";
import App from "./App";
import "./index.css";

// Global error handling for unhandled promise rejections
window.addEventListener('unhandledrejection', (event) => {
  // Silently handle common network errors and dev tools errors
  if (event.reason?.message?.includes('fetch') || 
      event.reason?.message?.includes('Failed to fetch') ||
      event.reason?.status === 401 || 
      event.reason?.status === 404 ||
      event.reason?.name === 'AbortError' ||
      event.reason?.stack?.includes('eruda') ||
      event.reason?.stack?.includes('__replco')) {
    event.preventDefault();
    return;
  }

  console.warn('Promise rejection handled:', event.reason);
  event.preventDefault();
});

// Global error handling for uncaught errors
window.addEventListener('error', (event) => {
  // Prevent crashes from minor errors and dev tools
  if (event.error?.name === 'ChunkLoadError' || 
      event.error?.message?.includes('Loading chunk') ||
      event.filename?.includes('eruda') ||
      event.filename?.includes('__replco') ||
      event.error?.stack?.includes('eruda')) {
    if (event.error?.name === 'ChunkLoadError') {
      window.location.reload();
    }
    event.preventDefault();
    return;
  }

  console.warn('Error handled:', event.error);
  event.preventDefault();
});

// Fix Vite HMR connection issues
if (import.meta.hot) {
  import.meta.hot.on('vite:beforeUpdate', () => {
    console.log('HMR update received')
  })
}

createRoot(document.getElementById("root")!).render(<App />);