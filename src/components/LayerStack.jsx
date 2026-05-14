import { useNetwork, LAYERS } from '../context/NetworkContext';
import { motion } from 'framer-motion';
import {
  Globe, ArrowDownUp, Network, Link2, Radio,
  ArrowDown, ArrowUp
} from 'lucide-react';

const layerIcons = [Globe, ArrowDownUp, Network, Link2, Radio];

const layerColors = {
  0: { bg: 'bg-blue-500/10', border: 'border-blue-500/30', text: 'text-blue-400', glow: 'shadow-[0_0_15px_rgba(59,130,246,0.2)]' },
  1: { bg: 'bg-purple-500/10', border: 'border-purple-500/30', text: 'text-purple-400', glow: 'shadow-[0_0_15px_rgba(168,85,247,0.2)]' },
  2: { bg: 'bg-cyan-500/10', border: 'border-cyan-500/30', text: 'text-cyan-400', glow: 'shadow-[0_0_15px_rgba(6,182,212,0.2)]' },
  3: { bg: 'bg-amber-500/10', border: 'border-amber-500/30', text: 'text-amber-400', glow: 'shadow-[0_0_15px_rgba(245,158,11,0.2)]' },
  4: { bg: 'bg-emerald-500/10', border: 'border-emerald-500/30', text: 'text-emerald-400', glow: 'shadow-[0_0_15px_rgba(16,185,129,0.2)]' },
};

const layerDescriptions = [
  'User data / application protocol (HTTP, FTP, SMTP)',
  'Segmentation, ports, flow control (TCP/UDP)',
  'Logical addressing, routing (IP)',
  'Physical addressing, framing (MAC / Ethernet)',
  'Bit transmission, electrical signals',
];

const dataNames = ['DATA', 'SEGMENT', 'PACKET', 'FRAME', 'BITS'];

export default function LayerStack() {
  const { state } = useNetwork();
  const { phase, currentLayerIndex, direction } = state;
  const isActive = phase === 'encapsulating' || phase === 'deencapsulating';

  return (
    <div className="flex flex-col gap-2">
      {/* Direction Indicator */}
      {isActive && (
        <div className="flex items-center justify-center gap-2 mb-2">
          {direction === 'down' ? (
            <>
              <ArrowDown size={14} className="text-accent-cyan" />
              <span className="text-xs text-accent-cyan font-medium">Encapsulating ↓</span>
            </>
          ) : (
            <>
              <ArrowUp size={14} className="text-accent-green" />
              <span className="text-xs text-accent-green font-medium">De-encapsulating ↑</span>
            </>
          )}
        </div>
      )}

      {LAYERS.map((layer, idx) => {
        const Icon = layerIcons[idx];
        const colors = layerColors[idx];
        const isCurrentLayer = isActive && currentLayerIndex === idx;
        const isPastLayer = isActive && (
          (direction === 'down' && idx < currentLayerIndex) ||
          (direction === 'up' && idx > currentLayerIndex)
        );

        return (
          <motion.div
            key={layer}
            className={`relative rounded-xl border p-4 transition-all duration-300 ${
              isCurrentLayer
                ? `${colors.bg} ${colors.border} ${colors.glow}`
                : isPastLayer
                ? `${colors.bg} ${colors.border} opacity-60`
                : 'bg-white/[0.02] border-white/[0.06]'
            }`}
            animate={{
              scale: isCurrentLayer ? 1.02 : 1,
            }}
            transition={{ type: 'spring', stiffness: 300, damping: 20 }}
          >
            {/* Active indicator */}
            {isCurrentLayer && (
              <motion.div
                className={`absolute left-0 top-0 bottom-0 w-1 rounded-l-xl ${colors.bg.replace('/10', '/60')}`}
                layoutId="activeLayerIndicator"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
              />
            )}

            <div className="flex items-center gap-3">
              <div className={`w-8 h-8 rounded-lg flex items-center justify-center ${
                isCurrentLayer || isPastLayer ? colors.bg : 'bg-white/[0.04]'
              }`}>
                <Icon size={16} className={isCurrentLayer || isPastLayer ? colors.text : 'text-white/30'} />
              </div>
              <div className="flex-1">
                <div className="flex items-center justify-between">
                  <span className={`text-xs font-semibold uppercase tracking-wider ${
                    isCurrentLayer ? colors.text : isPastLayer ? colors.text + ' opacity-60' : 'text-white/40'
                  }`}>
                    Layer {5 - idx} — {layer}
                  </span>
                  <span className={`text-[10px] font-mono px-2 py-0.5 rounded-md ${
                    isCurrentLayer ? `${colors.bg} ${colors.text}` : 'text-white/20'
                  }`}>
                    {dataNames[idx]}
                  </span>
                </div>
                <p className={`text-[10px] mt-0.5 ${isCurrentLayer ? 'text-white/50' : 'text-white/20'}`}>
                  {layerDescriptions[idx]}
                </p>
              </div>
            </div>

            {/* Processing indicator */}
            {isCurrentLayer && (
              <motion.div
                className="mt-2 flex items-center gap-2"
                initial={{ opacity: 0, y: -5 }}
                animate={{ opacity: 1, y: 0 }}
              >
                <div className={`w-1.5 h-1.5 rounded-full animate-pulse ${colors.text.replace('text-', 'bg-')}`} />
                <span className="text-[10px] text-white/40">Processing...</span>
              </motion.div>
            )}
          </motion.div>
        );
      })}
    </div>
  );
}
