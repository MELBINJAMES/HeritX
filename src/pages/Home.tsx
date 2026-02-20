

import React from 'react';

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
          <a href="http://localhost:5174/shop-owner/login" className="cta-button primary">
            Let&apos;s start with shop owner
          </a>
          <a href="http://localhost:3000/login" className="cta-button ghost">
            Let&apos;s start with finder
          </a>
        </div>
      </div>
    </div>
  )
}

export default Home

