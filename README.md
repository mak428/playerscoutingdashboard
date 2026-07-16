# Interactive Soccer Dashboard

A full-stack analytics dashboard for Top 5 European League players.

## Stack
- **Frontend**: Next.js 15 · React · TypeScript · Tailwind CSS · Plotly.js
- **Backend**: FastAPI · pandas

## Pages
| Page | Description |
|------|-------------|
| Home | Feature overview |
| Archetypes | K-Means player archetypes by position |
| Market Value | 5-year transfer value forecasts |
| Tactical Fit | Fit scores for 4 tactical systems |
| Shortlist | Personal player shortlist + comparison |

## Running the App

### 1. Backend
```bash
cd backend
pip install -r requirements.txt
uvicorn main:app --reload --port 8000
```

### 2. Frontend
```bash
cd frontend
npm install
npm run dev
```

Open [http://localhost:3000](http://localhost:3000).

The API docs are available at [http://localhost:8000/docs](http://localhost:8000/docs).
