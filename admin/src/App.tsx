import { BrowserRouter, Navigate, Route, Routes } from 'react-router-dom'
import Home from './pages/Home'
import Login from './pages/Login'
import Register from './pages/Register'
import ForgotPassword from './pages/ForgotPassword'
import ShopOwnerDashboard from './pages/ShopOwnerDashboard'
import FinderDashboard from './pages/FinderDashboard'
import { AuthProvider } from './context/AuthContext'

const App = () => {
  return (
    <AuthProvider>
      <BrowserRouter>
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/shop-owner/login" element={<Login role="Shop Owner" />} />
          <Route path="/finder/login" element={<Login role="Finder" />} />
          <Route path="/register" element={<Register />} />
          <Route path="/register/owner" element={<Register defaultRole="Shop Owner" lockRole />} />
          <Route path="/register/finder" element={<Register defaultRole="Finder" lockRole />} />
          <Route path="/forgot-password" element={<ForgotPassword />} />
          <Route path="/shop-owner/dashboard" element={<ShopOwnerDashboard />} />
          <Route path="/finder/dashboard" element={<FinderDashboard />} />
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </BrowserRouter>
    </AuthProvider>

  )
}

export default App

