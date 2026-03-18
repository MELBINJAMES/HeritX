import { Routes, Route, Outlet, useLocation } from 'react-router-dom';
import PublicNavbar from './src/components/PublicNavbar';
import Chatbot from './src/components/Chatbot';
import LocationPrompt from './src/components/LocationPrompt';
import Footer from './src/components/Footer';
import PublicHome from './src/pages/PublicHome';
import ItemDetails from './src/pages/ItemDetails';
import BecomeOwner from './src/pages/BecomeOwner';
import DashboardLayout from './src/layouts/DashboardLayout';
import Dashboard from './src/pages/Dashboard';
import BrowseItems from './src/pages/BrowseItems';
import MyRentals from './src/pages/MyRentals';
import Payments from './src/pages/Payments';
import Profile from './src/pages/Profile';
import Notifications from './src/pages/Notifications';
import Wishlist from './src/pages/Wishlist';
import Cart from './src/pages/Cart';
import Checkout from './src/pages/Checkout';
import PaymentSuccess from './src/pages/PaymentSuccess';
import BankGateway from './src/pages/BankGateway';
import UPIGateway from './src/pages/UPIGateway';
import CulturalGuidance from './src/pages/CulturalGuidance';
import ShopProfile from './src/pages/ShopProfile';
import Login from './src/pages/Login';
import Signup from './src/pages/Signup';
import ForgotPassword from './src/pages/ForgotPassword';
import { Terms, Privacy, Cancellation, Refund, HelpCenter, Contact } from './src/pages/LegalPages';
import ScrollToTop from './src/components/ScrollToTop';
import './src/styles/App.css';

// Layout for Public Pages
const PublicLayout = () => {
    const location = useLocation();
    return (
        <div className="public-app">
            <PublicNavbar />
            <LocationPrompt />
            <Outlet />
            {location.pathname === '/' && <Footer />}
        </div>
    );
};


function App() {
    return (
        <>
            <ScrollToTop />
            <Routes>
                {/* Public Routes */}
                <Route element={<PublicLayout />}>
                    <Route path="/" element={<PublicHome />} />
                    <Route path="/login" element={<Login />} />
                    <Route path="/signup" element={<Signup />} />
                    <Route path="/forgot-password" element={<ForgotPassword />} />
                    <Route path="/browse" element={<BrowseItems />} />
                    <Route path="/item/:id" element={<ItemDetails />} />
                    <Route path="/become-owner" element={<BecomeOwner />} />
                    <Route path="/cart" element={<Cart />} />
                    <Route path="/checkout" element={<Checkout />} />
                    <Route path="/payment-success" element={<PaymentSuccess />} />
                    <Route path="/bank-gateway" element={<BankGateway />} />
                    <Route path="/upi-gateway" element={<UPIGateway />} />
                    <Route path="/shop/:id" element={<ShopProfile />} />

                    {/* Legal & Support Routes */}
                    <Route path="/help" element={<HelpCenter />} />
                    <Route path="/terms" element={<Terms />} />
                    <Route path="/privacy" element={<Privacy />} />
                    <Route path="/cancellation" element={<Cancellation />} />
                    <Route path="/refund" element={<Refund />} />
                    <Route path="/contact" element={<Contact />} />
                    <Route path="/cultural-guidance" element={<CulturalGuidance />} />
                </Route>

                {/* Protected Dashboard Routes */}
                <Route path="/dashboard" element={<DashboardLayout />}>
                    <Route index element={<Dashboard />} />
                    <Route path="rentals" element={<MyRentals />} />
                    <Route path="payments" element={<Payments />} />
                    <Route path="profile" element={<Profile />} />
                    <Route path="notifications" element={<Notifications />} />
                    <Route path="wishlist" element={<Wishlist />} />
                </Route>
            </Routes>
            <Chatbot />
        </>
    );
}

export default App;
