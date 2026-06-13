import React, { useState, useEffect, useRef } from 'react';
import { DEFAULT_LAYOUT } from '../constants';

const DraggablePanel = ({ id, children, defaultPos, disabled, editModeContext, className }) => {
  const panelRef = useRef(null);
  const isReady = useRef(false);

  const [pos, setPos] = useState(() => {
    try {
      let master = {};
      const saved = localStorage.getItem('rfn_master_layout');
      if (saved) {
        master = JSON.parse(saved);
      } else {
        master = DEFAULT_LAYOUT;
        localStorage.setItem('rfn_master_layout', JSON.stringify(master));
      }
      
      const parsed = master[id];
      if (parsed) {
        return { x: parsed.x, y: parsed.y, r: parsed.r || 0, w: parsed.w || 'auto', h: parsed.h || 'auto' };
      }
    } catch (e) {}
    return { ...defaultPos, r: 0, w: 'auto', h: 'auto' };
  });

  useEffect(() => {
    const timer = setTimeout(() => {
      isReady.current = true;
    }, 100);
    return () => clearTimeout(timer);
  }, []);

  const saveToMaster = (currentPos) => {
    if (!isReady.current) return;
    try {
      const saved = localStorage.getItem('rfn_master_layout');
      const master = saved ? JSON.parse(saved) : {};
      master[id] = { id, x: currentPos.x, y: currentPos.y, r: currentPos.r, w: currentPos.w, h: currentPos.h };
      localStorage.setItem('rfn_master_layout', JSON.stringify(master));
    } catch (e) {}
  };

  const [isDragging, setIsDragging] = useState(false);
  const [isRotating, setIsRotating] = useState(false);
  const [startPos, setStartPos] = useState({ x: 0, y: 0 });

  useEffect(() => {
    if (!panelRef.current || disabled) return;
    const ob = new ResizeObserver((entries) => {
      for (let e of entries) {
        setPos(prev => { 
          const currentW = prev.w === 'auto' ? e.contentRect.width : prev.w;
          const currentH = prev.h === 'auto' ? e.contentRect.height : prev.h;
          if (Math.abs(e.contentRect.width - currentW) > 5 || Math.abs(e.contentRect.height - currentH) > 5) {
             const n = { ...prev, w: e.contentRect.width, h: e.contentRect.height };
             saveToMaster(n);
             return n;
          }
          return prev;
        });
      }
    });
    
    ob.observe(panelRef.current);
    
    return () => {
      ob.disconnect();
    };
  }, [id, disabled]);

  const onPointerDown = (e) => {
    if (disabled || e.target.tagName.toLowerCase() === 'button' || e.target.closest('button')) return;
    setIsDragging(true);
    setStartPos({ x: e.clientX - pos.x, y: e.clientY - pos.y });
    try {
      e.target.setPointerCapture(e.pointerId);
    } catch(err) {}
  };

  const onPointerMove = (e) => {
    try {
      if (isDragging) {
        let newX = Math.max(0, Math.min(e.clientX - startPos.x, window.innerWidth - 100));
        let newY = Math.max(0, Math.min(e.clientY - startPos.y, window.innerHeight - 50));
        setPos(p => ({ ...p, x: newX, y: newY }));
      } else if (isRotating && panelRef.current) {
        const rect = panelRef.current.getBoundingClientRect();
        if (!rect || rect.width === 0) return;
        const cx = rect.left + rect.width / 2;
        const cy = rect.top + rect.height / 2;
        const angle = Math.atan2(e.clientY - cy, e.clientX - cx) * (180 / Math.PI) + 90;
        setPos(p => ({ ...p, r: Number.isNaN(angle) ? p.r : angle }));
      }
    } catch (err) {
      console.warn('Pointer move aborted', err);
    }
  };

  const onPointerUp = (e) => {
    if (isDragging || isRotating) {
      try {
        if (e.target.hasPointerCapture(e.pointerId)) e.target.releasePointerCapture(e.pointerId);
      } catch(err) {}
      setPos(currentPos => {
        saveToMaster(currentPos);
        return currentPos;
      });
      setIsDragging(false);
      setIsRotating(false);
    }
  };

  return (
    <div 
      ref={panelRef}
      className={`absolute z-[1000] ${disabled ? '' : 'border-none cursor-move'} ${isDragging || isRotating ? 'ring-2 ring-neon-cyan shadow-[0_0_15px_rgba(0,245,255,0.4)]' : ''} ${className}`}
      style={{ 
        transform: `translate(${pos.x}px, ${pos.y}px) rotate(${pos.r}deg)`,
        backgroundColor: 'rgba(10, 10, 15, 0.9)',
        backdropFilter: 'blur(10px)',
        width: pos.w,
        height: pos.h,
        resize: disabled ? 'none' : 'both',
        overflow: 'visible'
      }}
      onPointerDown={onPointerDown}
      onPointerMove={onPointerMove}
      onPointerUp={onPointerUp}
      onPointerCancel={onPointerUp}
    >
      {editModeContext && !disabled && (
        <div 
          className="absolute -top-6 left-1/2 -translate-x-1/2 w-4 h-4 bg-neon-cyan border-2 border-white rounded-full cursor-alias z-[1001]"
          onPointerDown={(e) => { e.stopPropagation(); setIsRotating(true); try { e.target.setPointerCapture(e.pointerId); } catch(err) {} }}
        />
      )}
      {children}
    </div>
  );
};

export default DraggablePanel;
