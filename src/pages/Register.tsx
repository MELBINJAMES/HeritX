import { type FormEvent, useState } from 'react'
import { useGoogleLogin } from '@react-oauth/google'
import { Link, useNavigate } from 'react-router-dom'

type RegisterProps = {
  defaultRole?: 'Shop Owner' | 'Finder'
  lockRole?: boolean
}

const Register = ({ defaultRole = 'Shop Owner', lockRole = false }: RegisterProps) => {
  const [role, setRole] = useState<'Shop Owner' | 'Finder'>(defaultRole)
  const [fullName, setFullName] = useState('')
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [confirmPassword, setConfirmPassword] = useState('')
  const [showPassword, setShowPassword] = useState(false)
  const [showConfirmPassword, setShowConfirmPassword] = useState(false)
  const navigate = useNavigate()
  const googleLogin = useGoogleLogin({
    onSuccess: () => {
      // For registration, we might want to behave differently, but for now redirect similar to login
      const target = role === 'Shop Owner' ? '/shop-owner/dashboard' : '/finder/dashboard'
      navigate(target)
    },
    onError: () => {
      alert('Google signup failed. Please try again.')
    },
  })

  const validatePassword = (pwd: string) => {
    if (pwd.length < 8) return "Password must be at least 8 characters.";
    if (!/[A-Z]/.test(pwd)) return "Password must have at least one uppercase letter.";
    if (!/[a-z]/.test(pwd)) return "Password must have at least one lowercase letter.";
    return null;
  }

  const [error, setError] = useState('')

  const onSubmit = async (event: FormEvent) => {
    event.preventDefault()
    setError('')

    const pwdError = validatePassword(password);
    if (pwdError) {
      setError(pwdError);
      return;
    }

    if (password !== confirmPassword) {
      setError('Passwords do not match. Please re-enter them.')
      return
    }

    try {
      const res = await fetch('http://localhost/HertiX/admin/public/api/register.php', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          full_name: fullName,
          email,
          password
        }),
      })
      const data = await res.json()

      if (data.status === 'success') {
        // Success! We can show a nice 'success' popup or just redirect.
        // For now, let's just redirect smoothly as per modern UX.
        navigate(role === 'Shop Owner' ? '/shop-owner/login' : '/finder/login')
      } else {
        setError(data.message)
      }
    } catch (error) {
      console.error(error)
      setError('Registration failed. Please try again.')
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
        <h1 className="auth-title">Create your account</h1>
        <p className="auth-subtitle">Join the platform to rent or list Kerala treasures</p>

        <button
          className="google-button"
          type="button"
          onClick={() => googleLogin()}
        >
          <span className="google-icon">G</span>
          <span>Continue with Google</span>
        </button>

        <div className="divider">
          <span>or sign up with email</span>
        </div>

        <form className="auth-form" onSubmit={onSubmit}>
          <label className="field">
            <span>{lockRole && role === 'Shop Owner' ? 'Shop name' : 'Full name'}</span>
            <input
              required
              value={fullName}
              onChange={(e) => setFullName(e.target.value)}
              placeholder={lockRole && role === 'Shop Owner' ? 'HeritX Boutique' : 'Asha Nair'}
            />
          </label>
          <label className="field">
            <span>{lockRole && role === 'Shop Owner' ? 'Shop email' : 'Email'}</span>
            <input
              required
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="you@example.com"
            />
          </label>
          <label className="field" style={{ position: 'relative' }}>
            <span>Password</span>
            <div style={{ position: 'relative' }}>
              <input
                required
                type={showPassword ? 'text' : 'password'}
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="Required: 8+ chars, 1 Uppercase, 1 Lowercase"
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
            <span>Re-enter password</span>
            <div style={{ position: 'relative' }}>
              <input
                required
                type={showConfirmPassword ? 'text' : 'password'}
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                placeholder="Re-enter password"
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

          {!lockRole && (
            <label className="field">
              <span>I am a</span>
              <div className="segmented">
                <button
                  type="button"
                  className={role === 'Shop Owner' ? 'active' : ''}
                  onClick={() => setRole('Shop Owner')}
                >
                  Shop Owner
                </button>
                <button
                  type="button"
                  className={role === 'Finder' ? 'active' : ''}
                  onClick={() => setRole('Finder')}
                >
                  Finder
                </button>
              </div>
            </label>
          )}

          <button className="cta-button primary full" type="submit">
            Create account
          </button>
        </form>

        <div className="auth-links">
          <Link to={role === 'Shop Owner' ? '/shop-owner/login' : '/finder/login'}>
            Already registered? Sign in
          </Link>
        </div>
      </div>
    </div>
  )
}

export default Register

