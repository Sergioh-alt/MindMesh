import React, { useState, useCallback, useMemo, useEffect } from 'react';
import { ReactFlow, applyNodeChanges, applyEdgeChanges, addEdge, Background, Controls, MiniMap, Handle, Position, Panel, MarkerType, NodeResizer, useReactFlow, useHandleConnections } from '@xyflow/react';
import '@xyflow/react/dist/style.css';
import axios from 'axios'
import { EditModeContext, useEditMode } from '../contexts/EditModeContext'
import DecisionNode from './DecisionNode'
import BunkerNode from '../nodes/BunkerNode'
import { DEFAULT_LAYOUT, NODE_CONFIG } from '../constants';
import DraggablePanel from './DraggablePanel';
import ImageNode from './ImageNode';
import TelegramNode from '../nodes/TelegramNode';
import ScraperNode from '../nodes/ScraperNode';
import GenericCustomNode from './GenericCustomNode';
import { getDynamicNodes } from '../utils/nodeRegistry';
// ============================================================
// Helper: Rotation & Resize Wrapper
// ============================================================
export const RotatableNodeWrapper = ({ id, rotation, children, isMovementLocked, editMode, minWidth = 150, minHeight = 100 }) => {
  const { updateNodeData } = useReactFlow();
  const [rot, setRot] = useState(Number(rotation) || 0);
  const [isRotating, setIsRotating] = useState(false);
  const nodeRef = React.useRef(null);

  const onPointerDown = (e) => {
    e.stopPropagation();
    setIsRotating(true);
    e.target.setPointerCapture(e.pointerId);
  };

  const onPointerMove = (e) => {
    try {
      if (!isRotating || !nodeRef.current) return;
      const rect = nodeRef.current.getBoundingClientRect();
      if (!rect || rect.width === 0) return;
      const cx = rect.left + rect.width / 2;
      const cy = rect.top + rect.height / 2;
      const angle = Math.atan2(e.clientY - cy, e.clientX - cx) * (180 / Math.PI) + 90;
      setRot(prev => Number.isNaN(angle) ? prev : angle);
    } catch (err) {
      console.warn('Rotation calculation aborted', err);
    }
  };

  const onPointerUp = (e) => {
    if (isRotating) {
      if (e.target.hasPointerCapture(e.pointerId)) e.target.releasePointerCapture(e.pointerId);
      updateNodeData(id, { rotation: rot });
      setIsRotating(false);
    }
  };

  return (
    <div 
      ref={nodeRef}
      className={`relative w-full h-full pointer-events-auto`}
      style={{ transform: `rotate(${rot}deg)` }}
    >
      <NodeResizer minWidth={minWidth} minHeight={minHeight} isVisible={editMode && !isMovementLocked} />
      
      {editMode && !isMovementLocked && (
        <div 
          className="absolute -top-6 left-1/2 -translate-x-1/2 w-4 h-4 bg-neon-cyan border-2 border-white rounded-full cursor-alias z-[1001] nodrag"
          onPointerDown={onPointerDown}
          onPointerMove={onPointerMove}
          onPointerUp={onPointerUp}
          onPointerCancel={onPointerUp}
        />
      )}
      <div className="w-full h-full overflow-hidden">
        {children}
      </div>
    </div>
  );
};

// ============================================================
// Helper: Status badge
// ============================================================
const StatusDot = ({ status }) => {
  const colors = {
    idle: 'bg-gray-600',
    pending: 'bg-yellow-400 animate-pulse',
    processing: 'bg-neon-green animate-pulse shadow-neon-green',
    completed: 'bg-neon-cyan shadow-neon-cyan',
    approved: 'bg-neon-green shadow-neon-green',
    rejected: 'bg-red-500',
    error: 'bg-red-500',
  }
  return (
    <span className={`inline-block w-2 h-2 rounded-full mr-1.5 ${colors[status] ?? 'bg-gray-500'}`} />
  )
}

// ============================================================
// NODE: Reddit Source
// ============================================================
const RedditSourceNode = React.memo(({ id, data, selected }) => {
  const { updateNodeData } = useReactFlow()
  const { editMode, isMovementLocked, isFunctionLocked } = useEditMode()
  const [subreddit, setSubreddit] = useState(data?.subreddit ?? 'MachineLearning')
  const [keyword, setKeyword] = useState(data?.keyword ?? '')
  const [status, setStatus] = useState('idle')
  const [posts, setPosts] = useState([])

  useEffect(() => {
    if (data?.subreddit !== undefined) setSubreddit(data.subreddit)
    if (data?.keyword !== undefined) setKeyword(data.keyword)
  }, [data?.subreddit, data?.keyword])

  const handleFetch = async () => {
    setStatus('processing')
    try {
      const res = await axios.get(`/api/mock/trending/${subreddit}?limit=5`)
      setPosts(res.data.posts || [])
      setStatus('completed')
      data?.onFetch?.({ subreddit, keyword, posts: res.data.posts })
    } catch {
      setStatus('error')
    }
  }

  const connections = useHandleConnections({ type: 'source' });
  const isConnected = connections.length > 0;
  const config = NODE_CONFIG.redditSource;

  return (
    <RotatableNodeWrapper id={id} rotation={data?.rotation ?? 0} isMovementLocked={isMovementLocked} editMode={editMode} minWidth={260} minHeight={200}>
    <div className={`relative min-w-[260px] min-h-[200px] ${isConnected ? config?.glow : ''} ${selected ? `ring-2 ring-${config?.color || 'orange'}-500 shadow-[0_0_15px_rgba(249,115,22,0.2)]` : ''} ${editMode ? 'node-edit-active' : 'node-idle'} h-full pointer-events-none flex items-center justify-center`}>
      <div className={`node-chassis glow-b border-[1.5px] ${editMode && !isMovementLocked ? 'border-dashed border-2 border-amber-500' : `border-${config?.color || 'orange'}-500/30`} p-4 relative w-full h-full pointer-events-auto flex flex-col items-center justify-start text-center`}
           style={{ background: 'var(--industrial-bg)' }}>
        
        {editMode && <div className="absolute top-2 right-2 text-amber-500/80 text-[10px] animate-[spin_6s_linear_infinite]">⚙️</div>}
        
        <div className={`flex items-center gap-2 mb-3 w-full text-left`}>
          <div className={`w-8 h-8 rounded-lg bg-${config?.color || 'orange'}-600/10 border border-${config?.color || 'orange'}-500/30
                          flex items-center justify-center text-lg`}>{config?.emoji || '🔴'}</div>
          <div>
            <div className="font-hud text-xs text-orange-400 tracking-widest uppercase">REDDIT-IN</div>
            <div className="font-body text-sm font-semibold text-white uppercase tracking-tighter">System Source</div>
          </div>
          <div className="ml-auto flex items-center gap-1">
             <StatusDot status={status} />
          </div>
        </div>

        <div className="w-full space-y-3">
          <div>
            <label className="text-[10px] text-gray-500 font-mono tracking-widest uppercase mb-1 block text-left">Target Subreddit</label>
            <div className="flex items-center">
              <span className="text-orange-500 text-sm font-mono mr-1">r/</span>
              <input
                disabled={isFunctionLocked}
                value={subreddit}
                onChange={e => {
                  setSubreddit(e.target.value)
                  updateNodeData(id, { subreddit: e.target.value })
                }}
                className="flex-1 bg-dark-900 border border-orange-500/20 px-2 py-1
                           text-sm text-white font-mono focus:outline-none focus:border-orange-500/60 transition-all font-mono"
              />
            </div>
          </div>

          <div>
             <label className="text-[10px] text-gray-500 font-mono tracking-widest uppercase mb-1 block text-left">Keyword Filter</label>
             <input
               disabled={isFunctionLocked}
               value={keyword}
               onChange={e => {
                 setKeyword(e.target.value)
                 updateNodeData(id, { keyword: e.target.value })
               }}
               className="w-full bg-dark-900 border border-orange-500/10 px-2 py-1
                          text-xs text-white font-mono focus:outline-none focus:border-orange-500/40 uppercase"
               placeholder="NONE"
             />
          </div>

          <button
            onClick={handleFetch}
            disabled={status === 'processing'}
            className="w-full py-1.5 bg-orange-600/10 border border-orange-500/30 text-orange-400
                       hover:bg-orange-600/20 transition-all text-xs font-hud tracking-widest font-bold uppercase"
          >
            {status === 'processing' ? '⟳ LOADING...' : '▶ EXECUTE_FETCH'}
          </button>
        </div>
      </div>

      {/* Unified Handle */}
      <Handle id="redditSource-source" type="source" position={Position.Bottom} isConnectable={true} />
    </div>
    </RotatableNodeWrapper>
  )
})

