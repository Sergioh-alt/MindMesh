import React, { useState, useEffect } from 'react';
import { Handle, Position, useReactFlow, useHandleConnections } from '@xyflow/react';
import { useEditMode } from '../contexts/EditModeContext';
import { RotatableNodeWrapper } from '../components/FlowCanvas';
import { NODE_CONFIG } from '../constants';
import axios from 'axios';

const ScraperNode = React.memo(({ id, data, selected }) => {
  const { updateNodeData } = useReactFlow();
  const { editMode, isMovementLocked, isFunctionLocked } = useEditMode();
  const [url, setUrl] = useState(data?.url || '');
  const [status, setStatus] = useState('idle');
  const [result, setResult] = useState(data?.result || '');

  const sourceConns = useHandleConnections({ type: 'source' });
  const targetConns = useHandleConnections({ type: 'target' });
  const isConnected = sourceConns.length > 0 || targetConns.length > 0;
  const config = NODE_CONFIG.scraperNode;

  useEffect(() => {
    if (data?.url !== undefined) setUrl(data.url);
    if (data?.result !== undefined) setResult(data.result);
  }, [data?.url, data?.result]);

  const handleScrape = async () => {
    if (!url) return;
    setStatus('processing');
    try {
      const res = await axios.post('http://localhost:8000/api/scrape', { url });
      setResult(res.data.content);
      updateNodeData(id, { result: res.data.content, url });
      setStatus('completed');
    } catch (err) {
      console.error("Scraping error:", err);
      setStatus('error');
    }
  };

  return (
    <RotatableNodeWrapper id={id} rotation={data?.rotation ?? 0} isMovementLocked={isMovementLocked} editMode={editMode} minWidth={260} minHeight={180}>
    <div className={`relative min-w-[260px] ${isConnected ? config?.glow : ''}
                     ${selected ? 'ring-2 ring-neon-cyan' : ''}
                     ${status === 'processing' ? 'node-processing' : 'node-idle'}
                     ${editMode ? 'node-edit-active' : ''} h-full pointer-events-none`}>
      <div className={`node-chassis glow-t glow-b border-[1.5px] ${editMode && !isMovementLocked ? 'border-dashed border-2 border-amber-500' : 'border-neon-cyan/30'} p-4 relative w-full h-full pointer-events-auto`}
           style={{ background: 'var(--industrial-bg)' }}>
        
        <div className="flex items-center gap-2 mb-3">
          <div className="w-8 h-8 rounded-lg bg-neon-cyan/10 border border-neon-cyan/30
                          flex items-center justify-center text-lg">{config?.emoji || '🕸️'}</div>
          <div>
            <div className="font-hud text-xs text-neon-cyan tracking-widest">NODE-SCRAP</div>
            <div className="font-body text-sm font-semibold text-white">{config?.label || 'Web Scraper'}</div>
          </div>
          <div className="ml-auto">
             <div className={`w-2 h-2 rounded-full ${status === 'processing' ? 'bg-amber-500 animate-pulse' : (status === 'completed' ? 'bg-neon-green' : (status === 'error' ? 'bg-red-500' : 'bg-gray-600'))}`} />
          </div>
        </div>

        <div className="space-y-3">
          <div>
            <label className="text-[10px] text-gray-400 font-mono block mb-1">TARGET URL</label>
            <input
              disabled={isFunctionLocked}
              value={url}
              onChange={(e) => {
                setUrl(e.target.value);
                updateNodeData(id, { url: e.target.value });
              }}
              className="w-full bg-dark-900 border border-neon-cyan/20 rounded px-2 py-1
                         text-xs text-white font-mono focus:outline-none focus:border-neon-cyan/60 transition-all disabled:opacity-50"
              placeholder="https://example.com"
            />
          </div>

          <button
            onClick={handleScrape}
            disabled={status === 'processing' || isFunctionLocked || !url}
            className="w-full py-1.5 rounded-lg text-xs font-hud tracking-widest
                       bg-neon-cyan/10 border border-neon-cyan/30 text-neon-cyan
                       hover:bg-neon-cyan/20 hover:border-neon-cyan/60 transition-all
                       disabled:opacity-40 disabled:cursor-not-allowed uppercase"
          >
            {status === 'processing' ? '⟳ Crawling...' : 'Execute Crawl'}
          </button>

          {result && (
            <div className="mt-2 text-[10px] font-mono text-gray-400 max-h-24 overflow-y-auto pr-1 custom-scrollbar border-t border-neon-cyan/10 pt-2">
              <span className="text-neon-cyan/60">Extracted:</span> {result.substring(0, 500)}...
            </div>
          )}
        </div>

        <Handle type="target" position={Position.Top} />
        <Handle type="source" position={Position.Bottom} />
      </div>
    </div>
    </RotatableNodeWrapper>
  );
});

export default ScraperNode;
