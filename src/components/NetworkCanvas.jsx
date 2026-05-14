import { useNetwork } from '../context/NetworkContext';
import DeviceNode from './DeviceNode';
import { motion, AnimatePresence } from 'framer-motion';

export default function NetworkCanvas() {
  const { state } = useNetwork();
  const { devices, senderId, receiverId, phase, transmissionProgress, checkResults } = state;

  const sender = devices.find(d => d.id === senderId);
  const receiver = devices.find(d => d.id === receiverId);

  return (
    <div className="relative w-full h-full bg-dark overflow-hidden">
      {/* Grid Background */}
      <svg className="absolute inset-0 w-full h-full opacity-[0.04]" xmlns="http://www.w3.org/2000/svg">
        <defs>
          <pattern id="grid" width="40" height="40" patternUnits="userSpaceOnUse">
            <path d="M 40 0 L 0 0 0 40" fill="none" stroke="white" strokeWidth="0.5" />
          </pattern>
        </defs>
        <rect width="100%" height="100%" fill="url(#grid)" />
      </svg>

      {/* Connection Lines */}
      <svg className="absolute inset-0 w-full h-full pointer-events-none">
        {sender && devices.filter(d => d.id !== senderId).map(dev => (
          <g key={`line-${dev.id}`}>
            <line
              x1={sender.x + 60}
              y1={sender.y + 40}
              x2={dev.x + 60}
              y2={dev.y + 40}
              stroke="rgba(34,211,238,0.08)"
              strokeWidth="1"
              strokeDasharray="4 4"
            />
            {/* Animated signal along line */}
            {(phase === 'transmitting') && (
              <motion.circle
                cx={sender.x + 60}
                cy={sender.y + 40}
                r="4"
                fill="#22d3ee"
                initial={{ cx: sender.x + 60, cy: sender.y + 40, opacity: 1 }}
                animate={{
                  cx: dev.x + 60,
                  cy: dev.y + 40,
                  opacity: [1, 1, 0.5],
                }}
                transition={{
                  duration: 1.5,
                  ease: 'easeInOut',
                  repeat: transmissionProgress < 100 ? Infinity : 0,
                }}
              />
            )}
          </g>
        ))}
      </svg>

      {/* Broadcast Wave Effect */}
      <AnimatePresence>
        {phase === 'transmitting' && sender && (
          <motion.div
            className="absolute rounded-full border-2 border-accent-cyan/30 pointer-events-none"
            style={{
              left: sender.x + 60 - 20,
              top: sender.y + 40 - 20,
              width: 40,
              height: 40,
            }}
            initial={{ scale: 1, opacity: 0.6 }}
            animate={{ scale: 8, opacity: 0 }}
            transition={{ duration: 2, repeat: Infinity, ease: 'easeOut' }}
          />
        )}
      </AnimatePresence>

      {/* Device Nodes */}
      <AnimatePresence>
        {devices.map(dev => (
          <DeviceNode
            key={dev.id}
            device={dev}
            isSender={dev.id === senderId}
            isReceiver={dev.id === receiverId}
            checkResult={checkResults[dev.id]}
            isTransmitting={phase === 'transmitting'}
          />
        ))}
      </AnimatePresence>
    </div>
  );
}
