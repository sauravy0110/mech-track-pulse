
import { createRoot } from 'react-dom/client'
import App from './App.tsx'
import './index.css'

// Apply dark mode on initial load if needed
const theme = localStorage.getItem('theme') || 'light';
if (theme === 'dark' || (theme === 'system' && window.matchMedia('(prefers-color-scheme: dark)').matches)) {
  document.documentElement.classList.add('dark');
}

createRoot(document.getElementById("root")!).render(<App />);
