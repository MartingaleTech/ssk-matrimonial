# Backend Documentation

NestJS REST API + WebSocket server for SSK Matrimony.

## Architecture

```
src/
  main.ts                          # Bootstrap (port 3000, CORS, validation pipe)
  app.module.ts                    # Root module (13 feature modules, global JWT guard)
  config/
    database.config.ts             # PostgreSQL connection (from env vars)
    jwt.config.ts                  # JWT secret + expiry (from env vars)
  guards/
    jwt-auth.guard.ts              # Global JWT authentication guard
    roles.guard.ts                 # Role-based authorization guard
  common/decorators/
    public.decorator.ts            # @Public() - skip JWT guard
    current-user.decorator.ts      # @CurrentUser() - extract user from request
    roles.decorator.ts             # @Roles() - specify required roles
  database/entities/               # 27 TypeORM entities
  modules/                         # 13 feature modules (controller + service + DTOs)
```

## Database Schema (27 Entities)

### Core

| Entity | Table | PK | Description |
|--------|-------|-----|-------------|
| `User` | `users` | uuid | Auth credentials (email, phone, password_hash) |
| `UserSession` | `user_sessions` | uuid | Active sessions (device_info, ip, expires_at) |
| `Profile` | `profiles` | uuid | Main profile (display_name, gender, dob, status) |
| `ProfileManager` | `profile_managers` | uuid | User-to-profile role mapping. UNIQUE(user_id, profile_id) |

### Profile Details (one-to-one with Profile)

| Entity | Table | PK | Fields |
|--------|-------|-----|--------|
| `ProfileBasicDetails` | `profile_basic_details` | profile_id | first_name, last_name, community, mother_tongue, religion, caste_subgroup, gotra |
| `ProfileEducationCareer` | `profile_education_career` | profile_id | highest_education, education_details, occupation, company_name, annual_income_range, work_location_city/country |
| `ProfileFamilyInfo` | `profile_family_info` | profile_id | family_type, father/mother_occupation, siblings_brothers/sisters, family_status, family_values |
| `ProfileLifestyle` | `profile_lifestyle` | profile_id | diet, smoking, drinking, hobbies (JSON) |
| `ProfileLocation` | `profile_location` | profile_id | country, state, city, pincode, latitude, longitude |

### Kundali

| Entity | Table | PK | Description |
|--------|-------|-----|-------------|
| `ProfileKundali` | `profile_kundali` | profile_id | Birth details + computed astrology (rashi, nakshatra, lagna, planetary_positions JSON, houses JSON, doshas JSON) |
| `GunaMatchResults` | `guna_match_results` | uuid | 36-point match between two profiles. UNIQUE(profile1_id, profile2_id) ordered |
| `KundaliPreferences` | `kundali_preferences` | profile_id | Match requirements (require_kundali_match, minimum_guna_score, preferred rashi/nakshatra/doshas) |

### Social

| Entity | Table | PK | Description |
|--------|-------|-----|-------------|
| `Connection` | `connections` | uuid | Request between profiles (status: pending/accepted/rejected/cancelled). UNIQUE(from, to) |
| `Block` | `blocks` | uuid | Block relationship. UNIQUE(blocked_by, blocked) |
| `ChatThread` | `chat_threads` | uuid | One thread per profile pair. UNIQUE(profile1_id, profile2_id) ordered |
| `ChatMessage` | `chat_messages` | uuid | Message in thread (sender_profile_id + sender_manager_id, message_type, content) |

### Supporting

| Entity | Table | PK | Description |
|--------|-------|-----|-------------|
| `ProfilePhoto` | `profile_photos` | uuid | Photo with visibility (public/private/connected_only) |
| `ProfilePrivacySettings` | `profile_privacy_settings` | profile_id | Toggle visibility of name, work, location, kundali |
| `ProfilePartnerPreferences` | `profile_partner_preferences` | profile_id | Age/height ranges, education/occupation/location filters |
| `ProfileSearchIndex` | `profile_search_index` | profile_id | Denormalized search fields for fast filtering |
| `Verification` | `verifications` | uuid | Email/phone/document verification status |
| `OtpCode` | `otp_codes` | uuid | One-time codes (channel, code, expires_at, used_at) |
| `Notification` | `notifications` | uuid | User notifications (type, data JSON, is_read) |
| `UserNotificationSettings` | `user_notification_settings` | user_id | Toggle email/sms/push per notification category |
| `AuditLog` | `audit_logs` | uuid | Action log (actor_user_id, actor_manager_id, profile_id, action, metadata) |
| `Admin` | `admins` | uuid | Admin user mapping (user_id, role) |
| `Report` | `reports` | uuid | Profile reports (reason, status, resolution) |

### Profile Status Lifecycle

```
draft  -->  active  -->  suspended  -->  deleted
  |                         |
  +---- (profile creation)--+--- (admin action) ---+
```

