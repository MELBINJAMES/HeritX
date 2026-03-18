import React from 'react'
import ReactDOM from 'react-dom/client'
import ErrorBoundary from './src/components/ErrorBoundary.jsx'
import { GoogleOAuthProvider } from '@react-oauth/google'
import App from './App.jsx'
import './src/styles/index.css'
import { AuthProvider } from './src/context/AuthContext';
import { LanguageProvider } from './src/context/LanguageContext';
import { LocationProvider } from './src/context/LocationContext';
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
                        <LocationProvider>
                            <CartProvider>
                                <BrowserRouter basename={import.meta.env.BASE_URL}>
                                    <Toaster position="top-center" reverseOrder={false} />
                                    <App />
                                </BrowserRouter>
                            </CartProvider>
                        </LocationProvider>
                    </LanguageProvider>
                </AuthProvider>
            </GoogleOAuthProvider>
        </ErrorBoundary>
    </React.StrictMode>,
)
