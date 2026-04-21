from fastapi import FastAPI, WebSocket
from fastapi.middleware.cors import CORSMiddleware

from app.db import engine, Base
from app.models import Transaction, FraudAlert  # ensure tables are registered
from app.api import transactions, alerts, stats, generator
from app.api.websocket import ws_endpoint

Base.metadata.create_all(bind=engine)

app = FastAPI(
    title="Fraud Detection System",
    description="Real-time transaction fraud detection API",
    version="1.0.0",
)

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

app.include_router(transactions.router, prefix="/api/v1")
app.include_router(alerts.router, prefix="/api/v1")
app.include_router(stats.router, prefix="/api/v1")
app.include_router(generator.router, prefix="/api/v1")


@app.websocket("/ws")
async def websocket_route(websocket: WebSocket):
    await ws_endpoint(websocket)


@app.get("/")
def root():
    return {"status": "ok", "service": "Fraud Detection API v1.0"}


@app.get("/health")
def health():
    return {"status": "healthy"}
