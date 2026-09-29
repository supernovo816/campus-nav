const academicDivisions = [
  { name: 'BCA Department', floorId: 'floor3' },
  { name: 'BSc Department', floorId: 'floor6' },
  { name: 'Flight Simulation Lab', floorId: 'floor7' },
  { name: 'Aviation Department', floorId: 'floor8' },
  { name: 'B.Com Department', floorId: 'floor9' },
  { name: 'IDEA Lab', floorId: 'floor10' },
  { name: 'MCA Department', floorId: 'floor11' },
];

export default function LandingPage({ onNavigate }) {
  return (
    <main className="landing-container" id="landing-page">
      {/* Left Hero Column */}
      <section className="hero-column" aria-label="Campus Hero View">
        <img src="/vels_collage.jpeg" alt="VISTAS Campus View" className="hero-img" />
        <div className="hero-overlay">
          <span className="subtitle">ESTABLISHED 2026</span>
          <h1 style={{ fontSize: '2.1rem', lineHeight: 1.3, marginBottom: '0.8rem' }}>
            Vels Institute of Science, Technology and Advanced Studies
            <br />
            <span>(VISTAS)</span>
          </h1>
          <p>
            Welcome to our central innovation hub. Navigate seamlessly through our
            state-of-the-art laboratory corridors and study wings.
          </p>
        </div>
      </section>

      {/* Right Departments & CTA Column */}
      <section className="details-column" aria-label="Campus Directory">
        <div className="details-header">
          <img src="/vels_logo.jpeg" alt="VISTAS Logo" className="college-logo" />
          <span className="subtitle">Campus Directory</span>
          <h2 style={{ fontSize: '1.6rem', lineHeight: 1.3, marginTop: '0.5rem' }}>
            Vels Institute of Science, Technology and Advanced Studies (VISTAS)
          </h2>
          <p>
            Select a department below to inspect its primary campus wing or click
            explore to search for rooms across all floors.
          </p>
        </div>

        {/* Scrollable Divisions List */}
        <div className="dept-section">
          <h3>Academic Divisions</h3>
          <div className="dept-list" id="dept-list">
            {academicDivisions.map((dept) => (
              <div
                key={dept.name}
                className="dept-card"
                onClick={() => onNavigate(dept.floorId)}
                role="button"
                tabIndex={0}
                onKeyDown={(e) => e.key === 'Enter' && onNavigate(dept.floorId)}
                aria-label={dept.name}
              >
                <div className="dept-info">
                  <h4>{dept.name}</h4>
                </div>
                <div className="dept-arrow">➔</div>
              </div>
            ))}
          </div>
        </div>

        {/* Footer & CTA Button */}
        <div className="details-footer">
          <button className="btn-primary" id="explore-cta-btn" onClick={() => onNavigate('floor1')}>
            Navigate Now &nbsp;➔
          </button>
        </div>
      </section>
    </main>
  );
}
