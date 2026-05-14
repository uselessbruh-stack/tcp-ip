import { useNetwork } from '../context/NetworkContext';
import { Play, Pause, SkipForward, RotateCcw, Zap, Footprints } from 'lucide-react';

export default function ControlPanel({ onOpenDeviceManager }) {
  const { state, dispatch } = useNetwork();

  const handleStart = () => {
    if (state.phase === 'idle' || state.phase === 'complete') {
      dispatch({ type: 'RESET' });
      setTimeout(() => dispatch({ type: 'START_SIMULATION' }), 100);
    }
  };

  const handlePlayPause = () => {
    if (state.phase === 'idle') {
      handleStart();
    } else {
      dispatch({ type: 'TOGGLE_PLAY' });
    }
  };

  const handleStep = () => {
    if (state.phase === 'idle' || state.phase === 'complete') {
      dispatch({ type: 'RESET' });
      dispatch({ type: 'TOGGLE_STEP_MODE' });
      setTimeout(() => {
        dispatch({ type: 'START_SIMULATION' });
        dispatch({ type: 'REQUEST_STEP' });
      }, 100);
    } else {
      if (!state.stepMode) dispatch({ type: 'TOGGLE_STEP_MODE' });
      dispatch({ type: 'REQUEST_STEP' });
    }
  };

  const handleReset = () => {
    dispatch({ type: 'RESET' });
  };

  const phaseLabel = {
    idle: 'IDLE',
    encapsulating: 'ENCAPSULATING',
    transmitting: 'TRANSMITTING',
    checking: 'MAC CHECKING',
    deencapsulating: 'DE-ENCAPSULATING',
    complete: 'COMPLETE',
  };

  const phaseColor = {
    idle: 'text-white/40',
    encapsulating: 'text-accent-cyan',
    transmitting: 'text-accent-orange',
    checking: 'text-accent-blue',
    deencapsulating: 'text-accent-green',
    complete: 'text-accent-green',
  };

  return (
    <div className="w-full border-b border-white/[0.08] bg-dark-100/80 backdrop-blur-sm">
      <div className="flex items-center justify-between px-6 py-3 gap-4">
        {/* Brand */}
        <div className="flex items-center gap-3 shrink-0">
          <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-accent-cyan to-accent-blue flex items-center justify-center">
            <Zap size={16} className="text-dark" />
          </div>
          <div>
            <h1 className="text-sm font-bold text-white tracking-wide">TCP/IP Simulator</h1>
            <p className="text-[10px] text-white/30 uppercase tracking-widest">Network Flow Visualizer</p>
          </div>
        </div>

        {/* Data Input */}
        <div className="flex items-center gap-2">
          <span className="text-[10px] text-white/30 uppercase tracking-wider">Data:</span>
          <input
            type="text"
            value={state.packet.data}
            onChange={(e) => dispatch({ type: 'SET_DATA', payload: e.target.value })}
            disabled={state.phase !== 'idle' && state.phase !== 'complete'}
            className="w-40 px-3 py-1.5 text-xs rounded-lg bg-dark-300 border border-white/[0.08] text-white/80 placeholder-white/20 focus:outline-none focus:border-accent-cyan/40 disabled:opacity-50 font-mono"
            placeholder="Enter message..."
          />
        </div>

        {/* Sender / Receiver Select */}
        <div className="flex items-center gap-4">
          <div className="flex items-center gap-2">
            <span className="text-[10px] text-white/30 uppercase tracking-wider">Sender:</span>
            <select
              value={state.senderId || ''}
              onChange={(e) => dispatch({ type: 'SET_SENDER', payload: e.target.value })}
              disabled={state.phase !== 'idle' && state.phase !== 'complete'}
              className="px-2 py-1.5 text-xs rounded-lg bg-dark-300 border border-accent-cyan/20 text-accent-cyan focus:outline-none disabled:opacity-50"
            >
              {state.devices.map(d => (
                <option key={d.id} value={d.id}>{d.name} ({d.ip})</option>
              ))}
            </select>
          </div>
          <div className="text-white/20">→</div>
          <div className="flex items-center gap-2">
            <span className="text-[10px] text-white/30 uppercase tracking-wider">Receiver:</span>
            <select
              value={state.receiverId || ''}
              onChange={(e) => dispatch({ type: 'SET_RECEIVER', payload: e.target.value })}
              disabled={state.phase !== 'idle' && state.phase !== 'complete'}
              className="px-2 py-1.5 text-xs rounded-lg bg-dark-300 border border-accent-green/20 text-accent-green focus:outline-none disabled:opacity-50"
            >
              {state.devices.filter(d => d.id !== state.senderId).map(d => (
                <option key={d.id} value={d.id}>{d.name} ({d.ip})</option>
              ))}
            </select>
          </div>
        </div>

        {/* Playback Controls */}
        <div className="flex items-center gap-2">
          <button
            onClick={handlePlayPause}
            className="w-9 h-9 rounded-lg flex items-center justify-center bg-accent-cyan/10 border border-accent-cyan/20 text-accent-cyan hover:bg-accent-cyan/20 transition-all"
            title={state.isPlaying ? 'Pause' : 'Play'}
          >
            {state.isPlaying ? <Pause size={16} /> : <Play size={16} />}
          </button>
          <button
            onClick={handleStep}
            className="w-9 h-9 rounded-lg flex items-center justify-center bg-white/[0.04] border border-white/[0.08] text-white/60 hover:text-accent-cyan hover:border-accent-cyan/20 transition-all"
            title="Step"
          >
            <SkipForward size={16} />
          </button>
          <button
            onClick={handleReset}
            className="w-9 h-9 rounded-lg flex items-center justify-center bg-white/[0.04] border border-white/[0.08] text-white/60 hover:text-accent-red hover:border-accent-red/20 transition-all"
            title="Reset"
          >
            <RotateCcw size={16} />
          </button>

          {/* Step Mode Toggle */}
          <button
            onClick={() => dispatch({ type: 'TOGGLE_STEP_MODE' })}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs border transition-all ${
              state.stepMode
                ? 'bg-accent-orange/10 border-accent-orange/30 text-accent-orange'
                : 'bg-white/[0.04] border-white/[0.08] text-white/40'
            }`}
          >
            <Footprints size={12} />
            Step
          </button>
        </div>

        {/* Speed Slider */}
        <div className="flex items-center gap-3">
          <span className="text-[10px] text-white/30 uppercase tracking-wider">Speed:</span>
          <input
            type="range"
            min="0.5"
            max="3"
            step="0.5"
            value={state.speed}
            onChange={(e) => dispatch({ type: 'SET_SPEED', payload: parseFloat(e.target.value) })}
            className="w-20 h-1 accent-accent-cyan appearance-none bg-dark-400 rounded-full [&::-webkit-slider-thumb]:appearance-none [&::-webkit-slider-thumb]:w-3 [&::-webkit-slider-thumb]:h-3 [&::-webkit-slider-thumb]:bg-accent-cyan [&::-webkit-slider-thumb]:rounded-full [&::-webkit-slider-thumb]:cursor-pointer"
          />
          <span className="text-xs font-mono text-white/40">{state.speed}x</span>
        </div>

        {/* Status */}
        <div className={`text-xs font-bold uppercase tracking-widest ${phaseColor[state.phase]}`}>
          {phaseLabel[state.phase]}
        </div>
      </div>
    </div>
  );
}