- `draft`: Created in step 1 of profile creation (default)
- `active`: Set when user completes all 8 profile creation steps
- `suspended`/`deleted`: Admin actions

## API Reference

All endpoints are prefixed with `/api`. Authentication is required unless marked `@Public()`.

### Auth Module

| Method | Endpoint | Auth | Description |
|--------|----------|------|-------------|
| POST | `/auth/register` | Public | Register with email + password. Returns user + JWT |
| POST | `/auth/login` | Public | Login with email + password. Returns user + JWT |
| POST | `/auth/send-otp` | Public | Send OTP to email or phone |
| POST | `/auth/verify-otp` | Public | Verify OTP code |
| POST | `/auth/logout` | JWT | Logout (invalidate session) |

**Register request:**
```json
{ "email": "user@example.com", "password": "securepass123" }
```

**Register response:**
```json
{
  "user": { "id": "uuid", "email": "user@example.com", "phone": null },
  "token": "eyJhbG..."
}
```

### Profiles Module

| Method | Endpoint | Auth | Description |
|--------|----------|------|-------------|
| POST | `/profiles` | JWT | Create profile (auto-creates owner manager + privacy settings) |
| GET | `/profiles/:id` | JWT | Get profile with all sub-entities |
| PATCH | `/profiles/:id` | JWT | Update top-level profile fields (display_name, profile_status, etc.) |
| DELETE | `/profiles/:id` | JWT | Delete profile |
| PATCH | `/profiles/:id/basic` | JWT | Update basic details (name, community, gotra, etc.) |
| PATCH | `/profiles/:id/education-career` | JWT | Update education & career details |
| PATCH | `/profiles/:id/family-info` | JWT | Update family information |
| PATCH | `/profiles/:id/lifestyle` | JWT | Update lifestyle (diet, smoking, hobbies) |
| PATCH | `/profiles/:id/location` | JWT | Update location (country, state, city, pincode) |
| PATCH | `/profiles/:id/kundali` | JWT | Update kundali birth details |

**Create profile request:**
```json
{
  "display_name": "John D",
  "gender": "male",
  "date_of_birth": "1995-06-15",
  "height_cm": 175,
  "marital_status": "never_married"
}
```

**Create profile response:**
```json
{
  "profile": {
    "id": "uuid",
    "display_name": "John D",
    "profile_status": "draft",
    "has_kundali": false,
    "..."
  },
  "manager": {
    "id": "uuid",
    "role": "owner",
    "is_primary": true
  }
}
```

### Profile Managers Module

| Method | Endpoint | Auth | Description |
|--------|----------|------|-------------|
| POST | `/profiles/:id/managers` | JWT | Add manager (owner/parent/family_member) |
| GET | `/profiles/:id/managers` | JWT | List all managers for a profile |
| PATCH | `/profiles/:id/managers/:managerId` | JWT | Update manager role |
| DELETE | `/profiles/:id/managers/:managerId` | JWT | Remove manager |

### Photos Module

| Method | Endpoint | Auth | Description |
|--------|----------|------|-------------|
| POST | `/profiles/:id/photos` | JWT | Upload photo (url, visibility: public/private/connected_only) |
| GET | `/profiles/:id/photos` | JWT | List profile photos |
| PATCH | `/profiles/:id/photos/:photoId` | JWT | Update photo (is_primary, visibility) |
| DELETE | `/profiles/:id/photos/:photoId` | JWT | Delete photo |

### Preferences Module

| Method | Endpoint | Auth | Description |
|--------|----------|------|-------------|
| GET | `/profiles/:id/preferences` | JWT | Get partner preferences |
| PATCH | `/profiles/:id/preferences` | JWT | Update partner preferences |

### Search Module

| Method | Endpoint | Auth | Description |
|--------|----------|------|-------------|
| GET | `/search` | JWT | Search profiles with filters (gender, age, height, city, education, etc.) |
| GET | `/matches/recommended` | JWT | Get recommended matches for a profile |
| GET | `/matches/top` | JWT | Get top matches based on compatibility |

**Search query parameters:**
```
?gender=female&age_min=25&age_max=30&city=Bangalore&education_level=Masters&profile_id=uuid
```

### Connections Module

| Method | Endpoint | Auth | Description |
|--------|----------|------|-------------|
| POST | `/connections` | JWT | Send connection request |
| PATCH | `/connections/:id/accept` | JWT | Accept connection |
| PATCH | `/connections/:id/reject` | JWT | Reject connection |
| PATCH | `/connections/:id/cancel` | JWT | Cancel sent request |
| GET | `/connections` | JWT | List connections (filter by status) |

### Blocks Module

| Method | Endpoint | Auth | Description |
|--------|----------|------|-------------|
| POST | `/blocks` | JWT | Block a profile |
| DELETE | `/blocks/:id` | JWT | Unblock |

### Chat Module

