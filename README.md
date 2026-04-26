# Financial Fraud Detection System

A real-time fraud detection platform that analyzes financial transactions using a combination of rule-based heuristics and statistical anomaly detection. Every transaction is scored on a 0–100 risk scale and flagged if suspicious, with live updates streamed to a dashboard via WebSockets.

## Features

### Transaction Ingestion

- REST API to submit individual transactions
- Built-in synthetic data generator for testing and demos
- Fields captured: `user_id`, `amount`, `location`, `merchant_type`, `timestamp`

### 3-Layer Fraud Detection Engine

1. **Rule-based checks**
   - High-amount spikes (transactions above a threshold)
   - Rapid transactions (multiple transactions within a 5-minute window)
   - Unusual location changes (never-seen or recently-unused locations)
2. **Statistical checks**
   - Z-score anomaly detection on transaction amounts
   - Spending deviation from the user's historical average
3. **Risk scoring**
   - Every transaction gets a composite score from 0 to 100
   - Severity tiers: `low` → `medium` → `high` → `critical`

### Fraud Alerts

- Flagged transactions are stored as alerts with the list of reasons that triggered them
- Each alert records the severity and the full explanation (e.g., _"High transaction amount; Never-seen location: Dubai; Z-score anomaly"_)

### Dashboard (React + Recharts)

- Summary cards: total transactions, fraud count, fraud rate, average risk score
- Fraud alerts panel with severity badges
- Transactions table with color-coded risk scores and filter controls
- Charts:
  - Fraud vs. normal distribution
  - Risk-score distribution (bucketed)
  - Spending breakdown by merchant type
  - Daily fraud timeline

### Admin / API Layer

- Filter transactions by user, risk-score range, date range, or fraud status
- Paginated endpoints with configurable limit/offset

### Real-Time Updates

- WebSocket endpoint broadcasts every new transaction to connected dashboards
- Live alerts appear without needing to refresh

## Tech Stack

**Backend**

- FastAPI (Python 3.11+)
- SQLAlchemy + PostgreSQL
- Pydantic v2 for validation
- Pandas / NumPy for statistical analysis
- scikit-learn (available for future model extensions)
- WebSockets for real-time streaming

**Frontend**

- React (Vite)
- Tailwind CSS
- Recharts (charts/graphs)
- Axios (HTTP)
- React Router

## Project Structure

```
.
├── backend/
│   ├── app/
│   │   ├── api/              # FastAPI routers (transactions, alerts, stats, generator, websocket)
│   │   ├── engine/           # Fraud detection engine (detector.py)
│   │   ├── models/           # SQLAlchemy models (Transaction, FraudAlert)
│   │   ├── schemas/          # Pydantic schemas
│   │   ├── config.py         # App settings (env-driven)
│   │   ├── db.py             # SQLAlchemy engine / session
│   │   └── main.py           # FastAPI app entry point
│   ├── requirements.txt
│   └── .env.example
│
└── frontend/
    ├── src/
    │   ├── components/       # Reusable UI components
    │   ├── pages/            # Dashboard, Transactions, Alerts
    │   ├── hooks/            # useWebSocket, etc.
    │   ├── utils/            # API client, helpers
    │   └── App.jsx
    ├── index.html
    └── package.json
```

## Getting Started

### Prerequisites

- Python 3.11+
- Node.js 18+
- PostgreSQL 13+ (running locally or via Docker)

### 1. Database Setup

Create a database named `fraud_detection`:

```bash
createdb fraud_detection
```

Or using `psql`:

```sql
CREATE DATABASE fraud_detection;
```

### 2. Backend Setup

```bash
cd backend
python -m venv .venv
# Windows:
.venv\Scripts\activate
# macOS/Linux:
source .venv/bin/activate

pip install -r requirements.txt

# Configure your database URL
cp .env.example .env
# Edit .env to match your PostgreSQL credentials

uvicorn app.main:app --reload
```

The API will be available at `http://localhost:8000`.
Interactive docs: `http://localhost:8000/docs`

