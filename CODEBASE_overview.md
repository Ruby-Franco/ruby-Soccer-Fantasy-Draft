# Fantasy Soccer Draft App — Codebase Overview

## What This App Is

A real-time multiplayer fantasy soccer draft platform where a group of friends can join a room using a join code, take turns picking UEFA Champions League players, and see the final teams at the end. Think Among Us lobby system but for fantasy soccer drafts.

- **Live URL:** https://soccer-wine.vercel.app/
- **Frontend Repo:** Deployed on Vercel
- **Backend:** Deployed on Railway

---

## Tech Stack

| Layer | Technology |
|---|---|
| Frontend | React 19, React Router 6 (HashRouter), Vite 7 |
| Backend | Express 5, TypeScript 5, tsx |
| Database | MySQL on Railway (being implemented) |
| Real-time | Socket.io (being implemented) |
| Football Data | api-football.com (being implemented) |
| Frontend Hosting | Vercel |
| Backend Hosting | Railway |

---

## Current App Structure

### Frontend Pages (4 total)

| File | Route | Purpose |
|---|---|---|
| Login.jsx | #/ | Being replaced with name entry screen |
| Waiting.jsx | #/waiting | Shows whose turn it is |
| UserChoice.jsx | #/userchoice | Player draft/pick screen |
| TeamDisplay.jsx | #/teamdisplay | Final teams overview |

### Backend Endpoints

| Method | Path | Status |
|---|---|---|
| GET | / | Health check |
| GET | /health | Health check |
| POST | /login | Being removed |
| POST | /logout | Being removed |
| GET | /draft/state | Returns full draft state |
| GET | /draft/current | Returns current participant |
| GET | /draft/is-available/:playerId | Checks if player is available |
| POST | /draft/pick | Records a player pick |
| GET | /draft/turn | Returns current participant |
| POST | /draft/reset | Resets draft state |

---

## Environment Variables

| Variable | Used In | Purpose |
|---|---|---|
| VITE_API_URL | Frontend | Backend base URL |
| PORT | Backend | Server port, defaults to 3000 |
| MYSQL_URL | Backend | Railway MySQL connection string |
| FOOTBALL_API_KEY | Backend | api-football.com API key |

---

## Known Bugs (fix in order)

1. **selectedPlayerIds serialization bug** — `draftGameState.selectedPlayerIds` is a `Set<string>`. When Express sends it via `res.json()`, `JSON.stringify` converts the Set to `{}` so the frontend always thinks no players have been picked. Fix: convert Set to Array using `Array.from()` before sending response.

2. **Turn rotation broken** — `moveToNextTurn()` is commented out in `draft.ts` line 35 so `currentParticipantIndex` never advances and the draft is stuck on participant 0 forever. Fix: uncomment and properly call `moveToNextTurn()` after a successful pick.

3. **Hardcoded user identity** — the user is hardcoded as the string `"user1"` in `UserChoice.jsx` line 16. Fix: pass real username through React state from the entry screen.

4. **Hardcoded team data** — Alice, Noah and James teams are hardcoded static arrays in `TeamDisplay.jsx`. Fix: fetch all team data dynamically from `GET /draft/state`.

5. **Waiting screen disconnected** — uses hardcoded names from `global.js` with a 2 second `setTimeout` animation instead of real backend data. Fix: fetch current participant from `GET /draft/current`.

6. **CORS blocks local dev** — hardcoded to production Vercel URL only. Fix: accept both `localhost:5173` and `https://soccer-wine.vercel.app`.

---

## Dead Code to Remove (Ticket 0)

- Entire `/amplify/` directory — leftover from abandoned AWS Amplify approach
- `routes/players.ts` and `routes/teams.ts` — empty files, never imported
- `athleteList`, `selected` exports from `global.js` — never used anywhere
- `roundCounter` export from `global.js` — exported but never used
- `/login` and `/logout` backend endpoints — being replaced with name entry
- Fake token generation logic in `/login` endpoint

---

## What We Are Building (in ticket order)

### Ticket 0 — Clean up dead code
Remove all dead code listed above. Fix CORS to accept both localhost and production.

### Ticket 1 — Fix picked players bug
Convert `selectedPlayerIds` Set to Array before sending in `res.json()` response.

### Ticket 2 — Fix turn rotation
Uncomment and properly call `moveToNextTurn()` after successful pick in `POST /draft/pick`.

### Ticket 3 — Remove hardcoded names

- Replace hardcoded `"user1"` with real username from React state
- Waiting screen fetches real current participant from backend
- TeamDisplay fetches all teams dynamically from backend

### Ticket 4 — Replace login with name entry + Solo Demo
Replace `Login.jsx` entirely with:

- Simple name input field
- Three buttons: Create Room, Join Room, Try Solo Demo
- Solo Demo instantly creates a room with 4 fake participants (user, Alice, Noah, James), skips lobby, auto picks for fake participants using random selection, shows "Demo Mode" label throughout
- No backend call needed for name, store in React state

### Ticket 5 — Room system with join codes

