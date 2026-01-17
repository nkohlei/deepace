import { useEffect, useState } from 'react';
import './Maintenance.css';

const Maintenance = () => {
    // Generate random positions for floating images
    const [floatingImages, setFloatingImages] = useState([]);

    useEffect(() => {
        // Create 15 floating images with random properties
        const images = Array.from({ length: 15 }).map((_, i) => ({
            id: i,
            left: `${Math.random() * 100}%`,
            animationDuration: `${15 + Math.random() * 20}s`, // Slower, more elegant
            animationDelay: `${Math.random() * -20}s`,
            scale: 0.5 + Math.random() * 0.5, // vary size between 0.5 and 1.0
            opacity: 0.3 + Math.random() * 0.4
        }));
        setFloatingImages(images);
    }, []);

    return (
        <div className="maintenance-container">
            {/* Background Layer with Floating Images */}
            <div className="floating-images-container">
                {floatingImages.map((img) => (
                    <div 
                        key={img.id}
                        className="floating-image"
                        style={{
                            left: img.left,
                            animationDuration: img.animationDuration,
                            animationDelay: img.animationDelay,
                            transform: `scale(${img.scale})`,
                            opacity: img.opacity
                        }}
                    >
                        <img src="/assets/renovate.jpg" alt="" />
                    </div>
                ))}
            </div>

            {/* Overlay Gradient for readability */}
            <div className="maintenance-overlay"></div>

            {/* Main Content */}
            <div className="maintenance-content">
                <h1 className="glitch-text" data-text="Yenileniyoruz">Yenileniyoruz</h1>
                
                <div className="message-box">
                    <p className="primary-message">
                        Daha sorunsuz ve daha mükemmel bir hizmet için çalışıyoruz.
                    </p>
                    <p className="secondary-message">
                        Hizmette zahmet olmaz, geri geleceğiz.
                    </p>
                </div>
            </div>
            
            <div className="brand-tag">
                <span>PRJCTV</span>
            </div>
        </div>
    );
};

export default Maintenance;
