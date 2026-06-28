# Test Plan: PR #15 — View Profiles from Connections/Chat, Resend Rejected Connections

## What Changed (User-Visible)
1. Connections list now shows **display names** instead of profile IDs
2. Tapping a connection card navigates to that person's **profile detail**
3. **Resend Request** button appears on rejected/cancelled sent connections
4. Chat screen has a **"View Profile"** header button to view the other person's profile
5. Filter tabs now include **"Cancelled"** alongside Pending/Accepted/Rejected

## Test Environment
- Backend: http://localhost:3000/api (NestJS)
- Frontend: http://localhost:19006 (Expo web)
- Seed data: 8 users, 5 connections, 2 chat threads

## Key Test Accounts
| User | Email | Connections |
|------|-------|-------------|
| Vikram Singh | vikram.singh@example.com | Sent → Priya (rejected) |
| Rahul Sharma | rahul.sharma@example.com | Sent → Priya (accepted), Sent → Sneha (pending); Chat with Priya |
| Priya Patel | priya.patel@example.com | Received from Rahul (accepted), Received from Vikram (rejected) |

---

## Test 1: View Profile from Connections List + Display Names (Vikram)

**Login as:** vikram.singh@example.com / Test@1234

### Steps
1. After login, click the **"Connections"** tab in the bottom navigation bar
2. The default filter is "Pending" — verify the list content
3. Click the **"Rejected"** filter tab

### Assertions
- **A1.1**: The "Rejected" tab shows exactly 1 connection card
- **A1.2**: The card displays the name **"Priya Patel"** (not a UUID or "Sent Connection")
- **A1.3**: The card shows **"Sent"** direction label and a date
- **A1.4**: A **"Resend Request"** button is visible on the card
- **A1.5**: A **"View"** text button is visible on the right side of the card

### Evidence if broken
- If display names aren't working: card would show "Unknown" or a UUID string
- If resend button is missing: no button visible below the card
- If profile navigation is broken: tapping card would do nothing or crash

---

## Test 2: Resend Rejected Connection Request (Vikram)

**Continues from Test 1 (already on Rejected tab as Vikram)**

### Steps
1. Click the **"Resend Request"** button on the Priya Patel card
2. Observe the alert/response

### Assertions
- **A2.1**: A success alert appears with text containing **"resent"** (case insensitive)
- **A2.2**: After dismissing the alert, the rejected tab shows **0 connections** ("No rejected connections")
- **A2.3**: Switching to the **"Pending"** tab now shows the Priya Patel connection (resent = pending)

### Evidence if broken
- If resend API fails: error alert appears instead of success
- If UI doesn't refresh: card stays in rejected tab after resend

---

## Test 3: View Profile by Tapping Connection Card (Rahul)

**Login as:** rahul.sharma@example.com / Test@1234

### Steps
1. Click the **"Connections"** tab
2. Default filter is "Pending" — verify connections are listed
3. Tap on any connection card (e.g., Sneha Reddy)

### Assertions
- **A3.1**: Navigation occurs to the **Profile Detail** screen (header says "Profile")
- **A3.2**: The profile shows the correct person's details (display_name matches who was tapped)
- **A3.3**: A back button is available to return to the connections list

### Evidence if broken
- If navigation doesn't work: nothing happens on tap
- If wrong profile loads: display_name mismatch

---

## Test 4: View Profile from Chat Screen (Rahul)

**Continues as Rahul (who has a chat with Priya)**

### Steps
1. Click the **"Chat"** tab in the bottom navigation
2. Verify at least one chat thread is listed
3. Tap the chat thread to open the **ChatScreen**
4. Look for **"View Profile"** text in the top-right header area
5. Tap the **"View Profile"** button

### Assertions
- **A4.1**: Chat tab shows at least 1 thread
- **A4.2**: ChatScreen opens with messages visible
- **A4.3**: **"View Profile"** text appears in the header right area
- **A4.4**: Tapping "View Profile" navigates to **ProfileDetailScreen** (header says "Profile")
- **A4.5**: The profile shown is **Priya Patel** (the other person in the chat)

### Evidence if broken
- If headerRight isn't set: no "View Profile" button visible
- If navigation params are wrong: wrong profile or crash

---

## Test 5: API Verification — Resend Endpoint (Shell)

**Verify backend resend works at API level with concrete assertions**

### Steps (shell commands)
1. Login as Vikram, get token
2. List rejected connections — verify from_profile/to_profile fields present
3. Call PATCH /connections/:id/resend
4. Verify response has status='pending', responded_at=null

### Assertions
- **A5.1**: GET connections response includes `from_profile.display_name` and `to_profile.display_name`
- **A5.2**: PATCH resend response has `status: "pending"`
- **A5.3**: PATCH resend response has `responded_at: null`
- **A5.4**: Calling resend on a non-rejected connection returns 400

### Note
This was already verified during development. Will re-run after re-seeding to confirm clean state.
