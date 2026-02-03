import React from 'react'
import ReactDOM from 'react-dom/client'
import ErrorBoundary from './src/components/ErrorBoundary.jsx'
import { GoogleOAuthProvider } from '@react-oauth/google'
import App from './App.jsx'
import './src/styles/index.css'
import { AuthProvider } from './src/context/AuthContext';
import { LanguageProvider } from './src/context/LanguageContext';
import { CartProvider } from './src/context/CartContext';
import { BrowserRouter } from 'react-router-dom';
import { Toaster } from 'react-hot-toast';

const googleClientId = import.meta.env.VITE_GOOGLE_CLIENT_ID || "YOUR_GOOGLE_CLIENT_ID_PLACEHOLDER";

ReactDOM.createRoot(document.getElementById('root')).render(
    <React.StrictMode>
        <ErrorBoundary>
            <GoogleOAuthProvider clientId={googleClientId}>
                <AuthProvider>
                    <LanguageProvider>
                        <CartProvider>
                            <BrowserRouter>
                                <Toaster position="top-center" reverseOrder={false} />
                                <App />
                            </BrowserRouter>
                        </CartProvider>
                    </LanguageProvider>
                </AuthProvider>
            </GoogleOAuthProvider>
        </ErrorBoundary>
    </React.StrictMode>,
)
