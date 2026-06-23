# Frontend Documentation

React Native (Expo) mobile app for SSK Matrimony.

## Architecture

```
src/
  api/                    # 12 API modules, all through client.ts
    client.ts             # Axios instance with JWT interceptor + 401 handling
    auth.ts               # register, login, sendOtp, verifyOtp, logout
    profiles.ts           # CRUD + sub-entity updates (basic, education, family, etc.)
    managers.ts           # Profile manager CRUD
    photos.ts             # Photo upload/update/delete
    preferences.ts        # Partner preferences get/update
    search.ts             # Search, recommended, top matches
    connections.ts        # Send, accept, reject, cancel, list
    blocks.ts             # Block/unblock
    chat.ts               # Threads, messages, mark read
    kundali.ts            # Generate, match, summary, preferences, search, upload
    notifications.ts      # List, mark read
    verification.ts       # Email, phone, document verification
  context/
    AuthContext.tsx        # JWT token + user state, persisted to AsyncStorage
    ProfileContext.tsx     # Active profile + manager state, persisted to AsyncStorage
  navigation/
    AppNavigator.tsx       # 3-way conditional root navigator
    AuthStack.tsx          # Unauthenticated screens
    ProfileCreationStack.tsx  # 8-step profile creation flow
    MainTabs.tsx           # Bottom tab navigator (Discovery, Connections, Chat, Settings)
    types.ts               # TypeScript param lists for all navigators
  screens/                 # 30 screens across 8 categories
  components/              # 5 reusable components
  theme/                   # Design tokens (colors, spacing, typography)
  utils/
    storage.ts             # AsyncStorage helpers (token, user, clearStorage)
    authEvents.ts          # Event emitter for 401 session expiry
```

## Navigation Flow

### 3-Way Conditional Navigation (AppNavigator.tsx)

```
                    isLoading || isProfileLoading?
                           |
                          YES --> LoadingScreen
                           |
                          NO
                           |
                    isAuthenticated?
                      /         \
                    NO           YES
                    |             |
                AuthStack    hasCompletedProfile?
                                /         \
                              NO           YES
                              |             |
                    ProfileCreationStack  MainTabs + Detail Screens
```

- `isAuthenticated` = `!!token` (React state in AuthContext)
- `hasCompletedProfile` = `profile?.profile_status === 'active'`
- `isProfileLoading` prevents flash of ProfileCreationStack while stored profile loads from AsyncStorage

### AuthStack (4 screens)

```
Welcome --> Login --> OTP --> AccountSetupChoice
```

| Screen | Route | Description |
|--------|-------|-------------|
| WelcomeScreen | `Welcome` | Landing with Login/Register buttons |
| LoginScreen | `Login` | Email + password form with register toggle |
| OtpScreen | `OTP` | OTP verification (params: userId, channel, destination) |
| AccountSetupChoiceScreen | `AccountSetupChoice` | Post-registration options |

### ProfileCreationStack (9 screens, 8 steps)

```
BasicInfo --> Education --> Family --> Lifestyle --> Location -->
KundaliInput --> KundaliSummary --> Photos --> Preferences --> [auto-switch to MainTabs]
```

| Screen | Route | Step | API Endpoint |
|--------|-------|------|-------------|
| BasicInfoScreen | `ProfileBasicInfo` | 1 | POST `/profiles` + PATCH `/profiles/:id/basic` |
| EducationCareerScreen | `ProfileEducation` | 2 | PATCH `/profiles/:id/education-career` |
| FamilyInfoScreen | `ProfileFamily` | 3 | PATCH `/profiles/:id/family-info` |
| LifestyleScreen | `ProfileLifestyle` | 4 | PATCH `/profiles/:id/lifestyle` |
| LocationScreen | `ProfileLocation` | 5 | PATCH `/profiles/:id/location` |
| KundaliInputScreen | `ProfileKundaliInput` | 6 | PATCH `/profiles/:id/kundali` |
| KundaliSummaryScreen | `ProfileKundaliSummary` | 6b | Display only |
| PhotoUploadScreen | `ProfilePhotos` | 7 | POST `/profiles/:id/photos` |
| PartnerPreferencesScreen | `ProfilePreferences` | 8 | PATCH `/profiles/:id/preferences` + PATCH `/profiles/:id` (status='active') |

On step 8 completion, `PartnerPreferencesScreen` calls:
1. `preferencesApi.update(profileId, preferences)`
2. `profilesApi.update(profileId, { profile_status: 'active' })`
3. `refreshProfile(profileId)` - updates context

This sets `hasCompletedProfile` to true, triggering AppNavigator to switch to MainTabs.

### MainTabs (4 tabs)

