import React, { useEffect, useState, useRef } from 'react';
import { MapContainer, TileLayer, Marker, Popup, useMap, useMapEvents, LayersControl } from 'react-leaflet';
import { useNavigate } from 'react-router-dom';
import { MdMyLocation } from 'react-icons/md';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';

// Fix Leaflet default marker icon broken by Vite bundler
import markerIcon2x from 'leaflet/dist/images/marker-icon-2x.png';
import markerIcon from 'leaflet/dist/images/marker-icon.png';
import markerShadow from 'leaflet/dist/images/marker-shadow.png';

delete L.Icon.Default.prototype._getIconUrl;
L.Icon.Default.mergeOptions({ iconUrl: markerIcon, iconRetinaUrl: markerIcon2x, shadowUrl: markerShadow });

// High-end custom SVG-like pin for Shops
const createCustomIcon = (bgColor, textColor, iconEmoji) => {
    return new L.divIcon({
        className: 'custom-div-icon',
        html: `
            <div style="background-color: ${bgColor}; width: 34px; height: 34px; border-radius: 50% 50% 50% 0; transform: rotate(-45deg); display: flex; align-items: center; justify-content: center; box-shadow: 0 4px 8px rgba(0,0,0,0.3); border: 2px solid white;">
                <span style="transform: rotate(45deg); font-size: 16px; color: ${textColor}; line-height: 1; display: block;">${iconEmoji}</span>
            </div>
            <div style="width: 10px; height: 4px; background: rgba(0,0,0,0.2); border-radius: 50%; margin: 4px auto 0 auto; filter: blur(1px);"></div>
        `,
        iconSize: [34, 45],
        iconAnchor: [17, 45],
        popupAnchor: [0, -42]
    });
};

const nearbyIcon = createCustomIcon('#1e293b', '#fff', '🏷️');
const userIcon = createCustomIcon('#3b82f6', '#fff', '⭐');

// Sub-component: auto-fit bounds to show all markers
const MapBoundsFitter = ({ userCoords, shopCoords }) => {
    const map = useMap();
    const initialFitDone = useRef(false);

    // Fix for grey map tiles: watch the container for layout changes
    useEffect(() => {
        let timeoutId;
        const resizeObserver = new ResizeObserver(() => {
            clearTimeout(timeoutId);
            timeoutId = setTimeout(() => {
                map.invalidateSize();
            }, 100);
        });

        const container = map.getContainer();
        if (container) {
            resizeObserver.observe(container);
        }

        // Initial force
        setTimeout(() => map.invalidateSize(), 50);

        return () => {
            clearTimeout(timeoutId);
            if (container) resizeObserver.unobserve(container);
            resizeObserver.disconnect();
        };
    }, [map]);

    // Fit bounds to show User + all Shops (only when coords actually change)
    useEffect(() => {
        if (initialFitDone.current) return; // Prevent fighting with Locate Me or manual panning

        const bounds = L.latLngBounds([]);
        let hasPoints = false;

        // Ensure user coordinates are valid numbers before extending
        const validUserLat = parseFloat(userCoords?.[0]);
        const validUserLng = parseFloat(userCoords?.[1]);
        if (!isNaN(validUserLat) && !isNaN(validUserLng)) {
            bounds.extend([validUserLat, validUserLng]);
            hasPoints = true;
        }

        // Ensure shop coordinates are valid numbers before extending
        if (shopCoords && shopCoords.length > 0) {
            shopCoords.forEach(coord => {
                const validLat = parseFloat(coord.lat);
                const validLng = parseFloat(coord.lng);
                if (!isNaN(validLat) && !isNaN(validLng)) {
                    bounds.extend([validLat, validLng]);
                    hasPoints = true;
                }
            });
        }

        if (hasPoints && bounds.isValid()) {
            map.invalidateSize(); // Ensure container is ready before fitting
            // Padding so markers aren't exactly on the screen edge
            map.fitBounds(bounds, { padding: [50, 50], maxZoom: 14, animate: true, duration: 1 });
            initialFitDone.current = true;
        }
    }, [userCoords, shopCoords, map]);

    return null;
};

// Sub-component: Locate Me Button
const LocateControl = () => {
    const map = useMapEvents({
        locationfound(e) {
            map.flyTo(e.latlng, map.getZoom(), { animate: true, duration: 1.5 });
            // Pulse effect can be added here if desired.
        },
        locationerror(e) {
            console.warn("Location error:", e.message);
            alert("Could not automatically determine your location. Please check your browser permissions.");
        },
    });

    return (
        <div className="leaflet-top leaflet-right" style={{ marginTop: '70px', marginRight: '10px' }}>
            <div className="leaflet-control leaflet-bar">
                <button
                    onClick={(e) => {
                        e.preventDefault();
                        map.locate();
                    }}
                    title="Find My Location"
                    style={{
                        width: '34px', height: '34px', background: 'white', border: 'none', cursor: 'pointer',
                        display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#1e293b', fontSize: '1.2rem'
                    }}
                >
                    <MdMyLocation />
                </button>
            </div>
        </div>
    );
};

