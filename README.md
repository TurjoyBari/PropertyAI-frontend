# PropertyAI Frontend

Next.js 15 frontend for **PropertyAI** — Real Estate AI Management System.

## Stack

- Next.js 15 (App Router) + React 19 + TypeScript
- Tailwind CSS
- Better Auth client
- React Hook Form + Zod

## Getting Started

```bash
cp .env.example .env.local
npm install
npm run dev
```

App: http://localhost:3000

Make sure the backend is also running (`PropertyAI-backend` → `npm run dev` on port 4000).

Auth requests go to same-origin `/api/auth/*` and are rewritten to the NestJS API.

## Auth pages

| Route | Purpose |
|---|---|
| `/login` | Email/password + Google button |
| `/register` | Create account |
| `/forgot-password` | Request reset link |
| `/reset-password?token=...` | Set new password |
| `/dashboard` | Protected operations dashboard |

## Dashboard

Protected app shell with sidebar, KPI cards, Recharts trends, notifications, skeletons, and light/dark theme toggle.

Stats come from `GET /api/dashboard/stats` (rewritten to NestJS).

## Properties

| Route | Purpose |
|---|---|
| `/properties` | Search/filter list |
| `/properties/new` | Create listing |
| `/properties/[id]` | Detail, edit, delete |

## Related

Backend repository: [PropertyAI-backend](https://github.com/TurjoyBari/PropertyAI-backend)