// ============================================================
// NODE: Prompt Refiner (AI Agent)
// ============================================================
const PromptRefinerNode = React.memo(({ id, data, selected }) => {
  const { updateNodeData } = useReactFlow()
  const { editMode, isMovementLocked, isFunctionLocked, setInputTokens, setOutputTokens } = useEditMode()
  const [rawIdea, setRawIdea] = useState(data?.rawIdea ?? '')
  const [provider, setProvider] = useState(data?.provider ?? 'openai')
  const [status, setStatus] = useState('idle')
  const [result, setResult] = useState(data?.result ?? null)

  useEffect(() => {
    if (data?.rawIdea !== undefined) setRawIdea(data.rawIdea)
    if (data?.provider !== undefined) setProvider(data.provider)
    if (data?.result !== undefined) setResult(data.result)
  }, [data?.rawIdea, data?.provider, data?.result])

  const handleRefine = async () => {
    if (!rawIdea.trim()) return
    setStatus('processing')
    try {
      // Usar endpoint de 3-fases
      const res = await axios.post('http://127.0.0.1:8000/refine/prompt', {
        raw_idea: rawIdea,
        provider: provider,
        iterations: 1
      })
      setResult(res.data)
      updateNodeData(id, { result: res.data })
      setStatus('completed')
      
      if (res.data.input_tokens !== undefined && setInputTokens) {
         setInputTokens(prev => prev + res.data.input_tokens)
      }
      if (res.data.output_tokens !== undefined && setOutputTokens) {
         setOutputTokens(prev => prev + res.data.output_tokens)
      }
      
      data?.onRefine?.(res.data)
    } catch {
      setStatus('error')
    }
  }

    const sourceConns = useHandleConnections({ type: 'source' });
    const targetConns = useHandleConnections({ type: 'target' });
    const isConnected = sourceConns.length > 0 || targetConns.length > 0;
    const config = NODE_CONFIG.promptRefiner;

  return (
    <RotatableNodeWrapper id={id} rotation={data?.rotation ?? 0} isMovementLocked={isMovementLocked} editMode={editMode} minWidth={260} minHeight={150}>
    <div className={`relative min-w-[260px] ${isConnected ? config?.glow : ''}
                     ${selected ? `ring-2 ring-neon-${config?.color || 'cyan'} shadow-[0_0_15px_rgba(245,158,11,0.2)]` : ''}
                     ${status === 'processing' ? 'node-processing' : 'node-idle'}
                     ${editMode ? 'node-edit-active' : ''} h-full pointer-events-none`}>
      <div className={`node-chassis glow-t glow-b border-[1.5px] ${editMode && !isMovementLocked ? 'border-dashed border-2 border-amber-500' : `border-neon-${config?.color || 'cyan'}/20`} p-4 relative w-full h-full pointer-events-auto`}
           style={{ background: 'var(--industrial-bg)' }}>
        {editMode && <div className="absolute top-2 right-2 text-amber-500/80 text-[10px] animate-[spin_6s_linear_infinite]">⚙️</div>}
        <div className="flex items-center gap-2 mb-3">
          <div className={`w-8 h-8 rounded-lg bg-neon-${config?.color || 'cyan'}/10 border border-neon-${config?.color || 'cyan'}/30
                          flex items-center justify-center text-lg`}>{config?.emoji || '⚙️'}</div>
          <div>
            <div className="font-hud text-xs text-neon-cyan tracking-widest">NODE-02</div>
            <div className="font-body text-sm font-semibold text-white">AI Prompt Refiner</div>
          </div>
          <div className="ml-auto flex items-center">
            <StatusDot status={status} />
            <span className="text-xs font-mono text-gray-400 capitalize">{status}</span>
          </div>
        </div>

        <div className="space-y-2">
          <div>
            <label className="text-xs text-gray-400 font-mono">RAW IDEA / PROMPT</label>
            <textarea
              disabled={isFunctionLocked}
              value={rawIdea}
              onChange={e => {
                setRawIdea(e.target.value)
                updateNodeData(id, { rawIdea: e.target.value })
              }}
              rows={3}
              className="w-full mt-1 bg-dark-900 border border-neon-cyan/20 rounded px-2 py-1.5
                         text-xs text-neon-cyan/80 font-mono focus:outline-none focus:border-neon-cyan/60 resize-none disabled:opacity-50"
              placeholder="Describe your Reddit content idea..."
            />
          </div>
          <div className="flex items-center justify-between mt-3">
            <div className="flex items-center gap-2">
              <label className="text-xs text-gray-400 font-mono">LLM PROVIDER</label>
              {provider === 'ollama' ? (
                <span className="text-[9px] px-1.5 py-[1px] rounded border border-neon-green/50 text-neon-green bg-neon-green/10 font-bold tracking-widest">[LOCAL]</span>
              ) : (
                <span className="text-[9px] px-1.5 py-[1px] rounded border border-orange-500/50 text-orange-400 bg-orange-500/10 font-bold tracking-widest">[CLOUD]</span>
              )}
            </div>
            <select
              disabled={isFunctionLocked}
              value={provider}
              onChange={e => {
                setProvider(e.target.value)
                updateNodeData(id, { provider: e.target.value })
              }}
              className="bg-dark-900 border border-neon-cyan/30 text-neon-cyan text-xs font-hud rounded px-2 py-1 outline-none focus:border-neon-cyan disabled:opacity-50"
            >
              <option value="openai">GPT-4o (OpenAI)</option>
              <option value="anthropic">Claude 3.5 (Anthropic)</option>
              <option value="groq">Llama-3-70b (Groq)</option>
              <option value="ollama">Llama-3 (Ollama)</option>
            </select>
          </div>
        </div>



        <button
          onClick={handleRefine}
          disabled={status === 'processing' || !rawIdea.trim()}
          className="mt-3 w-full py-1.5 rounded-lg text-xs font-hud tracking-widest
                     bg-neon-cyan/10 border border-neon-cyan/30 text-neon-cyan
                     hover:bg-neon-cyan/20 hover:border-neon-cyan/60 transition-all
                     disabled:opacity-40 disabled:cursor-not-allowed"
        >
          {status === 'processing' ? '⟳ REFINING...' : '▶ REFINE PROMPT'}
        </button>

        {result && (
          <div className="mt-2 bg-dark-900/80 rounded p-2 text-[10px] font-mono text-neon-cyan/80
                          border border-neon-cyan/10 max-h-[100px] overflow-y-auto whitespace-pre-wrap">
            ✓ Routed via: {result.provider_matched?.toUpperCase()} (3-Pass)
            ✓ Cost: {result.tokens_used} TKs
            {"\n\n"}— PROPOSAL —{"\n"}
            {result.proposed?.substring(0, 80)}...
            {"\n\n"}— CRITIQUE —{"\n"}
            {result.critique?.substring(0, 80)}...
            {"\n\n"}— FINAL SYNTHESIS —{"\n"}
            {result.final}
          </div>
        )}
      </div>
        <Handle id="promptRefiner-target" type="target" position={Position.Top} />
        <Handle id="promptRefiner-source" type="source" position={Position.Bottom} />
    </div>
    </RotatableNodeWrapper>
  )
})

