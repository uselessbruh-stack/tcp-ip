import { useNetwork, LAYERS } from '../context/NetworkContext';
import { motion, AnimatePresence } from 'framer-motion';
import { ArrowDown, Plus, FileText, ArrowDownUp, Network, Link2, Radio } from 'lucide-react';

const layerDetails = [
  {
    icon: FileText,
    color: 'blue',
    title: 'Application Layer',
    action: 'Preparing raw data',
    desc: 'The application generates the data payload (e.g., HTTP request)',
    headerAdded: null,
    dataUnit: 'DATA',
  },
  {
    icon: ArrowDownUp,
    color: 'purple',
    title: 'Transport Layer',
    action: 'Adding TCP Header',
    desc: 'Adds source/destination ports, sequence numbers, and control flags',
    headerAdded: 'TCP Header',
    dataUnit: 'SEGMENT',
  },
  {
    icon: Network,
    color: 'cyan',
    title: 'Network Layer',
    action: 'Adding IP Header',
    desc: 'Adds source/destination IP addresses, TTL, and protocol type',
    headerAdded: 'IP Header',
    dataUnit: 'PACKET',
  },
  {
    icon: Link2,
    color: 'amber',
    title: 'Data Link Layer',
    action: 'Adding MAC Header',
    desc: 'Adds source/destination MAC addresses and EtherType',
    headerAdded: 'MAC Header',
    dataUnit: 'FRAME',
  },
  {
    icon: Radio,
    color: 'emerald',
    title: 'Physical Layer',
    action: 'Converting to Bits',
    desc: 'Transforms the frame into electrical signals or radio waves',
    headerAdded: 'Bit Encoding',
    dataUnit: 'BITS',
  },
];

const colorMap = {
  blue: { bg: 'bg-blue-500/10', border: 'border-blue-500/30', text: 'text-blue-400', headerBg: 'bg-blue-500/20' },
  purple: { bg: 'bg-purple-500/10', border: 'border-purple-500/30', text: 'text-purple-400', headerBg: 'bg-purple-500/20' },
  cyan: { bg: 'bg-cyan-500/10', border: 'border-cyan-500/30', text: 'text-cyan-400', headerBg: 'bg-cyan-500/20' },
  amber: { bg: 'bg-amber-500/10', border: 'border-amber-500/30', text: 'text-amber-400', headerBg: 'bg-amber-500/20' },
  emerald: { bg: 'bg-emerald-500/10', border: 'border-emerald-500/30', text: 'text-emerald-400', headerBg: 'bg-emerald-500/20' },
};

