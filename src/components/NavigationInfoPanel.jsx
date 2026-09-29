import { findRoomInAllFloors } from '../data/floorData';

const lobbyX = 80;

export default function NavigationInfoPanel({ currentFloorId, selectedOriginRoomId, selectedDestRoomId }) {
  const fromData = findRoomInAllFloors(selectedOriginRoomId);
  const toData = findRoomInAllFloors(selectedDestRoomId);

  if (!toData) return null;

  const fromRoom = fromData ? fromData.room : { name: 'Lobby', type: 'lobby', x: lobbyX };
  const fromFloor = fromData ? fromData.floor : null;
  const toRoom = toData.room;
  const toFloor = toData.floor;

  let label = null;

  if (!fromFloor || fromFloor.id === toFloor.id) {
    const dist = Math.round(Math.abs(fromRoom.x - toRoom.x) * 0.25);
    label = (
      <>
        📍 <strong>{fromRoom.name}</strong>{' '}
        <span className="nav-direction-arrow">➔</span>{' '}
        <strong>{toRoom.name}</strong> (Distance: approx. {dist} meters)
      </>
    );
  } else {
    const verticalDist = Math.abs(fromFloor.numId - toFloor.numId) * 4;
    const startDist = Math.round(Math.abs((fromRoom.x + (fromRoom.w || 0) / 2) - lobbyX) * 0.25);
    const endDist = Math.round(Math.abs(lobbyX - (toRoom.x + (toRoom.w || 0) / 2)) * 0.25);
    const totalDist = startDist + verticalDist + endDist;

    if (currentFloorId === fromFloor.id) {
      label = (
        <span>
          🚶 Step 1: Go from <strong>{fromRoom.name}</strong> to{' '}
          <strong>Lobby & Lift 🛗</strong> ({startDist}m).<br />
          ↕️ Step 2: Take Lift to <strong>{toFloor.name}</strong> (vertical: {verticalDist}m).{' '}
          <span style={{ color: 'var(--gold-300)' }}>Total path: ~{totalDist}m</span>
        </span>
      );
    } else if (currentFloorId === toFloor.id) {
      label = (
        <span>
          ↕️ Step 2: Exit Lift on <strong>{toFloor.name} 🛗</strong>.<br />
          🚶 Step 3: Proceed to <strong>{toRoom.name}</strong> ({endDist}m).{' '}
          <span style={{ color: 'var(--gold-300)' }}>Total path: ~{totalDist}m</span>
        </span>
      );
    } else {
      label = (
        <span>
          ↕️ Lift Transit. Traveling from <strong>{fromFloor.name}</strong> to{' '}
          <strong>{toFloor.name}</strong>.{' '}
          <span style={{ color: 'var(--gold-300)' }}>Total path: ~{totalDist}m</span>
        </span>
      );
    }
  }

  return (
    <div className="navigation-info-panel active" id="nav-info-panel">
      <span id="nav-directions-text">{label}</span>
    </div>
  );
}