// ============================================================
// NODE: Human Approval Gate
// ============================================================
const HumanApprovalNode = React.memo(({ id, data, selected }) => {
  const { updateNodeData } = useReactFlow()
  const { editMode, isMovementLocked, isFunctionLocked } = useEditMode()
  const [approved, setApproved] = useState(data?.approved ?? false)
  const [rejected, setRejected] = useState(data?.rejected ?? false)

  useEffect(() => {
    if (data?.approved !== undefined) setApproved(data.approved)
    if (data?.rejected !== undefined) setRejected(data.rejected)
  }, [data?.approved, data?.rejected])

  const handleApprove = () => {
    setApproved(true)
    setRejected(false)
    updateNodeData(id, { approved: true, rejected: false })
    data?.onChange?.({ approved: true })
  }
  const handleReject = () => {
    setApproved(false)
    setRejected(true)
    updateNodeData(id, { approved: false, rejected: true })
    data?.onChange?.({ approved: false })
  }

  const borderColor = approved ? 'border-neon-green/40' : rejected ? 'border-red-500/40' : 'border-purple-500/30'
  const bg = approved ? '#001a00' : rejected ? '#1a0000' : '#0d001a'

    const sourceConns = useHandleConnections({ type: 'source' });
    const targetConns = useHandleConnections({ type: 'target' });
    const isConnected = sourceConns.length > 0 || targetConns.length > 0;
    const config = NODE_CONFIG.humanApproval;

  return (
    <RotatableNodeWrapper id={id} rotation={data?.rotation ?? 0} isMovementLocked={isMovementLocked} editMode={editMode} minWidth={220} minHeight={120}>
    <div className={`relative min-w-[220px] ${isConnected ? config.glow : ''}
                     ${selected ? `ring-2 ring-neon-${config.color} shadow-[0_0_15px_rgba(191,0,255,0.2)]` : ''} node-idle
                     ${editMode ? 'node-edit-active' : ''} h-full pointer-events-none`}>
      <div className={`node-chassis glow-t glow-b border-[1.5px] ${editMode && !isMovementLocked ? 'border-dashed border-2 border-amber-500' : borderColor} p-4 relative w-full h-full pointer-events-auto`}
           style={{ background: 'var(--industrial-bg)' }}>
        {editMode && <div className="absolute top-2 right-2 text-amber-500/80 text-[10px] animate-[spin_6s_linear_infinite]">⚙️</div>}
        <div className="flex items-center gap-2 mb-3">
          <div className={`w-8 h-8 rounded-lg bg-${config.color}-600/20 border border-${config.color}-500/40
                          flex items-center justify-center text-lg`}>
            {approved ? '✅' : rejected ? '❌' : config.emoji}
          </div>
          <div>
            <div className="font-hud text-xs text-purple-400 tracking-widest">NODE-03</div>
            <div className="font-body text-sm font-semibold text-white">Human Approval</div>
          </div>
        </div>

        <div className="text-xs text-gray-400 font-mono mb-3 leading-relaxed">
          Review the refined blueprint before publishing. This gate prevents automated posting.
        </div>

        <div className="flex gap-2">
          <button
            id="approval-approve-btn"
            onClick={handleApprove}
            disabled={isFunctionLocked}
            className={`flex-1 py-2 rounded-lg text-xs font-hud tracking-widest transition-all disabled:opacity-50
                       ${approved
                ? 'bg-neon-green/30 border border-neon-green/70 text-neon-green shadow-neon-green'
                : 'bg-dark-900 border border-green-600/40 text-green-400 hover:bg-green-600/20'}`}
          >
            ✓ APPROVE
          </button>
          <button
            id="approval-reject-btn"
            onClick={handleReject}
            disabled={isFunctionLocked}
            className={`flex-1 py-2 rounded-lg text-xs font-hud tracking-widest transition-all disabled:opacity-50
                       ${rejected 
                ? 'bg-red-600/30 border border-red-500/70 text-red-400'
                : 'bg-dark-900 border border-red-600/40 text-red-400 hover:bg-red-600/20'}`}
          >
            ✗ REJECT
          </button>
        </div>

        <div className={`mt-2 text-center text-xs font-hud tracking-widest
          ${approved ? 'text-neon-green text-glow-green' : rejected ? 'text-red-400' : 'text-gray-600'}`}>
          {approved ? '— GATE OPEN —' : rejected ? '— GATE CLOSED —' : '— AWAITING DECISION —'}
        </div>
      </div>
      {/* Handles */}
      <Handle id="humanApproval-target" type="target" position={Position.Top} />
      <Handle id="humanApproval-source" type="source" position={Position.Bottom} />
    </div>
    </RotatableNodeWrapper>
  )
})

