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

  // Modal State
  const [showPendingModal, setShowPendingModal] = useState(false);

  // New Shop Fields
  const [shopAddress, setShopAddress] = useState('')
  const [shopCity, setShopCity] = useState('')
  const [shopPhone, setShopPhone] = useState('')
  const [proofFile, setProofFile] = useState<File | null>(null)

  const navigate = useNavigate()
  const googleLogin = useGoogleLogin({
    onSuccess: () => {
      // For registration, we might want to behave differently, but for now redirect similar to login
      const target = role === 'Shop Owner' ? '/shop-owner/dashboard' : '/finder/dashboard'
      navigate(target)
    },
    onError: () => {
      setError('Google signup failed. Please try again.')
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
      // Use FormData for File Upload
      const formData = new FormData()
      formData.append('email', email)
      formData.append('password', password)
      formData.append('full_name', fullName)
      formData.append('role', role)

      if (role === 'Shop Owner') {
        formData.append('shop_address', shopAddress)
        formData.append('shop_city', shopCity)
        formData.append('shop_phone', shopPhone)
        if (proofFile) {
          formData.append('proof_doc', proofFile)
        } else {
          setError("Please upload a verification document (Shop Front or License).")
          return;
        }
      }

      const res = await fetch('http://localhost/HertiX/admin/public/api/register.php', {
        method: 'POST',
        body: formData, // No Content-Type header needed for FormData; browser sets boundary
      })
      const data = await res.json()

      if (data.status === 'success') {
        if (role === 'Shop Owner') {
          setShowPendingModal(true); // Show pending message
        } else {
          navigate('/finder/login'); // Finder goes straight to login
        }
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

      {/* Success/Pending Modal */}
      {showPendingModal && (
        <div style={{
          position: 'fixed', top: 0, left: 0, right: 0, bottom: 0,
          backgroundColor: 'rgba(0,0,0,0.6)', zIndex: 1100,
          display: 'flex', justifyContent: 'center', alignItems: 'center',
          backdropFilter: 'blur(4px)'
        }}>
          <div style={{
            background: 'white', padding: '40px', borderRadius: '16px',
            width: '90%', maxWidth: '400px', textAlign: 'center',
            boxShadow: '0 20px 25px -5px rgba(0, 0, 0, 0.1)'
          }}>
            <div style={{ fontSize: '4rem', marginBottom: '20px' }}>⏳</div>
            <h2 style={{ fontSize: '1.5rem', fontWeight: 700, color: '#1e293b', marginBottom: '10px' }}>
              Request Submitted!
            </h2>
            <p style={{ color: '#64748b', lineHeight: '1.6', marginBottom: '25px' }}>
              Your shop registration is currently <strong>Pending Approval</strong>.
              <br /><br />
              The verification team will review your details. You will receive an email once your account is Approved or Rejected.
            </p>
            <button
              onClick={() => navigate('/shop-owner/login')}
              style={{
                background: '#0f172a', color: 'white', border: 'none',
                padding: '12px 24px', borderRadius: '8px', fontSize: '1rem',
                cursor: 'pointer', width: '100%', fontWeight: 600
              }}
            >
              Got it, take me to Login
            </button>
          </div>
        </div>
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

          {role === 'Shop Owner' && (
            <div style={{ marginTop: '15px', padding: '15px', background: '#f8fafc', borderRadius: '12px', border: '1px solid #e2e8f0' }}>
              <h4 style={{ margin: '0 0 15px', color: '#334155', fontSize: '0.95rem' }}>Shop Verification Details</h4>

              <label className="field">
                <span>Shop Address</span>
                <input required value={shopAddress} onChange={(e) => setShopAddress(e.target.value)} placeholder="Building No, Street Name" />
              </label>

              <div style={{ display: 'flex', gap: '10px' }}>
                <label className="field" style={{ flex: 1 }}>
                  <span>City / Locality</span>
                  <input required value={shopCity} onChange={(e) => setShopCity(e.target.value)} placeholder="e.g. Cochin" />
                </label>
                <label className="field" style={{ flex: 1 }}>
                  <span>Contact Phone</span>
                  <input required value={shopPhone} onChange={(e) => setShopPhone(e.target.value)} placeholder="+91 98765..." />
                </label>
              </div>

              <label className="field">
                <span>Shop Proof (Image/PDF)</span>
                <div style={{ border: '1px dashed #cbd5e1', padding: '15px', borderRadius: '8px', textAlign: 'center', background: 'white' }}>
                  <input
                    type="file"
                    required
                    accept=".jpg,.jpeg,.png,.pdf"
                    onChange={(e) => setProofFile(e.target.files ? e.target.files[0] : null)}
                    style={{ width: '100%' }}
                  />
                  <small style={{ display: 'block', marginTop: '5px', color: '#64748b' }}>
                    Upload Shop Board Photo or License
                  </small>
                </div>
              </label>
            </div>
          )}

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

