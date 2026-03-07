import React, { useState } from 'react';
import { useUserLocation } from '../context/LocationContext';
import { FaMapMarkerAlt, FaCrosshairs, FaArrowRight, FaArrowLeft, FaSpinner } from 'react-icons/fa';

const LocationPrompt = () => {
    const { location, setLocation, detectLocation, isPromptOpen, closePrompt } = useUserLocation();
    const [inputValue, setInputValue] = useState('');
    const [isDetecting, setIsDetecting] = useState(false);
    const [isSaving, setIsSaving] = useState(false);

    const handleSave = async () => {
        const val = inputValue.trim();
        if (!val) return;

        setIsSaving(true);
        const isPincode = /^\d+$/.test(val);
        await setLocation({
            city: isPincode ? '' : val,
            pincode: isPincode ? val : '',
            manual: true
            // lat/lng will be geocoded inside setLocation (LocationContext)
        });
        setInputValue('');
        setIsSaving(false);
    };

    const handleDetect = async () => {
        setIsDetecting(true);
        try {
            const loc = await detectLocation();
            await setLocation(loc);
            setInputValue('');
        } catch (err) {
            alert('Could not detect location. Please enter manually.');
        } finally {
            setIsDetecting(false);
        }
    };

    if (!isPromptOpen) return null;

    const busy = isDetecting || isSaving;

    return (
        <div style={{
            position: 'fixed', top: 0, left: 0, right: 0, bottom: 0,
            backgroundColor: 'rgba(0,0,0,0.65)', zIndex: 10000,
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            backdropFilter: 'blur(6px)', animation: 'fadeIn 0.2s ease'
        }}>
            <div style={{
                background: 'white', padding: '44px', borderRadius: '28px',
                width: '90%', maxWidth: '460px', boxShadow: '0 24px 60px rgba(0,0,0,0.22)',
                textAlign: 'center', position: 'relative'
            }}>
                {/* Back button — only when user already has a location */}
                {location && (
                    <button
                        onClick={closePrompt}
                        style={{
                            position: 'absolute', top: '16px', left: '16px',
                            background: '#f1f5f9', border: 'none', borderRadius: '50%',
                            width: '36px', height: '36px', display: 'flex', alignItems: 'center',
                            justifyContent: 'center', cursor: 'pointer', color: '#475569'
                        }}
                        title="Go back"
                    >
                        <FaArrowLeft size={14} />
                    </button>
                )}

                {/* Icon */}
                <div style={{
                    width: '72px', height: '72px', borderRadius: '50%',
                    background: 'linear-gradient(135deg, #1a1a1a, #444)',
                    display: 'flex', alignItems: 'center', justifyContent: 'center',
                    margin: '0 auto 20px', boxShadow: '0 8px 25px rgba(0,0,0,0.2)'
                }}>
                    <FaMapMarkerAlt color="white" size={28} />
                </div>

                <h2 style={{ fontSize: '1.8rem', fontWeight: 'bold', marginBottom: '8px', color: '#1a1a1a' }}>
                    Select Your Location
                </h2>
                <p style={{ color: '#64748b', marginBottom: '28px', fontSize: '0.95rem', lineHeight: '1.5' }}>
                    Discover Kerala treasures available for rent near you.
                </p>

                {/* Detect Button */}
                <button
                    id="detect-location-btn"
                    onClick={handleDetect}
                    disabled={busy}
                    style={{
                        width: '100%', padding: '15px', background: busy ? '#f1f5f9' : '#f8f9fa',
                        border: '2px solid #e2e8f0', borderRadius: '14px',
                        display: 'flex', alignItems: 'center', justifyContent: 'center',
                        gap: '10px', fontWeight: '600', cursor: busy ? 'not-allowed' : 'pointer',
                        transition: 'all 0.2s', color: '#1a1a1a', marginBottom: '18px', fontSize: '0.95rem'
                    }}
                    onMouseOver={(e) => !busy && (e.currentTarget.style.borderColor = '#1a1a1a')}
                    onMouseOut={(e) => !busy && (e.currentTarget.style.borderColor = '#e2e8f0')}
                >
                    {isDetecting
                        ? <><FaSpinner className="spin" size={14} color="#4285f4" /> Detecting...</>
                        : <><FaCrosshairs color="#4285f4" size={14} /> Use Current Location</>
                    }
                </button>

                {/* Divider */}
                <div style={{ display: 'flex', alignItems: 'center', gap: '12px', color: '#94a3b8', margin: '18px 0' }}>
                    <div style={{ flex: 1, height: '1px', background: '#e2e8f0' }} />
                    <span style={{ fontSize: '0.85rem', fontWeight: '600' }}>OR</span>
                    <div style={{ flex: 1, height: '1px', background: '#e2e8f0' }} />
                </div>

                {/* Manual Input */}
                <div style={{ position: 'relative', marginBottom: '22px' }}>
                    <FaMapMarkerAlt style={{
                        position: 'absolute', left: '16px', top: '50%',
                        transform: 'translateY(-50%)', color: '#94a3b8', pointerEvents: 'none'
                    }} />
                    <input
                        id="location-input"
                        type="text"
                        placeholder="Enter City or Pincode"
                        value={inputValue}
                        onChange={(e) => setInputValue(e.target.value)}
                        onKeyDown={(e) => e.key === 'Enter' && !busy && handleSave()}
                        disabled={busy}
                        style={{
                            width: '100%', padding: '15px 15px 15px 46px',
                            border: '2px solid #e2e8f0', borderRadius: '14px',
                            fontSize: '1rem', outline: 'none', transition: 'border-color 0.2s',
                            boxSizing: 'border-box', color: '#1a1a1a', fontWeight: '500'
                        }}
                        onFocus={(e) => e.currentTarget.style.borderColor = '#1a1a1a'}
                        onBlur={(e) => e.currentTarget.style.borderColor = '#e2e8f0'}
                    />
                </div>

                {/* Save Button */}
                <button
                    id="save-location-btn"
                    onClick={handleSave}
                    disabled={!inputValue.trim() || busy}
                    style={{
                        width: '100%', padding: '16px',
                        background: (!inputValue.trim() || busy) ? '#94a3b8' : '#1a1a1a',
                        color: 'white', border: 'none', borderRadius: '14px',
                        fontSize: '1rem', fontWeight: '700', cursor: (!inputValue.trim() || busy) ? 'not-allowed' : 'pointer',
                        display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '10px',
                        transition: 'all 0.2s'
                    }}
                >
                    {isSaving
                        ? <><FaSpinner className="spin" size={14} /> Finding location...</>
                        : <>Save Location <FaArrowRight size={14} /></>
                    }
                </button>

                <p style={{ marginTop: '16px', fontSize: '0.8rem', color: '#94a3b8' }}>
                    📍 Location is stored locally and never shared
                </p>
            </div>

            <style>{`
                @keyframes spin { to { transform: rotate(360deg); } }
                .spin { animation: spin 0.8s linear infinite; }
                @keyframes fadeIn { from { opacity: 0; } to { opacity: 1; } }
            `}</style>
        </div>
    );
};

export default LocationPrompt;
