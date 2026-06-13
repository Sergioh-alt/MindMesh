from fastapi import FastAPI, Request
from fastapi.middleware.cors import CORSMiddleware
import uvicorn

app = FastAPI(title="Synapse Flow Engine")

# Permitimos todo para pruebas de estabilidad
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"], 
    allow_methods=["*"],
    allow_headers=["*"],
)

@app.post("/process")
async def process_node(request: Request):
    # Capturamos el JSON crudo del Inspector
    data = await request.json()
    node_id = data.get("id", "Unknown")
    label = data.get("label", "Unknown")
    
    # Esto aparecerá en tu terminal negra para confirmar que llegó el mensaje
    print(f"📡 SEÑAL RECIBIDA: Nodo {label} (ID: {node_id})")
    
    result = f"SYNS_ECHO_STABLE: Conexión establecida en Bucaramanga. Recibido '{label}' con éxito."
    return {"status": "success", "output": result}

@app.get("/health")
async def health():
    return {"status": "online"}

if __name__ == "__main__":
    uvicorn.run(app, host="0.0.0.0", port=8000)