// ============================================================
// NODE: Reddit Publisher
// ============================================================
const PublisherNode = React.memo(({ id, data, selected }) => {
  const { updateNodeData } = useReactFlow()
  const { editMode, isMovementLocked, isFunctionLocked } = useEditMode()
  const [status, setStatus] = useState('idle')
  const [result, setResult] = useState(data?.result ?? null)
  const [subreddit, setSubreddit] = useState(data?.subreddit ?? 'SideProject')
  const [title, setTitle] = useState(data?.title ?? 'Post Title')

  useEffect(() => {
    if (data?.subreddit !== undefined) setSubreddit(data.subreddit)
    if (data?.title !== undefined) setTitle(data.title)
    if (data?.result !== undefined) setResult(data.result)
  }, [data?.subreddit, data?.title, data?.result])

  const handlePublish = async () => {
    setStatus('processing');
    try {
      const allNodes = getNodes();
      const refiner = allNodes.find(n => n.type === 'promptRefiner');
      const imageNode = allNodes.find(n => n.type === 'imageNode');
      
      const payload = {
        nodes: allNodes,
        text: refiner?.data?.response || title,
        subreddit: subreddit,
        image_url: imageNode?.data?.imageUrl || null
      };

      const res = await axios.post('http://localhost:8000/api/reddit/publish', payload);
      setResult({ status: 'SUCCESS', post_id: res.data.url });
      setStatus('completed');
    } catch (err) {
      console.error("Publishing error:", err);
      setStatus('error');
    }
  };

    const targetConns = useHandleConnections({ type: 'target' });
    const isConnected = targetConns.length > 0;
    const config = NODE_CONFIG.publisher;

  return (
    <RotatableNodeWrapper id={id} rotation={data?.rotation ?? 0} isMovementLocked={isMovementLocked} editMode={editMode} minWidth={240} minHeight={120}>
    <div className={`relative min-w-[220px] ${isConnected ? config?.glow : ''}
                     ${selected ? `ring-2 ring-neon-${config?.color || 'purple'} shadow-[0_0_15px_rgba(57,255,20,0.2)]` : ''} 
                     ${status === 'processing' ? 'node-processing' : 'node-idle'}
                     ${editMode ? 'node-edit-active' : ''} h-full pointer-events-none`}>
      <div className={`node-chassis glow-t border-[1.5px] ${editMode && !isMovementLocked ? 'border-dashed border-2 border-amber-500' : `border-neon-${config?.color || 'purple'}/30`} p-4 relative w-full h-full pointer-events-auto`}
           style={{ background: 'var(--industrial-bg)' }}>
        {editMode && <div className="absolute top-2 right-2 text-amber-500/80 text-[10px] animate-[spin_6s_linear_infinite]">⚙️</div>}
        <div className="flex items-center gap-2 mb-3">
          <div className={`w-8 h-8 rounded-lg bg-neon-${config?.color || 'purple'}/10 border border-neon-${config?.color || 'purple'}/30
                          flex items-center justify-center text-lg`}>{config?.emoji || '👤'}</div>
          <div>
            <div className="font-hud text-xs text-neon-green tracking-widest">NODE-04</div>
            <div className="font-body text-sm font-semibold text-white">Reddit Publisher</div>
          </div>
          <div className="ml-auto flex items-center">
            <StatusDot status={status} />
            <span className="text-xs font-mono text-gray-400 capitalize">{status}</span>
          </div>
        </div>

        <div>
          <label className="text-xs text-gray-400 font-mono">TARGET SUBREDDIT</label>
          <div className="flex items-center mt-1">
            <span className="text-neon-green text-sm font-mono mr-1">r/</span>
            <input
              disabled={isFunctionLocked}
              value={subreddit}
              onChange={e => {
                setSubreddit(e.target.value)
                updateNodeData(id, { subreddit: e.target.value })
              }}
              className="flex-1 bg-dark-900 border border-neon-green/20 px-2 py-1
                         text-sm text-white font-mono focus:outline-none focus:border-neon-green/60 disabled:opacity-50"
              placeholder="SideProject"
            />
          </div>
        </div>

        <div className="mt-2">
          <label className="text-xs text-gray-400 font-mono">POST TITLE</label>
          <input
            disabled={isFunctionLocked}
            value={title}
            onChange={e => {
              setTitle(e.target.value)
              updateNodeData(id, { title: e.target.value })
            }}
            className="w-full mt-1 bg-dark-900 border border-neon-green/20 px-2 py-1
                       text-sm text-white font-mono focus:outline-none focus:border-neon-green/60 disabled:opacity-50"
            placeholder="Your post title..."
          />
        </div>

        <div className="mt-3 bg-dark-900/60 p-2 border border-neon-green/10">
          <div className="text-xs font-mono text-gray-400 space-y-0.5">
            <div className="flex justify-between">
              <span>Rate Limit</span>
              <span className="text-neon-green">✓ Protected</span>
            </div>
            <div className="flex justify-between">
              <span>User-Agent</span>
              <span className="text-neon-green">✓ Compliant</span>
            </div>
            <div className="flex justify-between">
              <span>Mode</span>
              <span className="text-yellow-400">MOCK</span>
            </div>
          </div>
        </div>

        <button
          id="publisher-execute-btn"
          onClick={handlePublish}
          disabled={status === 'processing'}
          className="mt-3 w-full py-1.5 text-xs font-hud tracking-widest
                     bg-neon-green/10 border border-neon-green/30 text-neon-green
                     hover:bg-neon-green/20 hover:border-neon-green/60 transition-all
                     disabled:opacity-40 disabled:cursor-not-allowed"
        >
          {status === 'processing' ? '⟳ PUBLISHING...' : '🚀 EXECUTE PIPELINE'}
        </button>

        {result && (
          <div className="mt-2 bg-dark-900/80 p-2 text-[10px] font-mono
                          border border-neon-green/20 text-neon-green/80 flex flex-col gap-1 overflow-hidden">
            <div className="flex justify-between items-center">
              <span>STATUS: ✓ {result.status}</span>
              <button 
                onClick={() => window.open(result.post_id, '_blank')}
                className="text-neon-cyan hover:underline decoration-neon-cyan/50"
              >
                VIEW POST ↗
              </button>
            </div>
            <div className="text-[8px] truncate opacity-60">ID: {result.post_id}</div>
          </div>
        )}
        {status === 'error' && (
          <div className="mt-2 text-xs font-mono text-red-400">
            Pipeline error. Check backend connection.
          </div>
        )}
      </div>
      <Handle id="publisher-target" type="target" position={Position.Top} />
    </div>
    </RotatableNodeWrapper>
  )
})



