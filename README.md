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
      modules/             # 13 feature modules
      database/entities/   # 27 TypeORM entities
      guards/              # JWT + role-based auth guards
      config/              # Database + JWT configuration
  frontend/                # React Native (Expo) mobile app
    src/
      api/                 # 12 API modules (all through client.ts)
      screens/             # 30 screens across 8 categories
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
| `CORS_ORIGIN` | `*` | Allowed CORS origins |
| `PORT` | `3000` | Server port |

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

## License

Private - All rights reserved.
