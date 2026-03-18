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
        <footer className="site-footer-light">
            {/* Kerala Cultural Divider */}
            <div className="footer-pattern-divider"></div>
            
            <div className="back-to-top" onClick={scrollToTop}>
                <FaArrowUp />
            </div>

            <div className="footer-container">
                <div className="footer-links-grid">
                    {/* Column 1: Brand & Social */}
                    <div className="footer-column brand-column">
                        <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-start', marginBottom: '16px' }}>
                            <span style={{ fontSize: '2.4rem', fontWeight: 800, fontFamily: 'Georgia, serif', letterSpacing: '1px', lineHeight: 1.1, color: '#000000' }}>HeritX</span>
                            <span style={{ fontSize: '0.8rem', textTransform: 'uppercase', letterSpacing: '4px', color: '#666666', fontWeight: 700, marginTop: '4px' }}>Wear the Legacy</span>
                        </div>
                        <p className="brand-tagline" style={{ color: '#6B7280', lineHeight: 1.7, marginBottom: '24px' }}>
                            Connecting traditions with modern access. Experience authentic Kerala heritage today.
                        </p>
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
                            <li><a href="/HertiX/admin/shop-owner/login">Become an Owner</a></li>
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
                    <div className="footer-column contact-column">
                        <h3>Contact Info</h3>
                        <div style={{ marginTop: '16px', fontSize: '0.95rem', color: '#6B7280', lineHeight: 1.8 }}>
                            <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '16px' }}>
                                <MdEmail style={{ color: '#333333', fontSize: '1.2rem' }} /> support@heritx.com
                            </div>
                            <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '16px' }}>
                                <MdPhone style={{ color: '#333333', fontSize: '1.2rem' }} /> +91 98765 43210
                            </div>
                            <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                                <MdLocationOn style={{ color: '#333333', fontSize: '1.2rem' }} /> Kerala, India
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            {/* Copyright Bar */}
            <div className="footer-bottom">
                <p>&copy; {(new Date()).getFullYear()} {t('rights_reserved')} | HeritX Platform</p>
            </div>

            <style>
                {`
                .site-footer-light {
                    background-color: #FFFFFF;
                    color: #000000;
                    font-family: 'Outfit', sans-serif;
                    position: relative;
                }
                
                .footer-pattern-divider {
                    height: 12px; width: 100%;
                    background-color: #000000;
                    background-image: url('data:image/svg+xml;utf8,<svg width="40" height="40" viewBox="0 0 40 40" xmlns="http://www.w3.org/2000/svg"><path d="M20 0c11.046 0 20 8.954 20 20s-8.954 20-20 20S0 31.046 0 20 8.954 0 20 0zm0 2c-9.941 0-18 8.059-18 18s8.059 18 18 18 18-8.059 18-18S29.941 2 20 2z" fill="%23FFFFFF" fill-opacity="0.1" fill-rule="evenodd"/></svg>');
                    background-size: 30px 30px;
                }

                .footer-container {
                    max-width: 1300px; margin: 0 auto; padding: 80px 24px 0;
                }
                .footer-links-grid {
                    display: grid; grid-template-columns: 2fr 1fr 1fr 1.5fr; gap: 60px; padding-bottom: 60px;
                }
                .footer-column h3 {
                    color: #000000; font-size: 1.25rem; font-weight: 700; margin: 0 0 24px 0;
                    position: relative; padding-bottom: 12px;
                }
                .footer-column h3::after {
                    content: ''; position: absolute; left: 0; bottom: 0;
                    width: 40px; height: 3px; background: #000000; border-radius: 2px;
                }
                .footer-column ul { list-style: none; padding: 0; margin: 0; }
                .footer-column ul li { margin-bottom: 14px; }
                .footer-column ul li a {
                    color: #6B7280; text-decoration: none; font-size: 1rem; font-weight: 500;
                    transition: all 0.3s ease;
                }
                .footer-column ul li a:hover { color: #000000; padding-left: 4px; }
                .footer-social { display: flex; gap: 16px; margin-top: 24px; }
                .footer-social a {
                    width: 44px; height: 44px; border-radius: 50%; background: #ffffff;
                    border: 1px solid rgba(0,0,0,0.08); box-shadow: 0 4px 10px rgba(0,0,0,0.03);
                    display: flex; align-items: center; justify-content: center;
                    color: #000000; font-size: 1.2rem; transition: all 0.3s ease;
                }
                .footer-social a:hover {
                    background: #000000; color: #ffffff; transform: translateY(-4px);
                    box-shadow: 0 10px 20px rgba(0, 0, 0, 0.2);
                }
                .footer-bottom {
                    border-top: 1px solid rgba(0,0,0,0.06); padding: 24px 0;
                    text-align: center; color: #9CA3AF; font-size: 0.95rem; font-weight: 500;
                }
                .back-to-top {
                    position: fixed; bottom: 40px; left: 40px;
                    width: 48px; height: 48px; background: #000000; color: white;
                    border-radius: 50%; display: flex; align-items: center; justify-content: center;
                    cursor: pointer; box-shadow: 0 10px 20px rgba(0, 0, 0, 0.2);
                    transition: all 0.3s ease; z-index: 1000;
                }
                .back-to-top:hover {
                    background: #333333; transform: translateY(-5px);
                }

                @media (max-width: 991px) { .footer-links-grid { grid-template-columns: 1fr 1fr; gap: 40px; } }
                @media (max-width: 576px) { .footer-links-grid { grid-template-columns: 1fr; gap: 40px; } }
                `}
            </style>
        </footer>
    );
};

export default Footer;
