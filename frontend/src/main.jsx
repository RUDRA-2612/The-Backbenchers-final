import React from 'react'
import ReactDOM from 'react-dom/client'
import App from './App.jsx'
import './index.css'
import { MsalProvider } from '@azure/msal-react'
import { msalInstance } from './auth/authConfig'
import { Analytics } from '@vercel/analytics/react'

// Initialize MSAL outside of the React tree
msalInstance.initialize().then(() => {
  if (window !== window.top || window.opener) {
    // We are inside a popup or iframe. Do not render the full React app!
    // Just process the redirect hash so MSAL can send the token to the main window and close.
    msalInstance.handleRedirectPromise().catch(console.error);
  } else {
    // Normal app load
    msalInstance.handleRedirectPromise().catch(console.error);
    
    ReactDOM.createRoot(document.getElementById('root')).render(
      <React.StrictMode>
        <MsalProvider instance={msalInstance}>
          <App />
        </MsalProvider>
        <Analytics />
      </React.StrictMode>,
    );
  }
}).catch((error) => {
  console.error("MSAL Initialization Error:", error);
});
