// ==========================================
// FLOOR DATA MODEL
// Shared constants for all floor layouts
// Canvas: 800 x 400 | Corridor Y: 200 | Lobby X: 80
// ==========================================

export const corridorY = 200;
export const lobbyX = 720;

// Standard lobby room shared by most floors
export const LOBBY_ROOM = (floorId) => ([
  { id: `r${floorId}-lift-left`, name: 'Left Lift', type: 'lobby', x: 60, y: 170, w: 60, h: 60, icon: '🛗' },
  { id: `r${floorId}-lift-right`, name: 'Right Lift', type: 'lobby', x: 720, y: 170, w: 60, h: 60, icon: '🛗' },
]);

// Standard floor-6 layout rooms (reference layout)
// Rooms 1-10, Staff Room, Lift, Female Restroom, Male Restroom, Canteen/Sitting Place
export const buildStandardFloor = (floorId, roomPrefix, hasCanteen = true) => {
  const rooms = [];
  const lid = floorId < 0 ? `g${Math.abs(floorId)}` : floorId;

  // Lifts
  rooms.push({ id: `r${lid}-lift-left`, name: 'Left Lift', type: 'lobby', x: 60, y: 170, w: 60, h: 60, icon: '🛗' });
  rooms.push({ id: `r${lid}-lift-right`, name: 'Right Lift', type: 'lobby', x: 720, y: 170, w: 60, h: 60, icon: '🛗' });

  // Rooms 1-5 (top row)
  const topRooms = [
    { num: 1, x: 140, w: 80 },
    { num: 2, x: 228, w: 80 },
    { num: 3, x: 316, w: 80 },
    { num: 4, x: 404, w: 80 },
    { num: 5, x: 492, w: 80 },
  ];
  topRooms.forEach(({ num, x, w }) => {
    rooms.push({ id: `r${lid}-room${num}`, name: `Classroom ${floorId * 100 + num}`, altName: `Classroom ${num}`, type: 'classroom', x, y: 80, w, h: 80, icon: '📖' });
  });

  // Rooms 6-10 (bottom row)
  const bottomRooms = [
    { num: 6, x: 140, w: 80 },
    { num: 7, x: 228, w: 80 },
    { num: 8, x: 316, w: 80 },
    { num: 9, x: 404, w: 80 },
    { num: 10, x: 492, w: 80 },
  ];
  bottomRooms.forEach(({ num, x, w }) => {
    rooms.push({ id: `r${lid}-room${num}`, name: `Classroom ${floorId * 100 + num}`, altName: `Classroom ${num}`, type: 'classroom', x, y: 240, w, h: 80, icon: '📖' });
  });

  // Staff Room
  rooms.push({ id: `r${lid}-staff`, name: 'Staff Room', type: 'office', x: 580, y: 80, w: 130, h: 80, icon: '🔑' });

  // Female Restroom
  rooms.push({ id: `r${lid}-restF`, name: 'Female Restroom', type: 'toilet', x: 580, y: 240, w: 60, h: 80, icon: '🚺' });

  // Male Restroom
  rooms.push({ id: `r${lid}-restM`, name: 'Male Restroom', type: 'toilet', x: 648, y: 240, w: 62, h: 80, icon: '🚹' });

  // Canteen (floors 6 and below with canteen) or Sitting Place (floors 7-12)
  if (hasCanteen) {
    rooms.push({ id: `r${lid}-canteen`, name: 'Canteen', type: 'cafe', x: 580, y: 164, w: 130, h: 68, icon: '🍲' });
  } else {
    rooms.push({ id: `r${lid}-sitting`, name: 'Sitting Place', type: 'lounge', x: 580, y: 164, w: 130, h: 68, icon: '🛋️' });
  }

  return rooms;
};

