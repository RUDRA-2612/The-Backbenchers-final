import React from 'react'
import ReactDOM from 'react-dom/client'
import App from './App.jsx'
import './index.css'
import { MsalProvider } from '@azure/msal-react'
import { msalInstance } from './auth/authConfig'
import { Analytics } from '@vercel/analytics/react'

// Initialize MSAL outside of the React tree
msalInstance.initialize().then(() => {
  ReactDOM.createRoot(document.getElementById('root')).render(
    <React.StrictMode>
      <MsalProvider instance={msalInstance}>
        <App />
      </MsalProvider>
      <Analytics />
    </React.StrictMode>,
  )
}).catch((error) => {
  console.error("MSAL Initialization Error:", error);
  // Still render the app so we can show an error state if needed, or just fail gracefully
});
