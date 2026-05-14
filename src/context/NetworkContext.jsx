import { createContext, useContext, useReducer, useCallback, useRef, useEffect } from 'react';

const NetworkContext = createContext(null);

const LAYERS = ['Application', 'Transport', 'Network', 'Data Link', 'Physical'];

const generateMAC = () => {
  const hex = () => Math.floor(Math.random() * 256).toString(16).padStart(2, '0').toUpperCase();
  return `${hex()}:${hex()}:${hex()}:${hex()}:${hex()}:${hex()}`;
};

const generateIP = (idx) => `192.168.1.${10 + idx}`;

const defaultDevices = [
  { id: 'dev-1', name: 'PC-1', ip: '192.168.1.10', mac: generateMAC(), x: 100, y: 200 },
  { id: 'dev-2', name: 'PC-2', ip: '192.168.1.11', mac: generateMAC(), x: 300, y: 80 },
  { id: 'dev-3', name: 'Server', ip: '192.168.1.12', mac: generateMAC(), x: 300, y: 320 },
  { id: 'dev-4', name: 'Laptop', ip: '192.168.1.13', mac: generateMAC(), x: 500, y: 200 },
];

const initialState = {
  devices: defaultDevices,
  senderId: 'dev-1',
  receiverId: 'dev-4',
  phase: 'idle', // idle | encapsulating | transmitting | checking | deencapsulating | complete
  currentLayerIndex: -1, // 0-4 for layers
  direction: 'down', // down = encapsulating, up = deencapsulating
  packet: {
    data: 'Hello, World!',
    tcpHeader: null,
    ipHeader: null,
    macHeader: null,
    asBits: false,
  },
  speed: 1,
  isPlaying: false,
  stepMode: false,
  stepRequested: false,
  message: '',
  checkResults: {}, // { deviceId: 'match' | 'mismatch' }
  transmissionProgress: 0,
};

function reducer(state, action) {
  switch (action.type) {
    case 'ADD_DEVICE': {
      const idx = state.devices.length;
      const newDev = {
        id: `dev-${Date.now()}`,
        name: action.payload?.name || `Device-${idx + 1}`,
        ip: action.payload?.ip || generateIP(idx),
        mac: action.payload?.mac || generateMAC(),
        x: 150 + (idx % 3) * 200,
        y: 100 + Math.floor(idx / 3) * 180,
      };
      return { ...state, devices: [...state.devices, newDev] };
    }
    case 'REMOVE_DEVICE': {
      const filtered = state.devices.filter(d => d.id !== action.payload);
      let { senderId, receiverId } = state;
      if (senderId === action.payload) senderId = filtered[0]?.id || null;
      if (receiverId === action.payload) receiverId = filtered[filtered.length - 1]?.id || null;
      return { ...state, devices: filtered, senderId, receiverId };
    }
    case 'EDIT_DEVICE': {
      return {
        ...state,
        devices: state.devices.map(d =>
          d.id === action.payload.id ? { ...d, ...action.payload.updates } : d
        ),
      };
    }
    case 'SET_SENDER':
      return { ...state, senderId: action.payload };
    case 'SET_RECEIVER':
      return { ...state, receiverId: action.payload };
    case 'SET_DATA':
      return { ...state, packet: { ...initialState.packet, data: action.payload } };
    case 'SET_SPEED':
      return { ...state, speed: action.payload };
    case 'TOGGLE_PLAY':
      return { ...state, isPlaying: !state.isPlaying };
    case 'TOGGLE_STEP_MODE':
      return { ...state, stepMode: !state.stepMode, stepRequested: false };
    case 'REQUEST_STEP':
      return { ...state, stepRequested: true };
    case 'RESET':
      return { ...initialState, devices: state.devices, senderId: state.senderId, receiverId: state.receiverId, speed: state.speed, stepMode: state.stepMode };

    // Simulation phase transitions
    case 'START_SIMULATION':
      return {
        ...state,
        phase: 'encapsulating',
        currentLayerIndex: 0,
        direction: 'down',
        isPlaying: true,
        packet: { ...initialState.packet, data: state.packet.data || 'Hello, World!' },
        checkResults: {},
        message: 'Starting encapsulation at Application layer...',
        transmissionProgress: 0,
      };

    case 'ENCAP_LAYER': {
      const li = action.payload;
      const sender = state.devices.find(d => d.id === state.senderId);
      const receiver = state.devices.find(d => d.id === state.receiverId);
      let packet = { ...state.packet };
      let msg = '';
      switch (li) {
        case 0:
          msg = 'Application Layer: Preparing raw data for transmission';
          break;
        case 1:
          packet.tcpHeader = { srcPort: 49152, dstPort: 80, seq: 1, ack: 0, flags: 'SYN' };
          msg = 'Transport Layer: Adding TCP header (Src Port: 49152, Dst Port: 80) → Data becomes SEGMENT';
          break;
        case 2:
          packet.ipHeader = { srcIP: sender?.ip, dstIP: receiver?.ip, ttl: 64, protocol: 'TCP' };
          msg = `Network Layer: Adding IP header (${sender?.ip} → ${receiver?.ip}) → Segment becomes PACKET`;
          break;
        case 3:
          packet.macHeader = { srcMAC: sender?.mac, dstMAC: receiver?.mac, etherType: '0x0800' };
          msg = `Data Link Layer: Adding MAC header (${sender?.mac?.slice(0, 8)}... → ${receiver?.mac?.slice(0, 8)}...) → Packet becomes FRAME`;
          break;
        case 4:
          packet.asBits = true;
          msg = 'Physical Layer: Converting frame to bits/electrical signals for transmission';
          break;
      }
      return { ...state, currentLayerIndex: li, packet, message: msg };
    }

    case 'START_TRANSMISSION':
      return {
        ...state,
        phase: 'transmitting',
        message: 'Broadcasting signal across the network...',
        transmissionProgress: 0,
      };

    case 'UPDATE_TRANSMISSION_PROGRESS':
      return { ...state, transmissionProgress: Math.min(action.payload, 100) };

    case 'START_CHECKING':
      return { ...state, phase: 'checking', message: 'Devices checking MAC addresses...' };

    case 'CHECK_DEVICE': {
      const { deviceId, result } = action.payload;
      return {
        ...state,
        checkResults: { ...state.checkResults, [deviceId]: result },
      };
    }

    case 'START_DEENCAP':
      return {
        ...state,
        phase: 'deencapsulating',
        currentLayerIndex: 4,
        direction: 'up',
        message: 'Receiver accepted frame. Starting de-encapsulation...',
      };

    case 'DEENCAP_LAYER': {
      const li = action.payload;
      let packet = { ...state.packet };
      let msg = '';
      switch (li) {
        case 4:
          packet.asBits = false;
          msg = 'Physical Layer: Converting bits/signals back to digital frame';
          break;
        case 3:
          msg = `Data Link Layer: MAC verified ✓ — Removing MAC header → Frame becomes PACKET`;
          packet.macHeader = null;
          break;
        case 2:
          msg = `Network Layer: IP destination verified ✓ — Removing IP header → Packet becomes SEGMENT`;
          packet.ipHeader = null;
          break;
        case 1:
          msg = `Transport Layer: Port 80 matched ✓ — Removing TCP header → Segment becomes DATA`;
          packet.tcpHeader = null;
          break;
        case 0:
          msg = `Application Layer: Original data received: "${packet.data}"`;
          break;
      }
      return { ...state, currentLayerIndex: li, packet, message: msg };
    }

    case 'COMPLETE':
      return {
        ...state,
        phase: 'complete',
        isPlaying: false,
        message: `✅ Transmission complete! "${state.packet.data}" delivered successfully.`,
      };

    case 'SET_MESSAGE':
      return { ...state, message: action.payload };

    default:
      return state;
  }
}