// ==========================================
// UPPER FLOOR LAYOUT (Floors 7–12)
// Layout:
//   TOP ROW (single line): Room 10 | ... | Room 1  (left → right)
//   BELOW CORRIDOR: Staff Room | Male Restroom | Female Restroom
//   LOWER-RIGHT: [ Staircase ] [ Working Place ]
//   NO Canteen.
// Canvas: 800 × 400, corridorY = 200
// ==========================================
export const buildUpperFloor = (floorId, hasCafe = false, hasChairman = false) => {
  const rooms = [];
  const lid = floorId;

  // ── Lifts ──
  rooms.push({
    id: `r${lid}-lift-left`,
    name: 'Left Lift',
    type: 'lobby',
    x: 8, y: 148, w: 52, h: 104,
    icon: '🛗',
  });
  rooms.push({
    id: `r${lid}-lift-right`,
    name: 'Right Lift',
    type: 'lobby',
    x: 800, y: 148, w: 52, h: 104,
    icon: '🛗',
  });

  // ── 10 Rooms in ONE straight horizontal row above corridor ──
  // Room 10 on far left, Room 1 on far right.
  // Available x: 65 → 796  (731px total for 10 rooms)
  // Each room: width=71, gap=2  → 10×71 + 9×2 = 728  ✓
  const ROOM_Y = 22;
  const ROOM_H = 172;
  const ROOM_W = 71;
  const ROOM_GAP = 2;
  const ROOM_START_X = 65;

  // Rooms ordered Room 10 (leftmost index 0) → Room 1 (rightmost index 9)
  for (let i = 0; i < 10; i++) {
    const roomNum = 10 - i; // 10, 9, 8, … 1
    const x = ROOM_START_X + i * (ROOM_W + ROOM_GAP);
    rooms.push({
      id: `r${lid}-room${roomNum}`,
      name: `Classroom ${floorId * 100 + roomNum}`,
      altName: `Classroom ${roomNum}`,
      type: 'classroom',
      x,
      y: ROOM_Y,
      w: ROOM_W,
      h: ROOM_H,
      icon: '📖',
    });
  }

  // ── Below corridor (y = 208) ──
  const BELOW_Y = 208;
  const BELOW_H = 78;

  // Staff Room — leftmost below
  rooms.push({
    id: `r${lid}-staff`,
    name: 'Staff Room',
    type: 'office',
    x: 65, y: BELOW_Y, w: 170, h: BELOW_H,
    icon: '🔑',
  });

  // Male Restroom
  rooms.push({
    id: `r${lid}-restM`,
    name: 'Male Restroom',
    type: 'toilet',
    x: 240, y: BELOW_Y, w: 95, h: BELOW_H,
    icon: '🚹',
  });

  // Female Restroom
  rooms.push({
    id: `r${lid}-restF`,
    name: 'Female Restroom',
    type: 'toilet',
    x: 340, y: BELOW_Y, w: 95, h: BELOW_H,
    icon: '🚺',
  });

  // ── Lower-right: [ Staircase ] [ Working Place ] ──
  rooms.push({
    id: `r${lid}-staircase`,
    name: 'Staircase',
    type: 'amenity',
    x: 480, y: BELOW_Y, w: 150, h: BELOW_H,
    icon: '🪜',
  });

  if (hasCafe) {
    rooms.push({
      id: `r${lid}-cafe`,
      name: 'Cafe',
      type: 'cafe',
      x: 635, y: BELOW_Y, w: 158, h: BELOW_H,
      icon: '☕',
    });
  } else if (hasChairman) {
    rooms.push({
      id: `r${lid}-chairman`,
      name: 'Chairman Room',
      type: 'office',
      x: 635, y: BELOW_Y, w: 158, h: BELOW_H,
      icon: '👔',
    });
  } else {
    rooms.push({
      id: `r${lid}-workingplace`,
      name: 'Working Place',
      type: 'lounge',
      x: 635, y: BELOW_Y, w: 158, h: BELOW_H,
      icon: '💻',
    });
  }

  return rooms;
};

