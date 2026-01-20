// @ts-nocheck
import { Link } from 'react-router-dom' // keeping line but commenting out or removing if truly unused.
// Actually just replace with empty or just Remove line.


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


      </div>
    </div>
  )
}

export default Home

