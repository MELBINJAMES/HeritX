// @ts-nocheck
import { Link } from 'react-router-dom'


const Home = () => {
  return (
    <div className="hero-page">
      <div className="overlay" aria-hidden="true" />
      <div className="content">
        <div className="brand" style={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-start' }}>
          <span style={{ fontSize: '2rem', fontWeight: 800, fontFamily: 'Georgia, serif', letterSpacing: '1px', lineHeight: 1.1, color: '#1e293b' }}>HeritX</span>
          <span style={{ fontSize: '0.7rem', textTransform: 'uppercase', letterSpacing: '3px', color: '#64748b', fontWeight: 600, marginTop: '2px' }}>Wear the Legacy</span>
        </div>

        <div className="hero-copy">
          <div className="accent-line" aria-hidden="true" />
          <h1 className="headline">
            Rent Traditional
            <br />
            Kerala Treasures
          </h1>
          <p className="description">
            Experience the rich cultural heritage of Kerala with our curated collection of
            traditional attire, jewelry, and ceremonial items.
          </p>

          <div style={{ display: 'flex', gap: '15px', marginTop: '30px', flexWrap: 'wrap' }}>
            <a
              href="/HertiX/"
              style={{ padding: '12px 24px', background: '#d15a29', color: 'white', textDecoration: 'none', borderRadius: '8px', fontWeight: 'bold' }}
            >
              Go to Main Platform
            </a>
            <Link
              to="/admin/dashboard"
              style={{ padding: '12px 24px', background: 'rgba(255,255,255,0.1)', color: 'white', textDecoration: 'none', borderRadius: '8px', border: '1px solid rgba(255,255,255,0.2)' }}
            >
              Admin Access
            </Link>
            <Link
              to="/shop-owner/login"
              style={{ padding: '12px 24px', background: 'rgba(255,255,255,0.1)', color: 'white', textDecoration: 'none', borderRadius: '8px', border: '1px solid rgba(255,255,255,0.2)' }}
            >
              Shop Owner Login
            </Link>
            <Link
              to="/finder/login"
              style={{ padding: '12px 24px', background: 'rgba(255,255,255,0.1)', color: 'white', textDecoration: 'none', borderRadius: '8px', border: '1px solid rgba(255,255,255,0.2)' }}
            >
              Finder Login
            </Link>
          </div>
        </div>


      </div>
    </div>
  )
}

export default Home

