import React, { useState, useEffect } from 'react';
import { Handle, Position, useReactFlow, NodeResizer, useHandleConnections } from '@xyflow/react';
import { useEditMode } from '../contexts/EditModeContext';
import { RotatableNodeWrapper } from './FlowCanvas';
import { NODE_CONFIG } from '../constants';
import axios from 'axios';

const DecisionNode = React.memo(({ id, data, selected }) => {
  const { updateNodeData } = useReactFlow();
  const { editMode, isMovementLocked, isFunctionLocked } = useEditMode();
  const [conditionMet, setConditionMet] = useState(data?.conditionMet ?? null); // null = pending, true = pass, false = fail
  const [textInput, setTextInput] = useState(data?.textInput ?? "");

  const sourceConns = useHandleConnections({ type: 'source' });
  const targetConns = useHandleConnections({ type: 'target' });
  const isConnected = sourceConns.length > 0 || targetConns.length > 0;
  const config = NODE_CONFIG.decisionNode;

  useEffect(() => {
    if (data?.conditionMet !== undefined) setConditionMet(data.conditionMet);
    if (data?.textInput !== undefined) setTextInput(data.textInput);
  }, [data?.conditionMet, data?.textInput]);

  const checkCondition = async () => {
    try {
      const res = await axios.post('http://127.0.0.1:8000/api/decision', {
        text: textInput,
        min_words: 200
      });
      const passed = res.data.passed;
      setConditionMet(passed);
      updateNodeData(id, { conditionMet: passed, textInput });
    } catch (err) {
      console.warn("Decision API Check Failed", err);
      setConditionMet(false);
      updateNodeData(id, { conditionMet: false, textInput });
    }
  };

  const statusColor = conditionMet === null ? 'border-amber-500/40 text-amber-500' :
                      conditionMet === true ? 'border-neon-green/80 text-neon-green shadow-[0_0_15px_#39ff14]' :
                      'border-neon-red/80 text-neon-red shadow-[0_0_15px_#ff0044]';

  return (
    <RotatableNodeWrapper id={id} rotation={data?.rotation ?? 0} isMovementLocked={isMovementLocked} editMode={editMode} minWidth={180} minHeight={180}>
      <div className={`relative min-w-[260px] min-h-[220px] ${isConnected ? 'glow-active-amber' : ''}
                       ${selected ? 'ring-2 ring-amber-500 shadow-[0_0_15px_rgba(245,158,11,0.2)]' : ''}
                       ${conditionMet === null ? 'node-idle' : 'node-completed'}
                       ${editMode ? 'node-edit-active' : ''} h-full pointer-events-none flex items-center justify-center`}>
        <div className={`node-chassis glow-l glow-r border-[1.5px] ${editMode && !isMovementLocked ? 'border-dashed border-2 border-amber-500' : 'border-amber-500/30'} p-5 relative w-full h-full pointer-events-auto`}
             style={{ background: 'var(--industrial-bg)' }}>
          
          {editMode && <div className="absolute top-2 right-2 text-amber-500/80 text-[10px] animate-[spin_6s_linear_infinite]">⚙️</div>}
          
          <div className="flex flex-col h-full">
            <div className="flex items-center gap-2 mb-4">
               <div className="w-8 h-8 rounded-lg bg-amber-500/10 border border-amber-500/30
                               flex items-center justify-center text-lg">{config?.emoji || '⚖️'}</div>
               <div>
                 <div className="font-hud text-xs text-amber-500 tracking-widest uppercase line-clamp-1">LOGIC-GATE</div>
                 <div className="font-body text-sm font-semibold text-white">Decision Router</div>
               </div>
               <div className="ml-auto flex items-center">
                 <div className={`w-2 h-2 rounded-full mr-1.5 ${conditionMet === null ? 'bg-gray-500' : conditionMet ? 'bg-neon-green shadow-[0_0_8px_#39ff14]' : 'bg-neon-red shadow-[0_0_8px_#ff0044]'}`} />
                 <span className="text-[10px] font-mono text-gray-500 uppercase">{conditionMet === null ? 'IDLE' : conditionMet ? 'PASS' : 'FAIL'}</span>
               </div>
            </div>

            <div className="space-y-4 flex-grow flex flex-col justify-center">
               <div>
                  <label className="text-[10px] text-gray-500 font-mono tracking-widest uppercase mb-1 block">CONDITION: LENGTH &gt; 200</label>
                  <textarea
                    disabled={isFunctionLocked}
                    value={textInput}
                    onChange={(e) => {
                      setTextInput(e.target.value);
                      updateNodeData(id, { textInput: e.target.value });
                    }}
                    placeholder="SOURCE_DATA..."
                    className="w-full h-20 bg-dark-900 border border-amber-500/20 rounded px-2 py-1.5
                               text-[10px] font-mono text-gray-300 focus:outline-none focus:border-amber-500/60 transition-all nodrag resize-none"
                  />
               </div>
               
               <button
                 disabled={isFunctionLocked}
                 onClick={checkCondition}
                 className="w-full py-2 rounded-lg bg-amber-500/10 border border-amber-500/30 text-amber-500 text-[10px] font-hud tracking-widest font-bold hover:bg-amber-500/20 transition-all uppercase"
               >
                 RUN_GATE_VALIDATION
               </button>

               {conditionMet !== null && (
                 <div className={`text-center py-1.5 border rounded bg-dark-950/50 text-[10px] font-hud tracking-[0.2em] font-bold ${conditionMet ? 'text-neon-green border-neon-green/30' : 'text-neon-red border-neon-red/30'}`}>
                   {conditionMet ? 'PROTOCOL_AUTHORIZED' : 'ACCESS_DENIED'}
                 </div>
               )}
            </div>
          </div>
        </div>

        {/* Repositioned Side-by-Side Handles */}
        <Handle type="target" position={Position.Left} className="!translate-y-[-50%]" />
        <Handle id="decision-pass" type="source" position={Position.Right} style={{ top: '35%' }} />
        <Handle id="decision-fail" type="source" position={Position.Right} style={{ top: '65%' }} />
      </div>
    </RotatableNodeWrapper>
  );
});

export default DecisionNode;
