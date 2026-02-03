import React from 'react';
import { FaQuestionCircle, FaShieldAlt, FaFileContract, FaBan, FaEnvelope, FaMapMarkerAlt, FaPhoneAlt } from 'react-icons/fa';

const PageContainer = ({ title, icon: Icon, children }) => (
    <div style={{ maxWidth: '900px', margin: '60px auto', padding: '0 20px', fontFamily: 'Inter, -apple-system, sans-serif' }}>
        <header style={{ borderBottom: '2px solid #f3f4f6', paddingBottom: '30px', marginBottom: '40px', textAlign: 'center' }}>
            {Icon && <Icon style={{ fontSize: '3rem', color: '#1a1a1a', marginBottom: '15px' }} />}
            <h1 style={{ fontSize: '2.8rem', fontWeight: '800', margin: 0, color: '#1a1a1a', letterSpacing: '-0.02em' }}>{title}</h1>
            <p style={{ color: '#6b7280', marginTop: '10px', fontSize: '1.1rem' }}>Last updated: February 2026</p>
        </header>
        <div className="legal-content" style={{ lineHeight: '1.8', color: '#374151', fontSize: '1.05rem' }}>
            {children}
        </div>
    </div>
);

const Section = ({ title, children }) => (
    <section style={{ marginBottom: '40px' }}>
        <h2 style={{ fontSize: '1.5rem', fontWeight: '700', color: '#111827', marginBottom: '15px', display: 'flex', alignItems: 'center', gap: '10px' }}>
            {title}
        </h2>
        <div>{children}</div>
    </section>
);

export const Terms = () => (
    <PageContainer title="Terms & Conditions" icon={FaFileContract}>
        <Section title="1. Agreement to Terms">
            <p>Welcome to HeritX. By accessing our platform, you agree to be bound by these Terms and Conditions. These terms govern your use of our services, including browsing, renting, and listing heritage items.</p>
        </Section>
        <Section title="2. User Eligibility">
            <p>You must be at least 18 years old to create an account or enter into rental agreements. By using HeritX, you represent and warrant that you have the legal capacity to form a binding contract.</p>
        </Section>
        <Section title="3. Rental & Usage">
            <p>All items listed on HeritX are the property of their respective owners. Users must treat rented items with the utmost care, respecting the cultural significance and heritage of each piece. Any damage incurred during the rental period is the responsibility of the renter.</p>
            <p>Late returns may be subject to additional charges as specified in the individual item listing or by the shop owner.</p>
        </Section>
        <Section title="4. Prohibited Activities">
            <p>Users are strictly prohibited from reproducing items, using them for unauthorized commercial purposes without prior consent, or engaging in any activity that demeans the cultural value of the heritage items listed on our platform.</p>
        </Section>
    </PageContainer>
);

export const Privacy = () => (
    <PageContainer title="Privacy Policy" icon={FaShieldAlt}>
        <Section title="1. Information We Collect">
            <p>At HeritX, we collect only the information necessary to provide you with an exceptional rental experience. This includes your name, contact details, delivery address, and booking history.</p>
        </Section>
        <Section title="2. How We Use Data">
            <p>We use your information effectively to facilitate bookings, verify user identities, and improve our services. We never sell your personal data to third parties.</p>
        </Section>
        <Section title="3. Data Security">
            <p>We implement industry-standard security measures to protect your personal information from unauthorized access, alteration, or disclosure. Your payment information is handled through secure, encrypted gateways.</p>
        </Section>
        <Section title="4. Your Rights">
            <p>You have the right to access, correct, or delete your personal information at any time through your profile settings or by contacting our support team.</p>
        </Section>
    </PageContainer>
);

export const Cancellation = () => (
    <PageContainer title="Cancellation & Refunds" icon={FaBan}>
        <Section title="Cancellation Window">
            <p>We understand that plans can evolve. Our flexible cancellation policy is designed to be fair to both renters and owners:</p>
            <ul style={{ paddingLeft: '20px', listStyleType: 'disc' }}>
                <li><strong>Full Refund:</strong> Cancellations made more than 48 hours before the scheduled pick-up time.</li>
                <li><strong>Partial Refund (50%):</strong> Cancellations made between 24 and 48 hours before the scheduled pick-up.</li>
                <li><strong>No Refund:</strong> Cancellations made within 24 hours of the pick-up time.</li>
            </ul>
        </Section>
        <Section title="Refund Process">
            <p>Approved refunds are automatically processed back to the original payment method within 5-10 business days. Please note that bank processing times may vary.</p>
        </Section>
        <Section title="Item Condition Disputes">
            <p>If an item received is not as described or in poor condition, users must report it within 2 hours of delivery to be eligible for a full dispute-led refund.</p>
        </Section>
    </PageContainer>
);