// ==========================================
// ALL FLOORS DATA
// ==========================================
export const floors = [
  // G1 — Parking
  {
    id: 'g1',
    numId: -1,
    name: 'G1 — Parking',
    label: 'G1',
    tag: 'PARKING',
    facilities: 'Parking Area, Vehicle Bay',
    locked: false,
    special: 'parking',
    rooms: [
      { id: 'rg1-lift-left', name: 'Left Lift', type: 'lobby', x: 60, y: 170, w: 60, h: 60, icon: '🛗' },
      { id: 'rg1-lift-right', name: 'Right Lift', type: 'lobby', x: 720, y: 170, w: 60, h: 60, icon: '🛗' },
      { id: 'rg1-parking', name: 'Parking Area', type: 'amenity', x: 180, y: 80, w: 530, h: 240, icon: '🚗' },
    ],
  },

  // Ground Floor
  {
    id: 'ground',
    numId: 0,
    name: 'Ground Floor',
    label: 'G',
    tag: 'WAITING AREA',
    facilities: 'Reception, Canteen, Admission Room',
    locked: false,
    special: null,
    rooms: [
      { id: 'rg-lift-left', name: 'Left Lift', type: 'lobby', x: 60, y: 170, w: 60, h: 60, icon: '🛗' },
      { id: 'rg-lift-right', name: 'Right Lift', type: 'lobby', x: 720, y: 170, w: 60, h: 60, icon: '🛗' },
      { id: 'rg-reception', name: 'Central Reception Desk', type: 'office', x: 180, y: 80, w: 200, h: 90, icon: '🏢' },
      { id: 'rg-admission', name: 'Admissions Office', type: 'office', x: 400, y: 80, w: 310, h: 90, icon: '✏️' },
      { id: 'rg-canteen', name: 'Main Dining Canteen', type: 'cafe', x: 180, y: 230, w: 340, h: 90, icon: '🍲' },
      { id: 'rg-security', name: 'Security & First Aid', type: 'office', x: 540, y: 230, w: 170, h: 90, icon: '🚨' },
    ],
  },

  // M Floor
  {
    id: 'mfloor',
    numId: 0.5,
    name: 'M Floor',
    label: 'M',
    tag: 'CONFERENCE HALL',
    facilities: 'Conference Hall',
    locked: false,
    special: null,
    rooms: [
      { id: 'rm-lift-left', name: 'Left Lift', type: 'lobby', x: 60, y: 170, w: 60, h: 60, icon: '🛗' },
      { id: 'rm-lift-right', name: 'Right Lift', type: 'lobby', x: 720, y: 170, w: 60, h: 60, icon: '🛗' },
      { id: 'rm-conference', name: 'Conference Hall', type: 'amenity', x: 180, y: 80, w: 530, h: 240, icon: '🎤' },
    ],
  },

  // Floor 1
  {
    id: 'floor1',
    numId: 1,
    name: 'Floor 1',
    label: '1',
    tag: 'BBA DEPARTMENT',
    facilities: 'Classrooms 1–10, Staff Room, Lift, Male Restroom, Female Restroom, Staircase, Working Place',
    locked: false,
    special: null,
    rooms: buildUpperFloor(1),
  },

  // Floor 2
  {
    id: 'floor2',
    numId: 2,
    name: 'Floor 2',
    label: '2',
    tag: 'GAME SPACE',
    facilities: 'Gym, Game Space, Managing Office, Resting Hall',
    locked: false,
    special: null,
    rooms: [
      { id: 'r2-lift-left', name: 'Left Lift', type: 'lobby', x: 60, y: 170, w: 60, h: 60, icon: '🛗' },
      { id: 'r2-lift-right', name: 'Right Lift', type: 'lobby', x: 720, y: 170, w: 60, h: 60, icon: '🛗' },
      { id: 'r2-gym', name: 'Gym', type: 'amenity', x: 150, y: 80, w: 260, h: 100, icon: '🏋️' },
      { id: 'r2-game', name: 'Game Space', type: 'amenity', x: 430, y: 80, w: 260, h: 100, icon: '🎮' },
      { id: 'r2-office', name: 'Managing Office', type: 'office', x: 150, y: 230, w: 260, h: 100, icon: '💼' },
      { id: 'r2-rest', name: 'Resting Hall', type: 'lounge', x: 430, y: 230, w: 260, h: 100, icon: '🛋️' },
    ],
  },

  // Floor 3
  {
    id: 'floor3',
    numId: 3,
    name: 'Floor 3',
    label: '3',
    tag: 'BCA DEPARTMENT',
    facilities: 'Classrooms 1–10, Staff Room, Lift, Male Restroom, Female Restroom, Staircase, Working Place',
    locked: false,
    special: null,
    rooms: buildUpperFloor(3),
  },

  // Floor 4
  {
    id: 'floor4',
    numId: 4,
    name: 'Floor 4',
    label: '4',
    tag: 'LAB',
    facilities: 'Lab, Central Library, Male Restroom, Female Restroom',
    locked: false,
    special: null,
    rooms: [
      { id: 'r4-lift-left', name: 'Left Lift', type: 'lobby', x: 60, y: 170, w: 60, h: 60, icon: '🛗' },
      { id: 'r4-lift-right', name: 'Right Lift', type: 'lobby', x: 720, y: 170, w: 60, h: 60, icon: '🛗' },
      { id: 'r4-lab', name: 'Lab', type: 'classroom', x: 150, y: 80, w: 260, h: 100, icon: '🔬' },
      { id: 'r4-library', name: 'Central Library', type: 'amenity', x: 430, y: 80, w: 260, h: 100, icon: '📚' },
      { id: 'r4-restM', name: 'Male Restroom', type: 'toilet', x: 150, y: 230, w: 260, h: 100, icon: '🚹' },
      { id: 'r4-restF', name: 'Female Restroom', type: 'toilet', x: 430, y: 230, w: 260, h: 100, icon: '🚺' },
    ],
  },

  // Floor 5
  {
    id: 'floor5',
    numId: 5,
    name: 'Floor 5',
    label: '5',
    tag: 'UNDER CONSTRUCTION',
    facilities: 'Under Construction',
    locked: true,
    special: 'construction',
    rooms: [
      { id: 'r5-lift-left', name: 'Left Lift', type: 'lobby', x: 60, y: 170, w: 60, h: 60, icon: '🛗' },
      { id: 'r5-lift-right', name: 'Right Lift', type: 'lobby', x: 720, y: 170, w: 60, h: 60, icon: '🛗' },
      { id: 'r5-c501', name: 'Classroom 501', altName: 'Classroom 1', type: 'classroom', x: 180, y: 80, w: 140, h: 90, icon: '📖' },
      { id: 'r5-c502', name: 'Classroom 502', altName: 'Classroom 2', type: 'classroom', x: 350, y: 80, w: 140, h: 90, icon: '📖' },
      { id: 'r5-cafe', name: 'Express Coffee Box', type: 'cafe', x: 520, y: 80, w: 190, h: 90, icon: '☕' },
      { id: 'r5-rest', name: 'Restroom', type: 'toilet', x: 180, y: 230, w: 120, h: 90, icon: '🚻' },
      { id: 'r5-staff', name: 'Department Office', type: 'office', x: 330, y: 230, w: 180, h: 90, icon: '🔑' },
      { id: 'r5-seminar', name: 'Seminar Room 5A', type: 'classroom', x: 530, y: 230, w: 180, h: 90, icon: '🗣️' },
    ],
  },

  // Floor 6 — reference layout (Rooms 1-10, Staff, Lift, Female Restroom, Male Restroom, Canteen)
  {
    id: 'floor6',
    numId: 6,
    name: 'Floor 6',
    label: '6',
    tag: 'BSC DEPARTMENT',
    facilities: 'Classrooms 1–10, Staff Room, Left Lift, Right Lift, Male Restroom, Female Restroom, Staircase, Cafe',
    locked: false,
    special: null,
    rooms: buildUpperFloor(6, true),
  },

  // Floor 7 — upper-floor layout (single row Rooms 1–10, Staff, Restrooms, Staircase, Working Place)
  {
    id: 'floor7',
    numId: 7,
    name: 'Floor 7',
    label: '7',
    tag: 'FLIGHT SIMULATION LAB',
    facilities: 'Classrooms 1–10, Staff Room, Lift, Male Restroom, Female Restroom, Staircase, Working Place',
    locked: false,
    special: null,
    rooms: buildUpperFloor(7),
  },

  // Floor 8
  {
    id: 'floor8',
    numId: 8,
    name: 'Floor 8',
    label: '8',
    tag: 'AVIATION DEPARTMENT',
    facilities: 'Classrooms 1–10, Staff Room, Lift, Male Restroom, Female Restroom, Staircase, Working Place',
    locked: false,
    special: null,
    rooms: buildUpperFloor(8),
  },

  // Floor 9
  {
    id: 'floor9',
    numId: 9,
    name: 'Floor 9',
    label: '9',
    tag: 'B.COM DEPARTMENT',
    facilities: 'Classrooms 1–10, Staff Room, Lift, Male Restroom, Female Restroom, Staircase, Working Place',
    locked: false,
    special: null,
    rooms: buildUpperFloor(9),
  },

  // Floor 10
  {
    id: 'floor10',
    numId: 10,
    name: 'Floor 10',
    label: '10',
    tag: 'IDEA LAB',
    facilities: 'Classrooms 1–10, Staff Room, Lift, Male Restroom, Female Restroom, Staircase, Working Place',
    locked: false,
    special: null,
    rooms: buildUpperFloor(10),
  },

  // Floor 11
  {
    id: 'floor11',
    numId: 11,
    name: 'Floor 11',
    label: '11',
    tag: 'MCA DEPARTMENT',
    facilities: 'Classrooms 1–10, Staff Room, Lift, Male Restroom, Female Restroom, Staircase, Working Place',
    locked: false,
    special: null,
    rooms: buildUpperFloor(11),
  },

  // Floor 12
  {
    id: 'floor12',
    numId: 12,
    name: 'Floor 12',
    label: '12',
    tag: 'CHAIRMAN ROOM',
    facilities: 'Classrooms 1–10, Staff Room, Left Lift, Right Lift, Male Restroom, Female Restroom, Staircase, Chairman Room',
    locked: false,
    special: null,
    rooms: buildUpperFloor(12, false, true),
  },

  // Floor 13 — Turf (single facility)
  {
    id: 'floor13',
    numId: 13,
    name: 'Floor 13 — Turf',
    label: '13',
    tag: 'TURF',
    facilities: 'Turf',
    locked: false,
    special: 'turf',
    rooms: [
      { id: 'r13-lift-left', name: 'Left Lift', type: 'lobby', x: 60, y: 170, w: 60, h: 60, icon: '🛗' },
      { id: 'r13-lift-right', name: 'Right Lift', type: 'lobby', x: 720, y: 170, w: 60, h: 60, icon: '🛗' },
      { id: 'r13-turf', name: 'Turf', type: 'amenity', x: 180, y: 80, w: 530, h: 240, icon: '⚽' },
    ],
  },
];

