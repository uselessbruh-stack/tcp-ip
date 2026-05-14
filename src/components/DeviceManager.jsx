import { useState } from 'react';
import { createPortal } from 'react-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { useNetwork } from '../context/NetworkContext';

const generateMAC = () => {
  const hex = () => Math.floor(Math.random() * 256).toString(16).padStart(2, '0').toUpperCase();
  return `${hex()}:${hex()}:${hex()}:${hex()}:${hex()}:${hex()}`;
};
const generateIP = (idx) => `192.168.1.${10 + idx}`;

export default function DeviceManager() {
  const { state, dispatch } = useNetwork();
  const { devices, phase } = state;
  const disabled = phase !== 'idle' && phase !== 'complete';

  const [isOpen, setIsOpen] = useState(false);
  const [editId, setEditId] = useState(null);
  const [form, setForm] = useState({ name: '', ip: '', mac: '' });

  const openAdd = () => {
    setForm({
      name: `Device-${devices.length + 1}`,
      ip: generateIP(devices.length),
      mac: generateMAC(),
    });
    setEditId(null);
    setIsOpen(true);
  };

  const openEdit = (dev) => {
    setForm({ name: dev.name, ip: dev.ip, mac: dev.mac });
    setEditId(dev.id);
    setIsOpen(true);
  };

  const save = () => {
    if (!form.name || !form.ip || !form.mac) return;
    if (editId) {
      dispatch({ type: 'EDIT_DEVICE', payload: { id: editId, updates: form } });
    } else {
      dispatch({ type: 'ADD_DEVICE', payload: form });
    }
    setIsOpen(false);
  };

  const remove = (id) => {
    dispatch({ type: 'REMOVE_DEVICE', payload: id });
  };

  return (
    <div className="glass-card px-5 py-4 flex flex-col gap-4">
      <div className="flex items-center justify-between pb-3 border-b border-[rgba(26,35,64,0.6)]">
        <h3 className="panel-heading-sm text-neon-magenta text-glow-magenta !mb-0 !pb-0 !border-0">
          <span>🌐</span> Devices ({devices.length})
        </h3>
        <button
          onClick={openAdd}
          disabled={disabled}
          className="neon-btn magenta text-[11px] px-3 py-1.5"
        >
          + Add
        </button>
      </div>

      <div className="flex flex-col gap-2 max-h-[180px] overflow-y-auto pr-1">
        {devices.map(dev => (
          <div
            key={dev.id}
            className="flex items-center justify-between rounded-xl px-3 py-2.5 border border-border-dim hover:border-neon-magenta/30 transition-colors group"
            style={{ background: 'rgba(6,8,15,0.5)' }}
          >
            <div className="flex items-center gap-2.5">
              <span className="text-base">🖥️</span>
              <div>
                <div className="text-[11px] font-semibold text-text-primary">{dev.name}</div>
                <div className="text-[9px] text-text-muted font-mono mt-0.5">{dev.ip} | {dev.mac.slice(0, 11)}…</div>
              </div>
            </div>
            <div className="flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
              <button
                onClick={() => openEdit(dev)}
                disabled={disabled}
                className="text-xs text-text-muted hover:text-neon-cyan px-1 py-0.5 rounded transition-colors"
              >
                ✏️
              </button>
              <button
                onClick={() => remove(dev.id)}
                disabled={disabled || devices.length <= 2}
                className="text-xs text-text-muted hover:text-neon-red px-1 py-0.5 rounded transition-colors disabled:opacity-30"
              >
                🗑️
              </button>
            </div>
          </div>
        ))}
      </div>

      {/* Modal */}
      {createPortal(
        <AnimatePresence>
          {isOpen && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm"
              onClick={() => setIsOpen(false)}
            >
              <motion.div
                initial={{ scale: 0.9, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                exit={{ scale: 0.9, opacity: 0 }}
                onClick={(e) => e.stopPropagation()}
                className="glass-card px-8 py-7 w-[400px] glow-magenta"
              >
                <h4 className="text-sm font-bold text-neon-magenta mb-5">
                  {editId ? 'Edit Device' : 'Add New Device'}
                </h4>
                <div className="flex flex-col gap-4">
                  <div className="flex flex-col gap-1.5">
                    <label className="section-label">Name</label>
                    <input
                      type="text"
                      value={form.name}
                      onChange={(e) => setForm({ ...form, name: e.target.value })}
                      className="w-full"
                    />
                  </div>
                  <div className="flex flex-col gap-1.5">
                    <label className="section-label">IP Address</label>
                    <div className="flex gap-2">
                      <input
                        type="text"
                        value={form.ip}
                        onChange={(e) => setForm({ ...form, ip: e.target.value })}
                        className="flex-1 font-mono min-w-0"
                      />
                      <button onClick={() => setForm({ ...form, ip: generateIP(Math.floor(Math.random() * 240)) })} className="neon-btn text-[11px] px-3">🔄</button>
                    </div>
                  </div>
                  <div className="flex flex-col gap-1.5">
                    <label className="section-label">MAC Address</label>
                    <div className="flex gap-2">
                      <input
                        type="text"
                        value={form.mac}
                        onChange={(e) => setForm({ ...form, mac: e.target.value })}
                        className="flex-1 font-mono min-w-0"
                      />
                      <button onClick={() => setForm({ ...form, mac: generateMAC() })} className="neon-btn text-[11px] px-3">🔄</button>
                    </div>
                  </div>
                </div>
                <div className="flex gap-3 mt-6">
                  <button onClick={save} className="neon-btn green flex-1 py-2.5">
                    {editId ? 'Save' : 'Add'}
                  </button>
                  <button onClick={() => setIsOpen(false)} className="neon-btn red flex-1 py-2.5">
                    Cancel
                  </button>
                </div>
              </motion.div>
            </motion.div>
          )}
        </AnimatePresence>,
        document.body
      )}
    </div>
  );
}
