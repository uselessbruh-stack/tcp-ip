import { useNetwork, LAYERS } from '../context/NetworkContext';
import { motion, AnimatePresence } from 'framer-motion';
import { ArrowUp, Minus, FileText, ArrowDownUp, Network, Link2, Radio, Check } from 'lucide-react';

const layerDetails = [
  {
    icon: FileText,
    color: 'blue',
    title: 'Application Layer',
    action: 'Original data received',
    desc: 'The application processes the final payload',
    headerRemoved: null,
    dataUnit: 'DATA',
  },
  {
    icon: ArrowDownUp,
    color: 'purple',
    title: 'Transport Layer',
    action: 'Removing TCP Header',
    desc: 'Port matching verified — TCP header stripped, segment becomes data',
    headerRemoved: 'TCP Header',
    dataUnit: 'SEGMENT → DATA',
    check: 'Port 80 Match ✓',
  },
  {
    icon: Network,
    color: 'cyan',
    title: 'Network Layer',
    action: 'Removing IP Header',
    desc: 'IP destination verified — IP header stripped, packet becomes segment',
    headerRemoved: 'IP Header',
    dataUnit: 'PACKET → SEGMENT',
    check: 'IP Match ✓',
  },
  {
    icon: Link2,
    color: 'amber',
    title: 'Data Link Layer',
    action: 'Removing MAC Header',
    desc: 'MAC destination verified — MAC header stripped, frame becomes packet',
    headerRemoved: 'MAC Header',
    dataUnit: 'FRAME → PACKET',
    check: 'MAC Match ✓',
  },
  {
    icon: Radio,
    color: 'emerald',
    title: 'Physical Layer',
    action: 'Converting from Bits',
    desc: 'Electrical signals / bits decoded back into digital frame',
    headerRemoved: 'Bit Decoding',
    dataUnit: 'BITS → FRAME',
  },
];

const colorMap = {
  blue: { bg: 'bg-blue-500/10', border: 'border-blue-500/30', text: 'text-blue-400', headerBg: 'bg-blue-500/20' },
  purple: { bg: 'bg-purple-500/10', border: 'border-purple-500/30', text: 'text-purple-400', headerBg: 'bg-purple-500/20' },
  cyan: { bg: 'bg-cyan-500/10', border: 'border-cyan-500/30', text: 'text-cyan-400', headerBg: 'bg-cyan-500/20' },
  amber: { bg: 'bg-amber-500/10', border: 'border-amber-500/30', text: 'text-amber-400', headerBg: 'bg-amber-500/20' },
  emerald: { bg: 'bg-emerald-500/10', border: 'border-emerald-500/30', text: 'text-emerald-400', headerBg: 'bg-emerald-500/20' },
};