| Tab | Screen | Icon Area |
|-----|--------|-----------|
| Discover | SwipeScreen | Discovery/matchmaking |
| Connections | ConnectionsDashboardScreen | Sent/received requests |
| Chat | ChatListScreen | Message threads |
| Settings | AccountSettingsScreen | Profile management |

### Detail Screens (accessible from MainTabs)

| Screen | Route | Navigation Source |
|--------|-------|-------------------|
| ProfileDetailScreen | `ProfileDetail` | SwipeScreen, search results |
| AdvancedSearchScreen | `AdvancedSearch` | SwipeScreen header |
| TopMatchesScreen | `TopMatches` | SwipeScreen header |
| ChatScreen | `ChatScreen` | ChatListScreen |
| ChatInfoScreen | `ChatInfo` | ChatScreen header |
| ConnectionRequestScreen | `ConnectionRequest` | ProfileDetailScreen |
| ManagerListScreen | `ManagerList` | AccountSettingsScreen |
| AddManagerScreen | `AddManager` | ManagerListScreen |
| PrivacySettingsScreen | `PrivacySettings` | AccountSettingsScreen |
| NotificationSettingsScreen | `NotificationSettings` | AccountSettingsScreen |
| KundaliSummaryScreen | `KundaliSummary` | AccountSettingsScreen |
| GunaBreakdownScreen | `GunaBreakdown` | KundaliSummaryScreen |
| KundaliPreferencesScreen | `KundaliPreferences` | KundaliSummaryScreen |
| KundaliCompatibleMatchesScreen | `KundaliMatches` | KundaliSummaryScreen |

## State Management

### AuthContext

| State | Type | Persisted | Storage Key |
|-------|------|-----------|-------------|
| `token` | `string | null` | Yes | `auth_token` |
| `user` | `User | null` | Yes | `auth_user` |
| `isLoading` | `boolean` | No | - |

**Exposed methods:** `login(email, password)`, `register(email, password)`, `logout()`

**Computed:** `isAuthenticated = !!token`

**Session expiry:** AuthContext subscribes to `authEvents.onSessionExpired()`. When the API client receives a 401, it clears AsyncStorage and emits the event, causing AuthContext to set `token`/`user` to null.

### ProfileContext

| State | Type | Persisted | Storage Key |
|-------|------|-----------|-------------|
| `profile` | `Profile | null` | Yes | `active_profile` |
| `managerId` | `string | null` | Yes | `active_manager` (object: `{id, role}`) |
| `managerRole` | `string | null` | Yes | (same object) |
| `isProfileLoading` | `boolean` | No | - |

**Exposed methods:** `setProfile(profile)`, `setManagerInfo(id, role)`, `refreshProfile(profileId)`

**Computed:** `hasCompletedProfile = profile?.profile_status === 'active'`

**Lifecycle:**
1. On `isAuthenticated` becoming true, loads profile/manager from AsyncStorage
2. On `setProfile(p)`, also writes to AsyncStorage (or removes if null)
3. On logout, AuthContext clears React state -> `isAuthenticated` false -> ProfileContext clears profile/manager state

### Storage Cleanup on Logout

`clearStorage()` removes all 4 keys:
```typescript
AsyncStorage.multiRemove(['auth_token', 'auth_user', 'active_profile', 'active_manager'])
```

This prevents cross-user data leaks when a different user logs in.

## API Client (client.ts)

Axios instance with two interceptors:

**Request interceptor:** Attaches `Authorization: Bearer <token>` header from AsyncStorage.

