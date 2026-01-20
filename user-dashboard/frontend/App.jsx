import { BrowserRouter, Routes, Route, Outlet } from 'react-router-dom';
import PublicNavbar from './src/components/PublicNavbar';
import PublicHome from './src/pages/PublicHome';
import ItemDetails from './src/pages/ItemDetails';
import BecomeOwner from './src/pages/BecomeOwner';
import DashboardLayout from './src/layouts/DashboardLayout';
import Dashboard from './src/pages/Dashboard';
import BrowseItems from './src/pages/BrowseItems';
import MyRentals from './src/pages/MyRentals';
import Payments from './src/pages/Payments';
import Profile from './src/pages/Profile';
import CulturalGuidance from './src/pages/CulturalGuidance';
import Login from './src/pages/Login';
import ForgotPassword from './src/pages/ForgotPassword';
import { AuthProvider } from './src/context/AuthContext';
import './src/styles/App.css';

// Layout for Public Pages
const PublicLayout = () => (
    <div className="public-app">
        <PublicNavbar />
        <Outlet />
    </div>
);

function App() {
    return (
        <AuthProvider>
            <BrowserRouter>
                <Routes>
                    {/* Public Routes */}
                    <Route element={<PublicLayout />}>
                        <Route path="/" element={<PublicHome />} />
                        <Route path="/login" element={<Login />} />
                        <Route path="/forgot-password" element={<ForgotPassword />} />
                        <Route path="/browse" element={<BrowseItems />} />
                        <Route path="/item/:id" element={<ItemDetails />} />
                        <Route path="/become-owner" element={<BecomeOwner />} />
                        <Route path="/help" element={<CulturalGuidance />} />
                    </Route>

                    {/* Protected Dashboard Routes */}
                    <Route path="/dashboard" element={<DashboardLayout />}>
                        <Route index element={<Dashboard />} />
                        <Route path="rentals" element={<MyRentals />} />
                        <Route path="payments" element={<Payments />} />
                        <Route path="profile" element={<Profile />} />
                    </Route>
                </Routes>
            </BrowserRouter>
        </AuthProvider>
    );
}

export default App;