// ==========================================
// SEARCH LOGIC
// ==========================================

// Keyword aliases: maps a search term to partial strings checked against room name/type/facilities
const SEARCH_ALIASES = {
  turf: ['turf'],
  parking: ['parking', 'vehicle', 'basement', 'g1'],
  canteen: ['canteen', 'cafe', 'dining', 'coffee', 'bar'],
  staircase: ['staircase', 'stair'],
  'working place': ['working place', 'workingplace'],
  'work': ['working place', 'workingplace'],
  restroom: ['restroom', 'toilet', 'rest'],
  toilet: ['restroom', 'toilet'],
  staff: ['staff', 'office', 'administration', 'department'],
  gym: ['gym', 'fitness'],
  library: ['library', 'archives'],
  auditorium: ['auditorium', 'stage'],
  classroom: ['classroom', 'room', 'class'],
  cafe: ['cafe', 'coffee'],
  chairman: ['chairman'],
  conference: ['conference', 'hall'],
  bba: ['bba'],
};

export function searchLocations(query) {
  const cleanQuery = query.toLowerCase().trim();
  if (!cleanQuery) return [];

  // Collect alias expansions
  const aliasTerms = [cleanQuery];
  Object.entries(SEARCH_ALIASES).forEach(([key, expansions]) => {
    if (cleanQuery.includes(key) || expansions.some((e) => e.includes(cleanQuery))) {
      aliasTerms.push(...expansions);
    }
  });

  const seen = new Set();
  const results = [];

  floors.forEach((floor) => {
    if (floor.locked && floor.tag !== 'UNDER CONSTRUCTION') return;
    const facilitiesLC = floor.facilities.toLowerCase();
    const tagLC = (floor.tag || '').toLowerCase();
    const matchesFloor = aliasTerms.some((t) => facilitiesLC.includes(t) || tagLC.includes(t));

    floor.rooms.forEach((room) => {
      if (room.type === 'lobby') return;
      const nameLC = room.name.toLowerCase();
      const altNameLC = room.altName ? room.altName.toLowerCase() : '';
      const typeLC = room.type.toLowerCase();
      const nameMatch = aliasTerms.some((t) => nameLC.includes(t) || altNameLC.includes(t));
      const typeMatch = aliasTerms.some((t) => typeLC.includes(t));

      if (nameMatch || typeMatch || matchesFloor) {
        // De-duplicate: same room can't appear twice for one floor
        const key = `${floor.id}:${room.id}`;
        if (seen.has(key)) return;
        seen.add(key);
        results.push({
          floorId: floor.id,
          floorName: floor.name,
          room,
          // Subtitle shown in search results: "Classroom 8 — Floor 7"
          subtitle: `${floor.name}`,
        });
      }
    });
  });

  return results.sort((a, b) => {
    const aExact = a.room.name.toLowerCase().startsWith(cleanQuery) || (a.room.altName && a.room.altName.toLowerCase().startsWith(cleanQuery));
    const bExact = b.room.name.toLowerCase().startsWith(cleanQuery) || (b.room.altName && b.room.altName.toLowerCase().startsWith(cleanQuery));
    if (aExact && !bExact) return -1;
    if (!aExact && bExact) return 1;
    // Prefer exact name match over facilities match
    const aName = a.room.name.toLowerCase().includes(cleanQuery) || (a.room.altName && a.room.altName.toLowerCase().includes(cleanQuery));
    const bName = b.room.name.toLowerCase().includes(cleanQuery) || (b.room.altName && b.room.altName.toLowerCase().includes(cleanQuery));
    if (aName && !bName) return -1;
    if (!aName && bName) return 1;
    return 0;
  });
}

