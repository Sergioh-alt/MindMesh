import React, { useState, useEffect, useCallback } from 'react';
import { Handle, Position, useReactFlow, useHandleConnections } from '@xyflow/react';
import axios from 'axios';
import { useEditMode } from '../contexts/EditModeContext';
import { RotatableNodeWrapper } from '../components/FlowCanvas';
import { NODE_CONFIG } from '../constants';

const StatusDot = ({ status }) => {
  const colors = {
    idle: 'bg-gray-600',
    processing: 'bg-neon-cyan animate-pulse shadow-[0_0_8px_#00f5ff]',
    completed: 'bg-neon-green shadow-[0_0_8px_#39ff14]',
    error: 'bg-red-500 shadow-[0_0_8px_#ff0000]',
  };
  return <span className={`w-2 h-2 rounded-full mr-2 ${colors[status] || 'bg-gray-500'}`} />;
};

const TelegramNode = React.memo(({ id, data, selected }) => {
  const { updateNodeData } = useReactFlow();
  const { editMode, isMovementLocked, isFunctionLocked } = useEditMode();
  
  const [message, setMessage] = useState(data?.message ?? '');
  const [status, setStatus] = useState('idle');
  const [result, setResult] = useState(null);

  const sourceConns = useHandleConnections({ type: 'source' });
  const targetConns = useHandleConnections({ type: 'target' });
  const isConnected = sourceConns.length > 0 || targetConns.length > 0;
  const config = NODE_CONFIG.telegramNode;

  useEffect(() => {
    if (data?.message !== undefined) setMessage(data.message);
  }, [data?.message]);

  const handleSend = async () => {
    if (!message.trim()) return;
    setStatus('processing');
    try {
      const res = await axios.post('http://localhost:8000/api/telegram/send', {
        message: message,
        mode: 'HTML'
      });
      setResult(res.data);
      setStatus('completed');
    } catch (err) {
      console.error("[TelegramNode] Send failure:", err);
      setStatus('error');
    }
  };

  return (
    <RotatableNodeWrapper id={id} rotation={data?.rotation ?? 0} isMovementLocked={isMovementLocked} editMode={editMode} minWidth={240} minHeight={150}>
      <div className={`relative min-w-[240px] transition-all duration-300
                       ${isConnected ? config?.glow : ''}
                       ${selected ? 'ring-2 ring-[#0088cc]' : ''}
                       ${status === 'processing' ? 'brightness-110' : ''} h-full pointer-events-none`}>
        
        <div className={`node-chassis glow-t glow-b p-4 border-[1.5px] border-white/10 flex flex-col h-full pointer-events-auto
                        ${editMode && !isMovementLocked ? 'border-dashed border-2 border-amber-500' : ''}`}
             style={{ background: 'var(--industrial-bg)' }}>
          
          {/* Title Area */}
          <div className="flex items-center gap-3 mb-4">
            <div className="w-10 h-10 rounded-lg bg-[#0088cc]/20 border border-[#0088cc]/40 flex items-center justify-center text-xl shadow-inner">
              <span className="animate-pulse">{config?.emoji || '📥'}</span>
            </div>
            <div className="flex-1">
              <div className="flex items-center justify-between">
                <span className="text-[10px] font-hud text-[#0088cc] tracking-[0.2em] uppercase">Node Dispatch</span>
                <div className="flex items-center">
                  <StatusDot status={status} />
                  <span className="text-[9px] font-mono text-gray-500 uppercase">{status}</span>
                </div>
              </div>
              <h3 className="text-sm font-bold text-white tracking-wide">Telegram Bot</h3>
            </div>
          </div>

          {/* Config Area */}
          <div className="space-y-3 flex-1">
            <div className="relative group">
              <label className="text-[9px] font-mono text-gray-500 uppercase mb-1 block tracking-widest">Broadcast Payload</label>
              <textarea
                disabled={isFunctionLocked || status === 'processing'}
                value={message}
                onChange={(e) => {
                  setMessage(e.target.value);
                  updateNodeData(id, { message: e.target.value });
                }}
                placeholder="Enter text message or HTML markup..."
                className="w-full bg-black/40 border border-[#0088cc]/20 rounded-lg p-2.5 text-xs text-blue-100 font-mono focus:outline-none focus:border-[#0088cc]/60 transition-all resize-none h-24 placeholder:opacity-30"
              />
              <div className="absolute bottom-2 right-2 flex gap-1 items-center opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none">
                <span className="text-[8px] font-mono text-[#0088cc]">UTF-8</span>
              </div>
            </div>
          </div>

          {/* Actions */}
          <div className="mt-4 flex flex-col gap-2">
            <button
              onClick={handleSend}
              disabled={status === 'processing' || !message.trim() || isFunctionLocked}
              className={`w-full py-2.5 rounded-lg text-[10px] font-hud tracking-[3px] transition-all
                         ${status === 'processing' 
                           ? 'bg-[#0088cc]/10 border border-[#0088cc]/20 text-[#0088cc]/50 cursor-wait' 
                           : 'bg-[#0088cc]/20 border border-[#0088cc]/50 text-blue-300 hover:bg-[#0088cc]/40 hover:shadow-[0_0_15px_rgba(0,136,204,0.3)]'}`}
            >
              {status === 'processing' ? 'DISPATCHING...' : '▶ SEND SIGNAL'}
            </button>

            {result && (
              <div className="bg-black/50 border border-white/5 rounded-lg p-2 mt-2 animate-in fade-in slide-in-from-top-1">
                <div className="flex items-center justify-between text-[9px] font-mono">
                  <span className={result.status === 'success' ? 'text-neon-green' : 'text-red-400'}>
                    STATUS: {result.status.toUpperCase()}
                  </span>
                  <span className="text-gray-600">{result.mode}</span>
                </div>
                {result.url && (
                  <button 
                    onClick={() => window.open(result.url, '_blank')}
                    className="text-[8px] text-[#0088cc] hover:underline mt-1 block truncate"
                  >
                    DISPATCH_LINK: {result.url}
                  </button>
                )}
              </div>
            )}
          </div>
        </div>

        {/* Port Handles */}
        <Handle
          type="target"
          position={Position.Top}
        />
        <Handle
          type="source"
          position={Position.Bottom}
        />
      </div>
    </RotatableNodeWrapper>
  );
});

export default TelegramNode;