export function NetworkProvider({ children }) {
  const [state, dispatch] = useReducer(reducer, initialState);
  const timerRef = useRef(null);
  const tickRef = useRef(0);

  const tick = useCallback(() => {
    const s = stateRef.current;
    if (!s.isPlaying) return;
    if (s.stepMode && !s.stepRequested) return;
    if (s.stepMode) dispatch({ type: 'REQUEST_STEP' }); // consume step

    tickRef.current += 1;

    switch (s.phase) {
      case 'encapsulating': {
        if (s.currentLayerIndex < 4) {
          const next = s.currentLayerIndex + 1;
          dispatch({ type: 'ENCAP_LAYER', payload: next });
        } else {
          dispatch({ type: 'START_TRANSMISSION' });
        }
        break;
      }
      case 'transmitting': {
        if (s.transmissionProgress < 100) {
          dispatch({ type: 'UPDATE_TRANSMISSION_PROGRESS', payload: s.transmissionProgress + 25 });
        } else {
          dispatch({ type: 'START_CHECKING' });
        }
        break;
      }
      case 'checking': {
        const unchecked = s.devices.filter(d => d.id !== s.senderId && !s.checkResults[d.id]);
        if (unchecked.length > 0) {
          const dev = unchecked[0];
          const result = dev.id === s.receiverId ? 'match' : 'mismatch';
          dispatch({
            type: 'CHECK_DEVICE',
            payload: { deviceId: dev.id, result },
          });
          dispatch({
            type: 'SET_MESSAGE',
            payload: result === 'match'
              ? `${dev.name}: MAC MATCH ✓ — Accepting frame`
              : `${dev.name}: MAC MISMATCH ✗ — Dropping frame`,
          });
        } else {
          dispatch({ type: 'START_DEENCAP' });
        }
        break;
      }
      case 'deencapsulating': {
        if (s.currentLayerIndex > 0) {
          const next = s.currentLayerIndex - 1;
          dispatch({ type: 'DEENCAP_LAYER', payload: next });
        } else {
          dispatch({ type: 'COMPLETE' });
        }
        break;
      }
      default:
        break;
    }
  }, []);

  const stateRef = useRef(state);
  stateRef.current = state;

  useEffect(() => {
    if (state.isPlaying) {
      const interval = Math.max(400, 1800 - state.speed * 400);
      timerRef.current = setInterval(tick, interval);
    } else {
      clearInterval(timerRef.current);
    }
    return () => clearInterval(timerRef.current);
  }, [state.isPlaying, state.speed, tick]);

  // Consume step request
  useEffect(() => {
    if (state.stepMode && state.stepRequested && state.isPlaying) {
      tick();
      dispatch({ type: 'REQUEST_STEP' }); // reset
    }
  }, [state.stepRequested]);

  const value = { state, dispatch, LAYERS };
  return <NetworkContext.Provider value={value}>{children}</NetworkContext.Provider>;
}

export function useNetwork() {
  const ctx = useContext(NetworkContext);
  if (!ctx) throw new Error('useNetwork must be used within NetworkProvider');
  return ctx;
}

export { LAYERS };
export default NetworkContext;