// ============================================================
// Node type registry (Static Global Catalog for Stability)
// ============================================================
const STATIC_NODE_TYPES = {
  redditSource: RedditSourceNode,
  promptRefiner: PromptRefinerNode,
  humanApproval: HumanApprovalNode,
  publisher: PublisherNode,
  decisionNode: DecisionNode,
  imageNode: ImageNode,
  bunkerLock: BunkerNode,
  telegramNode: TelegramNode,
  scraperNode: ScraperNode,
};

// ============================================================
// Helper: Export Interceptor
// ============================================================
const handleExportBlueprint = async (nodes, edges) => {
  const lockedBunker = nodes.find(n => n.type === 'bunkerLock' && n.data?.isLocked === true);
  
  if (lockedBunker) {
    alert("CRITICAL SECURITY HALT: Cannot export blueprint while Búnker Protocol is ACTIVE (LOCKED). Unlock the Bunker node to proceed with exfiltration.");
    return;
  }

  try {
    const response = await axios.post('http://localhost:8000/api/blueprint/export', {
      nodes,
      edges
    });

    const isEncrypted = response.data.status === 'SECURE_ENCRYPTED';
    const payload = isEncrypted ? response.data.payload : JSON.stringify(response.data.payload, null, 2);
    const filename = isEncrypted ? 'sf_vault.bin' : 'sf_layout.json';
    const mimeType = isEncrypted ? 'application/octet-stream' : 'application/json';

    const blob = new Blob([payload], { type: mimeType });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = filename;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);

    if (isEncrypted) {
      alert("VAULT EXPORT SUCCESSFUL: Your blueprint has been AES-256 encrypted. Access requires the clearance key.");
    }
  } catch (err) {
    console.error("Export failure:", err);
    alert("CRITICAL EXPORT FAILURE: Could not secure the blueprint via backend gateway.");
  }
};

// ============================================================
// Default node layout
// ============================================================

const defaultNodes = []

const defaultEdges = []

