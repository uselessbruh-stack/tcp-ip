import { motion } from 'framer-motion';
import { Monitor, Server, Laptop, Wifi } from 'lucide-react';

const iconMap = {
  'PC': Monitor,
  'Server': Server,
  'Laptop': Laptop,
  'Device': Wifi,
};

function getIcon(name) {
  for (const [key, Icon] of Object.entries(iconMap)) {
    if (name.toLowerCase().includes(key.toLowerCase())) return Icon;
  }
  return Monitor;
}

export default function DeviceNode({ device, isSender, isReceiver, checkResult, isTransmitting }) {
  const Icon = getIcon(device.name);

  const borderColor = isSender
    ? 'border-accent-cyan/50'
    : isReceiver
    ? 'border-accent-green/50'
    : checkResult === 'mismatch'
    ? 'border-accent-red/40'
    : checkResult === 'match'
    ? 'border-accent-green/60'
    : 'border-white/[0.08]';

  const bgColor = isSender
    ? 'bg-accent-cyan/[0.06]'
    : isReceiver
    ? 'bg-accent-green/[0.06]'
    : 'bg-white/[0.03]';

  const shadowClass = isSender
    ? 'shadow-glow'
    : isReceiver
    ? 'shadow-glow-green'
    : checkResult === 'mismatch'
    ? 'shadow-glow-red'
    : '';

  return (
    <motion.div
      className={`absolute rounded-xl border p-3 ${borderColor} ${bgColor} ${shadowClass} backdrop-blur-sm cursor-default select-none`}
      style={{ left: device.x, top: device.y, width: 120 }}
      layout
      initial={{ scale: 0, opacity: 0 }}
      animate={{
        scale: 1,
        opacity: 1,
        x: checkResult === 'mismatch' ? [0, -4, 4, -4, 4, 0] : 0,
      }}
      exit={{ scale: 0, opacity: 0 }}
      transition={{
        type: 'spring',
        stiffness: 300,
        damping: 25,
        x: checkResult === 'mismatch' ? { duration: 0.5, ease: 'easeInOut' } : {},
      }}
    >
      {/* Role Badge */}
      {(isSender || isReceiver) && (
        <div className={`absolute -top-2 -right-2 text-[9px] font-bold px-1.5 py-0.5 rounded-md ${
          isSender ? 'bg-accent-cyan text-dark' : 'bg-accent-green text-dark'
        }`}>
          {isSender ? 'TX' : 'RX'}
        </div>
      )}

      {/* Check Result Badge */}
      {checkResult && (
        <motion.div
          className={`absolute -top-2 left-1/2 -translate-x-1/2 text-[9px] font-bold px-2 py-0.5 rounded-md ${
            checkResult === 'match'
              ? 'bg-accent-green text-dark'
              : 'bg-accent-red/80 text-white'
          }`}
          initial={{ y: -10, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
        >
          {checkResult === 'match' ? 'MAC ✓' : 'MAC ✗'}
        </motion.div>
      )}

      <div className="flex flex-col items-center gap-1.5">
        <Icon size={20} className={`${
          isSender ? 'text-accent-cyan' :
          isReceiver ? 'text-accent-green' :
          checkResult === 'mismatch' ? 'text-accent-red/60' :
          'text-white/50'
        }`} />
        <span className="text-[11px] font-semibold text-white/80 truncate w-full text-center">
          {device.name}
        </span>
        <span className="text-[9px] font-mono text-white/30">{device.ip}</span>
        <span className="text-[8px] font-mono text-white/20 truncate w-full text-center">
          {device.mac}
        </span>
      </div>

      {/* Active pulse ring for sender during transmission */}
      {isSender && isTransmitting && (
        <motion.div
          className="absolute inset-0 rounded-xl border border-accent-cyan/30"
          animate={{ scale: [1, 1.2, 1], opacity: [0.5, 0, 0.5] }}
          transition={{ duration: 1.5, repeat: Infinity }}
        />
      )}
    </motion.div>
  );
}
