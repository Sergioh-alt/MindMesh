import React from 'react';

/**
 * SYSTEM: Atomic Recovery Protocol (NATIVE_BYPASS)
 * These functions are injected into the global window scope to ensure 
 * recovery is possible even if the React reconciler is deadlocked.
 */
if (typeof window !== 'undefined') {
  window.sfEmergencyWipe = () => {
    // Explicit sync confirmation for SF_STATION_OPERATOR
    alert("SYSTEM: Iniciando Purga Total de Memoria..."); 
    
    try {
      localStorage.clear();
      sessionStorage.clear();
      // Use replace() to force a clean cache-less reload from the origin
      window.location.replace(window.location.origin);
    } catch (e) {
      window.location.replace(window.location.origin);
    }
  };

  window.sfForceReload = () => {
    window.location.reload();
  };
}

class ErrorBoundary extends React.Component {
  constructor(props) {
    super(props);
    this.state = { hasError: false };
  }

  static getDerivedStateFromError() {
    return { hasError: true };
  }

  componentDidCatch(error, errorInfo) {
    console.warn("--- SYSTEM CRITICAL CORE FAILURE ---");
    console.error(error, errorInfo);
  }

  render() {
    if (this.state.hasError) {
      // Use raw string-based HTML to bypass React's SyntheticEvent system entirely.
      // This is the most robust way to ensure recoverability during an engine deadlock.
      return (
        <div 
          dangerouslySetInnerHTML={{
            __html: `
              <div id="sf-emergency-wipe-overlay" style="position:fixed;top:0;left:0;right:0;bottom:0;z-index:2147483647;background:#050810;color:#ff0000;display:flex;align-items:center;justify-content:center;font-family:monospace;padding:20px;cursor:default;">
                <div style="max-width:500px;width:100%;padding:40px;border:1px solid rgba(255,0,0,0.4);background:rgba(255,0,0,0.05);text-align:center;border-radius:12px;box-shadow:0 0 50px rgba(255,0,0,0.2);">
                  <div style="font-size:48px;margin-bottom:24px;">⚠️</div>
                  <h1 style="font-size:22px;letter-spacing:5px;margin-bottom:12px;text-transform:uppercase;">Sistema en Recuperación</h1>
                  <p style="font-size:11px;color:#888;margin-bottom:40px;line-height:1.8;text-transform:uppercase;">
                    Reactor Core Collapse Detected.<br/>
                    Native Emergency Interface Active.
                  </p>

                  <div style="display:flex;flex-direction:column;gap:16px;">
                    <button 
                      onclick="window.sfForceReload()"
                      style="width:100%;padding:16px;background:rgba(255,0,0,0.15);border:1px solid #ff4444;color:#ff4444;font-size:10px;letter-spacing:3px;font-weight:bold;cursor:pointer;text-transform:uppercase;"
                    >
                      1. Reiniciar Núcleo (Native)
                    </button>

                    <button 
                      onclick="window.sfEmergencyWipe()"
                      style="width:100%;padding:16px;background:#111;border:1px solid #444;color:#666;font-size:10px;letter-spacing:3px;cursor:pointer;text-transform:uppercase;"
                    >
                      2. Purgar Memoria & Reiniciar
                    </button>
                  </div>

                  <div style="margin-top:40px;font-size:10px;opacity:0.4;">
                     Nexus Status: Recovery Interface Active
                  </div>
                </div>
              </div>
            `
          }} 
        />
      );
    }

    return this.props.children;
  }
}

export default ErrorBoundary;