| Method | Endpoint | Auth | Description |
|--------|----------|------|-------------|
| GET | `/chat/threads` | JWT | List chat threads |
| POST | `/chat/threads` | JWT | Create thread (one per profile pair) |
| GET | `/chat/threads/:id/messages` | JWT | Get messages in thread |
| POST | `/chat/threads/:id/messages` | JWT | Send message (stores sender_manager_id) |
| PATCH | `/chat/messages/:id/read` | JWT | Mark message as read |

**WebSocket gateway** (`ws://localhost:3000`):
- Connect with `{ auth: { token: "JWT..." } }` in handshake
- `joinThread(threadId)` - join a thread room (membership validated)
- `sendMessage({ threadId, content, messageType })` - send message via WS
- `newMessage` event - receive real-time messages

### Kundali Module

| Method | Endpoint | Auth | Description |
|--------|----------|------|-------------|
| POST | `/kundali/generate` | JWT | Generate kundali from birth details (computes rashi, nakshatra, lagna, planetary positions, houses, doshas) |
| GET | `/kundali/:profileId` | JWT | Get kundali for a profile |
| POST | `/kundali/match` | JWT | Compute 36-point Ashta-Koota guna match between two profiles |
| GET | `/kundali/match/:profileId` | JWT | Get existing match results for a profile |
| GET | `/kundali/summary/:profileId` | JWT | Get kundali summary |
| POST | `/kundali/ai-interpret` | JWT | AI interpretation of kundali |
| PATCH | `/profiles/:id/kundali/preferences` | JWT | Update kundali match preferences |
| GET | `/search/kundali` | JWT | Search by kundali criteria (rashi, nakshatra, manglik, guna score) |
| POST | `/kundali/upload` | JWT | Upload externally generated kundali |
| DELETE | `/kundali/:profileId` | JWT | Delete kundali data |

**Guna matching breakdown (36-point Ashta-Koota):**
```
Varna (1)  + Vashya (2) + Tara (3) + Yoni (4) +
Graha Maitri (5) + Gana (6) + Bhakoot (7) + Nadi (8) = 36 max
```

Match quality: `excellent` (>= 28), `very_good` (>= 21), `good` (>= 18), `average` (>= 14), `below_average` (< 14)

### Notifications Module

| Method | Endpoint | Auth | Description |
|--------|----------|------|-------------|
| GET | `/notifications` | JWT | List notifications for current user |
| PATCH | `/notifications/:id/read` | JWT | Mark notification as read |

### Verification Module

| Method | Endpoint | Auth | Description |
|--------|----------|------|-------------|
| POST | `/verification/email` | JWT | Request email verification |
| POST | `/verification/phone` | JWT | Request phone verification |
| POST | `/verification/document` | JWT | Submit document for verification |
| GET | `/verification/status` | JWT | Get verification status |

## Permission Model

### Manager Roles

| Permission | Owner | Parent | Family Member | Matchmaker (future) |
|-----------|-------|--------|---------------|---------------------|
| Edit profile | Yes | Yes | No | No |
| Approve connections | Yes | Yes | No | No |
| View chat | Yes | Yes | No | No |
| Send chat | Yes | Yes | No | No |
| View private photos | Yes | Yes | Yes | No |
| Manage managers | Yes | Yes | No | No |
| Delete profile | Yes | Yes | No | No |

### Block Enforcement

Blocked profiles are excluded from:
- Search results
- Recommended matches
- Connection requests (both directions)
- Chat thread creation

## Module Dependency Graph

```
AppModule (root)
  |-- AuthModule (JWT strategy, user CRUD)
  |-- ProfilesModule (profile + sub-entity CRUD)
  |-- ProfileManagersModule (role assignment)
  |-- PhotosModule (photo CRUD with visibility)
  |-- PreferencesModule (partner preference CRUD)
  |-- SearchModule (filtered search, recommendations)
  |-- ConnectionsModule (request lifecycle)
  |-- BlocksModule (block/unblock)
  |-- ChatModule (threads, messages, WebSocket gateway)
  |-- NotificationsModule (notification CRUD + settings)
  |-- KundaliModule (astrology engine, guna matching)
  |-- VerificationModule (email/phone/document verification)
  |-- AdminModule (admin user management)
```

## Development

### Adding a new endpoint

1. Create DTO in `modules/<module>/dto/` with `class-validator` decorators
2. Add service method in `modules/<module>/<module>.service.ts`
3. Add controller route in `modules/<module>/<module>.controller.ts`
4. Export DTO from `modules/<module>/dto/index.ts`

### Adding a new entity

1. Create entity in `database/entities/<name>.entity.ts` with TypeORM decorators
2. Export from `database/entities/index.ts`
3. Import entity in the relevant module's `TypeOrmModule.forFeature([...])`
4. TypeORM `synchronize: true` auto-creates the table in development

### Error handling

- Validation errors: Automatically handled by NestJS `ValidationPipe` (400)
- Auth errors: JWT guard returns 401
- Not found: Services throw `NotFoundException` (404)
- Forbidden: Role guard or service logic throws `ForbiddenException` (403)
