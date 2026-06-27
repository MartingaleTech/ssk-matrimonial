---
name: testing-ssk-matrimonial
description: Test the SSK Matrimony platform (NestJS backend + React Native Expo frontend) end-to-end. Use when verifying auth, profile creation, navigation, or API changes.
---

# Testing SSK Matrimony

## Prerequisites

### Backend
1. PostgreSQL must be running: `pg_isready` should return "accepting connections"
2. Start backend: `cd backend && npm run start:dev`
3. Wait for "Nest application successfully started" in output
4. Backend serves on `http://localhost:3000/api`

### Frontend
1. Run `cd frontend && npm install` (all web deps are now in package.json)
2. Start Expo web: `cd frontend && npx expo start --web --port 19006`
3. Expo web serves on `http://localhost:19006`
4. The entry point is `node_modules/expo/AppEntry.js` (NOT expo-router)

### Database
- PostgreSQL database `ssk_matrimonial` (or as configured in `backend/.env`)
- Tables auto-created by TypeORM `synchronize: true` on backend startup
- No manual migrations needed in dev
- If PostgreSQL isn't installed: `sudo apt-get install -y postgresql postgresql-client`
- Start PostgreSQL: `sudo pg_ctlcluster 14 main start` (version may vary)
- Create database: `sudo -u postgres createdb ssk_matrimonial && sudo -u postgres psql -c "ALTER USER postgres WITH PASSWORD 'postgres';"`

### Seeding Test Data
1. Start the backend first (tables must exist via TypeORM synchronize)
2. Run: `cd backend && npm run seed`
3. Creates 8 users (password: `Test@1234`), 8 profiles, connections, chat threads
4. The seed is idempotent — clears existing data before inserting
5. Login with any seeded email + `Test@1234` to get a JWT for API testing
6. Test accounts: `rahul.sharma@example.com`, `priya.patel@example.com`, etc.

## Devin Secrets Needed
- None. The app uses local PostgreSQL with default credentials configured in `backend/.env.example`.

## Key Testing Flows

### 1. Build Verification (Always Run First)
```bash
cd frontend && npx tsc --noEmit          # TypeScript compilation
cd frontend && npx eslint . --ext .ts,.tsx  # ESLint (0 errors expected)
```

### 2. Auth + Profile Creation API Flow
This simulates the exact sequence the frontend performs:

```bash
# Register
curl -s -X POST http://localhost:3000/api/auth/register \
  -H "Content-Type: application/json" \
  -d '{"email":"test@example.com","password":"testpass123"}'
# Returns: { user: {...}, token: "..." }

# Create profile (status should be 'draft')
curl -s -X POST http://localhost:3000/api/profiles \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer $TOKEN" \
  -d '{"display_name":"Test","gender":"male","date_of_birth":"1995-01-01","height_cm":175,"marital_status":"never_married"}'

# Steps 2-7: PATCH sub-entities
# /profiles/{id}/basic, /education-career, /family-info, /lifestyle, /location, /kundali

# Step 8: PATCH preferences
curl -s -X PATCH http://localhost:3000/api/profiles/$ID/preferences \
  -H "Content-Type: application/json" -H "Authorization: Bearer $TOKEN" \
  -d '{"age_min":21,"age_max":30}'

# Complete profile (this is what PartnerPreferencesScreen does)
curl -s -X PATCH http://localhost:3000/api/profiles/$ID \
  -H "Content-Type: application/json" -H "Authorization: Bearer $TOKEN" \
  -d '{"profile_status":"active"}'
# Verify: GET /profiles/{id} should show profile_status: "active"
```

### 3. Critical Code Assertions
After any changes to auth/navigation/profile context, verify:

```bash
# hasCompletedProfile checks status, not existence
grep 'hasCompletedProfile' frontend/src/context/ProfileContext.tsx
# Expected: profile?.profile_status === 'active'

# clearStorage removes all keys
grep 'multiRemove' frontend/src/utils/storage.ts
# Expected: includes 'active_profile' and 'active_manager'

# PartnerPreferencesScreen uses API, not navigate
grep -n 'navigate\|profilesApi\|refreshProfile' frontend/src/screens/profile-creation/PartnerPreferencesScreen.tsx
# Expected: profilesApi.update + refreshProfile, NO navigate('Main')

# 401 interceptor handles token expiry
grep -n 'clearStorage\|401' frontend/src/api/client.ts
# Expected: clearStorage() called inside 401 handler
```

## Architecture Notes

### Navigation Flow (3-way conditional in AppNavigator.tsx)
```
!isAuthenticated → AuthStack (Welcome, Login, OTP, AccountSetupChoice)
isAuthenticated && profile_status !== 'active' → ProfileCreationStack (8 steps)
isAuthenticated && profile_status === 'active' → MainTabs + detail screens
```

### State Persistence
- `AuthContext`: token + user → AsyncStorage (`auth_token`, `auth_user`)
- `ProfileContext`: profile + manager → AsyncStorage (`active_profile`, `active_manager`)
- On logout: `clearStorage()` removes all 4 keys
- On app restart: both contexts reload from AsyncStorage

### Common Pitfalls
- `hasCompletedProfile` must NOT be `!!profile` — profile exists after step 1 but status is 'draft'
- `useEffect` hooks that depend on `profile` must include it in deps array with null guard
- Profile creation screens should NOT call `setProfile()` in a way that triggers `hasCompletedProfile` to become true before step 8
- `clearStorage()` must remove profile/manager keys, not just auth keys, to prevent cross-user data leaks
- Browser automation tool might be unavailable; have a shell-based testing fallback ready
- When creating standalone TypeORM `DataSource` configs (e.g. seed scripts), you must list ALL entities referenced by relations — not just the ones you directly use. The `Profile` entity has `@OneToOne` to `KundaliPreferences`, `ProfileSearchIndex`, etc. Missing any causes `TypeORMError: Entity metadata not found`.
- The seed script is shell-only testing — no recording needed. Verify via SQL queries and API calls.

## Expo Web Gotchas
- `--non-interactive` flag is not supported; use `CI=1` environment variable instead
- `react-native-web` version mismatches may show warnings but usually work
- Missing `assets/favicon.png` might cause compilation errors — create a placeholder if needed
- Expo web runs on port 19006 by default with Metro bundler
- All `@nestjs/*` packages must be v10-compatible (core is v10). Do NOT upgrade satellite packages to v11 without also upgrading core.
- The frontend uses React Navigation (NOT expo-router). Entry point must be `node_modules/expo/AppEntry.js`.
- Web mode requires: `react-dom`, `react-native-web`, `@expo/metro-runtime`, `expo-asset`, `expo-font`, `expo-constants`
- `app.json` must have `web.bundler: "metro"` for Expo SDK 52+

## Fresh Install Verification
When testing dependency changes, always verify with a truly fresh install:
```bash
# Backend
cd backend && rm -rf node_modules package-lock.json && npm install
npx tsc --noEmit
npm run start:dev  # wait for "Nest application successfully started"

# Frontend
cd frontend && rm -rf node_modules package-lock.json && npm install
npx tsc --noEmit
npx expo start --web --port 19006  # verify Welcome screen renders, not blank
```