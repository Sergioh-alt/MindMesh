import React, { useState, useEffect } from 'react';
import { Handle, Position, useReactFlow, useHandleConnections } from '@xyflow/react';
import { NODE_CONFIG } from '../constants';
import { useEditMode } from '../contexts/EditModeContext';
import { RotatableNodeWrapper } from '../components/FlowCanvas';
import axios from 'axios';

const BunkerNode = React.memo(({ id, data, selected }) => {
  const { updateNodeData } = useReactFlow();
  const { editMode, isMovementLocked, isFunctionLocked } = useEditMode();
  
  const [isLocked, setIsLocked] = useState(data?.isLocked ?? true);
  const [password, setPassword] = useState("");
  const [status, setStatus] = useState("idle"); // idle, checking, error

  useEffect(() => {
    if (data?.isLocked !== undefined) setIsLocked(data.isLocked);
  }, [data?.isLocked]);

  const handleToggleLock = async () => {
    if (!isLocked) {
      // Locking is immediate
      setIsLocked(true);
      updateNodeData(id, { isLocked: true });
      setPassword("");
      return;
    }

    // Unlocking requires validation
    setStatus("checking");
    try {
      const res = await axios.post('http://localhost:8000/api/bunker/validate', {
        password: password
      });
      
      if (res.data.valid) {
        setIsLocked(false);
        updateNodeData(id, { isLocked: false });
        setStatus("idle");
        setPassword("");
      } else {
        setStatus("error");
        setTimeout(() => setStatus("idle"), 2000);
      }
    } catch (err) {
      setStatus("error");
      setTimeout(() => setStatus("idle"), 2000);
    }
  };

  const sourceConns = useHandleConnections({ type: 'source' });
  const targetConns = useHandleConnections({ type: 'target' });
  const isConnected = sourceConns.length > 0 || targetConns.length > 0;
  const config = NODE_CONFIG.bunkerLock || { emoji: '🔒', label: 'Bunker Lock' };

  return (
    <RotatableNodeWrapper id={id} rotation={data?.rotation ?? 0} isMovementLocked={isMovementLocked} editMode={editMode} minWidth={200} minHeight={200}>
        <div className={`node-chassis bunker-chassis border-[1.5px] ${editMode && !isMovementLocked ? 'border-dashed border-2 border-amber-500' : 'border-red-500/30'} p-4 relative w-full h-full pointer-events-auto`}
             style={{ background: 'var(--industrial-bg)' }}>
          
          {editMode && <div className="absolute top-2 right-2 text-amber-500/80 text-[10px] animate-[spin_6s_linear_infinite]">⚙️</div>}
          
          <div className="flex items-center gap-2 mb-3">
             <div className="w-8 h-8 rounded-lg bg-red-500/10 border border-red-500/30
                             flex items-center justify-center text-lg">
                {config?.emoji}
             </div>
             <div>
               <div className="font-hud text-xs text-red-500 tracking-widest uppercase line-clamp-1">
                  {data?.label || 'SECURITY-VAULT'}
               </div>
               <div className="font-body text-sm font-semibold text-white uppercase truncate max-w-[120px]">
                  {isLocked ? 'Protocol Locked' : 'System Secure'}
               </div>
             </div>
              <div className="ml-auto flex items-center">
                <div className={`w-2 h-2 rounded-full mr-1.5 ${isLocked ? 'bg-red-500 shadow-[0_0_8px_#ff0044]' : 'bg-neon-green shadow-[0_0_8px_#39ff14]'}`} />
                <span className="text-[10px] font-mono text-gray-500 uppercase">{status || 'OFFLINE'}</span>
              </div>
          </div>

          <div className="space-y-4">

             {isLocked && (
               <div className="mt-2 text-center">
                 <input
                   type="password"
                   disabled={isFunctionLocked || status === 'checking'}
                   placeholder="VAULT_KEY..."
                   value={password}
                   onChange={(e) => setPassword(e.target.value)}
                   className="w-full bg-dark-900 border border-red-500/20 rounded px-3 py-1.5
                              text-xs text-red-500 font-mono text-center focus:outline-none focus:border-red-500/60 transition-all placeholder:text-red-900/40 uppercase"
                 />
               </div>
             )}
             
             <button
               onClick={handleToggleLock}
               disabled={isFunctionLocked || status === 'checking' || (isLocked && !password)}
               className={`w-full py-2 rounded-lg text-xs font-hud tracking-[0.2em] font-bold transition-all uppercase
                          ${isLocked 
                             ? 'bg-red-600/10 border border-red-500/30 text-red-500 hover:bg-red-600/20' 
                             : 'bg-neon-green/10 border border-neon-green/30 text-neon-green hover:bg-neon-green/20'}`}
             >
               {status === 'checking' ? 'SYNCING...' : isLocked ? 'AUTHENTICATE' : 'DEACTIVATE'}
             </button>

             {status === 'error' && (
                <div className="text-[9px] text-red-500 font-mono text-center animate-pulse">
                   ACCESS DENIED - LOGGING ATTEMPT
                </div>
             )}
          </div>

        </div>
    </RotatableNodeWrapper>
  );
});

export default BunkerNode;
