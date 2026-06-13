import React, { useState, useEffect, useRef } from 'react';
import { ReactFlowProvider } from '@xyflow/react';
import FlowCanvas from './components/FlowCanvas';
import Sidebar from './components/Sidebar';
import { EditModeProvider, useEditMode } from './contexts/EditModeContext';
import HUD from './components/HUD';
import HardwareMonitor from './components/HardwareMonitor';
import ErrorBoundary from './components/ErrorBoundary';
import DraggablePanel from './components/DraggablePanel';
import { DEFAULT_LAYOUT } from './constants';

const AppContent = ({ selectedNode, setSelectedNode }) => {
  const { isEditMode, isMovementLocked } = useEditMode();
  
  return (
    <div className="h-screen w-screen flex flex-col bg-dark-950 font-sans text-white overflow-hidden relative">
      {/* Main Workspace */}
      <div className="absolute inset-0 flex flex-col pointer-events-auto">
        <ErrorBoundary>
          <ReactFlowProvider>
            <FlowCanvas onNodeSelect={setSelectedNode} />
          </ReactFlowProvider>
        </ErrorBoundary>
      </div>

      {/* HUD Header */}
      <DraggablePanel id="status-header" defaultPos={{ x: window.innerWidth / 2 - 350, y: 20 }} disabled={!isEditMode || isMovementLocked} editModeContext={isEditMode} className="shadow-2xl rounded-xl">
        <HUD />
      </DraggablePanel>

      {/* Sidebar Component */}
      <DraggablePanel id="palette-sidebar" defaultPos={{ x: 20, y: 100 }} disabled={!isEditMode || isMovementLocked} editModeContext={isEditMode} className="shadow-2xl rounded-xl">
        <Sidebar />
      </DraggablePanel>

      {/* Inspector */}
      {selectedNode && (
        <DraggablePanel id="inspector" defaultPos={{ x: window.innerWidth - 300, y: 80 }} disabled={!isEditMode || isMovementLocked} editModeContext={isEditMode} className="shadow-2xl">
          <aside className="w-72 bg-dark-900 border border-neon-cyan/20 rounded-xl p-4 flex flex-col">
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-xs font-hud text-neon-cyan tracking-widest uppercase">Inspector</h2>
              <button onClick={() => setSelectedNode(null)} className="text-gray-500 hover:text-white">✕</button>
            </div>
            <div className="space-y-4 font-mono text-[10px]">
              <div>
                <label className="text-gray-500 block mb-1">NODE ID</label>
                <div className="bg-dark-950 p-2 border border-gray-800">{selectedNode.id}</div>
              </div>
              <div>
                <label className="text-gray-500 block mb-1">PAYLOAD</label>
                <pre className="bg-dark-950 p-2 border border-gray-800 overflow-auto max-h-40">{JSON.stringify(selectedNode.data, null, 2)}</pre>
              </div>
            </div>
          </aside>
        </DraggablePanel>
      )}

      <footer className="absolute bottom-0 w-full h-[26px] bg-dark-950/80 border-t border-white/5 flex items-center px-6 justify-end gap-[25px] text-[10px] font-mono z-[9999] pointer-events-none backdrop-blur-md select-none">
        <div className="flex items-center pointer-events-auto">
          <HardwareMonitor />
        </div>
        <div className="flex items-center gap-6 text-gray-600 pointer-events-auto">
          <span className="opacity-20">//</span>
          <span className="tracking-tighter uppercase font-bold text-gray-500">Stability: <span className="text-neon-cyan/80">100.0%</span></span>
        </div>
      </footer>
    </div>
  );
};

function App() {
  const [selectedNode, setSelectedNode] = useState(null);

  return (
    <EditModeProvider>
      <AppContent selectedNode={selectedNode} setSelectedNode={setSelectedNode} />
    </EditModeProvider>
  );
}

export default App;
