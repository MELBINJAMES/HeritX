import React from 'react'
import ReactDOM from 'react-dom/client'
import { GoogleOAuthProvider } from '@react-oauth/google'
import App from './App'
import './style.css'

const rootElement = document.getElementById('app')

if (!rootElement) {
  throw new Error('Root container #app not found')
}

const googleClientId = import.meta.env.VITE_GOOGLE_CLIENT_ID || 'missing-client-id'

ReactDOM.createRoot(rootElement).render(
  <React.StrictMode>
    <GoogleOAuthProvider clientId={googleClientId}>
      <App />
    </GoogleOAuthProvider>
  </React.StrictMode>,
)
