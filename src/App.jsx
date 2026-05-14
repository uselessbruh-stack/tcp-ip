import { NetworkProvider, useNetwork } from './context/NetworkContext';
import { motion, AnimatePresence } from 'framer-motion';
import NetworkCanvas from './components/NetworkCanvas';
import EncapsulationFlow from './components/EncapsulationFlow';
import DeencapsulationFlow from './components/DeencapsulationFlow';
import ControlPanel from './components/ControlPanel';
import LayerStack from './components/LayerStack';
import PacketInspector from './components/PacketInspector';
import DeviceManager from './components/DeviceManager';

function AppContent() {
  const { state } = useNetwork();
  const { phase, message } = state;

  const showEncap = phase === 'idle' || phase === 'encapsulating';
  const showDecap = phase === 'deencapsulating' || phase === 'complete';
  const showTransmit = phase === 'transmitting' || phase === 'checking';

  return (
    <div className="h-screen flex flex-col overflow-hidden">
      {/* ═══ Top Control Bar ═══ */}
      <ControlPanel />

      {/* ═══ Main Layout ═══ */}
      <div className="flex-1 flex overflow-hidden">
        {/* ── Left Panel: Encapsulation / De-encapsulation Flow ── */}
        <aside
          className="w-[360px] shrink-0 p-5 overflow-y-auto"
          style={{ borderRight: '1px solid rgba(26,35,64,0.5)' }}
        >
          <AnimatePresence mode="wait">
            {showDecap ? (
              <motion.div key="decap" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>
                <DeencapsulationFlow />
              </motion.div>
            ) : (
              <motion.div key="encap" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>
                <EncapsulationFlow />
              </motion.div>
            )}
          </AnimatePresence>
        </aside>

        {/* ── Center: Network Canvas ── */}
        <main className="flex-1 flex flex-col min-w-0">
          {/* Network Visualization */}
          <div className="flex-1 relative">
            <NetworkCanvas />
          </div>

          {/* Status Message Bar */}
          <div
            className="shrink-0 px-6 py-3"
            style={{
              background: 'linear-gradient(135deg, rgba(6,8,15,0.97), rgba(11,16,34,0.97))',
              borderTop: '1px solid rgba(26,35,64,0.5)',
            }}
          >
            <AnimatePresence mode="wait">
              <motion.div
                key={message}
                initial={{ opacity: 0, y: 8 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -8 }}
                transition={{ duration: 0.25 }}
                className="flex items-center gap-3"
              >
                <div
                  className="w-2 h-2 rounded-full shrink-0"
                  style={{
                    background:
                      phase === 'idle' ? '#5c6b8a' :
                      phase === 'complete' ? '#00e87b' :
                      phase === 'checking' ? '#60a5fa' :
                      '#00d4e6',
                    boxShadow:
                      phase === 'idle' ? 'none' :
                      phase === 'complete' ? '0 0 8px #00e87b' :
                      '0 0 8px #00d4e6',
                  }}
                />
                <span className="text-xs font-mono text-text-secondary truncate">
                  {message || 'Ready — configure and start the simulation'}
                </span>
              </motion.div>
            </AnimatePresence>
          </div>
        </main>

        {/* ── Right Panel: Layer Stack ── */}
        <aside
          className="w-[320px] shrink-0 p-5 overflow-y-auto"
          style={{ borderLeft: '1px solid rgba(26,35,64,0.5)' }}
        >
          <div className="mb-4">
            <h3
              className="panel-heading text-neon-cyan text-glow-cyan"
            >
              <span>📡</span> TCP/IP Layers
            </h3>
          </div>
          <LayerStack />
        </aside>
      </div>
    </div>
  );
}

export default function App() {
  return (
    <NetworkProvider>
      <AppContent />
    </NetworkProvider>
  );
}
