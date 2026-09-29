import { useRef, useCallback } from 'react';
import { calculatePathPoints, generateSvgPathString, findRoomInAllFloors } from '../data/floorData';

const corridorY = 200;

// Helper: wrap a label into two tspan lines at a word boundary for narrow rooms
function renderRoomLabel(cx, baseY, name, narrow) {
  if (!narrow) {
    return `<text x="${cx}" y="${baseY}" class="map-room-label">${name}</text>`;
  }
  // Split on last space before midpoint, or just wrap at ~8 chars
  const words = name.split(' ');
  if (words.length <= 1) {
    return `<text x="${cx}" y="${baseY - 6}" class="map-room-label" font-size="9">${name}</text>`;
  }
  const mid = Math.ceil(words.length / 2);
  const line1 = words.slice(0, mid).join(' ');
  const line2 = words.slice(mid).join(' ');
  return `<text x="${cx}" y="${baseY - 7}" class="map-room-label" font-size="9">
    <tspan x="${cx}" dy="0">${line1}</tspan>
    <tspan x="${cx}" dy="12">${line2}</tspan>
  </text>`;
}

// Renders SVG content for a single floor
function renderFloorSVGContent(floor, selectedDestRoomId, selectedOriginRoomId) {
  if (!floor) return '';

  // Dynamically compute corridor extents from room bounds
  const leftLobby = floor.rooms.find((r) => r.type === 'lobby' && r.x < 400);
  const rightLobby = floor.rooms.find((r) => r.type === 'lobby' && r.x >= 400);
  const nonLobby = floor.rooms.filter((r) => r.type !== 'lobby');
  const cxStart = leftLobby ? leftLobby.x + leftLobby.w : 80;
  const cxEnd = rightLobby ? rightLobby.x : (nonLobby.length ? Math.max(...nonLobby.map((r) => r.x + r.w)) : 720);

  let content = `
    <path d="M ${cxStart} ${corridorY} L ${cxEnd} ${corridorY}" class="map-corridor-bg" />
    <path d="M ${cxStart} ${corridorY} L ${cxEnd} ${corridorY}" class="map-corridor-path" />
  `;

  floor.rooms.forEach((r) => {
    const isDest = r.id === selectedDestRoomId;
    const isOrig = r.id === selectedOriginRoomId;
    let roomClass = 'map-room';
    if (r.id.includes('chairman')) roomClass += ' chairman-room';
    if (isDest) roomClass += ' active-room';
    else if (isOrig) roomClass += ' origin-room';
    else if (r.type === 'lobby') roomClass += ' lobby-room';

    const cx = r.x + r.w / 2;
    const iconY = r.y + r.h / 2 - 12;
    const labelY = r.y + r.h / 2 + 4;
    const narrow = r.w <= 76; // upper-floor classroom cells are 71px wide

    let renderIconAndLabel = '';
    
    if (r.id.includes('chairman')) {
      const imgWidth = 28;
      const imgHeight = 28;
      const imgX = cx - imgWidth / 2;
      const imgY = r.y + 16;
      const crownY = r.y + 12;
      const chairLabelY = r.y + 58;
      
      renderIconAndLabel = `
        <image href="/vels_logo.jpeg" x="${imgX}" y="${imgY}" width="${imgWidth}" height="${imgHeight}" preserveAspectRatio="xMidYMid slice" style="pointer-events: none;" />
        ${renderRoomLabel(cx, chairLabelY, r.name, narrow)}
      `;
    } else {
      renderIconAndLabel = `
        <text x="${cx}" y="${iconY}" class="map-room-icon">${r.icon}</text>
        ${renderRoomLabel(cx, labelY, r.name, narrow)}
      `;
    }

    content += `
      <g id="group-${r.id}" data-room-id="${r.id}" class="room-clickable" style="cursor:pointer">
        <rect x="${r.x}" y="${r.y}" width="${r.w}" height="${r.h}" class="${roomClass}" rx="6" ry="6" />
        ${renderIconAndLabel}
      </g>
    `;
  });

  return content;
}

