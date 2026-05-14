// ── Simulation Engine ──
// Exports used by App.jsx, PacketInspector.jsx, DeviceManager.jsx

const generateMAC = () => {
  const hex = () => Math.floor(Math.random() * 256).toString(16).padStart(2, '0').toUpperCase();
  return `${hex()}:${hex()}:${hex()}:${hex()}:${hex()}:${hex()}`;
};

const generateIP = () => `192.168.1.${Math.floor(Math.random() * 240) + 10}`;

export const randomMAC = generateMAC;
export const randomIP = generateIP;

export const LAYERS = [
  { id: 'application', name: 'Application', shortName: 'L5', color: '#a78bfa' },
  { id: 'transport',   name: 'Transport',   shortName: 'L4', color: '#60a5fa' },
  { id: 'network',     name: 'Network',     shortName: 'L3', color: '#34d399' },
  { id: 'datalink',    name: 'Data Link',   shortName: 'L2', color: '#fbbf24' },
  { id: 'physical',    name: 'Physical',    shortName: 'L1', color: '#fb7185' },
];

export const PHASES = {
  IDLE: 'IDLE',
  ENCAPSULATING: 'ENCAPSULATING',
  TRANSMITTING: 'TRANSMITTING',
  FILTERING: 'FILTERING',
  DEENCAPSULATING: 'DEENCAPSULATING',
  COMPLETE: 'COMPLETE',
};

export function createDefaultDevices() {
  return [
    { id: 'dev1', name: 'PC-1',    ip: '192.168.1.10', mac: generateMAC(), type: 'pc' },
    { id: 'dev2', name: 'PC-2',    ip: '192.168.1.11', mac: generateMAC(), type: 'pc' },
    { id: 'dev3', name: 'Server',  ip: '192.168.1.12', mac: generateMAC(), type: 'server' },
    { id: 'dev4', name: 'Laptop',  ip: '192.168.1.13', mac: generateMAC(), type: 'laptop' },
  ];
}

/**
 * Build the packet layers up to and including `layerIndex` (0–4).
 * Returns an array of { layer, label, content } objects.
 */
export function buildPacketAtLayer(layerIndex, { data, protocol, sender, receiver }) {
  const layers = [];

  if (layerIndex >= 0) {
    layers.push({
      layer: 'application',
      label: 'Application Data',
      content: data || 'Hello, World!',
    });
  }

  if (layerIndex >= 1) {
    const srcPort = protocol === 'UDP' ? 53 : 49152;
    const dstPort = protocol === 'UDP' ? 53 : 80;
    layers.push({
      layer: 'transport',
      label: `${protocol} Header`,
      content: `Src Port: ${srcPort} → Dst Port: ${dstPort} | Seq: 1 | Flags: SYN`,
    });
  }

  if (layerIndex >= 2) {
    layers.push({
      layer: 'network',
      label: 'IP Header',
      content: `${sender?.ip || '?.?.?.?'} → ${receiver?.ip || '?.?.?.?'} | TTL: 64 | Proto: ${protocol}`,
    });
  }

  if (layerIndex >= 3) {
    layers.push({
      layer: 'datalink',
      label: 'MAC Header',
      content: `${sender?.mac?.slice(0, 8) || '??:??:??'}… → ${receiver?.mac?.slice(0, 8) || '??:??:??'}… | EtherType: 0x0800`,
    });
  }

  if (layerIndex >= 4) {
    layers.push({
      layer: 'physical',
      label: 'Physical Encoding',
      content: '01101000 01100101 01101100 01101100 01101111 …',
    });
  }

  return layers;
}
