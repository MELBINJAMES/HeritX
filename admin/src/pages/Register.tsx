import { type FormEvent, useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { useGoogleLogin } from '@react-oauth/google'

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
  const [shopPincode, setShopPincode] = useState('')
  const [shopPhone, setShopPhone] = useState('')
  const [proofFile, setProofFile] = useState<File | null>(null)
  const [userPhone, setUserPhone] = useState('')
  const [userCity, setUserCity] = useState('')

  const navigate = useNavigate()

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
          // Re-using same logic as Login.tsx
          if (role === 'Finder') {
            window.location.href = 'http://localhost:3001/dashboard';
          } else {
            navigate('/shop-owner/dashboard');
          }
        } else {
          setError(data.message || 'Google registration failed')
        }
      } catch (err) {
        console.error("Google Backend Error:", err)
        setError('Server error during Google Registration')
      }
    },
    onError: () => {
      setError('Google sign-up failed. Please try again.')
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
      const formData = new FormData()
      formData.append('email', email)
      formData.append('password', password)
      formData.append('full_name', fullName)
      formData.append('role', role)

      if (role === 'Shop Owner') {
        formData.append('shop_address', shopAddress)
        formData.append('shop_city', shopCity)
        formData.append('shop_pincode', shopPincode)
        formData.append('shop_phone', shopPhone)
        if (proofFile) {
          formData.append('proof_doc', proofFile)
        } else {
          setError("Please upload a verification document (Shop Front or License).")
          return;
        }

        if (shopCity.trim()) {
          try {
            const controller = new AbortController();
            const timeoutId = setTimeout(() => controller.abort(), 3000);

            const geoRes = await fetch(
              `https://nominatim.openstreetmap.org/search?city=${encodeURIComponent(shopCity.trim())}&format=json&limit=1`,
              {
                headers: { 'Accept-Language': 'en' },
                signal: controller.signal
              }
            );
            clearTimeout(timeoutId);
            const geoData = await geoRes.json();
            if (geoData && geoData.length > 0) {
              formData.append('shop_lat', geoData[0].lat);
              formData.append('shop_lng', geoData[0].lon);
            }
          } catch (geoErr) {
            console.warn('Geocoding failed or timed out, skipping coordinates:', geoErr);
          }
        }
      } else {
        // Finder Specific Fields
        formData.append('shop_phone', userPhone) // Reusing column for general user phone
        formData.append('shop_city', userCity)   // Reusing column for general user city
      }

      const res = await fetch('http://localhost/HertiX/admin/public/api/register.php', {
        method: 'POST',
        body: formData,
      })
      const data = await res.json()

      if (data.status === 'success') {
        if (role === 'Shop Owner') {
          setShowPendingModal(true);
        } else {
          navigate('/finder/login');
        }
      } else {
        setError(data.message)
      }
    } catch (error) {
      console.error(error)
      setError('Registration failed. Please try again.')
    }
  }

  if (error) {
    setTimeout(() => setError(''), 3000);
  }

  return (
    <div className="auth-page" style={{
      position: 'relative',
      background: 'linear-gradient(135deg, #f8fafc 0%, #e2e8f0 100%)',
      minHeight: '100vh',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      padding: '40px 20px'
    }}>
      <style>{`
        @keyframes fadeInUp {
          from { opacity: 0; transform: translateY(30px); }
          to { opacity: 1; transform: translateY(0); }
        }
        @keyframes slideInRight {
          from { opacity: 0; transform: translateX(20px); }
          to { opacity: 1; transform: translateX(0); }
        }
        .animate-fade-up { animation: fadeInUp 0.6s cubic-bezier(0.16, 1, 0.3, 1) forwards; }
        .stagger-1 { animation-delay: 0.1s; }
        .stagger-2 { animation-delay: 0.2s; }
        .stagger-3 { animation-delay: 0.3s; }
        
        .input-group:focus-within label { color: #3b82f6; }
        .input-group input:focus { border-color: #3b82f6; box-shadow: 0 0 0 4px rgba(59, 130, 246, 0.1); }

        .google-button {
          display: flex;
          align-items: center;
          justify-content: center;
          gap: 12px;
          width: 100%;
          max-width: 400px;
          height: 56px;
          background: white;
          border: 2px solid #e2e8f0;
          border-radius: 14px;
          color: #1e293b;
          font-weight: 700;
          font-size: 1rem;
          cursor: pointer;
          transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
          margin: 0 auto;
        }
        .google-button:hover {
          background: #f8fafc;
          border-color: #cbd5e1;
          transform: translateY(-1px);
          box-shadow: 0 4px 6px -1px rgba(0,0,0,0.05);
        }
        .divider {
          display: flex;
          align-items: center;
          text-align: center;
          width: 100%;
          max-width: 450px;
          margin: 20px auto;
          color: #94a3b8;
          font-size: 0.85rem;
          font-weight: 600;
          text-transform: uppercase;
          letter-spacing: 1px;
        }
        .divider::before, .divider::after {
          content: '';
          flex: 1;
          border-bottom: 1px solid #e2e8f0;
        }
        .divider:not(:empty)::before { margin-right: 15px; }
        .divider:not(:empty)::after { margin-left: 15px; }
      `}</style>

      {error && (
        <>
          <div style={{
            position: 'fixed', top: '50%', left: '50%', transform: 'translate(-50%, -50%)',
            backgroundColor: 'white', padding: '20px 30px', borderRadius: '12px',
            boxShadow: '0 10px 25px rgba(0,0,0,0.2)', zIndex: 1000,
            textAlign: 'center', minWidth: '300px', border: '1px solid #ff4d4f',
            animation: 'fadeIn 0.3s ease-out'
          }}>
            <div style={{ fontSize: '3rem', marginBottom: '10px' }}>⚠️</div>
            <h3 style={{ margin: '0 0 10px', color: '#ff4d4f' }}>Attention</h3>
            <p style={{ margin: 0, color: '#333' }}>{error}</p>
            <button onClick={() => setError('')} style={{
              marginTop: '15px', padding: '8px 20px', background: '#ff4d4f',
              color: 'white', border: 'none', borderRadius: '6px', cursor: 'pointer'
            }}>Okay</button>
          </div>
          <div onClick={() => setError('')} style={{
            position: 'fixed', top: 0, left: 0, right: 0, bottom: 0,
            backgroundColor: 'rgba(0,0,0,0.4)', zIndex: 999, backdropFilter: 'blur(2px)'
          }} />
        </>
      )}

      {showPendingModal && (
        <div style={{
          position: 'fixed', top: 0, left: 0, right: 0, bottom: 0,
          backgroundColor: 'rgba(0,0,0,0.6)', zIndex: 1100,
          display: 'flex', justifyContent: 'center', alignItems: 'center',
          backdropFilter: 'blur(4px)'
        }}>
          <div style={{
            background: 'white', padding: '40px', borderRadius: '24px',
            width: '90%', maxWidth: '440px', textAlign: 'center',
            boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.25)',
            animation: 'fadeInUp 0.5s ease-out'
          }}>
            <div style={{ fontSize: '4.5rem', marginBottom: '20px' }}>⏳</div>
            <h2 style={{ fontSize: '1.75rem', fontWeight: 800, color: '#1e293b', marginBottom: '15px' }}>
              Request Received!
            </h2>
            <p style={{ color: '#64748b', lineHeight: '1.7', marginBottom: '30px', fontSize: '1.05rem' }}>
              Your shop registration is now <strong>Pending Review</strong>.
              <br /><br />
              Our team will verify your documents shortly. You'll receive a confirmation email once your shop is live!
            </p>
            <button
              onClick={() => navigate('/shop-owner/login')}
              style={{
                background: 'linear-gradient(135deg, #0f172a 0%, #334155 100%)',
                color: 'white', border: 'none', padding: '15px 32px', borderRadius: '12px',
                fontSize: '1.1rem', cursor: 'pointer', width: '100%', fontWeight: 700,
                boxShadow: '0 10px 15px -3px rgba(0, 0, 0, 0.1)'
              }}
            >
              Continue to Login
            </button>
          </div>
        </div>
      )}

      <div className="auth-card animate-fade-up" style={{
        maxWidth: '850px', // Increased width for two-column layout
        width: '100%',
        padding: '50px',
        borderRadius: '32px',
        boxShadow: '0 25px 50px -12px rgba(0,0,0,0.15)',
        background: 'rgba(255, 255, 255, 0.95)',
        backdropFilter: 'blur(10px)',
        border: '1px solid rgba(255,255,255,0.5)'
      }}>
        <div className="auth-card-header" style={{ marginBottom: '40px' }}>
          <a href="http://localhost:3001" className="back-arrow" aria-label="Back to home">←</a>
          <div className="brand" style={{ display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
            <span style={{ fontSize: '2.4rem', fontWeight: 950, fontFamily: 'Georgia, serif', letterSpacing: '-0.5px', lineHeight: 1, color: '#0f172a' }}>HeritX</span>
            <span style={{ fontSize: '0.75rem', textTransform: 'uppercase', letterSpacing: '5px', color: '#64748b', fontWeight: 800, marginTop: '6px' }}>Wear the Legacy</span>
          </div>
        </div>

        <div style={{ textAlign: 'center', marginBottom: '45px' }} className="animate-fade-up stagger-1">
          <h1 style={{ fontSize: '2.5rem', fontWeight: 900, color: '#0f172a', marginBottom: '12px', letterSpacing: '-0.5px' }}>Begin Your Journey</h1>
          <p style={{ color: '#64748b', fontSize: '1.1rem', maxWidth: '500px', margin: '0 auto' }}>
            {role === 'Finder'
              ? 'Discover and rent exquisite Kerala heritage treasures with a personalized experience.'
              : "Join Kerala's premier heritage marketplace and showcase your unique treasures to the world."}
          </p>
        </div>

        {role === 'Finder' && (
          <div className="animate-fade-up stagger-2" style={{ marginBottom: '10px' }}>
            <button className="google-button" type="button" onClick={() => googleLogin()}>
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                <path d="M23.5 12.2c0-.8-.1-1.6-.2-2.3H12v4.4h6.5c-.3 1.5-1.1 2.8-2.4 3.6v3h3.9c2.3-2.1 3.5-5.2 3.5-8.7z" fill="#4285F4" />
                <path d="M12 23.9c3.2 0 5.9-1.1 7.9-2.9l-3.9-3c-1.1.7-2.5 1.1-4 1.1-3.1 0-5.7-2.1-6.6-4.9H1.4v3.1c2 3.9 6 6.6 10.6 6.6z" fill="#34A853" />
                <path d="M5.4 14.2c-.2-.7-.3-1.4-.3-2.2s.1-1.5.3-2.2V6.7H1.4C.5 8.3 0 10.1 0 12s.5 3.7 1.4 5.3l4-3.1z" fill="#FBBC05" />
                <path d="M12 4.8c1.7 0 3.3.6 4.6 1.8l3.4-3.4C17.9 1.2 15.1 0 12 0 7.4 0 3.4 2.7 1.4 6.7l4 3.1c.9-2.8 3.5-5 6.6-5z" fill="#EA4335" />
              </svg>
              Continue with Google
            </button>
            <div className="divider">or register with email</div>
          </div>
        )}

        {role === 'Finder' && (
          <div className="animate-fade-up stagger-2" style={{
            padding: '30px', background: '#f8fafc',
            borderRadius: '24px', border: '1px solid #e2e8f0',
            marginBottom: '35px',
            display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '24px'
          }}>
            <div style={{ gridColumn: '1 / -1', marginBottom: '5px' }}>
              <h4 style={{ margin: 0, color: '#0f172a', fontSize: '1.2rem', fontWeight: 800, display: 'flex', alignItems: 'center', gap: '10px' }}>
                <div style={{ width: '32px', height: '32px', background: '#10b981', borderRadius: '8px', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'white', fontSize: '1.2rem' }}>👤</div>
                Personal Details
              </h4>
              <p style={{ margin: '5px 0 0', color: '#64748b', fontSize: '0.9rem' }}>We need a few more details to set up your profile properly.</p>
            </div>

            <label className="field input-group">
              <span style={{ fontWeight: 700, color: '#475569', marginBottom: '8px', fontSize: '0.9rem' }}>Phone Number</span>
              <input
                required
                type="tel"
                value={userPhone}
                onChange={(e) => setUserPhone(e.target.value)}
                placeholder="+91 98765 43210"
                style={{ height: '52px', borderRadius: '12px', border: '2px solid #cbd5e1', padding: '0 18px', width: '100%', transition: 'all 0.3s' }}
              />
            </label>

            <label className="field input-group">
              <span style={{ fontWeight: 700, color: '#475569', marginBottom: '8px', fontSize: '0.9rem' }}>Current City</span>
              <input
                required
                value={userCity}
                onChange={(e) => setUserCity(e.target.value)}
                placeholder="e.g. Ernakulam"
                style={{ height: '52px', borderRadius: '12px', border: '2px solid #cbd5e1', padding: '0 18px', width: '100%', transition: 'all 0.3s' }}
              />
            </label>
          </div>
        )}

        <form className="auth-form" onSubmit={onSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '30px' }}>
          {/* Section 1: Basic Info */}
          <div className="animate-fade-up stagger-2" style={{
            display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '24px'
          }}>
            <label className="field input-group">
              <span style={{ fontWeight: 700, color: '#334155', marginBottom: '10px', display: 'block', fontSize: '0.95rem' }}>
                {lockRole && role === 'Shop Owner' ? 'Shop Name' : 'Full Name'}
              </span>
              <input
                required
                value={fullName}
                onChange={(e) => setFullName(e.target.value)}
                placeholder={lockRole && role === 'Shop Owner' ? 'HeritX Boutique' : 'Asha Nair'}
                style={{ height: '56px', borderRadius: '14px', border: '2px solid #e2e8f0', padding: '0 20px', fontSize: '1rem', width: '100%', transition: 'all 0.3s' }}
              />
            </label>

            <label className="field input-group">
              <span style={{ fontWeight: 700, color: '#334155', marginBottom: '10px', display: 'block', fontSize: '0.95rem' }}>Email Address</span>
              <input
                id="email-input"
                required
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="you@example.com"
                style={{ height: '56px', borderRadius: '14px', border: '2px solid #e2e8f0', padding: '0 20px', fontSize: '1rem', width: '100%', transition: 'all 0.3s' }}
              />
            </label>

            <label className="field input-group">
              <span style={{ fontWeight: 700, color: '#334155', marginBottom: '10px', display: 'block', fontSize: '0.95rem' }}>Password</span>
              <div style={{ position: 'relative' }}>
                <input
                  id="password-input"
                  required
                  type={showPassword ? 'text' : 'password'}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="Create Secure Password"
                  style={{ height: '56px', borderRadius: '14px', border: '2px solid #e2e8f0', padding: '0 50px 0 20px', fontSize: '1rem', width: '100%', transition: 'all 0.3s' }}
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  style={{ position: 'absolute', right: '16px', top: '50%', transform: 'translateY(-50%)', background: 'none', border: 'none', cursor: 'pointer', opacity: 0.5, fontSize: '1.2rem' }}
                >
                  {showPassword ? '👁️' : '👁️‍🗨️'}
                </button>
              </div>
            </label>

            <label className="field input-group">
              <span style={{ fontWeight: 700, color: '#334155', marginBottom: '10px', display: 'block', fontSize: '0.95rem' }}>Confirm Password</span>
              <div style={{ position: 'relative' }}>
                <input
                  required
                  type={showConfirmPassword ? 'text' : 'password'}
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  placeholder="Verify Password"
                  style={{ height: '56px', borderRadius: '14px', border: '2px solid #e2e8f0', padding: '0 50px 0 20px', fontSize: '1rem', width: '100%', transition: 'all 0.3s' }}
                />
                <button
                  type="button"
                  onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                  style={{ position: 'absolute', right: '16px', top: '50%', transform: 'translateY(-50%)', background: 'none', border: 'none', cursor: 'pointer', opacity: 0.5, fontSize: '1.2rem' }}
                >
                  {showConfirmPassword ? '👁️' : '👁️‍🗨️'}
                </button>
              </div>
            </label>
          </div>

          {/* Section 2: Shop Details */}
          {role === 'Shop Owner' && (
            <div className="animate-fade-up stagger-3" style={{
              padding: '30px', background: '#f8fafc',
              borderRadius: '24px', border: '1px solid #e2e8f0',
              display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '24px'
            }}>
              <div style={{ gridColumn: '1 / -1', marginBottom: '5px' }}>
                <h4 style={{ margin: 0, color: '#0f172a', fontSize: '1.2rem', fontWeight: 800, display: 'flex', alignItems: 'center', gap: '10px' }}>
                  <div style={{ width: '32px', height: '32px', background: '#3b82f6', borderRadius: '8px', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'white', fontSize: '1rem' }}>🏢</div>
                  Shop Verification
                </h4>
              </div>

              <label className="field input-group" style={{ gridColumn: '1 / -1' }}>
                <span style={{ fontWeight: 700, color: '#475569', marginBottom: '8px', fontSize: '0.9rem' }}>Business Address</span>
                <input required value={shopAddress} onChange={(e) => setShopAddress(e.target.value)} placeholder="Building No, Street Name, Area" style={{ height: '52px', borderRadius: '12px', border: '2px solid #cbd5e1', padding: '0 18px', width: '100%', transition: 'all 0.3s' }} />
              </label>

              <label className="field input-group">
                <span style={{ fontWeight: 700, color: '#475569', marginBottom: '8px', fontSize: '0.9rem' }}>City / Location</span>
                <input required value={shopCity} onChange={(e) => setShopCity(e.target.value)} placeholder="e.g. Cochin" style={{ height: '52px', borderRadius: '12px', border: '2px solid #cbd5e1', padding: '0 18px', width: '100%', transition: 'all 0.3s' }} />
              </label>

              <label className="field input-group">
                <span style={{ fontWeight: 700, color: '#475569', marginBottom: '8px', fontSize: '0.9rem' }}>Pincode</span>
                <input required value={shopPincode} onChange={(e) => setShopPincode(e.target.value)} placeholder="682001" style={{ height: '52px', borderRadius: '12px', border: '2px solid #cbd5e1', padding: '0 18px', width: '100%', transition: 'all 0.3s' }} />
              </label>

              <label className="field input-group">
                <span style={{ fontWeight: 700, color: '#475569', marginBottom: '8px', fontSize: '0.9rem' }}>Primary Contact Phone</span>
                <input required value={shopPhone} onChange={(e) => setShopPhone(e.target.value)} placeholder="+91 98765 43210" style={{ height: '52px', borderRadius: '12px', border: '2px solid #cbd5e1', padding: '0 18px', width: '100%', transition: 'all 0.3s' }} />
              </label>

              <label className="field input-group">
                <span style={{ fontWeight: 700, color: '#475569', marginBottom: '8px', fontSize: '0.9rem' }}>Registration Document</span>
                <div style={{
                  border: '2px dashed #3b82f6', padding: '12px', borderRadius: '14px',
                  textAlign: 'center', background: 'white', cursor: 'pointer',
                  transition: 'all 0.3s', minHeight: '52px', display: 'flex', alignItems: 'center', justifyContent: 'center'
                }}>
                  <input
                    type="file"
                    required
                    accept=".jpg,.jpeg,.png,.pdf"
                    onChange={(e) => setProofFile(e.target.files ? e.target.files[0] : null)}
                    style={{ position: 'absolute', opacity: 0, width: '100%', height: '52px', cursor: 'pointer' }}
                  />
                  <div style={{ color: proofFile ? '#10b981' : '#3b82f6', fontSize: '0.9rem', fontWeight: 600 }}>
                    {proofFile ? `📄 ${proofFile.name}` : '📎 Select File'}
                  </div>
                </div>
              </label>
            </div>
          )}

          <div className="animate-fade-up stagger-3" style={{
            display: 'flex', flexDirection: 'column', gap: '30px'
          }}>
            {!lockRole && (
              <label className="field" style={{ margin: 0 }}>
                <span style={{ fontWeight: 700, color: '#334155', marginBottom: '12px', display: 'block', fontSize: '0.95rem' }}>I want to join as a...</span>
                <div style={{
                  display: 'flex', background: '#e2e8f0', padding: '6px', borderRadius: '16px', gap: '6px',
                  maxWidth: '450px', margin: '0 auto', width: '100%' // Center the account type selector too
                }}>
                  <button
                    type="button"
                    onClick={() => setRole('Shop Owner')}
                    style={{
                      flex: 1, padding: '14px', borderRadius: '12px', border: 'none',
                      fontWeight: 800, fontSize: '0.95rem', cursor: 'pointer',
                      transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
                      background: role === 'Shop Owner' ? '#fff' : 'transparent',
                      color: role === 'Shop Owner' ? '#0f172a' : '#64748b',
                      boxShadow: role === 'Shop Owner' ? '0 10px 15px -3px rgba(0,0,0,0.1)' : 'none'
                    }}
                  >
                    Shop Owner
                  </button>
                  <button
                    type="button"
                    onClick={() => setRole('Finder')}
                    style={{
                      flex: 1, padding: '14px', borderRadius: '12px', border: 'none',
                      fontWeight: 800, fontSize: '0.95rem', cursor: 'pointer',
                      transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
                      background: role === 'Finder' ? '#fff' : 'transparent',
                      color: role === 'Finder' ? '#0f172a' : '#64748b',
                      boxShadow: role === 'Finder' ? '0 10px 15px -3px rgba(0,0,0,0.1)' : 'none'
                    }}
                  >
                    Finder
                  </button>
                </div>
              </label>
            )}

            <div style={{ display: 'flex', justifyContent: 'center', width: '100%' }}>
              <button
                id="submit-btn"
                className="cta-button"
                type="submit"
                style={{
                  height: '66px', borderRadius: '18px', background: '#0f172a',
                  color: 'white', border: 'none', fontSize: '1.25rem', fontWeight: 800,
                  cursor: 'pointer', transition: 'all 0.4s cubic-bezier(0.4, 0, 0.2, 1)',
                  boxShadow: '0 20px 25px -5px rgba(15, 23, 42, 0.3)',
                  width: '100%',
                  maxWidth: '400px' // Center and limit width
                }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.transform = 'translateY(-2px)';
                  e.currentTarget.style.boxShadow = '0 25px 30px -5px rgba(15, 23, 42, 0.4)';
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.transform = 'translateY(0)';
                  e.currentTarget.style.boxShadow = '0 20px 25px -5px rgba(15, 23, 42, 0.3)';
                }}
              >
                Create My Account
              </button>
            </div>
          </div>
        </form>

        <div style={{ textAlign: 'center', marginTop: '40px' }} className="animate-fade-up stagger-3">
          <p style={{ color: '#64748b', fontSize: '1.05rem', fontWeight: 500 }}>
            Already registered? <Link to={role === 'Shop Owner' ? '/shop-owner/login' : '/finder/login'} style={{ color: '#3b82f6', fontWeight: 800, textDecoration: 'none', borderBottom: '2px solid transparent', transition: 'all 0.3s' }} onMouseEnter={(e) => e.currentTarget.style.borderBottomColor = '#3b82f6'}>Sign in to your dashboard</Link>
          </p>
        </div>
      </div>
    </div>
  )
}

export default Register

