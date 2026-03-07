import React, { useEffect, useState, useRef } from 'react';

const Home = () => {
  const [mousePos, setMousePos] = useState({ x: window.innerWidth / 2, y: window.innerHeight / 2 });

  // Ref to the container to calculate relative positions if needed
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleMouseMove = (e: MouseEvent) => {
      // Use requestAnimationFrame for smooth 60fps performance
      requestAnimationFrame(() => {
        setMousePos({ x: e.clientX, y: e.clientY });
      });
    };

    window.addEventListener('mousemove', handleMouseMove);
    return () => {
      window.removeEventListener('mousemove', handleMouseMove);
    };
  }, []);

  const calculateEyeTransform = (eyeCenterX: number, eyeCenterY: number) => {
    // Distance from eye center to mouse pointer
    const dx = mousePos.x - eyeCenterX;
    const dy = mousePos.y - eyeCenterY;

    // Angle of mouse relative to eye center
    const angle = Math.atan2(dy, dx);

    // Calculate distance the pupil should move. 
    // Cap the movement to keep it inside the eye socket (max 15px radius)
    const distance = Math.min(Math.sqrt(dx * dx + dy * dy) * 0.05, 12);

    const moveX = Math.cos(angle) * distance;
    const moveY = Math.sin(angle) * distance;

    return `translate(calc(-50% + ${moveX}px), calc(-50% + ${moveY}px))`;
  };

  // The actual screen coordinates of the eyes will update on resize or scroll. 
  // We can measure them dynamically using refs.
  const leftEyeRef = useRef<HTMLDivElement>(null);
  const rightEyeRef = useRef<HTMLDivElement>(null);

  const [leftEyeCenter, setLeftEyeCenter] = useState({ x: 0, y: 0 });
  const [rightEyeCenter, setRightEyeCenter] = useState({ x: 0, y: 0 });

  useEffect(() => {
    const updateEyeCenters = () => {
      if (leftEyeRef.current && rightEyeRef.current) {
        const leftRect = leftEyeRef.current.getBoundingClientRect();
        const rightRect = rightEyeRef.current.getBoundingClientRect();

        setLeftEyeCenter({
          x: leftRect.left + leftRect.width / 2,
          y: leftRect.top + leftRect.height / 2
        });

        setRightEyeCenter({
          x: rightRect.left + rightRect.width / 2,
          y: rightRect.top + rightRect.height / 2
        });
      }
    };

    // Initial calculation
    updateEyeCenters();

    // Recalculate on window resize
    window.addEventListener('resize', updateEyeCenters);
    return () => window.removeEventListener('resize', updateEyeCenters);
  }, []);

  return (
    <div ref={containerRef} className="hero-container">
      <style>
        {`
          /* Clean CSS Reset for the Container */
          .hero-container {
            margin: 0;
            padding: 0;
            box-sizing: border-box;
            font-family: 'Inter', system-ui, sans-serif;
            background-color: #1a1514; /* Deep, dark heritage color */
            min-height: 100vh;
            display: flex;
            align-items: center;
            justify-content: center;
            color: #f8f6f0;
            overflow: hidden;
          }

          .hero-content {
            display: flex;
            width: 100%;
            max-width: 1300px;
            padding: 2rem;
            align-items: center;
            justify-content: space-between;
            gap: 4rem;
          }

          /* LEFT SIDE - KATHAKALI IMAGE */
          .hero-left {
            flex: 1;
            display: flex;
            justify-content: center;
            align-items: center;
            position: relative;
          }

          .kathakali-wrapper {
            position: relative;
            width: 100%;
            max-width: 450px;
            border-radius: 20px;
            overflow: hidden;
            box-shadow: 0 20px 50px rgba(0, 0, 0, 0.5);
            background-color: #2a2220; /* Placeholder background */
            aspect-ratio: 3/4;
          }

          .kathakali-image {
            width: 100%;
            height: 100%;
            object-fit: cover;
            display: block;
            filter: brightness(0.9) contrast(1.1); /* Enhance dramatic look */
          }

          /* EYE TRACKING CONTAINERS */
          .eye-socket {
            position: absolute;
            width: 60px;
            height: 40px;
            background-color: #fff;
            border-radius: 50% 50% 45% 45%;
            top: 45%; /* Approximate vertical center of eyes on faces */
            box-shadow: inset 0 3px 8px rgba(0,0,0,0.6), 0 0 10px rgba(0,0,0,0.8);
            overflow: hidden; /* Keeps pupil inside */
          }

          .eye-socket.left {
            left: 31%; /* Approximate horizontal position */
            transform: rotate(-5deg);
          }

          .eye-socket.right {
            right: 31%; /* Approximate horizontal position */
            transform: rotate(5deg);
          }

          /* THE PUPILS */
          .pupil {
            position: absolute;
            top: 50%;
            left: 50%;
            width: 24px;
            height: 24px;
            background-color: #111;
            border-radius: 50%;
            /* translate(-50%, -50%) will be combined with dynamic x,y */
            transition: transform 0.1s cubic-bezier(0.25, 0.46, 0.45, 0.94);
            box-shadow: 0 0 4px #000;
          }
          
          /* Eye catchlight for realism */
          .pupil::after {
            content: '';
            position: absolute;
            top: 4px;
            left: 4px;
            width: 6px;
            height: 6px;
            background: rgba(255,255,255,0.8);
            border-radius: 50%;
          }

          /* RIGHT SIDE - CONTENT */
          .hero-right {
            flex: 1;
            display: flex;
            flex-direction: column;
            justify-content: center;
            z-index: 10;
          }

          .hero-title {
            font-size: clamp(3rem, 5vw, 4.5rem);
            font-family: 'Playfair Display', Georgia, serif; /* Heritage feel */
            font-weight: 700;
            line-height: 1.1;
            margin: 0 0 1.5rem 0;
            background: linear-gradient(to right, #ffffff, #eab308); /* White to gold */
            -webkit-background-clip: text;
            -webkit-text-fill-color: transparent;
            text-shadow: 0 4px 20px rgba(0,0,0,0.3);
          }

          .hero-subtitle {
            font-size: 1.15rem;
            line-height: 1.7;
            color: #d1cbc8;
            margin: 0 0 2.5rem 0;
            max-width: 550px;
            font-weight: 300;
          }

          .cta-button {
            display: inline-flex;
            align-items: center;
            justify-content: center;
            background: #eab308; /* Vibrant Gold */
            color: #1a1514;
            text-decoration: none;
            padding: 1rem 2.5rem;
            border-radius: 30px;
            font-size: 1.1rem;
            font-weight: 600;
            letter-spacing: 0.5px;
            transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
            align-self: flex-start;
            box-shadow: 0 4px 15px rgba(234, 179, 8, 0.3);
            border: 2px solid transparent;
          }

          .cta-button:hover {
            background: transparent;
            color: #eab308;
            border-color: #eab308;
            transform: translateY(-3px);
            box-shadow: 0 8px 25px rgba(234, 179, 8, 0.2);
          }

          /* RESPONSIVE DESIGN */
          @media (max-width: 968px) {
            .hero-content {
              flex-direction: column;
              text-align: center;
              padding: 4rem 2rem;
              gap: 3rem;
            }

            .hero-right {
              align-items: center;
            }

            .cta-button {
              align-self: center;
            }

            .kathakali-wrapper {
              max-width: 320px; /* Reduced image size for mobile */
            }
          }

          @media (max-width: 480px) {
            .hero-title {
              font-size: 2.5rem;
            }
            .hero-subtitle {
              font-size: 1rem;
            }
            .kathakali-wrapper {
              max-width: 280px;
            }
            .eye-socket {
              width: 45px;
              height: 30px;
            }
            .pupil {
              width: 18px;
              height: 18px;
            }
          }
        `}
      </style>

      <div className="hero-content">

        {/* LEFT COLUMN: KATHAKALI ANIMATION */}
        <div className="hero-left">
          <div className="kathakali-wrapper">
            {/* Highly authentic Kathakali stock image that fits this framing perfectly */}
            <img
              src="https://upload.wikimedia.org/wikipedia/commons/thumb/c/c5/Kathakali_face_makeup.jpg/800px-Kathakali_face_makeup.jpg"
              alt="Kathakali Face"
              className="kathakali-image"
            />

            {/* INVISIBLE EYE CONTAINERS */}
            <div className="eye-socket left" ref={leftEyeRef} style={{ top: '48%', left: '33%' }}>
              <div
                className="pupil"
                style={{ transform: calculateEyeTransform(leftEyeCenter.x, leftEyeCenter.y) }}
              />
            </div>

            <div className="eye-socket right" ref={rightEyeRef} style={{ top: '48.5%', right: '31%' }}>
              <div
                className="pupil"
                style={{ transform: calculateEyeTransform(rightEyeCenter.x, rightEyeCenter.y) }}
              />
            </div>

          </div>
        </div>

        {/* RIGHT COLUMN: CONTENT */}
        <div className="hero-right">
          <h1 className="hero-title">Rent Authentic Traditions</h1>
          <p className="hero-subtitle">
            Experience the elegance of Kerala's heritage without the cost of ownership.
            Rent jewelry, attire, and decor for your special occasions.
          </p>
          <a href="/rentals" className="cta-button">
            Explore Rentals
          </a>
        </div>

      </div>
    </div>
  );
};

export default Home;