export default function EncapsulationFlow() {
  const { state } = useNetwork();
  const { currentLayerIndex, packet } = state;

  return (
    <div className="flex flex-col gap-1">
      <div className="text-center mb-3">
        <span className="text-xs text-accent-cyan font-semibold uppercase tracking-wider">
          Sender — Encapsulation
        </span>
        <p className="text-[10px] text-white/30 mt-1">Data is being wrapped at each layer</p>
      </div>

      {layerDetails.map((layer, idx) => {
        const colors = colorMap[layer.color];
        const Icon = layer.icon;
        const isActive = idx === currentLayerIndex;
        const isDone = idx < currentLayerIndex;
        const isPending = idx > currentLayerIndex;

        return (
          <div key={layer.title}>
            <motion.div
              className={`rounded-xl border p-4 transition-all ${
                isActive
                  ? `${colors.bg} ${colors.border} shadow-[0_0_20px_rgba(34,211,238,0.1)]`
                  : isDone
                  ? `${colors.bg} ${colors.border} opacity-70`
                  : 'bg-white/[0.02] border-white/[0.05] opacity-40'
              }`}
              animate={{
                scale: isActive ? 1.02 : 1,
                opacity: isPending ? 0.3 : isDone ? 0.7 : 1,
              }}
            >
              <div className="flex items-start gap-3">
                <div className={`w-8 h-8 rounded-lg flex items-center justify-center shrink-0 ${
                  isActive || isDone ? colors.bg : 'bg-white/[0.04]'
                }`}>
                  <Icon size={16} className={isActive || isDone ? colors.text : 'text-white/20'} />
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2">
                    <span className={`text-xs font-semibold ${isActive || isDone ? colors.text : 'text-white/30'}`}>
                      {layer.title}
                    </span>
                    {isDone && (
                      <span className="text-[8px] px-1.5 py-0.5 rounded bg-accent-green/20 text-accent-green">DONE</span>
                    )}
                    {isActive && (
                      <motion.span
                        className="text-[8px] px-1.5 py-0.5 rounded bg-accent-cyan/20 text-accent-cyan"
                        animate={{ opacity: [1, 0.5, 1] }}
                        transition={{ duration: 1.5, repeat: Infinity }}
                      >
                        ACTIVE
                      </motion.span>
                    )}
                  </div>
                  <p className={`text-[10px] mt-0.5 ${isActive ? 'text-white/50' : 'text-white/20'}`}>
                    {layer.desc}
                  </p>

                  {/* Header being added */}
                  <AnimatePresence>
                    {(isActive || isDone) && layer.headerAdded && (
                      <motion.div
                        className={`mt-2 flex items-center gap-2 px-2 py-1.5 rounded-lg ${colors.headerBg} border ${colors.border}`}
                        initial={{ opacity: 0, height: 0, marginTop: 0 }}
                        animate={{ opacity: 1, height: 'auto', marginTop: 8 }}
                        exit={{ opacity: 0, height: 0 }}
                      >
                        <Plus size={10} className={colors.text} />
                        <span className={`text-[10px] font-semibold ${colors.text}`}>
                          {layer.action}
                        </span>
                        <span className="text-[9px] text-white/20 ml-auto">
                          → {layer.dataUnit}
                        </span>
                      </motion.div>
                    )}
                  </AnimatePresence>

                  {/* Show specific header fields when active */}
                  <AnimatePresence>
                    {isActive && idx === 1 && packet.tcpHeader && (
                      <motion.div
                        className="mt-2 grid grid-cols-2 gap-1 text-[9px]"
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                      >
                        <span className="text-white/20">Src Port: <span className="text-purple-300 font-mono">{packet.tcpHeader.srcPort}</span></span>
                        <span className="text-white/20">Dst Port: <span className="text-purple-300 font-mono">{packet.tcpHeader.dstPort}</span></span>
                        <span className="text-white/20">Seq: <span className="text-purple-300 font-mono">{packet.tcpHeader.seq}</span></span>
                        <span className="text-white/20">Flags: <span className="text-purple-300 font-mono">{packet.tcpHeader.flags}</span></span>
                      </motion.div>
                    )}
                    {isActive && idx === 2 && packet.ipHeader && (
                      <motion.div
                        className="mt-2 grid grid-cols-2 gap-1 text-[9px]"
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                      >
                        <span className="text-white/20">Src: <span className="text-cyan-300 font-mono">{packet.ipHeader.srcIP}</span></span>
                        <span className="text-white/20">Dst: <span className="text-cyan-300 font-mono">{packet.ipHeader.dstIP}</span></span>
                        <span className="text-white/20">TTL: <span className="text-cyan-300 font-mono">{packet.ipHeader.ttl}</span></span>
                        <span className="text-white/20">Proto: <span className="text-cyan-300 font-mono">{packet.ipHeader.protocol}</span></span>
                      </motion.div>
                    )}
                    {isActive && idx === 3 && packet.macHeader && (
                      <motion.div
                        className="mt-2 grid grid-cols-1 gap-1 text-[9px]"
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                      >
                        <span className="text-white/20">Src MAC: <span className="text-amber-300 font-mono">{packet.macHeader.srcMAC}</span></span>
                        <span className="text-white/20">Dst MAC: <span className="text-amber-300 font-mono">{packet.macHeader.dstMAC}</span></span>
                        <span className="text-white/20">EtherType: <span className="text-amber-300 font-mono">{packet.macHeader.etherType}</span></span>
                      </motion.div>
                    )}
                  </AnimatePresence>
                </div>
              </div>
            </motion.div>

            {/* Arrow between layers */}
            {idx < 4 && (
              <div className="flex justify-center py-1">
                <ArrowDown size={14} className={`${
                  idx < currentLayerIndex ? 'text-accent-cyan/40' : 'text-white/10'
                }`} />
              </div>
            )}
          </div>
        );
      })}

      {/* Data Visualization */}
      <motion.div
        className="mt-3 glass-panel p-3"
        animate={{ opacity: currentLayerIndex >= 0 ? 1 : 0.3 }}
      >
        <div className="text-[10px] text-white/30 uppercase tracking-wider mb-2">Visual Structure</div>
        <div className="flex flex-col gap-1">
          {/* Build up the encapsulated data visually */}
          <AnimatePresence>
            {currentLayerIndex >= 3 && (
              <motion.div
                className="px-2 py-1 rounded bg-amber-500/10 border border-amber-500/20 text-[9px] text-amber-400 text-center font-mono"
                initial={{ scaleX: 0 }}
                animate={{ scaleX: 1 }}
                exit={{ scaleX: 0 }}
              >
                MAC Header
              </motion.div>
            )}
          </AnimatePresence>
          <AnimatePresence>
            {currentLayerIndex >= 2 && (
              <motion.div
                className="px-2 py-1 rounded bg-cyan-500/10 border border-cyan-500/20 text-[9px] text-cyan-400 text-center font-mono mx-1"
                initial={{ scaleX: 0 }}
                animate={{ scaleX: 1 }}
                exit={{ scaleX: 0 }}
              >
                IP Header
              </motion.div>
            )}
          </AnimatePresence>
          <AnimatePresence>
            {currentLayerIndex >= 1 && (
              <motion.div
                className="px-2 py-1 rounded bg-purple-500/10 border border-purple-500/20 text-[9px] text-purple-400 text-center font-mono mx-2"
                initial={{ scaleX: 0 }}
                animate={{ scaleX: 1 }}
                exit={{ scaleX: 0 }}
              >
                TCP Header
              </motion.div>
            )}
          </AnimatePresence>
          <motion.div
            className="px-2 py-1.5 rounded bg-blue-500/10 border border-blue-500/20 text-[10px] text-blue-400 text-center font-mono mx-3"
          >
            {packet.data}
          </motion.div>
        </div>
      </motion.div>
    </div>
  );
}
