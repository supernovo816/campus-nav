// B1 Parking Floor Page
// Displays parking statistics and an SVG parking layout map
import { floors } from '../../data/floorData';

// Generate parking spots: rows of spots with statuses
const ROWS = [
  { label: 'Row A', count: 10, statuses: ['available','available','occupied','available','available','occupied','available','available','occupied','available'] },
  { label: 'Row B', count: 10, statuses: ['occupied','occupied','available','available','reserved','available','occupied','available','available','available'] },
  { label: 'Row C', count: 10, statuses: ['available','available','available','occupied','available','available','available','reserved','occupied','available'] },
  { label: 'Row D', count: 10, statuses: ['available','occupied','available','available','available','occupied','available','available','reserved','available'] },
];

const STATUS_COLOR = {
  available: '#35c6d9',
  occupied: '#2a271f',
  reserved: '#cfa13a',
};

const STATUS_STROKE = {
  available: '#4de0ed',
  occupied: '#3d3a30',
  reserved: '#e8c15f',
};

function countByStatus(status) {
  return ROWS.reduce((acc, row) => acc + row.statuses.filter((s) => s === status).length, 0);
}

export default function ParkingPage({ highlightedRoomId }) {
  // Look up highlighted room from B1 floor data
  const b1Floor = floors.find((f) => f.id === 'b1');
  const highlightedRoom = highlightedRoomId
    ? b1Floor?.rooms.find((r) => r.id === highlightedRoomId)
    : null;
  const totalSpots = ROWS.reduce((a, r) => a + r.count, 0);
  const available = countByStatus('available');
  const occupied = countByStatus('occupied');
  const reserved = countByStatus('reserved');

  const spotW = 46;
  const spotH = 30;
  const spotGapX = 8;
  const spotGapY = 16;
  const rowLabelW = 36;
  const startX = 20;
  const startY = 20;

  // Build SVG spots
  const svgRows = ROWS.map((row, rowIdx) => {
    const y = startY + rowIdx * (spotH + spotGapY + 20);
    const spots = row.statuses.map((status, i) => {
      const x = startX + rowLabelW + i * (spotW + spotGapX);
      const icon = status === 'available' ? '' : status === 'reserved' ? 'R' : '';
      return (
        <g key={i}>
          <rect
            x={x} y={y}
            width={spotW} height={spotH}
            rx={4}
            fill={STATUS_COLOR[status]}
            stroke={STATUS_STROKE[status]}
            strokeWidth={1}
            opacity={status === 'occupied' ? 0.6 : 1}
          />
          {status === 'reserved' && (
            <text
              x={x + spotW / 2} y={y + spotH / 2 + 4}
              textAnchor="middle"
              fill="#e8c15f"
              fontSize={10}
              fontFamily="Outfit, sans-serif"
              fontWeight="700"
            >
              R
            </text>
          )}
          {status === 'occupied' && (
            <text
              x={x + spotW / 2} y={y + spotH / 2 + 4}
              textAnchor="middle"
              fill="#5a5850"
              fontSize={14}
              fontFamily="sans-serif"
            >
              🚗
            </text>
          )}
          {status === 'available' && (
            <text
              x={x + spotW / 2} y={y + spotH / 2 + 4}
              textAnchor="middle"
              fill="#4de0ed"
              fontSize={10}
              fontFamily="Outfit, sans-serif"
            >
              P
            </text>
          )}
        </g>
      );
    });

    return (
      <g key={row.label}>
        <text
          x={startX + rowLabelW - 4} y={y + spotH / 2 + 4}
          textAnchor="end"
          fill="#8b8579"
          fontSize={11}
          fontFamily="Outfit, sans-serif"
          fontWeight={600}
        >
          {row.label}
        </text>
        {spots}
      </g>
    );
  });

  const svgHeight = startY + ROWS.length * (spotH + spotGapY + 20) + 20;
  const svgWidth = startX + rowLabelW + 10 * (spotW + spotGapX) - spotGapX + 20;

  return (
    <div className="parking-page">
      {/* Search Highlight Banner */}
      {highlightedRoom && (
        <div className="search-highlight-banner" id="parking-highlight-banner" role="status" aria-live="polite">
          <span className="search-highlight-icon">{highlightedRoom.icon}</span>
          <div className="search-highlight-text">
            <strong>{highlightedRoom.name}</strong>
            <span>B1 — Basement Parking</span>
          </div>
          <span className="search-highlight-badge">📍 Located Here</span>
        </div>
      )}
      {/* Header */}
      <div className="parking-header">
        <div className="parking-header-info">
          <h2>B1 — Basement Parking</h2>
          <p>Underground vehicle parking facility. {available} spots currently available.</p>
        </div>
        <div className="parking-badge">
          <span>🚗</span> Parking Level B1
        </div>
      </div>

      {/* Stats */}
      <div className="parking-stats">
        <div className="parking-stat-card">
          <div className="parking-stat-num">{available}</div>
          <div className="parking-stat-label">Available</div>
        </div>
        <div className="parking-stat-card">
          <div className="parking-stat-num" style={{ color: '#8b8579' }}>{occupied}</div>
          <div className="parking-stat-label">Occupied</div>
        </div>
        <div className="parking-stat-card">
          <div className="parking-stat-num" style={{ color: 'var(--gold-300)' }}>{reserved}</div>
          <div className="parking-stat-label">Reserved</div>
        </div>
      </div>

      {/* Parking Map */}
      <div className="parking-map-area">
        <div className="parking-map-header">
          <span>Parking Layout — B1 Level</span>
          <div className="parking-legend">
            <div className="parking-legend-item">
              <div className="parking-legend-dot available" />
              Available
            </div>
            <div className="parking-legend-item">
              <div className="parking-legend-dot occupied" />
              Occupied
            </div>
            <div className="parking-legend-item">
              <div className="parking-legend-dot reserved" />
              Reserved
            </div>
          </div>
        </div>
        <div className="parking-svg-wrap">
          <svg
            viewBox={`0 0 ${svgWidth} ${svgHeight}`}
            style={{ background: 'transparent' }}
          >
            {/* Entry/Exit labels */}
            <text x={svgWidth / 2} y={svgHeight - 6} textAnchor="middle" fill="#8b8579" fontSize={10} fontFamily="Outfit, sans-serif">
              ← Entry / Exit →
            </text>
            {svgRows}
          </svg>
        </div>
      </div>
    </div>
  );
}