// ==========================================
// PATH CALCULATION
// ==========================================
export function findRoomInAllFloors(roomId) {
  if (!roomId) return null;
  for (const f of floors) {
    const room = f.rooms.find((r) => r.id === roomId);
    if (room) return { room, floor: f };
  }
  return null;
}

export function calculateSingleFloorPoints(floor, fromRoomId, toRoomId) {
  let fromRoom = floor.rooms.find((r) => r.id === fromRoomId);
  let toRoom = floor.rooms.find((r) => r.id === toRoomId);
  if (!toRoom) return null;
  if (!fromRoom) {
    fromRoom = floor.rooms.find((r) => r.type === 'lobby' && r.name.includes('Right')) || floor.rooms.find((r) => r.type === 'lobby') || { x: lobbyX, y: corridorY, w: 0, h: 0 };
  }

  const startX = fromRoom.type === 'lobby' ? (fromRoom.x < 400 ? fromRoom.x + fromRoom.w : fromRoom.x) : fromRoom.x + fromRoom.w / 2;
  const startY = fromRoom.type === 'lobby' ? corridorY : fromRoom.y < corridorY ? fromRoom.y + fromRoom.h : fromRoom.y;
  const endX = toRoom.type === 'lobby' ? (toRoom.x < 400 ? toRoom.x + toRoom.w : toRoom.x) : toRoom.x + toRoom.w / 2;
  const endY = toRoom.type === 'lobby' ? corridorY : toRoom.y < corridorY ? toRoom.y + toRoom.h : toRoom.y;

  const points = [{ x: startX, y: startY }];
  if (startY !== corridorY) points.push({ x: startX, y: corridorY });
  if (startX !== endX) points.push({ x: endX, y: corridorY });
  if (endY !== corridorY) points.push({ x: endX, y: endY });
  return points;
}

