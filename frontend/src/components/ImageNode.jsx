import React, { useState, useEffect } from 'react';
import { Handle, Position, useReactFlow, useHandleConnections } from '@xyflow/react';
import axios from 'axios';
import { useEditMode } from '../contexts/EditModeContext';
import { RotatableNodeWrapper } from './FlowCanvas';
import { NODE_CONFIG } from '../constants';

const StatusDot = ({ status }) => {
  const colors = {
    idle: 'bg-gray-600',
    pending: 'bg-yellow-400 animate-pulse',
    processing: 'bg-neon-green animate-pulse shadow-neon-green',
    completed: 'bg-neon-cyan shadow-neon-cyan',
    error: 'bg-red-500',
  }
  return (
    <span className={`inline-block w-2 h-2 rounded-full mr-1.5 ${colors[status] ?? 'bg-gray-500'}`} />
  )
}

const ImageNode = React.memo(({ id, data, selected }) => {
  const { updateNodeData } = useReactFlow()
  const { editMode, isMovementLocked, isFunctionLocked, addFlatCost } = useEditMode()
  const [prompt, setPrompt] = useState(data?.prompt || '')
  const [status, setStatus] = useState('idle')
  const [imageUrl, setImageUrl] = useState(data?.imageUrl || null)

  useEffect(() => {
    if (data) {
      if (data.prompt !== undefined) setPrompt(data.prompt)
      if (data.imageUrl !== undefined) setImageUrl(data.imageUrl)
    }
  }, [data])

  const handleGenerate = async () => {
    if (!prompt.trim()) return
    setStatus('processing')
    try {
      const res = await axios.post('http://localhost:8000/api/generate-image', {
        prompt: prompt
      })
      setImageUrl(res.data.url)
      updateNodeData(id, { imageUrl: res.data.url })
      if (addFlatCost) addFlatCost(0.04) // DALL-E 3 Cost
      setStatus('completed')
    } catch {
      setStatus('error')
    }
  }

  const sourceConns = useHandleConnections({ type: 'source' });
  const targetConns = useHandleConnections({ type: 'target' });
  const isConnected = sourceConns.length > 0 || targetConns.length > 0;
  const config = NODE_CONFIG.imageNode || { emoji: '🖼️', label: 'Image Generator', color: 'cyan', glow: 'glow-active-cyan' };

  return (
    <RotatableNodeWrapper id={id} rotation={data?.rotation ?? 0} isMovementLocked={isMovementLocked} editMode={editMode} minWidth={280} minHeight={200}>
      <div className={`relative min-w-[280px] h-full
                       ${isConnected ? config.glow : ''}
                       ${selected ? `ring-2 ring-neon-${config.color} shadow-[0_0_15px_rgba(0,245,255,0.2)]` : ''}
                       ${status === 'processing' ? 'node-processing' : 'node-idle'}
                       ${editMode ? 'node-edit-active' : ''} pointer-events-none`}>
        <div className={`node-chassis glow-t glow-b border-[1.5px] ${editMode && !isMovementLocked ? 'border-dashed border-2 border-amber-500' : `border-neon-${config.color}/30`} p-4 relative w-full h-full pointer-events-auto`}
             style={{ background: 'var(--industrial-bg)' }}>
          
          {/* Header Part (Cloned from Prompt Refiner) */}
          <div className="flex items-center gap-2 mb-3">
            <div className={`w-8 h-8 rounded-lg bg-neon-${config.color}/10 border border-neon-${config.color}/30
                            flex items-center justify-center text-lg`}>{config.emoji}</div>
            <div>
              <div className="font-hud text-xs text-neon-cyan tracking-widest">NODE-IMG</div>
              <div className="font-body text-sm font-semibold text-white">Image Generator</div>
            </div>
            <div className="ml-auto flex items-center">
               <StatusDot status={status} />
               <span className="text-[10px] font-mono text-gray-400 capitalize ml-1">{status}</span>
            </div>
          </div>

          {/* Content Part */}
          <div className="space-y-2">
            <label className="text-[10px] text-gray-400 font-mono uppercase tracking-widest">Visual Prompt Payload</label>
            <textarea
              disabled={isFunctionLocked || status === 'processing'}
              value={prompt}
              onChange={(e) => {
                setPrompt(e.target.value)
                updateNodeData(id, { prompt: e.target.value })
              }}
              rows={2}
              className="w-full bg-dark-950 border border-neon-cyan/20 p-2 text-xs text-neon-cyan/80 font-mono focus:outline-none focus:border-neon-cyan/50 resize-none nodrag rounded"
              placeholder="Awaiting diffusion vector instructions..."
            />
          </div>

          <button
            onClick={handleGenerate}
            disabled={status === 'processing' || !prompt.trim() || isFunctionLocked}
            className="mt-3 w-full py-2 bg-neon-cyan/10 border border-neon-cyan/30 text-neon-cyan text-xs font-hud tracking-widest hover:bg-neon-cyan/20 transition-all disabled:opacity-40 rounded-lg"
          >
            {status === 'processing' ? '⟳ GENERATING...' : '▶ EXECUTE_GENERATION ($0.04)'}
          </button>

          {/* Conditional Image Rendering Rule */}
          <div className="mt-3 relative aspect-video bg-dark-950 border border-white/5 overflow-hidden group rounded-md">
            {status === 'processing' ? (
              <div className="absolute inset-0 flex flex-col items-center justify-center gap-2">
                 <div className="w-6 h-6 border-2 border-neon-cyan border-t-transparent rounded-full animate-spin" />
                 <span className="text-[10px] text-neon-cyan animate-pulse font-hud">RENDERING...</span>
              </div>
            ) : imageUrl ? (
              <img src={imageUrl} alt="Generated" className="w-full h-full object-cover transition-transform group-hover:scale-105" />
            ) : (
               <div className="absolute inset-0 flex items-center justify-center text-gray-600 text-[10px] font-mono tracking-tighter">
                  READY_FOR_GEN
               </div>
            )}
          </div>
        </div>

        {/* Handles */}
        <Handle id="img-target" type="target" position={Position.Top} />
        <Handle id="img-source" type="source" position={Position.Bottom} />
      </div>
    </RotatableNodeWrapper>
  )
})

export default ImageNode;
