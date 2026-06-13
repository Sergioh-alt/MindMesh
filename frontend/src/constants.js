export const DEFAULT_LAYOUT = {
  "status-header": { "id": "status-header", "x": 6, "y": 9, "r": 0, "w": "auto", "h": "auto" },
  "palette-sidebar": { "id": "palette-sidebar", "x": 8, "y": 78, "r": 0, "w": "auto", "h": "auto" },
  "undo-redo-panel": { "id": "undo-redo-panel", "x": 280, "y": 84, "r": 0, "w": "auto", "h": "auto" },
  "canvas_controls": { "id": "canvas_controls", "x": 281, "y": 125, "r": 0, "w": "auto", "h": "auto" },
  "inspector": { "id": "inspector", "x": 1052, "y": 250, "r": 0, "w": "auto", "h": "auto" },
  "minimap-panel": { "id": "minimap-panel", "x": 1093, "y": 39, "r": 0, "w": "auto", "h": "auto" },
  "canvas-mode-toggle": { "id": "canvas-mode-toggle", "x": 10, "y": 504, "r": 0, "w": "auto", "h": "auto" }
};

export const API_BASE_URL = 'http://127.0.0.1:8000';

export const NODE_CONFIG = {
  redditSource: { emoji: '🔴', label: 'Reddit Source', color: 'orange', glow: 'glow-active-orange' },
  promptRefiner: { emoji: '⚙️', label: 'Prompt Refiner', color: 'cyan', glow: 'glow-active-cyan' },
  scraperNode: { emoji: '🕸️', label: 'Web Scraper', color: 'purple', glow: 'glow-active-purple' },
  telegramNode: { emoji: '📥', label: 'Telegram In', color: 'cyan', glow: 'glow-active-cyan' },
  humanApproval: { emoji: '👤', label: 'Human Approval', color: 'purple', glow: 'glow-active-purple' },
  publisher: { emoji: '📤', label: 'Publisher', color: 'green', glow: 'glow-active-green' },
  decisionNode: { emoji: '⚖️', label: 'Decision Gate', color: 'amber', glow: 'glow-active-amber' },
  bunkerLock: { emoji: '🔒', label: 'Bunker Lock', color: 'red' },
  imageNode: { emoji: '🖼️', label: 'Image Generator', color: 'cyan', glow: 'glow-active-cyan' }
};
