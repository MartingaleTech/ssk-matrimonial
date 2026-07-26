# SSK Matrimony

A modern, SSK-community matrimonial platform with multi-manager profiles, chat, swipe-based matchmaking, and Vedic kundali matching.

## Tech Stack

| Layer | Technology |
|-------|-----------|
| Backend | NestJS 10, TypeScript, TypeORM, PostgreSQL |
| Frontend | React Native 0.76, Expo SDK 52, TypeScript |
| Auth | JWT (passport-jwt), bcryptjs |
| Chat | WebSockets (Socket.IO) + REST |
| Kundali | Vedic astrology engine (Ashta-Koota 36-point guna matching) |

## Quick Start

### Prerequisites

- **Node.js** >= 18
- **PostgreSQL** >= 14
- **npm** >= 9

### 1. Clone and configure

```bash
git clone https://github.com/MartingaleTech/ssk-matrimonial.git
cd ssk-matrimonial

# Backend environment
cp backend/.env.example backend/.env
# Edit backend/.env with your PostgreSQL credentials if needed
```

### 2. Start the backend

```bash
cd backend
npm install
npm run start:dev
```

The API starts on `http://localhost:3000/api`. Tables are auto-created via TypeORM `synchronize: true`.

### 3. Start the frontend

```bash
cd frontend
npm install

# Mobile (Expo Go)
npx expo start

# Web (for browser testing)
npm install react-native-web react-dom @expo/webpack-config
npx expo start --web
```

Mobile: scan the QR code with Expo Go. Web: opens on `http://localhost:19006`.

## Project Structure

```
ssk-matrimonial/
  backend/                 # NestJS API server
    src/
      modules/             # 16 feature modules
      database/entities/   # 32 TypeORM entities
      guards/              # JWT + role-based auth guards
      config/              # Database + JWT configuration
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

### Backend (`backend/.env`)

| Variable | Default | Description |
|----------|---------|-------------|
| `DB_HOST` | `localhost` | PostgreSQL host |
| `DB_PORT` | `5432` | PostgreSQL port |
| `DB_USERNAME` | `postgres` | Database user |
| `DB_PASSWORD` | `postgres` | Database password |
| `DB_DATABASE` | `ssk_matrimonial` | Database name |
| `JWT_SECRET` | `your-jwt-secret-change-in-production` | JWT signing secret |
| `JWT_EXPIRES_IN` | `7d` | Token expiry duration |
| `CORS_ORIGIN` | `*` | Comma-separated allowed origins. Must be explicit (never `*`) in production |
| `PORT` | `3000` | Server port |
| `DB_SSL` | `false` | Connect to PostgreSQL over TLS |
| `DB_SSL_REJECT_UNAUTHORIZED` | `true` | Verify the PostgreSQL server certificate |
| `DB_SSL_CA` | – | PEM CA bundle for the PostgreSQL server certificate |
| `DATA_ENCRYPTION_KEY` | – | 32-byte key (`openssl rand -hex 32`) for AES-256-GCM field encryption. Required in production |
| `STRIPE_SECRET_KEY` | – | Stripe secret key (US payments) |
| `STRIPE_PUBLISHABLE_KEY` | – | Stripe publishable key returned to the app |
| `STRIPE_WEBHOOK_SECRET` | – | Stripe webhook signing secret |
| `RAZORPAY_KEY_ID` | – | Razorpay key id (India payments) |
| `RAZORPAY_KEY_SECRET` | – | Razorpay key secret |
| `RAZORPAY_WEBHOOK_SECRET` | – | Razorpay webhook signing secret |

### Frontend

| Variable | Default | Description |
|----------|---------|-------------|
| `EXPO_PUBLIC_API_URL` | `http://localhost:3000/api` | Backend API base URL |

## Available Scripts

### Backend

```bash
npm run start:dev      # Development with hot-reload
npm run build          # Production build
npm run start:prod     # Run production build
npm run lint           # ESLint
npm run test           # Unit tests
npm run test:e2e       # End-to-end tests
```

### Frontend

```bash
npx expo start         # Start Expo dev server
npx expo start --web   # Start web version
npm run lint           # ESLint
npm run typecheck      # TypeScript check (tsc --noEmit)
```

## Documentation

- **[Backend Documentation](backend/DOCS.md)** - API reference, database schema, module architecture, permission model
- **[Frontend Documentation](frontend/DOCS.md)** - Screen inventory, navigation flow, state management, component library

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
- **Security**: Helmet, CORS allowlist, strict validation, rate limiting, AES-256-GCM field encryption for sensitive PII and provider identifiers, and masked responses for non-owners

> iOS note: digital subscriptions in an iOS App Store build must use Apple
> StoreKit / In-App Purchase. The Stripe Apple Pay flow covers Android and web;
> a StoreKit flow is still an open product decision.

## License

Private - All rights reserved.
