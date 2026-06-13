import React, { useState } from 'react';
import { saveNewNode } from '../utils/nodeRegistry';

const NodeFactoryModal = ({ isOpen, onClose }) => {
  const [nodeName, setNodeName] = useState('');
  const [emoji, setEmoji] = useState('⚙️');
  const [hasTarget, setHasTarget] = useState(true);
  const [hasSource, setHasSource] = useState(true);
  const [logic, setLogic] = useState('');
  const [color, setColor] = useState('#00E5FF'); // Default Cyan hex

  if (!isOpen) return null;

  const handleCreate = () => {
    if (!nodeName.trim()) return;
    saveNewNode({
      label: nodeName,
      emoji,
      nodeColor: color, // Save the hex code directly
      hasTarget,
      hasSource,
      logic
    });
    onClose();
  };

  const colors = ['#00E5FF', '#FFD700', '#A020F0', '#FF8C00', '#DC143C'];

  return (
    <div className="fixed inset-0 z-[10000] flex items-center justify-center p-4 backdrop-blur-sm bg-black/60">
      <div className="node-chassis bg-dark-950 border-neon-cyan/40 p-8 w-[450px] shadow-2xl relative">
        <h2 className="text-sm font-hud text-neon-cyan tracking-[0.3em] mb-6 flex justify-between items-center">
           <span>NODE FACTORY v1.0</span>
           <button onClick={onClose} className="text-gray-500 hover:text-white transition-colors">✕</button>
        </h2>

        <div className="space-y-5">
          <div className="flex gap-4 items-end">
             <div className="flex-1">
                <label className="text-[10px] text-gray-400 font-mono block mb-1">NODE_IDENTIFIER</label>
                <input 
                  value={nodeName}
                  onChange={(e) => setNodeName(e.target.value)}
                  className="w-full bg-dark-900 border border-neon-cyan/20 rounded-lg p-2 text-xs text-white font-mono focus:border-neon-cyan transition-all"
                  placeholder="CLASSIFIER_X"
                />
             </div>
             <div className="flex-1">
                <label className="text-[10px] text-gray-400 font-mono block mb-1 uppercase tracking-widest text-[#00E5FF]">GLYPH (EMOJI/ICON)</label>
                <input 
                  value={emoji}
                  onChange={(e) => setEmoji(e.target.value)}
                  className="w-full bg-dark-900 border border-neon-cyan/30 rounded-lg p-3 text-center text-xl focus:border-neon-cyan transition-all text-white font-mono shadow-[inset_0_0_10px_rgba(0,229,255,0.05)]"
                  placeholder="ENTRY_GLYPH..."
                />
             </div>
          </div>

          <div className="flex justify-between items-center bg-dark-900/50 p-3 rounded-lg border border-white/5">
            <span className="text-[10px] text-gray-400 font-mono uppercase">Ports (Handles)</span>
            <div className="flex gap-4 font-mono text-[10px]">
               <label className="flex items-center gap-2 cursor-pointer group">
                  <input type="checkbox" checked={hasTarget} onChange={() => setHasTarget(!hasTarget)} className="hidden" />
                  <div className={`w-3 h-3 border rounded transition-all duration-200 ${hasTarget ? 'bg-[#00f5ff] border-[#00f5ff] shadow-[0_0_10px_#00f5ff,0_0_20px_rgba(0,245,255,0.4)]' : 'border-gray-700'}`} />
                  <span className={hasTarget ? 'text-neon-cyan text-glow-cyan' : 'text-gray-600'}>INPUT</span>
               </label>
               <label className="flex items-center gap-2 cursor-pointer group">
                  <input type="checkbox" checked={hasSource} onChange={() => setHasSource(!hasSource)} className="hidden" />
                  <div className={`w-3 h-3 border rounded transition-all duration-200 ${hasSource ? 'bg-[#f59e0b] border-[#f59e0b] shadow-[0_0_10px_#f59e0b,0_0_20px_rgba(245,158,11,0.4)]' : 'border-gray-700'}`} />
                  <span className={hasSource ? 'text-neon-amber text-glow-amber' : 'text-gray-600'}>OUTPUT</span>
               </label>
            </div>
          </div>

          <div>
            <label className="text-[10px] text-gray-400 font-mono block mb-1">LOGIC_INJECTION (RAW)</label>
            <textarea 
              value={logic}
              onChange={(e) => setLogic(e.target.value)}
              className="w-full bg-dark-900 border border-neon-cyan/10 rounded-lg p-3 text-xs text-gray-400 font-mono h-24 focus:border-neon-cyan transition-all"
              placeholder="// Pipeline processing data payload..."
            />
          </div>

          <div className="flex gap-2">
             {colors.map(c => (
                <button 
                  key={c}
                  onClick={() => setColor(c)}
                  style={{ backgroundColor: c, boxShadow: color === c ? `0 0 10px ${c}` : 'none' }}
                  className={`flex-1 h-3 rounded-full border transition-all ${color === c ? 'border-white' : 'border-gray-700 hover:border-gray-500'}`}
                />
             ))}
          </div>

          <button 
            onClick={handleCreate}
            disabled={!nodeName.trim()}
            className="w-full py-3 bg-neon-cyan/10 border border-neon-cyan/40 text-neon-cyan text-xs font-hud tracking-[0.2em] rounded-xl hover:bg-neon-cyan/20 active:scale-[0.98] transition-all disabled:opacity-40 uppercase font-bold shadow-[0_0_15px_rgba(0,245,255,0.1)]"
          >
            Execute Creation Sequence
          </button>
        </div>
      </div>
    </div>
  );
};

export default NodeFactoryModal;
