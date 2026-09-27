# SSK Matrimony — Mobile app

A modern, SSK-community matrimonial platform with multi-manager profiles, chat, swipe-based matchmaking, and Vedic kundali matching.

This repository contains the **React Native (Expo) mobile app**. The platform is split across three repositories:

| Repository | Contents |
|------------|----------|
| [`ssk-matrimonial`](https://github.com/MartingaleTech/ssk-matrimonial) (this repo) | Expo mobile app (`frontend/`) |
| [`ssk-matrimonial-backend`](https://github.com/MartingaleTech/ssk-matrimonial-backend) | NestJS REST API + Socket.IO `/chat` gateway, admin API, migrations, Docker/CI |
| [`ssk-matrimonial-web`](https://github.com/MartingaleTech/ssk-matrimonial-web) | Next.js web app (public site, member app, admin console) |

The mobile app talks to the backend only over HTTP (`/api`), so it can point at any deployed backend via `EXPO_PUBLIC_API_URL`.

## Tech Stack

| Layer | Technology |
|-------|-----------|
| Mobile | React Native 0.76, Expo SDK 52, TypeScript |
| API | [ssk-matrimonial-backend](https://github.com/MartingaleTech/ssk-matrimonial-backend) (NestJS 10, TypeORM, PostgreSQL) |
| Chat | Socket.IO `/chat` namespace + REST |

## Quick Start

### Prerequisites

- **Node.js** >= 18
- **npm** >= 9
- A running backend — either a deployed API or a local one from
  [ssk-matrimonial-backend](https://github.com/MartingaleTech/ssk-matrimonial-backend#readme)
  (`docker compose up --build` there starts Postgres + the API on `http://localhost:3000/api`).

### Run the app

```bash
git clone https://github.com/MartingaleTech/ssk-matrimonial.git
cd ssk-matrimonial/frontend
npm install

# Point the app at your backend (defaults to http://localhost:3000/api)
export EXPO_PUBLIC_API_URL=https://<your-api-host>/api

# Mobile (Expo Go)
npx expo start

# Web (for browser testing)
npx expo start --web
```

Mobile: scan the QR code with Expo Go. Web: opens on `http://localhost:19006` / `http://localhost:8081`.

> The backend's `CORS_ORIGIN` must include any browser origin you use (e.g. `http://localhost:8081`,
> `http://localhost:19006`). Native iOS/Android clients send no `Origin` header and are always allowed.
> On a physical device, use your machine's LAN IP (not `localhost`) in `EXPO_PUBLIC_API_URL`.

## Project Structure

```
ssk-matrimonial/
  frontend/                # React Native (Expo) mobile app
    src/
      api/                 # 15 API modules (all through client.ts)
      screens/             # 35 screens across 10 categories
      navigation/          # Stack + Tab navigators
      context/             # AuthContext + ProfileContext
      components/          # Reusable UI components
      theme/               # Colors, spacing, typography
      utils/               # Storage, auth events
```

## Environment Variables

| Variable | Default | Description |
|----------|---------|-------------|
| `EXPO_PUBLIC_API_URL` | `http://localhost:3000/api` | Backend API base URL (including `/api`) |

Backend configuration (database, JWT, CORS, Stripe/Razorpay, Twilio, R2) is documented in the
[backend README](https://github.com/MartingaleTech/ssk-matrimonial-backend#readme).

## Available Scripts

```bash
cd frontend
npx expo start         # Start Expo dev server
npx expo start --web   # Start web version
npm run lint           # ESLint
npm run typecheck      # TypeScript check (tsc --noEmit)
```

## Documentation

- **[Frontend Documentation](frontend/DOCS.md)** - Screen inventory, navigation flow, state management, component library
- **[Backend Documentation](https://github.com/MartingaleTech/ssk-matrimonial-backend/blob/main/DOCS.md)** - API reference, database schema, module architecture, permission model
- **API reference (OpenAPI)** - served by the backend at `/api/docs`

## Key Features

- **Multi-manager profiles**: Owner, Parent, and Family Member roles per profile
- **Permission enforcement**: Only Owner + Parent can edit profile, manage connections, send/read chat
- **Chat**: Profile-to-profile messaging with `sender_manager_id` tracking, WebSocket real-time delivery
- **Swipe-based discovery**: Browse recommended matches, connect, or skip
- **Kundali engine**: Vedic astrology computation (rashi, nakshatra, lagna, planetary positions, houses, doshas) with 36-point Ashta-Koota guna matching
- **Privacy controls**: Granular visibility settings (name, work details, location, kundali)
- **Block enforcement**: Blocked profiles excluded from search, matches, connections, and chat
- **Profile creation flow**: 8-step guided flow (Basic Info -> Education -> Family -> Lifestyle -> Location -> Kundali -> Photos -> Preferences)
- **Subscriptions**: Basic and Premium plans priced per country (₹499 / ₹999 in India, $4.99 / $9.99 in the US), billed monthly through Razorpay (UPI, netbanking, cards) or Stripe (cards, Apple Pay, ACH)
- **Free trial**: The first 100 fully verified profiles get 6 months of Premium
- **Premium entitlements**: 10 photos (5 on Basic), favorites, and Kundali matching

> iOS note: digital subscriptions in an iOS App Store build must use Apple
> StoreKit / In-App Purchase. The Stripe Apple Pay flow covers Android and web;
> a StoreKit flow is still an open product decision.

## License

Private - All rights reserved.
