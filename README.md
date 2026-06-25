# Roast or Recruit

Upload your resume. Get roasted. Or recruited.

Two modes:
- **Roast** — brutally honest feedback on your resume (brutalityScore out of 100, multiple roasts, verdict)
- **Recruit** — ATS score + technical review + recruiter recommendation

Built with Express + React + Mongo + Gemini API.

## Features

- Resume analysis via Google Gemini AI
- Per-user rate limiting (4 analyses/hour, or 4/hr per IP for anonymous users)
- Auth via email OTP (JWT sessions)
- Leaderboard for top roast/recruit scores
- Admin stats dashboard

## Quick start

```bash
# Clone
git clone https://github.com/your-username/roast-or-recruit.git
cd roast-or-recruit

# Install & build client
cd client
npm install
npm run build
cd ..

# Install & start server
cd server
npm install
cp .env.example .env   # fill in your env vars
npm start
```

Open http://localhost:5000

## Env vars

| Var | Required | Description |
|---|---|---|
| `GEMINI_API_KEY` | Yes | Google Gemini API key |
| `MONGO_URI` | Yes | MongoDB connection string |
| `JWT_SECRET` | Yes | Random secret for JWT signing |
| `SMTP_*` | For signup | Gmail app password for OTP emails |
| `CORS_ORIGIN` | For prod | Comma-separated allowed origins |
| `PORT` | No | Default 5000 |

## Deploy

Push to GitHub and connect on [Railway](https://railway.app). Set all env vars in the dashboard.