// Cross-floor stacked SVG view
function CrossFloorView({ fromFloor, toFloor, selectedOriginRoomId, selectedDestRoomId }) {
  const isFromUpper = fromFloor.numId > toFloor.numId;
  const upperFloor = isFromUpper ? fromFloor : toFloor;
  const lowerFloor = isFromUpper ? toFloor : fromFloor;

  const upperBadge = isFromUpper ? 'Start' : 'Destination';
  const upperBadgeClass = isFromUpper ? 'start-badge' : 'end-badge';
  const lowerBadge = isFromUpper ? 'Destination' : 'Start';
  const lowerBadgeClass = isFromUpper ? 'end-badge' : 'start-badge';

  const upperPoints = calculatePathPoints(upperFloor.id, selectedOriginRoomId, selectedDestRoomId);
  const lowerPoints = calculatePathPoints(lowerFloor.id, selectedOriginRoomId, selectedDestRoomId);

  const renderSvg = (floor, pathPoints) => {
    let content = renderFloorSVGContent(floor, selectedDestRoomId, selectedOriginRoomId);
    if (pathPoints && pathPoints.length > 1) {
      const d = generateSvgPathString(pathPoints);
      content += `
        <path d="${d}" class="map-navigation-path" />
        <circle r="6" class="map-navigation-pulse-dot">
          <animateMotion dur="4s" repeatCount="indefinite" path="${d}" rotate="auto" />
        </circle>
      `;
    } else if (pathPoints && pathPoints.length === 1) {
      content += `
        <circle cx="${pathPoints[0].x}" cy="${pathPoints[0].y}" r="15" fill="none" stroke="var(--gold-300)" stroke-width="2.5">
          <animate attributeName="r" values="8;24;8" dur="2s" repeatCount="indefinite" />
          <animate attributeName="opacity" values="0.9;0.1;0.9" dur="2s" repeatCount="indefinite" />
        </circle>
        <circle cx="${pathPoints[0].x}" cy="${pathPoints[0].y}" r="6" fill="var(--gold-100)" />
      `;
    }
    return content;
  };

  return (
    <div className="dual-map-container" id="dual-map-container">
      {[
        { floor: upperFloor, badge: upperBadge, badgeClass: upperBadgeClass, points: upperPoints },
        { floor: lowerFloor, badge: lowerBadge, badgeClass: lowerBadgeClass, points: lowerPoints },
      ].map(({ floor, badge, badgeClass, points }) => (
        <div key={floor.id} className="map-stack-panel">
          <div className="map-panel-header">
            <h3 className="map-panel-title">{floor.name}</h3>
            <span className={`map-panel-badge ${badgeClass}`}>{badge}</span>
          </div>
          <div className="map-panel-svg-wrap">
            <svg
              viewBox="-10 0 880 400"
              className="blueprint-svg"
              dangerouslySetInnerHTML={{ __html: renderSvg(floor, points) }}
            />
          </div>
        </div>
      ))}
    </div>
  );
}

export default function BlueprintMap({
  floor,
  floors,
  selectedOriginRoomId,
  selectedDestRoomId,
  onRoomClick,
}) {
  const svgRef = useRef(null);
  const isDragActiveRef = useRef(false);

  // Check cross-floor routing
  const fromData = findRoomInAllFloors(selectedOriginRoomId);
  const toData = findRoomInAllFloors(selectedDestRoomId);
  const isCrossFloor = fromData && toData && fromData.floor.id !== toData.floor.id;

  // Handle SVG room clicks (delegated)
  const handleSvgClick = useCallback(
    (e) => {
      if (isDragActiveRef.current) return;
      const group = e.target.closest('[data-room-id]');
      if (!group) return;
      const roomId = group.getAttribute('data-room-id');
      if (roomId) onRoomClick(roomId);
    },
    [onRoomClick]
  );

  // Build SVG content for single floor
  const pathPoints = !isCrossFloor && selectedDestRoomId
    ? calculatePathPoints(floor.id, selectedOriginRoomId, selectedDestRoomId)
    : null;

  let svgContent = renderFloorSVGContent(floor, selectedDestRoomId, selectedOriginRoomId);
  if (pathPoints && pathPoints.length > 0) {
    const d = generateSvgPathString(pathPoints);
    svgContent += `
      <path d="${d}" class="map-navigation-path" id="active-nav-path" />
      <circle r="6" class="map-navigation-pulse-dot">
        <animateMotion dur="4s" repeatCount="indefinite" path="${d}" rotate="auto" />
      </circle>
    `;
  }

  if (floor.locked) {
    return (
      <div className="blueprint-viewport" id="blueprint-viewport">
        <div className="construction-overlay active">
          <span className="construction-icon">🚧</span>
          <h3>Floor Under Construction</h3>
          <p>This level is locked for structural remodeling. Navigation unavailable.</p>
        </div>
      </div>
    );
  }

  return (
    <div className="blueprint-viewport" id="blueprint-viewport">
      {!isCrossFloor && (
        <div className="map-hint-text" id="map-hint-text">
          💡 Click your destination
        </div>
      )}

      {isCrossFloor ? (
        <CrossFloorView
          fromFloor={fromData.floor}
          toFloor={toData.floor}
          selectedOriginRoomId={selectedOriginRoomId}
          selectedDestRoomId={selectedDestRoomId}
        />
      ) : (
        <svg
          id="floor-svg"
          ref={svgRef}
          viewBox="-10 0 880 400"
          className="blueprint-svg"
          onClick={handleSvgClick}
          dangerouslySetInnerHTML={{ __html: svgContent }}
        />
      )}

      {/* Construction overlay (never shown if not locked, kept for CSS compatibility) */}
      <div className="construction-overlay" id="construction-overlay" />
    </div>
  );
}
