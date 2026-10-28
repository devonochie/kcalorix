# Kcalorix Web

The web app for **Kcalorix**, a calorie and workout tracker. Log meals, follow guided workouts, and watch your progress toward your goal. It installs on your phone like a native app.

## Features

- **Onboarding** that sets your goal (lose, maintain, gain), activity level, units and pace, then calculates your daily calorie and macro targets
- **Food diary** with meal types, food search, a calorie checker, and editing or deleting entries
- **Workouts** with an exercise library filtered by muscle group, equipment and difficulty, plus recommendations that match your goal and level
- **Workout plans** you can build yourself or generate automatically
- **Guided sessions** with a warm-up, live set logging, rest flow, and a summary with personal records
- **Progress** charts for weight and calories, and a weight log
- **Notifications** in the app and as push notifications
- **Account tools** including email verification, password reset, and exporting your data as JSON or CSV
- **Installable PWA** with an offline page

## Tech stack

- [Next.js](https://nextjs.org/) (App Router) and TypeScript
- [TanStack Query](https://tanstack.com/query) for server state
- [Axios](https://axios-http.com/) for API calls (session cookie auth)

## Requirements

- Node.js 20 or newer
- The Kcalorix backend running (see the backend README)

## Getting started

```bash
# 1. Install dependencies
npm install

# 2. Create your environment file
cp .env.example .env.local

# 3. Start the dev server
npm run dev
```

Open [http://localhost:3000](http://localhost:3000).

## Environment variables

Create a `.env.local` file in the project root:

| Variable | Required | Description |
|---|---|---|
| `NEXT_PUBLIC_API_URL` | No | Backend address. Defaults to `http://localhost:8080` |
| `NEXT_PUBLIC_MEDIA_BASE_URL` | No | Base URL for exercise images and videos that use relative paths |

## Scripts

| Command | What it does |
|---|---|
| `npm run dev` | Start the development server |
| `npm run build` | Create a production build |
| `npm run start` | Run the production build |
| `npm run lint` | Check the code for problems |

## Project structure

```
src/
├── app/            Pages and routes
│   ├── (auth)/     Login, register, verify email, password reset
│   ├── (app)/      Today, diary, workouts, exercises, progress, profile
│   └── onboarding/ First-run setup
├── components/     UI, food, workout, onboarding, profile and progress components
├── hooks/          Data hooks built on TanStack Query
├── lib/
│   └── api/        Axios client and one module per backend area
└── types/          Request and response types, and enums that mirror the backend
```

## How it talks to the backend

All requests go to `NEXT_PUBLIC_API_URL` under `/api/v1` and send the session cookie with every call, so the backend must allow this site's origin in its CORS settings with credentials enabled.

## Installing as an app

In production, the browser offers an install option. On iPhone, open the site in Safari, tap Share, then **Add to Home Screen**. The service worker is only active in production builds.

## Deployment

Build with `npm run build`, then host on any platform that supports Next.js, such as Vercel. Set `NEXT_PUBLIC_API_URL` to your deployed backend address.

## License

Add your license here.
