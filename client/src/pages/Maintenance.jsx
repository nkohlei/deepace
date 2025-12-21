import './Maintenance.css';

const Maintenance = () => {
    return (
        <div className="maintenance-container">
            <div className="maintenance-content">
                <div className="maintenance-icon">🔧</div>
                <h1>Bakım Çalışması</h1>
                <p>
                    Sitemiz şu anda bakım çalışması nedeniyle geçici olarak kapalıdır.
                    <br />
                    En kısa sürede geri döneceğiz!
                </p>
                <div className="maintenance-footer">
                    <span>deepace</span>
                </div>
            </div>
        </div>
    );
};

export default Maintenance;
