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
        const res = await fetch('http://localhost/HertiX/admin/public/api/google_login.php', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ token: tokenResponse.access_token }),
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

          if (role === 'Finder') {
            window.location.href = 'http://localhost:3000/dashboard';
          } else {
            navigate('/shop-owner/dashboard');
          }
        } else {
          setError(data.message || 'Google login failed')
        }
      } catch (err) {
        console.error("Google Backend Error:", err)
        setError('Server error during Google Login')
      }
    },
    onError: () => {
      alert('Google sign-in failed. Please try again.')
    },
  })

  const [error, setError] = useState('')

  const onSubmit = async (event: FormEvent) => {
    event.preventDefault()
    setError('')

    try {
      const res = await fetch('http://localhost/HertiX/admin/public/api/login.php', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password }),
      })
      const data = await res.json()

      if (data.status === 'success') {
        const userData = {
          id: data.user.id,
          name: data.user.name,
          email: data.user.email,
          role: role
        }

        login(userData)

        console.log('User logged in:', userData)

        if (role === 'Finder') {
          // Redirect to the external User Dashboard (Protected Area)
          window.location.href = 'http://localhost:3000/dashboard';
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
          <a href="http://localhost:3000" className="back-arrow" aria-label="Back to home">
            ←
          </a>
          <div className="brand compact">
            <span className="logo-mark" aria-hidden="true" />
            <span className="logo-text">HeritX</span>
          </div>
        </div>
        <h1 className="auth-title">Welcome back, {role}</h1>
        <p className="auth-subtitle">Sign in to continue</p>

        <button
          className="google-button"
          type="button"
          onClick={() => googleLogin()}
        >
          <span className="google-icon">G</span>
          <span>Continue with Google</span>
        </button>

        <div className="divider">
          <span>or sign in with email</span>
        </div>

        <form className="auth-form" onSubmit={onSubmit}>
          <label className="field">
            <span>Email</span>
            <input
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
          <button className="cta-button primary full" type="submit">
            Sign in
          </button>
        </form>

        <div className="auth-links">
          <Link to={`/forgot-password?role=${role === 'Shop Owner' ? 'owner' : 'finder'}`}>Forgot password?</Link>
          <span className="muted">
            Don&apos;t have an account?{' '}
            <Link to={role === 'Shop Owner' ? '/register/owner' : '/register/finder'}>
              Register
            </Link>
          </span>
        </div>
      </div>
    </div>
  )
}

export default Login

