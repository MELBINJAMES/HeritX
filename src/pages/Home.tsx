import { Link } from 'react-router-dom'

const Home = () => {
  return (
    <div className="hero-page">
      <div className="overlay" aria-hidden="true" />
      <div className="content">
        <div className="brand">
          <span className="logo-mark" aria-hidden="true" />
          <span className="logo-text">HeritX</span>
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
        </div>

        <div className="cta-row">
          <Link to="/shop-owner/login" className="cta-button primary">
            Let&apos;s start with shop owner
          </Link>
          <Link to="/finder/login" className="cta-button ghost">
            Let&apos;s start with finder
          </Link>
        </div>
      </div>
    </div>
  )
}

export default Home

