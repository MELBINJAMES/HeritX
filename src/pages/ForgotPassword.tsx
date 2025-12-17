import { type FormEvent, useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'

type Step = 'email' | 'otp' | 'reset'

const ForgotPassword = () => {
  const [step, setStep] = useState<Step>('email')
  const [email, setEmail] = useState('')
  const [otp, setOtp] = useState('')
  const [password, setPassword] = useState('')
  const [confirmPassword, setConfirmPassword] = useState('')
  const [showPassword, setShowPassword] = useState(false)
  const [showConfirmPassword, setShowConfirmPassword] = useState(false)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const navigate = useNavigate()

  // Helper to call PHP API
  // Using relative path assuming Vite proxies to localhost/HertiX/admin/public/api or direct URL
  const API_BASE = 'http://localhost/HertiX/admin/public/api'

  // Step 1: Send OTP
  const onSendOtp = async (e: FormEvent) => {
    e.preventDefault()
    setLoading(true)
    setError('')
    try {
      const res = await fetch(`${API_BASE}/forgot_password.php`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email }),
      })
      const data = await res.json()

      if (data.status === 'success') {
        // success message is implicit by moving to next step
        setStep('otp')
      } else {
        setError(data.message)
      }
    } catch (error) {
      console.error(error)
      setError('Failed to connect to server')
    } finally {
      setLoading(false)
    }
  }

  // Step 2: Verify OTP
  const onVerifyOtp = async (e: FormEvent) => {
    e.preventDefault()
    setLoading(true)
    setError('')
    try {
      const res = await fetch(`${API_BASE}/verify_otp.php`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, otp }),
      })
      const data = await res.json()

      if (data.status === 'success') {
        setStep('reset')
      } else {
        setError(data.message)
      }
    } catch (error) {
      console.error(error)
      setError('Failed to connect to server')
    } finally {
      setLoading(false)
    }
  }

  // Step 3: Reset Password
  const onResetPassword = async (e: FormEvent) => {
    e.preventDefault()
    setError('')
    if (password !== confirmPassword) {
      setError('Passwords do not match.')
      return
    }

    if (password.length < 8) {
      setError('Password must be at least 8 characters long.')
      return
    }
    if (!/[A-Z]/.test(password)) {
      setError('Password must contain at least one uppercase letter.')
      return
    }
    if (!/[a-z]/.test(password)) {
      setError('Password must contain at least one lowercase letter.')
      return
    }

    setLoading(true)
    try {
      const res = await fetch(`${API_BASE}/reset_password.php`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, otp, password }),
      })
      const data = await res.json()

      if (data.status === 'success') {
        navigate('/finder/login')
      } else {
        setError(data.message)
      }
    } catch (error) {
      console.error(error)
      setError('Failed to connect to server')
    } finally {
      setLoading(false)
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
          <Link to="/" className="back-arrow" aria-label="Back to home">
            ←
          </Link>
          <div className="brand compact">
            <span className="logo-mark" aria-hidden="true" />
            <span className="logo-text">HeritX</span>
          </div>
        </div>

        {step === 'email' && (
          <>
            <h1 className="auth-title">Reset your password</h1>
            <p className="auth-subtitle">Enter your email to receive a promo code.</p>
            <form className="auth-form" onSubmit={onSendOtp}>
              <label className="field">
                <span>Email</span>
                <input
                  required
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="you@example.com"
                  disabled={loading}
                />
              </label>
              <button className="cta-button primary full" type="submit" disabled={loading}>
                {loading ? 'Sending...' : 'Send Code'}
              </button>
            </form>
          </>
        )}

        {step === 'otp' && (
          <>
            <h1 className="auth-title">Enter Code</h1>
            <p className="auth-subtitle">We sent a code to {email}</p>
            <form className="auth-form" onSubmit={onVerifyOtp}>
              <label className="field">
                <span>Promo Code</span>
                <input
                  required
                  type="text"
                  value={otp}
                  onChange={(e) => setOtp(e.target.value)}
                  placeholder="Check your email/alert"
                  disabled={loading}
                />
              </label>
              <button className="cta-button primary full" type="submit" disabled={loading}>
                {loading ? 'Verifying...' : 'Verify Code'}
              </button>
            </form>
          </>
        )}

        {step === 'reset' && (
          <>
            <h1 className="auth-title">New Password</h1>
            <p className="auth-subtitle">Create a new password for your account.</p>
            <form className="auth-form" onSubmit={onResetPassword}>
              <label className="field">
                <span>New Password</span>
                <div style={{ position: 'relative' }}>
                  <input
                    required
                    type={showPassword ? 'text' : 'password'}
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder="Required: 8+ chars, 1 Uppercase, 1 Lowercase"
                    disabled={loading}
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
              <label className="field">
                <span>Confirm Password</span>
                <div style={{ position: 'relative' }}>
                  <input
                    required
                    type={showConfirmPassword ? 'text' : 'password'}
                    value={confirmPassword}
                    onChange={(e) => setConfirmPassword(e.target.value)}
                    placeholder="Confirm password"
                    disabled={loading}
                    style={{ paddingRight: '40px' }}
                  />
                  <button
                    type="button"
                    onClick={() => setShowConfirmPassword(!showConfirmPassword)}
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
                    title={showConfirmPassword ? 'Hide password' : 'Show password'}
                  >
                    {showConfirmPassword ? '👁️' : '👁️‍🗨️'}
                  </button>
                </div>
              </label>
              <button className="cta-button primary full" type="submit" disabled={loading}>
                {loading ? 'Updating...' : 'Change Password'}
              </button>
            </form>
          </>
        )}

        <div className="auth-links">
          <Link to="/finder/login">Return to login</Link>
        </div>
      </div>
    </div>
  )
}

export default ForgotPassword

