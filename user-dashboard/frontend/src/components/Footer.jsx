import React from 'react';
import { FaFacebook, FaInstagram, FaYoutube, FaWhatsapp, FaArrowUp } from 'react-icons/fa';
import { MdEmail, MdPhone, MdLocationOn } from 'react-icons/md';
import { Link } from 'react-router-dom';
import { useLanguage } from '../context/LanguageContext';

const Footer = () => {
    const { t } = useLanguage();
    const scrollToTop = () => {
        window.scrollTo({ top: 0, behavior: 'smooth' });
    };

    return (
        <footer className="site-footer">
            <div className="back-to-top" onClick={scrollToTop}>
                <FaArrowUp />
            </div>

            <div className="footer-container">
                <div className="footer-links-grid">
                    {/* Column 1: Brand & Social */}
                    <div className="footer-column brand-column">
                        <h2 className="brand-name">HeritX</h2>
                        <p className="brand-tagline">{t('brand_tagline')}</p>
                        <p className="brand-desc">{t('brand_desc')}</p>
                        <div className="footer-social">
                            <a href="https://www.facebook.com" target="_blank" rel="noopener noreferrer" aria-label="Facebook"><FaFacebook /></a>
                            <a href="https://www.instagram.com" target="_blank" rel="noopener noreferrer" aria-label="Instagram"><FaInstagram /></a>
                            <a href="https://www.youtube.com" target="_blank" rel="noopener noreferrer" aria-label="YouTube"><FaYoutube /></a>
                            <a href="https://wa.me/919876543210" target="_blank" rel="noopener noreferrer" aria-label="WhatsApp"><FaWhatsapp /></a>
                        </div>
                    </div>

                    {/* Column 2: Explore */}
                    <div className="footer-column">
                        <h3>{t('quick_links')}</h3>
                        <ul>
                            <li><Link to="/">{t('home')}</Link></li>
                            <li><Link to="/browse">{t('browse')}</Link></li>
                            <li><Link to="/rentals">{t('my_bookings')}</Link></li>
                            <li><Link to="/become-owner">Become an Owner</Link></li>
                        </ul>
                    </div>

                    {/* Column 3: Support */}
                    <div className="footer-column">
                        <h3>{t('support')}</h3>
                        <ul>
                            <li><Link to="/help">{t('help_center')}</Link></li>
                            <li><Link to="/terms">{t('terms')}</Link></li>
                            <li><Link to="/privacy">{t('privacy')}</Link></li>
                            <li><Link to="/cancellation">{t('cancellation')}</Link></li>
                            <li><Link to="/contact">Contact Us</Link></li>
                        </ul>
                    </div>

                    {/* Column 4: Contact */}
                    <div className="footer-column">
                        <h3>{t('support')}</h3>
                        <div style={{ marginTop: '10px', fontSize: '0.9rem', color: '#a3a3a3' }}>
                            <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '10px' }}>
                                <MdEmail style={{ color: '#ffd700' }} /> support@heritx.com
                            </div>
                            <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '10px' }}>
                                <MdPhone style={{ color: '#ffd700' }} /> +91 98765 43210
                            </div>
                            <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                                <MdLocationOn style={{ color: '#ffd700' }} /> Kerala, India
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            {/* Copyright Bar */}
            <div className="footer-bottom">
                <p>&copy; 2026 {t('rights_reserved')}</p>
            </div>
        </footer>
    );
};

export default Footer;
