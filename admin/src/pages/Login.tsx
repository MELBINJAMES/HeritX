import { type FormEvent, useState } from 'react'
import { useGoogleLogin } from '@react-oauth/google'
import { Link, useNavigate } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'

type LoginProps = {
  role: 'Shop Owner' | 'Finder'
}

const Login = ({ role }: LoginProps) => {
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [showPassword, setShowPassword] = useState(false)
  const navigate = useNavigate()
  const { login } = useAuth()
  const googleLogin = useGoogleLogin({
    onSuccess: async (tokenResponse) => {
      try {
        const res = await fetch('/HertiX/admin/public/api/google_login.php', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            token: tokenResponse.access_token,
            required_role: role
          }),
        })
        const data = await res.json()

        if (data.status === 'success') {
          // Ensure role matches what they are trying to login as
          // Note: In real world, we might auto-detect role from DB. 
          // Here we enforce the role they are currently on the login page for.
          const userData = {
            id: data.user.id,
            name: data.user.name,
            email: data.user.email,
            role: role // Enforce current page role
          }
          login(userData)
          console.log('Google User logged in:', userData)

      if (data.user.role === 'Finder') {
        window.location.href = '/HertiX/';
        return;
      }
      navigate('/shop-owner/dashboard');
        } else {
          setError(data.message || 'Google login failed')
        }
      } catch (err) {
        console.error("Google Backend Error:", err)
        setError('Server error during Google Login')
      }
    },
    onError: () => {
      setError('Google sign-in failed. Please try again.')
    },
  })

  const [error, setError] = useState('')

  const onSubmit = async (event: FormEvent) => {
    event.preventDefault()
    setError('')

    try {
      const res = await fetch('/HertiX/admin/public/api/login.php', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password, required_role: role }),
      })
      const data = await res.json()

      if (data.status === 'success') {
        const userData = {
          id: data.user.id,
          name: data.user.name,
          email: data.user.email,
          role: data.user.role === 'admin' ? 'admin' : data.user.role
        }

        login(userData)

        console.log('User logged in:', userData)

        if (data.user.role === 'admin') {
          navigate('/admin/dashboard');
        } else if (data.user.role === 'Finder') {
          // Redirect to the external User Dashboard (Protected Area)
          window.location.href = '/HertiX/user-dashboard/frontend/dashboard';
        } else {
          navigate('/shop-owner/dashboard');
        }
      } else {
        setError(data.message)
      }
    } catch (error) {
      console.error(error)
      setError('Login failed. Please try again.')
    }
  }

  // Auto-dismiss error after 3 seconds
  if (error) {
    setTimeout(() => setError(''), 3000);
  }

  return (
    <div className="auth-page" style={{ position: 'relative' }}>
      {error && (
        <>
          <div style={{
            position: 'fixed',
            top: '50%',
            left: '50%',
            transform: 'translate(-50%, -50%)',
            backgroundColor: 'white',
            padding: '20px 30px',
            borderRadius: '12px',
            boxShadow: '0 10px 25px rgba(0,0,0,0.2)',
            zIndex: 1000,
            textAlign: 'center',
            minWidth: '300px',
            border: '1px solid #ff4d4f',
            animation: 'fadeIn 0.3s ease-out'
          }}>
            <div style={{ fontSize: '3rem', marginBottom: '10px' }}>⚠️</div>
            <h3 style={{ margin: '0 0 10px', color: '#ff4d4f' }}>Attention</h3>
            <p style={{ margin: 0, color: '#333' }}>{error}</p>
            <button
              onClick={() => setError('')}
              style={{
                marginTop: '15px',
                padding: '8px 20px',
                background: '#ff4d4f',
                color: 'white',
                border: 'none',
                borderRadius: '6px',
                cursor: 'pointer'
              }}
            >
              Okay
            </button>
          </div>
          <div
            onClick={() => setError('')}
            style={{
              position: 'fixed',
              top: 0,
              left: 0,
              right: 0,
              bottom: 0,
              backgroundColor: 'rgba(0,0,0,0.4)',
              zIndex: 999,
              backdropFilter: 'blur(2px)'
            }}
          />
        </>
      )}
      <div className="auth-card">
        <div className="auth-card-header">
          <a href="/HertiX/" className="back-arrow" aria-label="Back to home">
            ←
          </a>
          <div className="brand compact" style={{ display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
            <span style={{ fontSize: '1.8rem', fontWeight: 800, fontFamily: 'Georgia, serif', letterSpacing: '1px', lineHeight: 1.1, color: '#1e293b' }}>HeritX</span>
            <span style={{ fontSize: '0.65rem', textTransform: 'uppercase', letterSpacing: '3px', color: '#64748b', fontWeight: 600, marginTop: '2px' }}>Wear the Legacy</span>
          </div>
        </div>
        <h1 className="auth-title">Welcome back, {role}</h1>
        <p className="auth-subtitle">Sign in to continue</p>

        <button
          className="google-button"
          type="button"
          onClick={() => googleLogin()}
        >
          <span className="google-icon-svg">
            <svg width="18" height="18" viewBox="0 0 18 18">
              <path d="M17.64 9.2c0-.637-.057-1.251-.164-1.84H9v3.481h4.844c-.209 1.125-.843 2.078-1.796 2.717v2.258h2.908c1.702-1.567 2.684-3.874 2.684-6.615z" fill="#4285F4"/>
              <path d="M9 18c2.43 0 4.467-.806 5.956-2.184l-2.908-2.258c-.806.54-1.834.859-3.048.859-2.344 0-4.328-1.584-5.036-3.711H.957v2.332A8.997 8.997 0 0 0 9 18z" fill="#34A853"/>
              <path d="M3.964 10.706c-.18-.54-.282-1.117-.282-1.706 0-.589.102-1.166.282-1.706V4.962H.957A8.996 8.996 0 0 0 0 9c0 1.452.348 2.827.957 4.038l3.007-2.332z" fill="#FBBC05"/>
              <path d="M9 3.58c1.321 0 2.508.454 3.44 1.345l2.582-2.58C13.463.891 11.426 0 9 0A8.997 8.997 0 0 0 .957 4.962l3.007 2.332C4.672 5.164 6.656 3.58 9 3.58z" fill="#EA4335"/>
            </svg>
          </span>
          <span>Continue with Google</span>
        </button>

        <div className="divider">
          <span>or sign in with email</span>
        </div>

        <form className="auth-form" onSubmit={onSubmit}>
          <label className="field">
            <span>Email</span>
            <input
              id="email-input"
              required
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="you@example.com"
            />
          </label>
          <label className="field">
            <span>Password</span>
            <div style={{ position: 'relative' }}>
              <input
                id="password-input"
                required
                type={showPassword ? 'text' : 'password'}
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="••••••••"
                style={{ paddingRight: '40px' }}
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                style={{
                  position: 'absolute',
                  right: '10px',
                  top: '50%',
                  transform: 'translateY(-50%)',
                  background: 'none',
                  border: 'none',
                  cursor: 'pointer',
                  fontSize: '1.2rem',
                }}
                title={showPassword ? 'Hide password' : 'Show password'}
              >
                {showPassword ? '👁️' : '👁️‍🗨️'}
              </button>
            </div>
          </label>
          <button id="submit-btn" className="cta-button primary full" type="submit">
            Sign in
          </button>
        </form>

        <div className="auth-links">
          <Link to={`/forgot-password?role=${role === 'Shop Owner' ? 'owner' : 'finder'}`}>Forgot password?</Link>
          <span className="muted">
            Don&apos;t have an account?{' '}
            <Link id="register-btn" to={role === 'Shop Owner' ? '/register/owner' : '/register/finder'}>
              Register
            </Link>
          </span>
        </div>
      </div>
    </div>
  )
}

export default Login

