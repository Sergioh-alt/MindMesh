import React, { useState } from 'react';
import { Handle, Position, useReactFlow, useHandleConnections } from '@xyflow/react';
import axios from 'axios';
import { useEditMode } from '../contexts/EditModeContext';
import { RotatableNodeWrapper } from './FlowCanvas';
import { API_BASE_URL } from '../constants';

const GenericCustomNode = React.memo(({ id, data, selected }) => {
  const { updateNodeData } = useReactFlow();
  const { editMode, isMovementLocked } = useEditMode();
  const [isRunning, setIsRunning] = useState(false);

  const sourceConns = useHandleConnections({ type: 'target' }); // Renamed correctly; input is target
  const targetConns = useHandleConnections({ type: 'target' });
  const isConnected = sourceConns.length > 0 || targetConns.length > 0;

  const handleRunNode = async (e) => {
    e.stopPropagation();
    setIsRunning(true);
    try {
      const response = await axios.post(`${API_BASE_URL}/process`, {
        id,
        label: data.label,
        type: 'dynamic',
        payload: {
          logic: data.logic,
          source: data.sourceNodeId || null
        }
      });
      updateNodeData(id, { output: response.data.output || "EXECUTION_COMPLETE" });
    } catch (err) {
      console.error("Execution failure:", err);
      updateNodeData(id, { output: "!! ERROR: SYSTEM_TIMEOUT_OR_HALT !!" });
    } finally {
      setIsRunning(false);
    }
  };

  // Use dynamic properties from metadata
  const config = {
    emoji: data?.emoji || '⚙️',
    label: data?.label || 'Custom Node',
    nodeColor: data?.nodeColor || '#00E5FF', 
    hasTarget: data?.hasTarget ?? true,
    hasSource: data?.hasSource ?? true
  };

  const glowStyle = isConnected 
    ? { boxShadow: `0 0 15px 2px ${config.nodeColor}99, inset 0 0 8px ${config.nodeColor}66`, borderColor: config.nodeColor }
    : { boxShadow: `0 0 10px ${config.nodeColor}33`, borderColor: `${config.nodeColor}44` };

  return (
    <RotatableNodeWrapper id={id} rotation={data?.rotation ?? 0} isMovementLocked={isMovementLocked} editMode={editMode} minWidth={200} minHeight={120}>
      <div className={`relative min-w-[200px] h-full transition-all duration-300 border-none outline-none node-idle h-full pointer-events-none`}>
        <div className={`node-chassis ${config.hasTarget ? 'glow-t' : ''} ${config.hasSource ? 'glow-b' : ''} border-[1.5px] ${isRunning ? 'node-processing' : ''} ${editMode && !isMovementLocked ? 'border-dashed border-2 border-amber-500' : ''} p-4 relative w-full h-full pointer-events-auto shadow-none`}
             style={{ 
               background: 'var(--industrial-bg)', 
               borderColor: glowStyle.borderColor, 
               boxShadow: glowStyle.boxShadow,
               borderRadius: '12px' 
             }}>
          
          <div className="flex items-center gap-2 mb-3">
            <div className={`w-8 h-8 rounded-lg border flex items-center justify-center text-lg`}
                 style={{ backgroundColor: `${config.nodeColor}11`, borderColor: `${config.nodeColor}33` }}>
              {config.emoji}
            </div>
            <div>
              <div className="font-hud text-[10px] tracking-widest uppercase" style={{ color: config.nodeColor }}>DYNAMIC-EXP</div>
              <div className="font-body text-sm font-semibold text-white tracking-tight">{config.label}</div>
            </div>
          </div>

          <div className="node-output-terminal scrollbar-none">
             <div className="opacity-40 text-[8px] mb-1 uppercase tracking-widest border-b border-white/5 pb-1 flex justify-between">
                <span>Output Stream</span>
                <span className="animate-pulse">●</span>
             </div>
             {data?.output || "Awaiting execution..."}
          </div>

          {!editMode && (
            <button 
              onClick={handleRunNode}
              disabled={isRunning}
              className={`mt-3 w-full py-2 rounded-lg border text-[10px] font-hud tracking-[0.2em] uppercase transition-all
                         ${isRunning 
                            ? 'bg-amber-500/10 border-amber-500/40 text-amber-500 cursor-not-allowed' 
                            : 'bg-green-500/10 border-green-500/50 text-[#39ff14] hover:bg-green-500/20 active:scale-95 shadow-[0_0_15px_rgba(57,255,20,0.1)]'}`}
            >
              {isRunning ? 'Synthesizing...' : 'Execute Sequence ‣'}
            </button>
          )}

          <div className="mt-auto pt-2 border-t border-white/5 text-[8px] font-mono text-gray-600 flex justify-between uppercase">
             <span>PID: {id.split('_')[1] || 'STATIC'}</span>
             <span>VER: 1.1</span>
          </div>
        </div>

        {/* Dynamic Handles */}
        {config.hasTarget && (
          <Handle id="target" type="target" position={Position.Top} />
        )}
        {config.hasSource && (
          <Handle id="source" type="source" position={Position.Bottom} />
        )}
      </div>
    </RotatableNodeWrapper>
  );
});

export default GenericCustomNode;
