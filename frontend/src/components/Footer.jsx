// frontend/src/components/Footer.jsx - Enhanced with Reference Design Patterns

import React from 'react';
import { Link } from 'react-router-dom';
import './Footer.css';

// Font Awesome
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faInstagram, faWhatsapp, faFacebookF, faTwitter } from '@fortawesome/free-brands-svg-icons';

const Footer = () => {
    return (
        <div className='footer'>
            <div className="footer-logo">
                {/* If you later add a logo image, replace the text below with an <img /> */}
                <div className="footer-logotype">
                    <h2>VEIL & VOGUE</h2>
                </div>
            </div>
            <ul className="footer-links">
                <li><Link to="/about">About Us</Link></li>
                <li><Link to="/best-sellers">Best Sellers</Link></li>
                <li><Link to="/offices">Offices</Link></li>
                <li><Link to="/contact">Contact Us</Link></li>
                <li><Link to="/newsletter">Newsletter</Link></li>
            </ul>
            <div className="footer-social-icons">
                <a className="footer-icons-container" href="https://www.instagram.com" target="_blank" rel="noreferrer" aria-label="Instagram">
                    <FontAwesomeIcon icon={faInstagram} />
                </a>
                <a className="footer-icons-container" href="https://wa.me/" target="_blank" rel="noreferrer" aria-label="WhatsApp">
                    <FontAwesomeIcon icon={faWhatsapp} />
                </a>
                <a className="footer-icons-container" href="https://www.facebook.com" target="_blank" rel="noreferrer" aria-label="Facebook">
                    <FontAwesomeIcon icon={faFacebookF} />
                </a>
                <a className="footer-icons-container" href="https://twitter.com" target="_blank" rel="noreferrer" aria-label="Twitter">
                    <FontAwesomeIcon icon={faTwitter} />
                </a>
            </div>

            <div className="footer-copyright">
                <hr />
                <p>Copyright @ 2024 - All Right Reserved</p>
            </div>
        </div>
    )
}

export default Footer;