/**
 * MapView — Leaflet-based shop map
 *
 * Props:
 *   userCity    {string}   — city name for filtering & centering fallback
 *   userLat     {number}   — user's latitude  (preferred over geocoding city)
 *   userLng     {number}   — user's longitude (preferred over geocoding city)
 *   singleShop  {object}   — { lat, lng, name, city } — show only one marker (ShopProfile mode)
 *   height      {string}   — container height (default '420px')
 */
const MapView = ({ userCity, userLat, userLng, singleShop, height = '420px' }) => {
    const [shops, setShops] = useState([]);
    const [center, setCenter] = useState([10.8505, 76.2711]); // Default: Kerala center
    const navigate = useNavigate();

    // ── Determine initial/updated map center fallback ─────────────────────────
    useEffect(() => {
        // Fallback — geocode city string (only if no coords available)
        if (!userLat && !userLng && userCity && !singleShop) {
            fetch(`https://nominatim.openstreetmap.org/search?city=${encodeURIComponent(userCity)}&format=json&limit=1`)
                .then(r => r.json())
                .then(data => {
                    if (data && data.length > 0) {
                        const fetchedLat = parseFloat(data[0].lat);
                        const fetchedLng = parseFloat(data[0].lon);
                        if (!isNaN(fetchedLat) && !isNaN(fetchedLng)) {
                            setCenter([fetchedLat, fetchedLng]);
                        }
                    }
                })
                .catch(() => { });
        }
    }, [userLat, userLng, userCity, singleShop]);

    // ── Fetch all shop locations (skip in singleShop mode) ───────────────────
    useEffect(() => {
        if (singleShop) return;
        // The instruction implies a change from 3001 to default port, but the original code already uses the default.
        // Assuming the user intended to add the imageUrl line and ensure it uses the correct path.
        // The line below is added as per the provided 'Code Edit' snippet.
        // If 'matchedDbItem' is not defined in this scope, this line might cause an error.
        // For now, it's placed as per the instruction's context.
        // const imageUrl = matchedDbItem.image_url ? `http://localhost/HertiX/uploads/${matchedDbItem.image_url}` : null;
        fetch('http://localhost/HertiX/user-dashboard/backend/api/shop_locations.php')
            .then(r => r.json())
            .then(data => Array.isArray(data) ? setShops(data) : [])
            .catch(err => console.error('MapView fetch err:', err));
    }, [singleShop]);

    const shopsToRender = singleShop
        ? [{ shopId: 0, shopName: singleShop.name, city: singleShop.city, latitude: singleShop.lat, longitude: singleShop.lng, totalItems: null }]
        : shops;

    return (
        <div style={{
            borderRadius: '20px', overflow: 'hidden',
            border: '1px solid #e2e8f0',
            boxShadow: '0 4px 20px rgba(0,0,0,0.1)',
            height
        }}>
            <style>{`
                .custom-div-icon {
                    background: none;
                    border: none;
                    transition: transform 0.2s cubic-bezier(0.175, 0.885, 0.32, 1.275);
                }
                .custom-div-icon:hover {
                    transform: scale(1.1) translateY(-5px) !important;
                    z-index: 1000 !important;
                }
                .leaflet-container {
                    z-index: 1 !important;
                    font-family: inherit !important;
                }
                /* Custom stylish popup */
                .leaflet-popup-content-wrapper {
                    border-radius: 12px;
                    box-shadow: 0 10px 25px -5px rgba(0, 0, 0, 0.1), 0 8px 10px -6px rgba(0, 0, 0, 0.1);
                    padding: 0;
                    overflow: hidden;
                }
                .leaflet-popup-content {
                    margin: 0 !important;
                    width: 220px !important;
                }
                .leaflet-popup-tip-container {
                    margin-top: -1px;
                }
            `}</style>
            <MapContainer center={center} zoom={10} style={{ height: '100%', width: '100%' }} scrollWheelZoom={false}>

                <LayersControl position="topright">
                    <LayersControl.BaseLayer checked name="Modern Street">
                        <TileLayer
                            attribution='&copy; <a href="https://carto.com/">Carto</a>'
                            url="https://{s}.basemaps.cartocdn.com/rastertiles/voyager/{z}/{x}/{y}{r}.png"
                        />
                    </LayersControl.BaseLayer>
                    <LayersControl.BaseLayer name="Realistic Satellite">
                        <TileLayer
                            attribution='&copy; <a href="https://www.esri.com/">Esri</a>'
                            url="https://server.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer/tile/{z}/{y}/{x}"
                        />
                    </LayersControl.BaseLayer>
                </LayersControl>

                {/* Tracking & Fitting */}
                <LocateControl />
                <MapBoundsFitter
                    userCoords={userLat && userLng ? [userLat, userLng] : (userCity ? center : null)}
                    shopCoords={shopsToRender.map(s => ({ lat: s.latitude, lng: s.longitude }))}
                />

                {/* User location marker */}
                {userLat && userLng && (
                    <Marker position={[userLat, userLng]} icon={userIcon}>
                        <Popup>
                            <div style={{ padding: '15px' }}>
                                <div style={{ fontSize: '0.75rem', textTransform: 'uppercase', letterSpacing: '1px', color: '#3b82f6', fontWeight: 700, marginBottom: '5px' }}>You are here</div>
                                <div style={{ fontWeight: 600, color: '#1e293b' }}>Detected Location</div>
                                <div style={{ fontSize: '0.85rem', color: '#64748b', marginTop: '2px' }}>{userCity || 'Searching local area...'}</div>
                            </div>
                        </Popup>
                    </Marker>
                )}

                {/* Shop markers */}
                {shopsToRender.map((shop, index) => {
                    const validLat = parseFloat(shop.latitude);
                    const validLng = parseFloat(shop.longitude);
                    if (isNaN(validLat) || isNaN(validLng)) return null;

                    return (
                        <Marker
                            key={shop.shopId ?? `shop-${index}`}
                            position={[validLat, validLng]}
                            icon={nearbyIcon}
                        >
                            <Popup>
                                <div style={{ display: 'flex', flexDirection: 'column' }}>
                                    <div style={{ background: '#f8fafc', padding: '12px 15px', borderBottom: '1px solid #e2e8f0' }}>
                                        <div style={{ fontWeight: 700, fontSize: '1rem', color: '#0f172a', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                                            {shop.shopName}
                                        </div>
                                        <div style={{ color: '#64748b', fontSize: '0.8rem', marginTop: '2px', display: 'flex', alignItems: 'center', gap: '4px' }}>
                                            📍 {shop.city}
                                        </div>
                                    </div>
                                    <div style={{ padding: '15px' }}>
                                        {shop.totalItems !== null && (
                                            <div style={{ background: '#fef3c7', color: '#92400e', display: 'inline-block', padding: '4px 10px', borderRadius: '20px', fontSize: '0.75rem', fontWeight: 600, marginBottom: '15px' }}>
                                                {shop.totalItems} item{shop.totalItems !== 1 ? 's' : ''} available
                                            </div>
                                        )}
                                        {!singleShop && (
                                            <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                                                <button
                                                    onClick={() => navigate(`/shop/${shop.shopId}`)}
                                                    style={{
                                                        width: '100%', padding: '10px 0',
                                                        background: '#1e293b', color: 'white',
                                                        border: 'none', borderRadius: '6px',
                                                        cursor: 'pointer', fontWeight: '600', fontSize: '0.85rem',
                                                        transition: 'background 0.2s',
                                                        boxShadow: '0 2px 4px rgba(0,0,0,0.1)'
                                                    }}
                                                    onMouseOver={(e) => e.target.style.background = '#0f172a'}
                                                    onMouseOut={(e) => e.target.style.background = '#1e293b'}
                                                >
                                                    Visit Storefront
                                                </button>
                                                <button
                                                    onClick={() => {
                                                        const dest = `${validLat},${validLng}`;
                                                        let url = `https://www.google.com/maps/dir/?api=1&destination=${dest}`;
                                                        if (userLat && userLng && !isNaN(parseFloat(userLat))) {
                                                            url += `&origin=${parseFloat(userLat)},${parseFloat(userLng)}`;
                                                        }
                                                        window.open(url, '_blank');
                                                    }}
                                                    style={{
                                                        width: '100%', padding: '10px 0',
                                                        background: '#e0e7ff', color: '#4338ca',
                                                        border: '1px solid #c7d2fe', borderRadius: '6px',
                                                        cursor: 'pointer', fontWeight: '600', fontSize: '0.85rem',
                                                        transition: 'background 0.2s',
                                                        display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '6px'
                                                    }}
                                                    onMouseOver={(e) => e.target.style.background = '#c7d2fe'}
                                                    onMouseOut={(e) => e.target.style.background = '#e0e7ff'}
                                                >
                                                    Get Directions 🗺️
                                                </button>
                                            </div>
                                        )}
                                    </div>
                                </div>
                            </Popup>
                        </Marker>
                    );
                })}
            </MapContainer>
        </div>
    );
};

export default MapView;
