import { useState, useCallback } from 'react';
import { floors, findRoomInAllFloors } from '../data/floorData';
import FloorSidebar from '../components/FloorSidebar';
import SearchConsole from '../components/SearchConsole';
import BlueprintMap from '../components/BlueprintMap';
import NavigationInfoPanel from '../components/NavigationInfoPanel';
import TurfPage from '../floors/floor13/TurfPage';
import ParkingPage from '../floors/b1/ParkingPage';

export default function NavigatorPage({ initialFloorId, onGoHome }) {
  const [currentFloorId, setCurrentFloorId] = useState(initialFloorId || 'floor1');
  const [selectedOriginRoomId, setSelectedOriginRoomId] = useState(null);
  const [selectedDestRoomId, setSelectedDestRoomId] = useState(null);
  const [isAtoBMode, setIsAtoBMode] = useState(false);
  const [matchingFloorIds, setMatchingFloorIds] = useState([]);

  // Controlled values for SearchConsole to reflect resets
  const [destValue, setDestValue] = useState('');
  const [originValue, setOriginValue] = useState('');

  const currentFloor = floors.find((f) => f.id === currentFloorId);

  // When switching floor, reset single-search destination if not on that floor
  const handleFloorSelect = useCallback(
    (floorId) => {
      setCurrentFloorId(floorId);
      if (!isAtoBMode) {
        const fl = floors.find((f) => f.id === floorId);
        if (fl && !fl.rooms.some((r) => r.id === selectedDestRoomId)) {
          setSelectedDestRoomId(null);
          setDestValue('');
        }
        const lobby = fl?.rooms.find((r) => r.type === 'lobby' && r.name.includes('Right')) || fl?.rooms.find((r) => r.type === 'lobby');
        setSelectedOriginRoomId(lobby ? lobby.id : null);
      }
    },
    [isAtoBMode, selectedDestRoomId]
  );

  // Room click on map
  const handleRoomClick = useCallback(
    (roomId) => {
      const floor = floors.find((f) => f.id === currentFloorId);
      const room = floor?.rooms.find((r) => r.id === roomId);
      if (!room || room.type === 'lobby') return;

      if (isAtoBMode) {
        // In A-to-B mode: if origin not set, set origin; otherwise set dest
        if (!selectedOriginRoomId) {
          setSelectedOriginRoomId(roomId);
          setOriginValue(room.name);
        } else {
          setSelectedDestRoomId(roomId);
          setDestValue(room.name);
        }
      } else {
        setSelectedDestRoomId(roomId);
        setDestValue(room.name);
      }
    },
    [currentFloorId, isAtoBMode, selectedOriginRoomId]
  );

  // SearchConsole callbacks
  const handleDestSelect = useCallback(
    (floorId, roomId, roomName) => {
      setSelectedDestRoomId(roomId);
      setDestValue(roomName);
      if (floorId !== currentFloorId) {
        setCurrentFloorId(floorId);
      }
    },
    [currentFloorId]
  );

  const handleOriginSelect = useCallback(
    (floorId, roomId, roomName) => {
      setSelectedOriginRoomId(roomId);
      setOriginValue(roomName);
      if (floorId !== currentFloorId) {
        setCurrentFloorId(floorId);
      }
    },
    [currentFloorId]
  );

  const handleToggleMode = useCallback(
    (atob) => {
      setIsAtoBMode(atob);
      setSelectedDestRoomId(null);
      setDestValue('');
      setOriginValue('');

      if (!atob) {
        const fl = floors.find((f) => f.id === currentFloorId);
        const lobby = fl?.rooms.find((r) => r.type === 'lobby' && r.name.includes('Right')) || fl?.rooms.find((r) => r.type === 'lobby');
        setSelectedOriginRoomId(lobby ? lobby.id : null);
      } else {
        setSelectedOriginRoomId(null);
      }
    },
    [currentFloorId]
  );

  const handleClear = useCallback(() => {
    setSelectedDestRoomId(null);
    setDestValue('');
    setOriginValue('');
    setMatchingFloorIds([]);

    const fl = floors.find((f) => f.id === currentFloorId);
    const lobby = fl?.rooms.find((r) => r.type === 'lobby' && r.name.includes('Right')) || fl?.rooms.find((r) => r.type === 'lobby');
    setSelectedOriginRoomId(lobby ? lobby.id : null);
  }, [currentFloorId]);

  // Render the correct main content area
  const renderMainContent = () => {
    if (!currentFloor) return null;

    // Special floor pages
    if (currentFloor.special === 'turf') {
      return <TurfPage highlightedRoomId={selectedDestRoomId} />;
    }
    if (currentFloor.special === 'parking') {
      return <ParkingPage highlightedRoomId={selectedDestRoomId} />;
    }
    if (currentFloor.special === 'construction') {
      return (
        <main className="blueprint-container" aria-label="Floor Under Construction" style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', height: '100%', color: 'var(--ink-2)' }}>
          <div style={{ fontSize: '4rem', marginBottom: '1rem' }}>🚧</div>
          <p style={{ fontSize: '1.2rem', textAlign: 'center', fontWeight: '500' }}>
            Floor 5 is currently under construction and is not available.
          </p>
        </main>
      );
    }

    // Standard blueprint map
    return (
      <main className="blueprint-container" aria-label="Selected Floor Blueprint Viewer">
        {/* Blueprint Top Section */}
        <div className="blueprint-header">
          <div className="blueprint-title-area">
            <h2 id="blueprint-floor-title">
              {currentFloor.name}
              {currentFloor.tag && (
                <span style={{ fontSize: '0.8em', marginLeft: '12px', color: 'var(--gold-500)', fontWeight: 'bold' }}>
                  {currentFloor.tag}
                </span>
              )}
            </h2>
            <p id="blueprint-floor-desc">{currentFloor.facilities}</p>
          </div>

          {/* Navigation Info Panel */}
          {selectedDestRoomId && (
            <NavigationInfoPanel
              currentFloorId={currentFloorId}
              selectedOriginRoomId={selectedOriginRoomId}
              selectedDestRoomId={selectedDestRoomId}
            />
          )}
        </div>

        {/* SVG Map Viewport */}
        <BlueprintMap
          floor={currentFloor}
          floors={floors}
          selectedOriginRoomId={selectedOriginRoomId}
          selectedDestRoomId={selectedDestRoomId}
          onRoomClick={handleRoomClick}
        />

        {/* Legend Footer */}
        <footer className="blueprint-footer">
          <div className="legend">
            <div className="legend-item">
              <span className="legend-color corridor" />
              <span>Corridor Path</span>
            </div>
            <div className="legend-item">
              <span className="legend-color room" />
              <span>Classroom Space</span>
            </div>
            <div className="legend-item">
              <span className="legend-color selected" />
              <span>Selected Destination</span>
            </div>
            <div className="legend-item">
              <span className="legend-color path" />
              <span>Navigation Route</span>
            </div>
          </div>
          <div style={{ fontSize: '0.8rem', color: 'var(--ink-2)' }}>
            💡 <em>Tip: Click any classroom directly on the map to set it as destination!</em>
          </div>
        </footer>
      </main>
    );
  };

  return (
    <div className="navigator-container">
      {/* Zone 1: Top Navigation Header */}
      <header className="nav-header">
        <div className="logo-section">
          <button className="logo-link" onClick={onGoHome} style={{ background: 'none', border: 'none', cursor: 'pointer' }}>
            <img src="/vels_logo.jpeg" alt="VISTAS Logo" className="logo-img" />
            <h1 className="logo-title">VISTAS Map</h1>
          </button>
        </div>

        {/* Search Console — always visible for global search across all floors */}
        <SearchConsole
          isAtoBMode={isAtoBMode}
          onToggleMode={handleToggleMode}
          onDestSelect={handleDestSelect}
          onOriginSelect={handleOriginSelect}
          onClear={handleClear}
          destValue={destValue}
          originValue={originValue}
          onMatchingFloors={setMatchingFloorIds}
        />

        {/* Back CTA */}
        <button className="back-btn" id="back-home-btn" onClick={onGoHome}>
          <span>◀</span> Back to Home
        </button>
      </header>

      {/* Main Body Grid: Sidebar + Main Content */}
      <div className="nav-body">
        {/* Zone 2: Left Sidebar Floor Selector */}
        <FloorSidebar
          floors={floors}
          currentFloorId={currentFloorId}
          onFloorSelect={handleFloorSelect}
          matchingFloorIds={matchingFloorIds}
        />

        {/* Zone 3: Right Main Content */}
        {renderMainContent()}
      </div>
    </div>
  );
}
