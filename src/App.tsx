import { BrowserRouter, Route, Routes } from 'react-router-dom'
import Login from './pages/Login'
import Register from './pages/Register'
import ForgotPassword from './pages/ForgotPassword'
import ShopOwnerDashboard from './pages/ShopOwnerDashboard'
import FinderDashboard from './pages/FinderDashboard'

const ExternalRedirect = ({ to }: { to: string }) => {
  window.location.href = to;
  return null;
};

const App = () => {
  return (
    <BrowserRouter basename="/HertiX">
      <Routes>
        <Route path="/" element={<ExternalRedirect to="/HertiX/user-dashboard/frontend/" />} />
        <Route path="/shop-owner/login" element={<Login role="Shop Owner" />} />
        <Route path="/finder/login" element={<Login role="Finder" />} />
        <Route path="/register" element={<Register />} />
        <Route path="/register/owner" element={<Register defaultRole="Shop Owner" lockRole />} />
        <Route path="/register/finder" element={<Register defaultRole="Finder" lockRole />} />
        <Route path="/forgot-password" element={<ForgotPassword />} />
        <Route path="/shop-owner/dashboard" element={<ShopOwnerDashboard />} />
        <Route path="/finder/dashboard" element={<FinderDashboard />} />
        <Route path="*" element={<ExternalRedirect to="/HertiX/user-dashboard/frontend/" />} />
      </Routes>
    </BrowserRouter>
  )
}

export default App

