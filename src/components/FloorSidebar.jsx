// FloorSidebar — elevator-style left panel for floor selection
// Preserves exact same CSS classes and visual style as original
export default function FloorSidebar({ floors, currentFloorId, onFloorSelect, matchingFloorIds = [] }) {
  // Show floors from lowest (G1) to highest (Floor 13)
  const sorted = [...floors].sort((a, b) => a.numId - b.numId);

  return (
    <nav className="floor-sidebar" id="floor-sidebar" aria-label="Floor Selector Elevator Panel">
      <div className="floor-sidebar-title">VISTAS Levels</div>

      {sorted.map((floor) => {
        const isActive = floor.id === currentFloorId;
        const isLocked = floor.locked;
        const isPulse = matchingFloorIds.includes(floor.id);

        const blockClass = [
          'floor-block',
          isActive ? 'active' : '',
          isLocked ? 'locked' : '',
          isPulse ? 'pulse-match' : '',
        ]
          .filter(Boolean)
          .join(' ');

        return (
          <button
            key={floor.id}
            className={blockClass}
            onClick={() => !isLocked && onFloorSelect(floor.id)}
            disabled={isLocked}
            aria-label={`Go to ${floor.name}`}
          >
            <div className="floor-num" data-floor-id={floor.id}>
              {floor.label}
            </div>
            <div className="floor-info">
              <span className="floor-name">{floor.name}</span>
              {floor.tag && (
                <span className="floor-tag" style={{ fontSize: '0.75rem', fontWeight: 'bold', color: 'var(--gold-500)', letterSpacing: '0.05em' }}>
                  {floor.tag}
                </span>
              )}
              <span className="floor-rooms" title={floor.facilities}>
                {floor.facilities}
              </span>
            </div>
            {isLocked && <span className="locked-badge">W.I.P</span>}
          </button>
        );
      })}
    </nav>
  );
}