### 3. Frontend Setup

```bash
cd frontend
npm install
npm run dev
```

The dashboard will be available at `http://localhost:5173`.

## API Reference

Base URL: `http://localhost:8000/api/v1`

### Transactions

| Method | Endpoint             | Description                               |
| ------ | -------------------- | ----------------------------------------- |
| POST   | `/transactions/`     | Submit a new transaction (runs detection) |
| GET    | `/transactions/`     | List transactions with filters            |
| GET    | `/transactions/{id}` | Get a single transaction                  |

**Filters on GET `/transactions/`:**
`user_id`, `min_risk_score`, `max_risk_score`, `start_date`, `end_date`, `is_fraud`, `limit`, `offset`

**Example — submit a transaction:**

```bash
curl -X POST http://localhost:8000/api/v1/transactions/ \
  -H "Content-Type: application/json" \
  -d '{
    "user_id": "user_001",
    "amount": 7500.00,
    "location": "Dubai",
    "merchant_type": "electronics"
  }'
```

### Alerts

| Method | Endpoint        | Description                         |
| ------ | --------------- | ----------------------------------- |
| GET    | `/alerts/`      | List fraud alerts (filterable)      |
| GET    | `/alerts/count` | Count of alerts grouped by severity |

### Statistics

| Method | Endpoint                    | Description                          |
| ------ | --------------------------- | ------------------------------------ |
| GET    | `/stats/summary`            | Totals, fraud rate, avg risk, volume |
| GET    | `/stats/risk-distribution`  | Bucketed risk-score distribution     |
| GET    | `/stats/merchant-breakdown` | Spending by merchant type            |
| GET    | `/stats/timeline`           | Daily fraud vs. normal counts        |

### Synthetic Data Generator

| Method | Endpoint          | Description                   |
| ------ | ----------------- | ----------------------------- |
| POST   | `/generator/seed` | Seed N synthetic transactions |

**Query params:** `count` (1–500, default 50), `fraud_ratio` (0.0–1.0, default 0.15)

**Example:**

```bash
curl -X POST "http://localhost:8000/api/v1/generator/seed?count=200&fraud_ratio=0.2"
```

### WebSocket

- Endpoint: `ws://localhost:8000/ws`
- Emits a JSON message for every new transaction:

```json
{
  "event": "transaction",
  "data": {
    "id": 42,
    "user_id": "user_001",
    "amount": 7500.0,
    "is_fraud": true,
    "risk_score": 75.0,
    "severity": "high"
  }
}
```

## How the Detection Engine Works

When a transaction is submitted, the engine runs every layer and accumulates a risk score:

| Check               | Score delta | Triggers when                                               |
| ------------------- | ----------- | ----------------------------------------------------------- |
| High amount         | +30         | `amount ≥ $5,000`                                           |
| Elevated amount     | +15         | `amount ≥ $3,000`                                           |
| Rapid transactions  | +35         | 3+ transactions from the same user in 5 minutes             |
| Never-seen location | +25         | Location not in user's history                              |
| Unusual location    | +12         | Location not used in last 5 transactions                    |
| Z-score anomaly     | up to +30   | `\|z\| ≥ 2.5` on user's historical amounts (min 5 prior tx) |
| Spending deviation  | +20         | Amount ≥ 3× the user's historical average                   |

**Classification:**

- `risk_score ≥ 80` → **critical**
- `risk_score ≥ 65` → **high**
- `risk_score ≥ 50` → **medium** (fraud threshold)
- `risk_score < 50` → **low** (not flagged)

## Configuration

All backend settings live in `backend/.env`:

```
DATABASE_URL=postgresql://postgres:password@localhost:5432/fraud_detection
```

## Roadmap

- [ ] Authentication / API key support
- [ ] ML-based anomaly detection (Isolation Forest via scikit-learn)
- [ ] Celery workers for async batch scoring
- [ ] Alert escalation rules (email / webhook notifications)
- [ ] User-level risk profiles and whitelist management

## License

MIT
