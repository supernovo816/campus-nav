import { useState, useRef, useEffect } from 'react';
import { searchLocations } from '../data/floorData';

export default function SearchConsole({
  isAtoBMode,
  onToggleMode,
  onDestSelect,
  onOriginSelect,
  onClear,
  destValue,
  originValue,
  onMatchingFloors,
}) {
  const [destQuery, setDestQuery] = useState(destValue || '');
  const [originQuery, setOriginQuery] = useState(originValue || '');
  const [destMatches, setDestMatches] = useState([]);
  const [originMatches, setOriginMatches] = useState([]);
  const [showDest, setShowDest] = useState(false);
  const [showOrigin, setShowOrigin] = useState(false);

  const destRef = useRef(null);
  const originRef = useRef(null);

  // Sync controlled values when parent resets
  useEffect(() => setDestQuery(destValue || ''), [destValue]);
  useEffect(() => setOriginQuery(originValue || ''), [originValue]);

  useEffect(() => {
    const handler = (e) => {
      if (destRef.current && !destRef.current.contains(e.target)) setShowDest(false);
      if (originRef.current && !originRef.current.contains(e.target)) setShowOrigin(false);
    };
    document.addEventListener('mousedown', handler);
    return () => document.removeEventListener('mousedown', handler);
  }, []);

  const handleDestInput = (e) => {
    const q = e.target.value;
    setDestQuery(q);
    const matches = searchLocations(q);
    setDestMatches(matches.slice(0, 8));
    setShowDest(matches.length > 0 && q.length > 0);
    if (onMatchingFloors) onMatchingFloors([...new Set(matches.map((m) => m.floorId))]);
  };

  const handleOriginInput = (e) => {
    const q = e.target.value;
    setOriginQuery(q);
    const matches = searchLocations(q);
    setOriginMatches(matches.slice(0, 8));
    setShowOrigin(matches.length > 0 && q.length > 0);
  };

  const selectDest = (match) => {
    setDestQuery(match.room.name);
    setShowDest(false);
    onDestSelect(match.floorId, match.room.id, match.room.name);
  };

  const selectOrigin = (match) => {
    setOriginQuery(match.room.name);
    setShowOrigin(false);
    onOriginSelect(match.floorId, match.room.id, match.room.name);
  };

  const handleClear = () => {
    setDestQuery('');
    setOriginQuery('');
    setShowDest(false);
    setShowOrigin(false);
    if (onMatchingFloors) onMatchingFloors([]);
    onClear();
  };

  return (
    <div className="search-console">
      {/* Mode Toggle */}
      <div className="mode-toggle">
        <button
          className={`toggle-btn${!isAtoBMode ? ' active' : ''}`}
          id="toggle-single"
          onClick={() => onToggleMode(false)}
        >
          Single Search
        </button>
        <button
          className={`toggle-btn${isAtoBMode ? ' active' : ''}`}
          id="toggle-atob"
          onClick={() => onToggleMode(true)}
        >
          A to B Path
        </button>
      </div>

      {/* Search Fields */}
      <div className="search-fields">
        {/* Origin input — A-to-B only */}
        {isAtoBMode && (
          <div className="search-input-wrapper" id="origin-input-wrapper" ref={originRef}>
            <input
              type="text"
              id="origin-search"
              placeholder="From: Start location..."
              autoComplete="off"
              value={originQuery}
              onChange={handleOriginInput}
              onFocus={() => originMatches.length > 0 && setShowOrigin(true)}
            />
            <div className={`autocomplete-dropdown${showOrigin ? ' active' : ''}`} id="origin-dropdown">
              {originMatches.map((m) => (
                <div
                  key={`${m.floorId}-${m.room.id}`}
                  className="autocomplete-item"
                  onMouseDown={() => selectOrigin(m)}
                >
                  <span className="autocomplete-room-name">
                    <span className="autocomplete-icon">{m.room.icon}</span>
                    {m.room.name}
                  </span>
                  <span className="match-floor">{m.floorName}</span>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Destination input — always visible */}
        <div className="search-input-wrapper" id="dest-input-wrapper" ref={destRef}>
          <input
            type="text"
            id="dest-search"
            placeholder="Search any room or facility (e.g. Classroom 8, Turf, Parking)..."
            autoComplete="off"
            value={destQuery}
            onChange={handleDestInput}
            onFocus={() => destMatches.length > 0 && setShowDest(true)}
          />
          <div className={`autocomplete-dropdown${showDest ? ' active' : ''}`} id="dest-dropdown">
            {destMatches.map((m) => (
              <div
                key={`${m.floorId}-${m.room.id}`}
                className="autocomplete-item"
                onMouseDown={() => selectDest(m)}
              >
                <span className="autocomplete-room-name">
                  <span className="autocomplete-icon">{m.room.icon}</span>
                  {m.room.name}
                </span>
                <span className="match-floor">{m.floorName}</span>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Reset button */}
      <button className="clear-search-btn" id="clear-btn" onClick={handleClear}>
        Reset
      </button>
    </div>
  );
}