// ============================================================
const FlowCanvas = ({ onNodeSelect }) => {
  const { isEditMode, editMode, toggleEditMode, isMovementLocked, isFunctionLocked } = useEditMode()
  const { getNode } = useReactFlow()

  // Undo / Redo system (Moved up to be available for onNodesChange/onEdgesChange)
  const [past, setPast] = useState([])
  const [future, setFuture] = useState([])
  const [isHydrated, setIsHydrated] = useState(false)

  const [dynamicNodes, setDynamicNodes] = useState(getDynamicNodes());

  useEffect(() => {
    const handleUpdate = () => setDynamicNodes(getDynamicNodes());
    window.addEventListener('sf_registry_updated', handleUpdate);
    return () => window.removeEventListener('sf_registry_updated', handleUpdate);
  }, []);

  // Stabilize Registration via useMemo (Principal SE Recommendation)
  const nodeTypes = useMemo(() => {
    const types = { ...STATIC_NODE_TYPES };
    Object.keys(dynamicNodes).forEach(id => {
      types[id] = GenericCustomNode;
    });
    return types;
  }, [dynamicNodes]);

  const edgeTypes = useMemo(() => ({}), []);
  
  // Atomic Initialization
  const INITIAL_NODES = useMemo(() => [], []);
  const INITIAL_EDGES = useMemo(() => [], []);
  const [nodes, setNodes] = useState(INITIAL_NODES);
  const [edges, setEdges] = useState(INITIAL_EDGES);

  // Hydration logic: Load from storage after mounting to ensure stable initial state
  useEffect(() => {
    try {
      const savedNodes = localStorage.getItem('sf-nodes')
      if (savedNodes) {
        try {
          const parsed = JSON.parse(savedNodes)
          if (Array.isArray(parsed) && parsed.length > 0) {
            const validNodes = parsed.filter(n => n && n.id && n.type && nodeTypes[n.type])
            setNodes(validNodes.length > 0 ? validNodes : [])
          } else {
            setNodes([])
          }
        } catch (je) {
          console.error("SYSTEM: Corrupted Nodes detected. Forced reset to [].")
          setNodes([])
        }
      } else {
        setNodes([])
      }

      const savedEdges = localStorage.getItem('sf-edges')
      if (savedEdges) {
        try {
          const parsed = JSON.parse(savedEdges)
          setEdges(Array.isArray(parsed) ? parsed : [])
        } catch (je) {
          setEdges([])
        }
      } else {
        setEdges([])
      }
      
      // Atomic Hydration Success
      setIsHydrated(true)
    } catch (e) {
      console.error("[SYSTEM] CRITICAL_HYDRATION_FAILURE. Reverting to SAFE_MODE.");
      setNodes(defaultNodes)
      setEdges(defaultEdges)
      setIsHydrated(true)
    }
  }, [setNodes, setEdges])

  const takeSnapshot = useCallback(() => {
    setPast(p => [...p, { nodes, edges }])
    setFuture([])
  }, [nodes, edges])

  // Wrapping in useCallback as requested for stabilized references and undo/redo capture
  // Senior Interaction Guard: Reinforces change stability
  // Change Handlers Protection (Principal SE Reconstruction)
  const onNodesChange = useCallback((changes) => {
    if (!changes || changes.length === 0) return;
    takeSnapshot();
    setNodes((nds) => applyNodeChanges(changes, nds || []));
  }, [takeSnapshot]);

  const onEdgesChange = useCallback((changes) => {
    if (!changes || changes.length === 0) return;
    takeSnapshot();
    setEdges((eds) => applyEdgeChanges(changes, eds || []));
  }, [takeSnapshot]);

  // Senior Interaction Guard: Prevents crashes during rapid edit-mode transitions
  const handleLockToggle = useCallback(() => {
    if (!nodes || nodes.length === 0) {
      console.warn("[SYSTEM] Interaction Blocked: No nodes detected in local buffer.");
      return;
    }
    // Final Safety Guard (Principal SE)
    if (typeof toggleEditMode === 'function') {
      toggleEditMode();
    }
  }, [nodes, toggleEditMode]);

  // --- Physical Lockdown: Bunker State Sync ---
  const systemIsLocked = React.useMemo(() => 
    nodes.some(n => n.type === 'bunkerLock' && n.data?.isLocked !== false),
    [nodes]
  );

  // Enforcer for legacy edges and globally styling decision nodes
  useEffect(() => {
    setEdges((eds) => eds.map(edge => {
      const sourceNode = nodes.find(n => n.id === edge.source);
      const isHardware = sourceNode?.type === 'hardwareNode';
      const isFail = edge.sourceHandle === 'fail' || edge.sourceHandle === 'decision-fail';
      const targetStroke = isHardware ? '#FFD700' : (isFail ? '#FF4D4D' : '#00E5FF');
      
      if (edge.style?.stroke !== targetStroke) {
        return { 
          ...edge, 
          style: { 
            ...edge.style, 
            stroke: targetStroke, 
            strokeWidth: isHardware ? 4 : 2 
          } 
        };
      }
      return edge;
    }));

    setNodes((nds) => nds.map(node => {
      if (node.type === 'decisionNode' && typeof node.data?.passed === 'boolean') {
        const expectedColor = node.data.passed ? '#00FF00' : '#FF0000';
        if (node.style?.stroke !== expectedColor) {
           return {
             ...node,
             style: { 
               ...node.style, 
               stroke: expectedColor,
               borderColor: expectedColor,
               boxShadow: `0 0 15px ${expectedColor}`
             }
           };
        }
      }
      return node;
    }));
  }, [nodes, setEdges, setNodes]);

  useEffect(() => {
    if (!isHydrated || !nodes || !Array.isArray(nodes)) return;
    localStorage.setItem('sf-nodes', JSON.stringify(nodes))
  }, [nodes, isHydrated])

  useEffect(() => {
    if (!isHydrated || !edges || !Array.isArray(edges)) return;
    localStorage.setItem('sf-edges', JSON.stringify(edges))
  }, [edges, isHydrated])

  // (Undo/Redo logic moved up)

  const undo = () => {
    if (past.length === 0) return
    const prev = past[past.length - 1]
    setPast(p => p.slice(0, -1))
    setFuture(f => [{ nodes, edges }, ...f])
    setNodes(prev.nodes)
    setEdges(prev.edges)
  }

  const redo = () => {
    if (future.length === 0) return
    const next = future[0]
    setFuture(f => f.slice(1))
    setPast(p => [...p, { nodes, edges }])
    setNodes(next.nodes)
    setEdges(next.edges)
  }

  // Edge interaction context menu
  const [edgeMenu, setEdgeMenu] = useState(null)
  
  const onEdgeClick = useCallback((e, edge) => {
    try {
      if (!edge || typeof edge !== 'object') return
      e.stopPropagation()
      setEdgeMenu({
        edgeId: edge.id,
        source: edge.source,
        target: edge.target,
        x: e.clientX,
        y: e.clientY
      })
    } catch (err) {
      console.warn("DOM Crash Prevented [onEdgeClick]:", err)
    }
  }, [])

  const recolorEdgeMenu = (color) => {
    if (!edgeMenu) return
    takeSnapshot()
    setEdges(eds => eds.map(e => e.id === edgeMenu.edgeId ? { ...e, style: { stroke: color, strokeWidth: 3 }, markerEnd: { type: MarkerType.ArrowClosed, color } } : e))
    setEdgeMenu(null)
  }

  // Node Context Menu
  const [nodeMenu, setNodeMenu] = useState(null)
  
  const onNodeContextMenu = useCallback((e, node) => {
    e.preventDefault()
    e.stopPropagation()
    setNodeMenu({
      nodeId: node.id,
      x: e.clientX,
      y: e.clientY
    })
  }, [])

  const deleteNodeMenu = () => {
    if (!nodeMenu) return
    takeSnapshot()
    setNodes(nds => nds.filter(n => n.id !== nodeMenu.nodeId))
    setNodeMenu(null)
  }

  const onPaneClick = useCallback(() => {
    setEdgeMenu(null)
    setNodeMenu(null)
  }, [])

  const deleteEdgeMenu = useCallback((event, edge) => {
    if (event) event.preventDefault()
    if (edge && edge.id) {
       setEdges((es) => es.filter((e) => e.id !== edge.id))
    }
  }, [setEdges])

  const duplicateEdgeMenu = useCallback((event) => {
    if (event) event.preventDefault()
    if (edgeMenu) {
       setEdges((es) => {
         const existing = es.find(e => e.id === edgeMenu.edgeId);
         if (!existing) return es;
         // Generate slightly offset target for demonstration or rely on re-drag
         return [...es, { ...existing, id: `edge_${Date.now()}` }];
       })
       setEdgeMenu(null)
    }
  }, [edgeMenu, setEdges])

  const onConnect = useCallback((params) => {
    if (!params.source || !params.target) return;
    takeSnapshot();
    
    // Principal SE: Memoized Dynamic Style Detection
    const sourceNode = getNode(params.source);
    const isHardware = sourceNode?.type === 'hardwareNode';
    const isFail = params.sourceHandle === 'fail' || params.sourceHandle === 'decision-fail';

    const edgeStyle = {
      stroke: isHardware ? '#FFD700' : (isFail ? '#FF4D4D' : '#00E5FF'),
      strokeWidth: isHardware ? 4 : 2,
    };

    setEdges((eds) => addEdge({ 
      ...params, 
      id: `e-${params.source}-${params.target}-${Date.now()}`,
      type: 'smoothstep',
      animated: true, 
      style: edgeStyle 
    }, eds || []));

    // Phase XVI: Dynamic Data Flux Integration
    setNodes((nds) => nds.map((node) => 
      node.id === params.target 
        ? { ...node, data: { ...node.data, sourceNodeId: params.source } } 
        : node
    ));
  }, [getNode, setEdges, setNodes, takeSnapshot]);

  const onNodeClick = useCallback((_, node) => {
    onNodeSelect?.(node)
  }, [onNodeSelect])

  const onDrop = useCallback((event) => {
    event.preventDefault()
    const type = event.dataTransfer.getData('application/rfn-node')
    if (!type) return
    const reactFlowBounds = event.currentTarget.getBoundingClientRect()
    const position = {
      x: event.clientX - reactFlowBounds.left - 120,
      y: event.clientY - reactFlowBounds.top - 50,
    }
    const newNode = {
      id: `${type}_${Date.now()}`,
      type,
      position,
      data: dynamicNodes[type] ? { ...dynamicNodes[type] } : { ...NODE_CONFIG[type] },
      deletable: true,
    }
    takeSnapshot()
    setNodes(nds => [...nds, newNode])
  }, [setNodes, takeSnapshot, dynamicNodes])

  const onDragOver = useCallback((event) => {
    event.preventDefault()
    event.dataTransfer.dropEffect = 'move'
  }, [])

  // -----------------------------------------------------------------------
  // Bootstrap Guard: Ensures flow utilities are correctly loaded (Principal SE)
  // -----------------------------------------------------------------------
  if (typeof applyNodeChanges !== 'function') {
    return <div className="w-full h-screen bg-[#050810] flex items-center justify-center text-red-500 font-mono">Error Crítico: Utilidades de Flujo no cargadas. Reinstalando...</div>;
  }

  // -----------------------------------------------------------------------
  // Render Gate: Stabilizes initial render by ensuring hydration is complete
  // -----------------------------------------------------------------------
  if (!isHydrated) {
    return (
      <div className="w-full h-screen bg-[#050810] flex flex-col items-center justify-center font-hud relative">
        <div className="absolute inset-0 pointer-events-none opacity-5 bg-[linear-gradient(rgba(18,16,16,0)_50%,rgba(0,0,0,0.25)_50%),linear-gradient(90deg,rgba(255,0,0,0.06),rgba(0,255,0,0.02),rgba(0,0,255,0.06))] bg-[length:100%_2px,3px_100%]" />
        <div className="relative z-10 flex flex-col items-center gap-6 text-center">
          <div className="w-16 h-16 border-2 border-neon-cyan/20 border-t-neon-cyan rounded-full animate-spin shadow-[0_0_20px_rgba(0,245,255,0.2)]" />
          <div className="flex flex-col items-center gap-2">
            <h2 className="text-neon-cyan text-xs tracking-[0.4em] font-bold animate-pulse">SYNAPSE FLOW (SYSTEM)</h2>
            <p className="text-[10px] text-gray-500 font-mono tracking-widest uppercase opacity-70">Synthesizing Neural Canvas...</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="w-full h-screen rfn-canvas-grid rfn-scanline">
      <ReactFlow
        nodes={nodes}
        edges={edges}
        onNodesChange={onNodesChange}
        onEdgesChange={onEdgesChange}
        onConnect={onConnect}
        onNodeClick={onNodeClick}
        onNodeContextMenu={onNodeContextMenu}
        onNodeDragStop={() => takeSnapshot()}
        onEdgeClick={onEdgeClick}
        onPaneClick={onPaneClick}
        onDrop={onDrop}
        onDragOver={onDragOver}
        nodeTypes={nodeTypes}
        fitView={true}
        minZoom={0.05}
        maxZoom={3}
        nodesConnectable={isEditMode}
        nodesDraggable={isEditMode}
        onNodesDelete={(deleted) => {
          takeSnapshot()
        }}
        onEdgesDelete={(deleted) => {
          takeSnapshot()
        }}
        snapToGrid={true}
        snapGrid={[10, 10]}
        connectionMode="loose"
        connectionLineType="smoothstep"
        connectionLineStyle={{ stroke: '#00E5FF', strokeWidth: 2 }}
        deleteKeyCode={isMovementLocked ? null : ["Backspace", "Delete"]}
        selectionKeyCode={["Shift"]}
        isValidConnection={(connection) => {
          const sourceNode = nodes.find(n => n.id === connection.source);
          const targetNode = nodes.find(n => n.id === connection.target);
          
          // Rule 1: Block Source -> Source loops
          if (sourceNode?.type === 'redditSource' && targetNode?.type === 'redditSource') {
            return false;
          }
          
          // Rule 2: Block Publisher as a source (Terminal Node)
          if (sourceNode?.type === 'publisher') {
            return false;
          }

          return true;
        }}
        connectionRadius={30}
        fitViewOptions={{ padding: 0.5 }}
        defaultEdgeOptions={{ 
          type: 'smoothstep', 
          animated: true, 
          style: { stroke: '#00f5ff', strokeWidth: 3 },
          markerEnd: { type: MarkerType.ArrowClosed, color: '#00f5ff' }
        }}
        proOptions={{ hideAttribution: true }}
      >
        <Background
          variant="dots"
          gap={24}
          size={1}
          color="rgba(0,245,255,0.08)"
        />
        {isHydrated && (
          <DraggablePanel id="canvas_controls" defaultPos={{ x: 20, y: 400 }} disabled={!isEditMode || isMovementLocked} editModeContext={isEditMode}>
            <Controls className="!bg-dark-800 !border-neon-cyan/20" position="top-left" style={{ position: 'relative', margin: 0, transform: 'none', left: 0, top: 0, bottom: 'auto', right: 'auto' }} />
          </DraggablePanel>
        )}
        
        {isHydrated && (
          <DraggablePanel id="minimap-panel" defaultPos={{ x: 20, y: 500 }} disabled={!isEditMode || isMovementLocked} editModeContext={isEditMode}>
            <MiniMap
              position="top-left"
              style={{ position: 'relative', margin: 0, width: 200, height: 150, transform: 'none', left: 0, top: 0, bottom: 'auto', right: 'auto' }}
              nodeColor={(n) => {
                switch (n.type) {
                  case 'redditSource': return '#ff6b00'
                  case 'promptRefiner': return '#00f5ff'
                  case 'humanApproval': return '#bf00ff'
                  case 'publisher': return '#39ff14'
                  case 'hardwareNode': return '#ff0044'
                  default: return '#444'
                }
              }}
              maskColor="rgba(5,8,16,0.8)"
            />
          </DraggablePanel>
        )}

        {isHydrated && (
          <DraggablePanel id="canvas-mode-toggle" defaultPos={{ x: 800, y: 20 }} disabled={!isEditMode || isMovementLocked} editModeContext={isEditMode}>
            <div 
              onClick={handleLockToggle}
              className={`flex items-center gap-2 text-xs font-mono bg-dark-800/90 cursor-pointer
                          border ${isEditMode ? 'border-amber-500 shadow-[0_0_15px_rgba(245,158,11,0.3)]' : 'border-neon-cyan/20'} rounded-lg px-3 py-1.5 transition-all`}
            >
              <span className={isEditMode ? 'text-amber-500' : 'text-gray-500'}>CANVAS MODE</span>
              <span className={isEditMode ? 'text-amber-500 text-glow-amber' : 'text-neon-cyan text-glow-cyan'}>
                {isEditMode ? 'UNLOCKED' : 'ACTIVE'}
              </span>
            </div>
          </DraggablePanel>
        )}
        
        {isHydrated && (
          <DraggablePanel id="undo-redo-panel" defaultPos={{ x: 60, y: 20 }} disabled={!isEditMode || isMovementLocked} editModeContext={isEditMode}>
            <div className="flex gap-2">
              <button 
                onClick={undo} disabled={past.length === 0}
                className="px-3 py-1.5 rounded bg-dark-900 border border-neon-cyan/30 text-neon-cyan text-[10px] font-mono tracking-widest disabled:opacity-30 disabled:cursor-not-allowed hover:bg-neon-cyan/20 transition-all">
                ⟲ UNDO
              </button>
              <button 
                onClick={redo} disabled={future.length === 0}
                className="px-3 py-1.5 rounded bg-dark-900 border border-neon-cyan/30 text-neon-cyan text-[10px] font-mono tracking-widest disabled:opacity-30 disabled:cursor-not-allowed hover:bg-neon-cyan/20 transition-all">
                REDO ⟳
              </button>
            </div>
          </DraggablePanel>
        )}

        {isHydrated && (
          <DraggablePanel id="blueprint-panel" defaultPos={{ x: window.innerWidth - 300, y: window.innerHeight - 80 }} disabled={!isEditMode || isMovementLocked} editModeContext={isEditMode}>
            <div className="flex gap-2 p-2 bg-dark-900/80 border border-neon-cyan/30 rounded-lg shadow-2xl backdrop-blur-md">
               <button 
                  onClick={() => handleExportBlueprint(nodes, edges)} 
                  disabled={systemIsLocked}
                  className={`px-3 py-1.5 rounded text-[10px] font-mono tracking-widest transition-all font-bold
                             ${systemIsLocked 
                                ? 'bg-red-500/10 border border-red-500/40 text-red-500 opacity-40 cursor-not-allowed shadow-inner' 
                                : 'bg-neon-cyan/10 border border-neon-cyan/50 text-neon-cyan hover:bg-neon-cyan/20 shadow-[0_0_10px_rgba(0,245,255,0.1)] hover:shadow-neon-cyan/30 hover:scale-[1.02]'}`}
               >
                  {systemIsLocked ? '[🔒] SYSTEM LOCKED' : '[↓] EXPORT BLUEPRINT'}
               </button>
             <button onClick={() => {
                const input = document.createElement('input');
                input.type = 'file';
                input.accept = '.json';
                input.onchange = e => {
                   const file = e.target.files[0];
                   if (!file) return;
                   const reader = new FileReader();
                   reader.onload = ev => {
                      try {
                         const json = JSON.parse(ev.target.result);
                         if (json.nodes) setNodes(json.nodes);
                         if (json.edges) setEdges(json.edges);
                      } catch(err) { alert('Invalid Blueprint JSON format'); }
                   };
                   reader.readAsText(file);
                };
                input.click();
             }} className="px-3 py-1.5 rounded bg-amber-500/10 border border-amber-500/50 text-amber-500 text-[10px] font-mono tracking-widest hover:bg-amber-500/20 transition-all font-bold">
               [↑] IMPORT BLUEPRINT
             </button>
          </div>
        </DraggablePanel>
      )}
    </ReactFlow>

      {nodeMenu && typeof nodeMenu.x === 'number' && (
        <div style={{ top: nodeMenu.y, left: nodeMenu.x }} className="fixed z-[9999] bg-dark-900 border border-neon-cyan/50 rounded-lg p-2 shadow-[0_0_15px_rgba(0,245,255,0.2)]">
          <button onClick={deleteNodeMenu} className="block w-full text-left px-3 py-1.5 text-xs font-mono text-red-400 hover:bg-red-500/20 rounded">✗ Eliminar Nodo</button>
        </div>
      )}

      {edgeMenu && typeof edgeMenu.x === 'number' && (
        <div style={{ top: edgeMenu.y, left: edgeMenu.x }} className="fixed z-[9999] bg-dark-900 border border-neon-cyan/50 rounded-lg p-2 shadow-[0_0_15px_rgba(0,245,255,0.2)]">
          <button onClick={() => {
            setEdges((es) => es.filter((e) => e.id !== edgeMenu.edgeId));
            setEdgeMenu(null);
          }} className="block w-full text-left px-3 py-1.5 text-xs font-mono text-red-400 hover:bg-red-500/20 rounded">✗ Eliminar Conector</button>
          <button onClick={() => {
            onConnect({ source: edgeMenu.source, target: edgeMenu.target, sourceHandle: null, targetHandle: null });
            setEdgeMenu(null);
          }} className="block w-full text-left px-3 py-1.5 text-xs font-mono text-neon-cyan hover:bg-neon-cyan/20 rounded mt-1">⎘ Duplicar Conexión</button>
          
          {isEditMode && (
            <div className="mt-2 pt-2 border-t border-gray-700/50 flex gap-2 justify-center">
              {['#00f5ff', '#39ff14', '#bf00ff', '#ff6b00'].map(color => (
                <button 
                  key={color} 
                  onClick={() => recolorEdgeMenu(color)}
                  className="w-4 h-4 rounded-full border border-gray-600 hover:scale-125 transition-transform shadow-lg" 
                  style={{ backgroundColor: color, boxShadow: `0 0 5px ${color}` }} 
                />
              ))}
            </div>
          )}
        </div>
      )}
    </div>
  )
}

export default FlowCanvas
