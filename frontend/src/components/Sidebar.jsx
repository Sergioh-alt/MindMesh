import React, { useState, useMemo, useEffect } from 'react';
import { useEditMode } from '../contexts/EditModeContext';
import { NODE_CONFIG } from '../constants';
import { getDynamicNodes, deleteDynamicNode } from '../utils/nodeRegistry';
import NodeFactoryModal from './NodeFactoryModal';

const Sidebar = () => {
  const { isEditMode } = useEditMode();
  const [searchTerm, setSearchTerm] = useState('');
  const [debouncedSearchTerm, setDebouncedSearchTerm] = useState('');

  // 300ms Debounce for performance optimization
  useEffect(() => {
    const handler = setTimeout(() => {
      setDebouncedSearchTerm(searchTerm);
    }, 300);

    return () => clearTimeout(handler);
  }, [searchTerm]);

  const onDragStart = (event, nodeType) => {
    if (!isEditMode) return;
    event.dataTransfer.setData('application/rfn-node', nodeType);
    event.dataTransfer.effectAllowed = 'move';
  };

  const [dynamicNodes, setDynamicNodes] = useState(getDynamicNodes());
  const [isModalOpen, setIsModalOpen] = useState(false);

  useEffect(() => {
    const handleUpdate = () => setDynamicNodes(getDynamicNodes());
    window.addEventListener('sf_registry_updated', handleUpdate);
    return () => window.removeEventListener('sf_registry_updated', handleUpdate);
  }, []);

  const nodeLibrary = useMemo(() => {
    const staticNodes = Object.entries(NODE_CONFIG).map(([type, config]) => ({
      type,
      label: `${config.emoji} ${config.label}`,
      color: config.color,
      glow: config.glow !== undefined
    }));

    const dynamicEntries = Object.entries(dynamicNodes).map(([id, config]) => ({
      type: id,
      label: `${config.emoji} ${config.label}`,
      color: config.color || 'cyan',
      glow: true,
      isCustom: true
    }));

    return [...staticNodes, ...dynamicEntries];
  }, [dynamicNodes]);

  const filteredNodes = useMemo(() => {
    return nodeLibrary.filter(node => 
      node.label.toLowerCase().includes(debouncedSearchTerm.toLowerCase()) ||
      node.type.toLowerCase().includes(debouncedSearchTerm.toLowerCase())
    );
  }, [debouncedSearchTerm, nodeLibrary]);

  return (
    <aside className="w-64 bg-dark-900 border-r border-neon-cyan/20 p-4 flex flex-col h-full shrink-0 relative transition-all shadow-[10px_0_30px_rgba(0,0,0,0.5)]">
      {/* Palette Header */}
      
      <div className="mb-4">
        <h2 className="text-xs font-hud tracking-widest mb-1 flex justify-between items-center text-neon-cyan">
           <span>NODE PALETTE</span>
           <span className={`text-[9px] px-1.5 py-0.5 rounded-lg border ${isEditMode ? 'text-amber-500 border-amber-500/30 bg-amber-500/10' : 'text-gray-500 border-gray-500/30 bg-gray-500/10'}`}>
              {isEditMode ? '🔓 UNLOCKED' : '🔒 LOCKED'}
           </span>
        </h2>
        <div className="h-px bg-gradient-to-r from-neon-cyan/50 to-transparent mb-4" />
        
        {/* Cyberpunk Search Bar */}
        <div className="relative mb-4 group">
          <input
            type="text"
            placeholder="SEARCH NODES..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full bg-dark-950 border border-neon-cyan/20 rounded-lg px-8 py-1.5 text-[10px] font-mono text-white placeholder-gray-600 focus:outline-none focus:border-neon-cyan/60 transition-all shadow-inner"
          />
          <span className="absolute left-2 top-1/2 -translate-y-1/2 text-neon-cyan opacity-40 group-focus-within:opacity-100 transition-opacity">🔍</span>
          {searchTerm && (
            <button 
              onClick={() => setSearchTerm('')}
              className="absolute right-2 top-1/2 -translate-y-1/2 text-gray-500 hover:text-white text-[10px]"
            >
              ✕
            </button>
          )}
        </div>

        <div className="space-y-3 overflow-y-auto pr-2 custom-scrollbar" style={{ maxHeight: 'calc(100vh - 180px)', paddingBottom: '120px' }}>
          {filteredNodes.length > 0 ? (
            <>
              {filteredNodes.map((node) => (
                <div
                  key={node.type}
                  className={`p-3 border border-${node.color}-500/30 bg-${node.color}-500/10 rounded-xl transition-all transform hover:scale-[1.02] active:scale-95 ${isEditMode ? 'cursor-grab hover:bg-' + node.color + '-500/20' : 'cursor-not-allowed opacity-50'}`}
                  style={node.hex ? { borderColor: `${node.hex}44`, backgroundColor: `${node.hex}11` } : {}}
                  onDragStart={(event) => onDragStart(event, node.type)}
                  draggable={isEditMode}
                >
                  <div className={`text-xs font-hud text-${node.color}-400 flex justify-between items-center group`}
                       style={node.hex ? { color: node.hex } : {}}>
                    <span className={node.glow ? `text-glow-${node.color}` : ''}>{node.label}</span>
                    <div className="flex items-center gap-2">
                       <span className={`text-[8px] opacity-40 font-mono uppercase bg-black/20 px-1 rounded`}>
                          {node.isCustom ? 'CUSTOM' : 'STDLIB'}
                       </span>
                       {node.isCustom && isEditMode && (
                          <button 
                             onClick={(e) => {
                                e.stopPropagation();
                                if (window.confirm(`PERMANENTLY VOID NODE: ${node.label}?`)) {
                                   deleteDynamicNode(node.type);
                                }
                             }}
                             className="text-red-500 hover:text-red-400 opacity-60 hover:opacity-100 transition-all text-[10px]"
                             title="VOID MODULE"
                          >
                             🗑️
                          </button>
                       )}
                    </div>
                  </div>
                </div>
              ))}
              
              {isEditMode && (
                <button 
                  onClick={() => setIsModalOpen(true)}
                  className="w-full mt-2 py-4 border border-dashed border-neon-cyan/30 rounded-xl text-[11px] font-hud text-neon-cyan/60 hover:text-neon-cyan hover:border-neon-cyan/60 hover:bg-neon-cyan/5 transition-all uppercase tracking-[0.2em]"
                >
                  Create New Node ➕
                </button>
              )}
            </>
          ) : (
            <div className="text-center py-8 opacity-40 border border-dashed border-gray-700 rounded">
              <div className="text-xl mb-1">🚫</div>
              <div className="text-[10px] font-mono">NO NODES MATCHING SEARCH</div>
            </div>
          )}
        </div>
      </div>
      <NodeFactoryModal isOpen={isModalOpen} onClose={() => setIsModalOpen(false)} />
    </aside>
  );
};

export default Sidebar;
