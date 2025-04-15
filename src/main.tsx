import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import './index.css'
import App from './App.tsx'
// Import firebase services from the new config file
import { app, analytics } from './lib/firebase';
import { AuthProvider } from './context/AuthContext'; // Import the AuthProvider

// Log analytics (optional, but good practice to keep if you use it)
console.log('Firebase App initialized:', app);
console.log('Firebase Analytics initialized:', analytics);

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <AuthProvider> { /* Wrap App with AuthProvider */ }
      <App />
    </AuthProvider>
  </StrictMode>,
)