export default function DeencapsulationFlow() {
  const { state } = useNetwork();
  const { currentLayerIndex, packet } = state;

  // Reverse order: Physical (4) → Application (0)
  const reversedLayers = [...layerDetails].reverse();

  return (
    <div className="flex flex-col gap-1">
      <div className="text-center mb-3">
        <span className="text-xs text-accent-green font-semibold uppercase tracking-wider">
          Receiver — De-encapsulation
        </span>
        <p className="text-[10px] text-white/30 mt-1">Headers are being peeled off at each layer</p>
      </div>

      {reversedLayers.map((layer, displayIdx) => {
        const colors = colorMap[layer.color];
        const Icon = layer.icon;
        const actualIdx = 4 - displayIdx; // Map back to original index
        const isActive = actualIdx === currentLayerIndex;
        const isDone = actualIdx > currentLayerIndex;
        const isPending = actualIdx < currentLayerIndex;

        return (
          <div key={layer.title}>
            <motion.div
              className={`rounded-xl border p-4 transition-all ${
                isActive
                  ? `${colors.bg} ${colors.border} shadow-[0_0_20px_rgba(16,185,129,0.1)]`
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
                        className="text-[8px] px-1.5 py-0.5 rounded bg-accent-green/20 text-accent-green"
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

                  {/* Header being removed */}
                  <AnimatePresence>
                    {isActive && layer.headerRemoved && (
                      <motion.div
                        className={`mt-2 flex items-center gap-2 px-2 py-1.5 rounded-lg ${colors.headerBg} border ${colors.border}`}
                        initial={{ opacity: 1 }}
                        animate={{ opacity: [1, 0.5, 1] }}
                        transition={{ duration: 1, repeat: Infinity }}
                      >
                        <Minus size={10} className={colors.text} />
                        <span className={`text-[10px] font-semibold ${colors.text}`}>
                          {layer.action}
                        </span>
                        <span className="text-[9px] text-white/20 ml-auto">
                          → {layer.dataUnit}
                        </span>
                      </motion.div>
                    )}
                  </AnimatePresence>

                  {/* Decision logic check */}
                  <AnimatePresence>
                    {(isActive || isDone) && layer.check && (
                      <motion.div
                        className="mt-2 flex items-center gap-1.5"
                        initial={{ opacity: 0, x: -10 }}
                        animate={{ opacity: 1, x: 0 }}
                      >
                        <Check size={10} className="text-accent-green" />
                        <span className="text-[9px] text-accent-green font-medium">{layer.check}</span>
                      </motion.div>
                    )}
                  </AnimatePresence>
                </div>
              </div>
            </motion.div>

            {/* Arrow between layers */}
            {displayIdx < 4 && (
              <div className="flex justify-center py-1">
                <ArrowUp size={14} className={`${
                  (4 - displayIdx) > currentLayerIndex ? 'text-accent-green/40' : 'text-white/10'
                }`} />
              </div>
            )}
          </div>
        );
      })}

      {/* Data Visualization — unwrapping */}
      <motion.div
        className="mt-3 glass-panel p-3"
      >
        <div className="text-[10px] text-white/30 uppercase tracking-wider mb-2">Visual Structure</div>
        <div className="flex flex-col gap-1">
          <AnimatePresence>
            {packet.macHeader && (
              <motion.div
                className="px-2 py-1 rounded bg-amber-500/10 border border-amber-500/20 text-[9px] text-amber-400 text-center font-mono"
                exit={{ scaleX: 0, opacity: 0 }}
                transition={{ duration: 0.5 }}
              >
                MAC Header
              </motion.div>
            )}
          </AnimatePresence>
          <AnimatePresence>
            {packet.ipHeader && (
              <motion.div
                className="px-2 py-1 rounded bg-cyan-500/10 border border-cyan-500/20 text-[9px] text-cyan-400 text-center font-mono mx-1"
                exit={{ scaleX: 0, opacity: 0 }}
                transition={{ duration: 0.5 }}
              >
                IP Header
              </motion.div>
            )}
          </AnimatePresence>
          <AnimatePresence>
            {packet.tcpHeader && (
              <motion.div
                className="px-2 py-1 rounded bg-purple-500/10 border border-purple-500/20 text-[9px] text-purple-400 text-center font-mono mx-2"
                exit={{ scaleX: 0, opacity: 0 }}
                transition={{ duration: 0.5 }}
              >
                TCP Header
              </motion.div>
            )}
          </AnimatePresence>
          <motion.div
            className="px-2 py-1.5 rounded bg-blue-500/10 border border-blue-500/20 text-[10px] text-blue-400 text-center font-mono mx-3"
            animate={{
              scale: currentLayerIndex === 0 ? [1, 1.05, 1] : 1,
            }}
            transition={{ duration: 1, repeat: currentLayerIndex === 0 ? Infinity : 0 }}
          >
            {packet.data}
          </motion.div>
        </div>
      </motion.div>

      {/* Final message */}
      <AnimatePresence>
        {currentLayerIndex === 0 && (
          <motion.div
            className="mt-2 glass-panel p-3 text-center border-accent-green/30"
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
          >
            <span className="text-xs text-accent-green font-semibold">
              ✅ Data received: &quot;{packet.data}&quot;
            </span>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
