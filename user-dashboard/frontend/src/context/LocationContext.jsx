import React, { createContext, useContext, useState } from 'react';

const LocationContext = createContext();

// Geocode a city string → { lat, lng } using Nominatim (free, no key)
const geocodeCity = async (city) => {
    try {
        const res = await fetch(
            `https://nominatim.openstreetmap.org/search?city=${encodeURIComponent(city)}&format=json&limit=1`,
            { headers: { 'Accept-Language': 'en' } }
        );
        const data = await res.json();
        if (data && data.length > 0) {
            return { lat: parseFloat(data[0].lat), lng: parseFloat(data[0].lon) };
        }
    } catch (e) {
        console.warn('Geocoding failed:', e);
    }
    return null;
};

export const LocationProvider = ({ children }) => {
    const [location, setLocationState] = useState(() => {
        const saved = localStorage.getItem('hertix_user_location');
        return saved ? JSON.parse(saved) : null;
    });

    // Controls whether the location prompt modal is open.
    const [isPromptOpen, setIsPromptOpen] = useState(() => {
        return !localStorage.getItem('hertix_user_location');
    });

    // Sets location + persists to localStorage.
    // If city provided but no coords, geocodes first.
    const setLocation = async (loc) => {
        if (!loc) {
            setIsPromptOpen(true);
            return;
        }

        let enriched = { ...loc };

        // Geocode if city provided but coords missing
        if (loc.city && (loc.lat == null || loc.lng == null)) {
            const coords = await geocodeCity(loc.city);
            if (coords) {
                enriched.lat = coords.lat;
                enriched.lng = coords.lng;
            }
        }

        localStorage.setItem('hertix_user_location', JSON.stringify(enriched));
        setLocationState(enriched);
        setIsPromptOpen(false);
    };

    const openPrompt = () => setIsPromptOpen(true);
    const closePrompt = () => setIsPromptOpen(false);

    // Browser geolocation → reverse geocode → returns { city, pincode, lat, lng, manual: false }
    const detectLocation = () => {
        return new Promise((resolve, reject) => {
            if (!navigator.geolocation) { reject('Geolocation not supported'); return; }

            navigator.geolocation.getCurrentPosition(
                async (position) => {
                    const { latitude, longitude } = position.coords;
                    try {
                        const res = await fetch(`https://nominatim.openstreetmap.org/reverse?format=jsonv2&lat=${latitude}&lon=${longitude}`);
                        const data = await res.json();
                        const addr = data.address || {};
                        const city = addr.city || addr.town || addr.village || addr.suburb || addr.state_district || '';
                        const pincode = addr.postcode || '';
                        resolve({ city, pincode, lat: latitude, lng: longitude, manual: false });
                    } catch (err) {
                        console.error('Reverse Geocoding Error:', err);
                        reject('Error fetching location details');
                    }
                },
                (error) => { console.error('Geolocation Error:', error); reject(error); },
                { enableHighAccuracy: true, timeout: 8000, maximumAge: 0 }
            );
        });
    };

    return (
        <LocationContext.Provider value={{ location, setLocation, detectLocation, isPromptOpen, openPrompt, closePrompt }}>
            {children}
        </LocationContext.Provider>
    );
};

export const useUserLocation = () => {
    const context = useContext(LocationContext);
    if (!context) throw new Error('useUserLocation must be used within LocationProvider');
    return context;
};
