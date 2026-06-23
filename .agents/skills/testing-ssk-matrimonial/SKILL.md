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
1. Install web deps if not present: `cd frontend && npm install react-native-web react-dom @expo/webpack-config`
2. Create `frontend/assets/favicon.png` if missing (Expo web requires it)
3. Start Expo web: `cd frontend && CI=1 npx expo start --web --port 8081`
4. Expo web serves on `http://localhost:19006`

### Database
- PostgreSQL database `ssk_matrimonial` (or as configured in `backend/.env`)
- Tables auto-created by TypeORM `synchronize: true` on backend startup
- No manual migrations needed in dev

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
!isAuthenticated -> AuthStack (Welcome, Login, OTP, AccountSetupChoice)
isAuthenticated && profile_status !== 'active' -> ProfileCreationStack (8 steps)
isAuthenticated && profile_status === 'active' -> MainTabs + detail screens
```

### State Persistence
- `AuthContext`: token + user -> AsyncStorage (`auth_token`, `auth_user`)
- `ProfileContext`: profile + manager -> AsyncStorage (`active_profile`, `active_manager`)
- On logout: `clearStorage()` removes all 4 keys
- On app restart: both contexts reload from AsyncStorage

### Common Pitfalls
- `hasCompletedProfile` must NOT be `!!profile` -- profile exists after step 1 but status is 'draft'
- `useEffect` hooks that depend on `profile` must include it in deps array with null guard
- Profile creation screens should NOT call `setProfile()` in a way that triggers `hasCompletedProfile` to become true before step 8
- `clearStorage()` must remove profile/manager keys, not just auth keys, to prevent cross-user data leaks
- Browser automation tool might be unavailable; have a shell-based testing fallback ready

## Expo Web Gotchas
- `--non-interactive` flag is not supported; use `CI=1` environment variable instead
- `react-native-web` version mismatches may show warnings but usually work
- Missing `assets/favicon.png` causes a webpack compilation error -- create a placeholder
- Expo web runs on port 19006 (not 8081 which is Metro)
