# Synapse Flow (SF-2026)

[![React](https://img.shields.io/badge/Frontend-React%20Flow-61DAFB?logo=react)](https://reactjs.org)
[![FastAPI](https://img.shields.io/badge/Backend-FastAPI-009688?logo=fastapi)](https://fastapi.tiangolo.com)
[![Python](https://img.shields.io/badge/Python-3.10%2B-3776AB?logo=python)](https://python.org)
[![Status](https://img.shields.io/badge/Status-Active%20Development-yellow)]()

High-performance node-based interactive interface for content drafting and linguistic analysis. Combines React Flow's visual programming paradigm with real-time hardware telemetry and a FastAPI backend for modular data pipeline construction.

## Technical Architecture

```
┌─────────────────────────────────────────────────────────┐
│                    Synapse Flow (SF-2026)                │
│                                                         │
│  ┌─────────────────────┐   ┌─────────────────────────┐  │
│  │    Frontend (React)  │   │   Backend (FastAPI)      │  │
│  │                      │   │                          │  │
│  │  • XYFlow node-graph │   │  • Universal Data        │  │
│  │  • Persistent layout │   │    Factory               │  │
│  │  • 8-point resize    │ ◄─┤  • Message-passing       │  │
│  │  • Logic-Decision    │   │    protocol              │  │
│  │    Gates (rhomboid)  │   │  • Telemetry pipeline    │  │
│  │  • Cost HUD          │   │  • API endpoints         │  │
│  └──────────┬──────────┘   └──────────┬──────────────┘  │
│             │                          │                 │
│             └──────────┬───────────────┘                 │
│                        ▼                                 │
│             ┌─────────────────────┐                      │
│             │  System Telemetry   │                      │
│             │  • CPU / RAM / GPU  │                      │
│             │  • Real-time HUD    │                      │
│             └─────────────────────┘                      │
└─────────────────────────────────────────────────────────┘
```

## Features

- **Node-Based Content Drafting**: Modular workflow construction using visual nodes
- **Interactive Refinement**: Manual iterative prompting for high-quality content drafting and structural review
- **Logic-Decision Gates**: Rhomboid-style boolean filters for technical constraint checking (e.g., word count thresholds)
- **Financial Monitoring**: Real-time USD token cost estimation integrated into the main HUD
- **Hardware Telemetry**: Native CPU/RAM monitoring embedded directly in the node graph for performance-aware research
- **Persistent Layout Hydration**: Node positions and connections survive session restarts
- **8-Point Omnidirectional Resizing**: Flexible node dimensions for any content type

## Tech Stack

| Layer | Technology |
|---|---|
| **Frontend** | React.js, XYFlow (React Flow) |
| **Backend** | FastAPI (Python) |
| **State** | React Context + REST API |
| **Telemetry** | psutil (Python) |
| **Build** | npm / vite (frontend), uvicorn (backend) |

## Getting Started

### Prerequisites

- Node.js 18+
- Python 3.10+

### Frontend

```bash
cd frontend
npm install
npm run dev
```

### Backend

```bash
cd backend
pip install -r requirements.txt
uvicorn main:app --reload --port 8000
```

## Project Structure

```
├── frontend/          # React + XYFlow UI
│   ├── src/
│   │   ├── components/   # Node types, gates, HUD
│   │   ├── hooks/        # Layout persistence, resize
│   │   └── utils/        # Cost calculation, API client
│   └── package.json
├── backend/           # FastAPI server
│   ├── routers/         # API endpoints
│   ├── services/        # Data factory, message protocol
│   └── telemetry/       # System monitoring
├── main.py            # Entry point
└── README.md
```

## Development Status

Synapse Flow is in active development, focusing on:
- Refinement of data visualization components
- Secure API integration patterns
- Educational software engineering environments

## Related

- [EEA-2026-ANT](https://github.com/YOUR_USER/EEA-2026-ANT) — Autonomous trading system
- [Shura](https://github.com/YOUR_USER/shura) — Financial analysis dashboard