**Response interceptor:** On 401 status:
1. Calls `clearStorage()` to remove all persisted auth/profile data
2. Emits `authEvents.emitSessionExpired()` so AuthContext clears React state
3. Rejects the promise (caller's catch block still fires)

```typescript
const API_BASE_URL = process.env.EXPO_PUBLIC_API_URL || 'http://localhost:3000/api';
```

## Component Library

| Component | Props | Description |
|-----------|-------|-------------|
| `Button` | `title`, `onPress`, `variant` (`filled`/`outline`), `loading`, `disabled`, `style` | Primary action button with SSK theme |
| `Input` | `label`, `placeholder`, `value`, `onChangeText`, `secureTextEntry`, `keyboardType`, `error` | Text input with label and error display |
| `Card` | `children`, `style` | Elevated card container |
| `Avatar` | `uri`, `size`, `name` | Profile image with fallback initials |
| `LoadingScreen` | - | Full-screen loading spinner |

## Theme

### Colors

| Token | Hex | Usage |
|-------|-----|-------|
| `primary` | `#D4382C` | Primary buttons, highlights, headers |
| `primaryLight` | `#F5E6E4` | Light primary backgrounds |
| `secondary` | `#F9A825` | Secondary accents, badges |
| `background` | `#FFFFFF` | Screen backgrounds |
| `surface` | `#F8F9FA` | Card/section backgrounds |
| `text` | `#1A1A2E` | Primary text |
| `textSecondary` | `#6C757D` | Secondary/descriptive text |
| `border` | `#E9ECEF` | Input borders, dividers |
| `success` | `#28A745` | Success states |
| `error` | `#DC3545` | Error states, validation |

### Spacing

| Token | Value | Usage |
|-------|-------|-------|
| `xs` | 4px | Tight gaps |
| `sm` | 8px | Small padding |
| `md` | 16px | Default padding |
| `lg` | 24px | Section spacing |
| `xl` | 32px | Large spacing |
| `xxl` | 48px | Hero spacing |

### Typography

| Token | Size | Weight | Usage |
|-------|------|--------|-------|
| `h1` | 28 | 700 | Page titles |
| `h2` | 24 | 600 | Section headers |
| `h3` | 20 | 600 | Sub-headers |
| `body` | 16 | 400 | Body text |
| `bodySmall` | 14 | 400 | Secondary text |
| `caption` | 12 | 400 | Labels, timestamps |
| `button` | 16 | 600 | Button text |

## Screen Inventory (30 screens)

### Auth (4)
- `WelcomeScreen` - SSK Matrimony branding + Login/Register CTAs
- `LoginScreen` - Email + password with register/login toggle
- `OtpScreen` - 6-digit OTP input with resend timer
- `AccountSetupChoiceScreen` - Post-registration routing

### Profile Creation (9)
- `BasicInfoScreen` - Name, gender, DOB, height, marital status + community details
- `EducationCareerScreen` - Education, occupation, company, income, work location
- `FamilyInfoScreen` - Family type, parents' occupations, siblings, family status/values
- `LifestyleScreen` - Diet, smoking, drinking, hobbies
- `LocationScreen` - Country, state, city, pincode
- `KundaliInputScreen` - Birth date, time, place
- `KundaliSummaryScreen` - Display computed kundali (rashi, nakshatra, lagna)
- `PhotoUploadScreen` - Photo selection via expo-image-picker
- `PartnerPreferencesScreen` - Age/height ranges, education, occupations, locations

### Discovery (4)
- `SwipeScreen` - Card-based match browsing with Connect/Skip actions
- `ProfileDetailScreen` - Full profile view with all sections
- `AdvancedSearchScreen` - Multi-filter search form
- `TopMatchesScreen` - Highest compatibility matches list

### Connections (2)
- `ConnectionsDashboardScreen` - Tabs for sent/received/accepted connections
- `ConnectionRequestScreen` - Send connection with optional message

### Chat (3)
- `ChatListScreen` - All chat threads with last message preview
- `ChatScreen` - Message conversation with real-time updates
- `ChatInfoScreen` - Thread/profile info

### Managers (2)
- `ManagerListScreen` - List managers with role badges, remove option
- `AddManagerScreen` - Add new manager by email with role selection

### Settings (3)
- `AccountSettingsScreen` - Hub linking to privacy, notifications, managers, kundali, logout
- `PrivacySettingsScreen` - Toggle visibility settings
- `NotificationSettingsScreen` - Toggle notification channels and categories

### Kundali (4)
- `KundaliSummaryScreen` - Full kundali display with planetary positions
- `GunaBreakdownScreen` - 36-point Ashta-Koota score breakdown
- `KundaliPreferencesScreen` - Match requirements (min score, preferred rashi/nakshatra)
- `KundaliCompatibleMatchesScreen` - Profiles matching kundali criteria

## Development

### Adding a new screen

1. Create screen component in `screens/<category>/<ScreenName>.tsx`
2. Export from `screens/<category>/index.ts`
3. Add route to the appropriate navigator:
   - Auth flow: `navigation/AuthStack.tsx` + `AuthStackParamList`
   - Profile creation: `navigation/ProfileCreationStack.tsx` + `ProfileCreationParamList`
   - Main app: `navigation/AppNavigator.tsx` + `RootStackParamList`
4. Add TypeScript param types in `navigation/types.ts`

### Adding a new API module

1. Create `api/<module>.ts` with typed request/response interfaces
2. Use `client.get/post/patch/delete` for all HTTP calls
3. Export from `api/index.ts`

### Running checks

```bash
npm run typecheck    # TypeScript compilation (tsc --noEmit)
npm run lint         # ESLint
```

### Platform support

| Platform | Command | Notes |
|----------|---------|-------|
| iOS | `npx expo start --ios` | Requires Xcode + iOS simulator |
| Android | `npx expo start --android` | Requires Android Studio + emulator |
| Web | `npx expo start --web` | Requires `react-native-web`, `react-dom`, `@expo/webpack-config` |
| Expo Go | `npx expo start` | Scan QR code on physical device |