export function calculatePathPoints(floorId, fromRoomId, toRoomId) {
  const fromData = findRoomInAllFloors(fromRoomId);
  const toData = findRoomInAllFloors(toRoomId);
  if (!toData) return null;

  const fromFloor = fromData ? fromData.floor : floors.find((f) => f.id === floorId);
  const toFloor = toData.floor;

  if (fromFloor.id === toFloor.id) {
    if (floorId !== toFloor.id) return null;
    return calculateSingleFloorPoints(toFloor, fromRoomId, toRoomId);
  }

  if (floorId === fromFloor.id) {
    const startLobby = fromFloor.rooms.find((r) => r.type === 'lobby' && r.name.includes('Right')) || fromFloor.rooms.find((r) => r.type === 'lobby');
    if (!startLobby) return null;
    return calculateSingleFloorPoints(fromFloor, fromRoomId, startLobby.id);
  } else if (floorId === toFloor.id) {
    const destLobby = toFloor.rooms.find((r) => r.type === 'lobby' && r.name.includes('Right')) || toFloor.rooms.find((r) => r.type === 'lobby');
    if (!destLobby) return null;
    return calculateSingleFloorPoints(toFloor, destLobby.id, toRoomId);
  }

  return null;
}

export function generateSvgPathString(points) {
  if (!points || points.length === 0) return '';
  return `M ${points[0].x} ${points[0].y} ` + points.slice(1).map((p) => `L ${p.x} ${p.y}`).join(' ');
}

// ==========================================
// DEPARTMENTS FOR LANDING PAGE
// ==========================================
export const departments = [
  { name: 'School of Computing & IT', rooms: 'Computer Labs, Study Halls', floorId: 'floor7' },
  { name: 'Department of Sciences', rooms: 'Research Labs, Classrooms', floorId: 'floor9' },
  { name: 'VISTAS Main Library & Archives', rooms: 'Library, Archives', floorId: 'floor4' },
  { name: 'VISTAS Administration', rooms: 'Reception, Admissions, Canteen', floorId: 'floor1' },
  { name: 'Auditorium & Events', rooms: 'Auditorium, Art Gallery', floorId: 'floor3' },
  { name: 'Sports & Leisure (Turf)', rooms: 'Turf — Book a slot', floorId: 'floor13' },
];
