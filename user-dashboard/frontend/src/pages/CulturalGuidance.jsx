import React from 'react';

const CulturalGuidance = () => {
    return (
        <div style={{ maxWidth: '800px' }}>
            <h1>Cultural Guidance & Heritage</h1>
            <p style={{ color: '#666', fontSize: '1.1rem', marginTop: '10px' }}>
                Understanding the traditions behind the items you rent is crucial for respecting our heritage.
            </p>

            <div style={{ marginTop: '30px' }}>
                <section style={{ background: 'white', padding: '25px', borderRadius: '12px', marginBottom: '20px' }}>
                    <h2 style={{ color: '#1a1a1a' }}>Handling Kasavu</h2>
                    <p style={{ marginTop: '10px', lineHeight: '1.6' }}>
                        The Kerala Kasavu saree and mundu are symbols of purity and elegance.
                        Keep them away from direct soil and oil. Always fold them neatly along the gold border (zari)
                        to prevent creasing/damaging the threads.
                    </p>
                </section>

                <section style={{ background: 'white', padding: '25px', borderRadius: '12px', marginBottom: '20px' }}>
                    <h2 style={{ color: '#1a1a1a' }}>Nettipattam Usage</h2>
                    <p style={{ marginTop: '10px', lineHeight: '1.6' }}>
                        Originally used to adorn elephants during festivals, the Nettipattam is now a popular wall decor
                        believed to bring prosperity. When hanging, ensure it is placed at a height and not touched
                        frequently to maintain its luster.
                    </p>
                </section>

                <section style={{ background: 'white', padding: '25px', borderRadius: '12px', marginBottom: '20px' }}>
                    <h2 style={{ color: '#1a1a1a' }}>Temple Jewelry</h2>
                    <p style={{ marginTop: '10px', lineHeight: '1.6' }}>
                        Our rental jewelry includes authentic designs. Please ensure no perfumes or hairsprays are
                        sprayed directly onto the ornaments as chemicals can tarnish the gold plating.
                    </p>
                </section>
            </div>
        </div>
    );
};

export default CulturalGuidance;