- Replace single global `draftGameState` with `Map<roomCode, DraftGameState>`
- `POST /rooms/create` — generates unique 6 character room code, sets creator as host
- `POST /rooms/join` — validates code, adds user to room
- All draft endpoints accept `roomCode` parameter
- Frontend: Create Room shows generated code, Join Room has code input field

### Ticket 6 — Waiting lobby with Socket.io

**Backend:**
- Install and set up Socket.io on Express server
- Emit `player_joined` when user joins room
- Emit `draft_started` when host starts draft
- Emit `pick_made` after every pick with updated draft state
- Emit `turn_changed` after every turn advance
- Emit `draft_complete` when all rounds finish
- Scope all events to room code using Socket.io rooms

**Frontend:**
- Install Socket.io client
- Build waiting lobby: shows room code at top, live participant list, Start Draft button for host only (enabled when 2+ players joined)
- Replace Waiting.jsx timer animation with real Socket.io `turn_changed` events
- Remove all `window` focus event listeners
- Auto navigate everyone to TeamDisplay on `draft_complete` event

### Ticket 7 — Fix round counter, set 7 rounds default

- Use `roundCounter` to control picks per user
- Default to 7 rounds (builds one complete realistic soccer squad)
- Host can choose 5, 7, or 10 rounds when creating room
- Pass round limit into `POST /rooms/create`
- Draft ends when all participants complete all rounds
- UI shows current round and total rounds clearly

### Ticket 8 — Real player database with live API sync

**Database (Railway MySQL):**
- Players table: `id, name, position, club, nationality, photo_url, points_value, api_player_id, updated_at`
- Teams table: `id, name, logo_url, api_team_id`
- Connect backend using `mysql2` package via `MYSQL_URL` env var

**API Integration (api-football.com):**
- On server start, fetch current UEFA Champions League squads
- If database empty: seed with API response
- If database has data: check `updated_at` — refresh if older than 24 hours
- If API fails: fall back to existing database data, log clearly
- Points values by position: Goalkeeper 6, Defender 7, Midfielder 8-10, Forward 10-14

**Frontend updates:**
- Show real player photos from `photo_url`
- Show club name under each player
- Fallback silhouette if photo fails to load

---

## Draft Flow (final intended flow)

1. User lands on page
2. Chooses: Create Room / Join Room / Try Solo Demo
3. Enters their name
4. Create Room → gets 6 character join code to share with friends
5. Join Room → enters code → joins waiting lobby
6. Waiting Lobby → see who has joined in real time, host clicks Start Draft
7. Draft → take turns picking players, see live updates via Socket.io
8. Waiting for others → see real time picks as others draft
9. Draft Complete → auto navigate to Teams Overview
10. Teams Overview → see all teams, share results, start new draft

---

## Solo Demo Flow

1. User enters name
2. Clicks Try Solo Demo
3. App creates room with user + Alice, Noah, James as fake participants
4. Skips waiting lobby, goes straight to draft
5. User picks manually, fake participants auto pick randomly
6. All 7 rounds complete, navigate to Teams Overview
7. Demo Mode label visible throughout

---

## Resume Bullets (for interviews)

- Built and refactored a real-time multiplayer fantasy soccer draft platform in React, identifying and resolving critical bugs including a Set serialization issue causing drafted players to reappear and a commented-out turn rotation function breaking draft flow
- Architected a room-based multiplayer system with generated join codes allowing concurrent independent draft sessions, replacing a single hardcoded global state
- Implemented real-time synchronization across concurrent users using Socket.io, replacing a non-functional polling architecture with event-driven WebSocket communication
- Integrated a live football API (api-football.com) to sync real UEFA Champions League player data to a MySQL database on startup, with fallback logic ensuring app reliability if the API is unavailable
- Connected all frontend components to live backend state, replacing hardcoded participant names and team data with dynamic API calls to an Express/TypeScript backend

---

## How to Talk About This Project in Interviews

**The narrative:**

> "When I inherited the codebase I did a full audit and found some critical issues — picked players were reappearing because a JavaScript Set was being serialized as an empty object, and turn rotation was completely broken because the function was commented out. I fixed those bugs first, then rebuilt the architecture to support real multiplayer with room codes and Socket.io for real time updates, and integrated a live football API with a MySQL database. It went from a single user demo that didn't really work to an actual multiplayer app anyone could open and play with friends."

**Key technical points to hit:**

- Set serialization bug and how you fixed it
- Why you chose Socket.io over polling
- How the room system works (like Among Us lobby)
- How you handled API rate limits with the 24 hour refresh strategy
- The solo demo mode and why you added it (accessibility for interviewers)

---

## Notes for Claude Code

- Always run one ticket at a time
- Test each ticket fully before moving to the next
- The frontend uses HashRouter so all routes have `#` prefix
- Backend TypeScript is compiled with `tsc`, run with `tsx` in development
- CORS must accept both `http://localhost:5173` and `https://soccer-wine.vercel.app`
- Never hardcode usernames, participant names, or team data
- All draft state must be scoped to room codes once Ticket 5 is complete
- Socket.io events must be scoped to rooms to prevent cross-room interference
