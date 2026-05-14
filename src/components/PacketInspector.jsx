import { useNetwork } from '../context/NetworkContext';
import { motion, AnimatePresence } from 'framer-motion';

const layerColors = {
  0: { name: 'Application', color: '#a78bfa' },
  1: { name: 'Transport',   color: '#60a5fa' },
  2: { name: 'Network',     color: '#34d399' },
  3: { name: 'Data Link',   color: '#fbbf24' },
  4: { name: 'Physical',    color: '#fb7185' },
};

export default function PacketInspector() {
  const { state } = useNetwork();
  const { phase, currentLayerIndex, direction, packet } = state;

  const isActive = phase === 'encapsulating' || phase === 'deencapsulating';

  // Build layers list based on current encapsulation state
  const activeLayers = [];
  if (isActive || phase === 'transmitting' || phase === 'checking' || phase === 'complete') {
    const maxLayer = direction === 'down' ? currentLayerIndex : 4;
    const minLayer = direction === 'up' ? currentLayerIndex : 0;

    for (let i = 0; i <= 4; i++) {
      let content = '';
      let visible = false;

      if (direction === 'down') {
        visible = i <= currentLayerIndex;
      } else if (phase === 'transmitting' || phase === 'checking') {
        visible = true; // all layers visible during transmission
      } else if (phase === 'complete') {
        visible = false; // all headers stripped
        if (i === 0) visible = true; // only data remains
      } else {
        // deencapsulating
        visible = i <= currentLayerIndex || i === 0;
        if (i > 0 && i > currentLayerIndex) visible = false;
        if (i > 0 && i <= currentLayerIndex) visible = true;
        if (i === 0) visible = true;
      }

      if (phase === 'transmitting' || phase === 'checking') visible = true;

      switch (i) {
        case 0: content = packet.data || 'Hello, World!'; break;
        case 1: content = packet.tcpHeader ? `Src: ${packet.tcpHeader.srcPort} → Dst: ${packet.tcpHeader.dstPort} | Seq: ${packet.tcpHeader.seq} | ${packet.tcpHeader.flags}` : 'TCP Header'; break;
        case 2: content = packet.ipHeader ? `${packet.ipHeader.srcIP} → ${packet.ipHeader.dstIP} | TTL: ${packet.ipHeader.ttl}` : 'IP Header'; break;
        case 3: content = packet.macHeader ? `${packet.macHeader.srcMAC?.slice(0,8)}… → ${packet.macHeader.dstMAC?.slice(0,8)}… | ${packet.macHeader.etherType}` : 'MAC Header'; break;
        case 4: content = packet.asBits ? '01101000 01100101 01101100 01101100 …' : 'Bit Stream'; break;
      }

      if (visible) {
        activeLayers.push({ index: i, ...layerColors[i], content });
      }
    }
  }

  const title = phase === 'deencapsulating'
    ? '📦 Unwrapping Packet'
    : phase === 'complete'
    ? '✅ Final Data'
    : '📦 Packet Structure';

  return (
    <div className="glass-card px-5 py-4 h-full flex flex-col gap-3">
      <h3 className="panel-heading-sm text-neon-cyan text-glow-cyan !mb-0">
        {title}
      </h3>

      <div className="relative flex-1 flex flex-col gap-1">
        <AnimatePresence mode="popLayout">
          {activeLayers.length > 0 ? (
            [...activeLayers].reverse().map((layer, idx) => (
              <motion.div
                key={layer.name}
                initial={{ opacity: 0, x: -20, height: 0 }}
                animate={{ opacity: 1, x: 0, height: 'auto' }}
                exit={{ opacity: 0, x: 20, height: 0 }}
                transition={{ duration: 0.4, delay: idx * 0.05 }}
                className="rounded-lg overflow-hidden"
                style={{
                  background: `linear-gradient(90deg, ${layer.color}18, ${layer.color}05)`,
                  borderLeft: `3px solid ${layer.color}`,
                  paddingLeft: `${14 + (activeLayers.length - 1 - idx) * 5}px`,
                }}
              >
                <div className="flex items-center justify-between py-2 pr-4">
                  <div className="flex items-center gap-2">
                    <span
                      className="text-[11px] font-bold uppercase tracking-wider"
                      style={{ color: layer.color }}
                    >
                      {layer.name}
                    </span>
                  </div>
                </div>
                <div className="text-[10px] text-text-muted font-mono pb-2 pr-4 break-all leading-relaxed">
                  {layer.content}
                </div>
              </motion.div>
            ))
          ) : (
            <div className="text-center py-8 text-text-muted text-xs">
              <span className="text-2xl block mb-3 opacity-30">📦</span>
              No packet data yet — start a simulation
            </div>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
}