export const HelpCenter = () => (
    <PageContainer title="Help Center" icon={FaQuestionCircle}>
        <Section title="Frequently Asked Questions">
            <div style={{ display: 'grid', gap: '20px' }}>
                <div style={{ background: '#f9fafb', padding: '25px', borderRadius: '12px', border: '1px solid #e5e7eb' }}>
                    <h4 style={{ margin: '0 0 10px 0', fontSize: '1.1rem', color: '#111827' }}>How do I book an item?</h4>
                    <p style={{ margin: 0 }}>Simply browse our cultural collection, select your desired dates on the calendar, and click 'Add to Cart'. You can then proceed to checkout to confirm your booking.</p>
                </div>
                <div style={{ background: '#f9fafb', padding: '25px', borderRadius: '12px', border: '1px solid #e5e7eb' }}>
                    <h4 style={{ margin: '0 0 10px 0', fontSize: '1.1rem', color: '#111827' }}>Can I become a shop owner?</h4>
                    <p style={{ margin: 0 }}>Yes! If you own cultural or traditional items, you can list them on HeritX. Click on 'Become an Owner' in the footer to start the registration process.</p>
                </div>
                <div style={{ background: '#f9fafb', padding: '25px', borderRadius: '12px', border: '1px solid #e5e7eb' }}>
                    <h4 style={{ margin: '0 0 10px 0', fontSize: '1.1rem', color: '#111827' }}>What is the delivery process?</h4>
                    <p style={{ margin: 0 }}>Shop owners handle delivery/pickup as specified in the item details. Most items offer home delivery within Kerala.</p>
                </div>
            </div>
        </Section>
    </PageContainer>
);

export const Contact = () => (
    <PageContainer title="Contact Us" icon={FaEnvelope}>
        <div style={{ display: 'grid', gridTemplateColumns: 'minmax(300px, 1fr) 1fr', gap: '50px', alignItems: 'start' }}>
            <div>
                <Section title="Get in Touch">
                    <p>Have questions about HeritX? We're here to help you preserve and share Kerala's heritage. Our support team typically responds within 4 hours during business days.</p>
                </Section>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '15px' }}>
                        <div style={{ width: '45px', height: '45px', background: '#f3f4f6', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                            <FaEnvelope style={{ color: '#1a1a1a' }} />
                        </div>
                        <div>
                            <p style={{ margin: 0, fontWeight: 'bold' }}>Email Us</p>
                            <p style={{ margin: 0, color: '#6b7280' }}>support@heritx.com</p>
                        </div>
                    </div>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '15px' }}>
                        <div style={{ width: '45px', height: '45px', background: '#f3f4f6', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                            <FaPhoneAlt style={{ color: '#1a1a1a' }} />
                        </div>
                        <div>
                            <p style={{ margin: 0, fontWeight: 'bold' }}>Call Support</p>
                            <p style={{ margin: 0, color: '#6b7280' }}>+91 98765 43210</p>
                        </div>
                    </div>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '15px' }}>
                        <div style={{ width: '45px', height: '45px', background: '#f3f4f6', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                            <FaMapMarkerAlt style={{ color: '#1a1a1a' }} />
                        </div>
                        <div>
                            <p style={{ margin: 0, fontWeight: 'bold' }}>Our Office</p>
                            <p style={{ margin: 0, color: '#6b7280' }}>Heritage Hub, Kochi, Kerala</p>
                        </div>
                    </div>
                </div>
            </div>

            <form style={{ background: '#f9fafb', padding: '30px', borderRadius: '20px', border: '1px solid #e5e7eb' }}>
                <h3 style={{ margin: '0 0 20px 0', fontSize: '1.2rem' }}>Send a Message</h3>
                <div style={{ display: 'grid', gap: '15px' }}>
                    <input type="text" placeholder="Your Name" style={{ width: '100%', padding: '12px 15px', borderRadius: '10px', border: '1px solid #d1d5db' }} />
                    <input type="email" placeholder="Your Email" style={{ width: '100%', padding: '12px 15px', borderRadius: '10px', border: '1px solid #d1d5db' }} />
                    <textarea placeholder="How can we help?" rows="4" style={{ width: '100%', padding: '12px 15px', borderRadius: '10px', border: '1px solid #d1d5db', resize: 'vertical' }}></textarea>
                    <button type="submit" style={{ padding: '15px', background: '#1a1a1a', color: 'white', border: 'none', borderRadius: '30px', fontWeight: 'bold', cursor: 'pointer', transition: 'background 0.2s' }}>
                        Send Message
                    </button>
                </div>
            </form>
        </div>
    </PageContainer>
);

export const Refund = () => (
    <PageContainer title="Refund Policy" icon={FaBan}>
        <Section title="General Policy">
            <p>Our goal is your complete satisfaction. Refunds are issued in cases of cancellation according to our cancellation policy, or when an item significantly fails to match its description.</p>
        </Section>
        <Section title="Eligibility">
            <p>To be eligible for a performance-based refund, users must provide photographic evidence of the issue within 2 hours of receiving the item.</p>
        </Section>
    </PageContainer>
);
